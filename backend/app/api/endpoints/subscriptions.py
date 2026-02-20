from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
import stripe
import os
from datetime import datetime, timedelta

from app.db.session import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.subscription import Subscription
from app.models.billing import Invoice
from app.schemas.subscription import (
    SubscriptionCreate, 
    SubscriptionUpdate, 
    SubscriptionResponse,
    AdminUserSubscriptionsResponse,
    AdminUserSubscriptionRecord,
    PaginationInfo
)
from app.services.subscription_service import SubscriptionService
from app.services.billing_service import BillingService

# Define AI credits for different plans
PLAN_AI_CREDITS = {
    "Free": 0,
    "Basic": 100000,        # 100K credits
    "Plus": 1000000,        # 1M credits  
    "Professional": 500000,  # 500K credits  
    "Business": 5000000,    # 5M credits
    "Enterprise": 10000000,  # 10M credits
    "Premium": 2000000,     # 2M credits
}

def get_plan_ai_credits(plan_name: str) -> int:
    """Get AI credits for a specific plan"""
    return PLAN_AI_CREDITS.get(plan_name, 0)

router = APIRouter()

# Initialize Stripe if API key is available
stripe_api_key = os.getenv("STRIPE_API_KEY")
if stripe_api_key:
    stripe.api_key = stripe_api_key

@router.get("/plans", response_model=List[SubscriptionResponse])
async def get_subscription_plans(
    db: Session = Depends(get_db)
):
    """Get all available subscription plans"""
    # Get plans that are templates (not user-specific subscriptions)
    # Look for plans that have stripe_price_id (indicating they are plan templates)
    plans = db.query(Subscription).filter(
        Subscription.is_active == True,
        Subscription.stripe_price_id.isnot(None)  # Only plans with Stripe price IDs
    ).all()
    
    # Filter out user-specific subscriptions by checking if they have payment details
    template_plans = []
    for plan in plans:
        # If it has no subscription_id, it's likely a plan template, not a user subscription
        if not plan.subscription_id:
            template_plans.append(plan)
    
    return template_plans

@router.get("/my", response_model=Optional[SubscriptionResponse])
async def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the current user's subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.is_active == True
    ).first()
    
    if not subscription:
        return None
    
    return subscription

@router.post("/subscribe", response_model=SubscriptionResponse)
async def subscribe_to_plan(
    plan_id: int = Body(...),
    payment_method_id: Optional[str] = Body(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Subscribe to a plan"""
    # Check if user already has an active subscription
    existing_subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.is_active == True
    ).first()
    
    # If user has existing subscription, deactivate it first (this allows upgrades/renewals)
    if existing_subscription:
        existing_subscription.is_active = False
        db.commit()
    
    # Get the plan
    plan = db.query(Subscription).filter(
        Subscription.id == plan_id,
        Subscription.is_active == True
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )
    
    # Create subscription in database
    subscription_data = {
        "user_id": current_user.id,
        "name": plan.name,
        "description": plan.description,
        "price": plan.price,
        "interval": plan.interval,
        "is_active": True,
        "features": plan.features,
        "resume_limit": plan.resume_limit,
        "cover_letter_limit": plan.cover_letter_limit,
        "ai_credits_limit": plan.ai_credits_limit or get_plan_ai_credits(plan.name),
    }
    
    # If Stripe is configured and payment method provided, create a subscription in Stripe
    if stripe_api_key and payment_method_id:
        try:
            # Set up intervals for Stripe
            interval_mapping = {
                "monthly": {"interval": "month", "interval_count": 1},
                "yearly": {"interval": "year", "interval_count": 1},
            }
            stripe_interval = interval_mapping.get(plan.interval, {"interval": "month", "interval_count": 1})
              # Create or get a customer
            stripe_customers = stripe.Customer.list(email=current_user.email)
            if stripe_customers.data:
                customer = stripe_customers.data[0]
            else:
                customer = stripe.Customer.create(
                    email=current_user.email,
                    name=current_user.name,
                    payment_method=payment_method_id,
                    invoice_settings={"default_payment_method": payment_method_id}
                )
            
            # Use the existing Stripe price ID from the plan
            if not plan.stripe_price_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Plan does not have a valid Stripe price ID configured"
                )
            
            # Create the subscription using the existing price ID
            stripe_subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{"price": plan.stripe_price_id}],
                payment_behavior="error_if_incomplete",
                payment_settings={"save_default_payment_method": "on_subscription"},
                expand=["latest_invoice.payment_intent"]
            )
            
            # Update subscription data with Stripe info
            subscription_data.update({
                "payment_provider": "stripe",
                "subscription_id": stripe_subscription.id,
                "stripe_price_id": plan.stripe_price_id,
                "current_period_start": datetime.fromtimestamp(stripe_subscription.current_period_start),
                "current_period_end": datetime.fromtimestamp(stripe_subscription.current_period_end)
            })
            
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe error: {str(e)}"
            )
    else:
        # If no payment integration, set dummy dates for subscription period
        now = datetime.now()
        period_end = now + timedelta(days=30 if plan.interval == "monthly" else 365)
        subscription_data.update({
            "payment_provider": "manual",
            "current_period_start": now,
            "current_period_end": period_end
        })
    
    # Create subscription in database
    db_subscription = Subscription(**subscription_data)
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    
    # Handle subscription setup for fresh usage tracking
    SubscriptionService.handle_subscription_renewal_or_upgrade(db, current_user.id, db_subscription)
    
    # Create an invoice for this subscription
    try:
        invoice = BillingService.create_subscription_invoice(
            db=db,
            user_id=current_user.id,
            subscription=db_subscription,
            billing_period_start=db_subscription.current_period_start,
            billing_period_end=db_subscription.current_period_end
        )
        
        # If payment was processed successfully (e.g., via Stripe), mark invoice as paid
        if stripe_api_key and payment_method_id and 'stripe_subscription' in locals():
            BillingService.mark_invoice_as_paid(
                db=db,
                invoice=invoice,
                payment_method="stripe",
                external_invoice_id=stripe_subscription.latest_invoice.id if hasattr(stripe_subscription, 'latest_invoice') and stripe_subscription.latest_invoice else None
            )
        elif subscription_data.get("payment_provider") == "manual":
            # For manual payments, mark as paid immediately (or keep as pending based on your business logic)
            BillingService.mark_invoice_as_paid(
                db=db,
                invoice=invoice,
                payment_method="manual"
            )
            
    except Exception as e:
        # Log the error but don't fail the subscription creation
        print(f"Warning: Failed to create invoice for subscription {db_subscription.id}: {str(e)}")
    
    return db_subscription

@router.post("/cancel", response_model=SubscriptionResponse)
async def cancel_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cancel current subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.is_active == True
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    # If using Stripe, cancel the subscription there as well
    if subscription.payment_provider == "stripe" and subscription.subscription_id and stripe_api_key:
        try:
            stripe.Subscription.delete(subscription.subscription_id)
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe error: {str(e)}"
            )
    
    # Update subscription in database
    subscription.is_active = False
    
    # Reset user's subscription token usage when cancelling
    current_user.subscription_tokens_used = 0
    
    # Check if user has already used free limits before subscribing
    # If they have, they shouldn't get free access again after cancellation
    usage = SubscriptionService.get_total_usage(db, current_user.id)
    if usage["resume_count"] > 0 or usage["cover_letter_count"] > 0:
        current_user.has_used_free_limits = True
    
    db.commit()
    db.refresh(subscription)
    db.refresh(current_user)
    
    return subscription

@router.post("/webhook", status_code=status.HTTP_200_OK)
async def handle_stripe_webhook(
    payload: dict = Body(...),
    signature: str = None,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhooks for subscription events"""
    if not stripe_api_key:
        return {"status": "success", "message": "Stripe not configured, ignoring webhook"}
    
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    if webhook_secret and signature:
        try:
            # Verify the event
            event = stripe.Webhook.construct_event(
                payload, signature, webhook_secret
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Webhook error: {str(e)}"
            )
    else:
        event = payload
      # Handle the event
    event_type = event.get("type")
    event_data = event.get("data", {}).get("object", {})
    
    if event_type == "checkout.session.completed":
        session = event_data
        print(f"Checkout session completed: {session.get('id')}")
        # Handle successful checkout session completion
        
    elif event_type == "customer.subscription.created":
        subscription = event_data
        print(f"Subscription created: {subscription.get('id')}")
        # Handle new subscription creation
        
    elif event_type == "customer.subscription.deleted":
        subscription = event_data
        subscription_id = subscription.get("id")
        db_subscription = db.query(Subscription).filter(
            Subscription.subscription_id == subscription_id
        ).first()
        
        if db_subscription:
            db_subscription.is_active = False
            db.commit()
            print(f"Subscription deleted: {subscription_id}")
    
    elif event_type == "customer.subscription.updated":
        subscription = event_data
        subscription_id = subscription.get("id")
        db_subscription = db.query(Subscription).filter(
            Subscription.subscription_id == subscription_id
        ).first()
        
        if db_subscription:
            db_subscription.current_period_start = datetime.fromtimestamp(subscription.get("current_period_start"))
            db_subscription.current_period_end = datetime.fromtimestamp(subscription.get("current_period_end"))
            
            # Update AI credits if plan name is known and credits are not properly set
            if db_subscription.ai_credits_limit == 0:
                expected_credits = get_plan_ai_credits(db_subscription.name)
                if expected_credits > 0:
                    db_subscription.ai_credits_limit = expected_credits
                    print(f"Updated AI credits for {db_subscription.name} plan: {expected_credits}")
            
            db.commit()
            print(f"Subscription updated: {subscription_id}")
            
    elif event_type == "invoice.payment_failed":
        invoice = event_data
        print(f"Invoice payment failed: {invoice.get('id')}")
        # Handle failed payment - you might want to notify user or suspend service
        
    elif event_type == "invoice.payment_succeeded":
        invoice = event_data
        subscription_id = invoice.get("subscription")
        invoice_id = invoice.get("id")
        amount_paid = invoice.get("amount_paid", 0) / 100  # Convert from cents
        
        # Find the subscription in our database
        db_subscription = db.query(Subscription).filter(
            Subscription.subscription_id == subscription_id
        ).first()
        
        if db_subscription:
            # Create an invoice record in our database
            billing_period_start = datetime.fromtimestamp(invoice.get("period_start", 0))
            billing_period_end = datetime.fromtimestamp(invoice.get("period_end", 0))
            
            # Create invoice using billing service
            invoice_record = BillingService.create_subscription_invoice(
                db=db,
                user_id=db_subscription.user_id,
                subscription=db_subscription,
                billing_period_start=billing_period_start,
                billing_period_end=billing_period_end
            )
            
            # Mark it as paid immediately since payment succeeded
            BillingService.mark_invoice_as_paid(
                db=db,
                invoice=invoice_record,
                payment_method="stripe",
                external_invoice_id=invoice_id
            )
            
            print(f"Invoice payment succeeded and recorded: {invoice_id}")
        
    elif event_type == "payment_intent.payment_failed":
        payment_intent = event_data
        print(f"Payment intent failed: {payment_intent.get('id')}")
        # Handle failed payment intent
        
    elif event_type == "payment_intent.succeeded":
        payment_intent = event_data
        print(f"Payment intent succeeded: {payment_intent.get('id')}")
        # Handle successful payment intent
        
    else:
        print(f"Unhandled event type: {event_type}")
    
    return {"status": "success"}

# Admin endpoints

@router.get("/admin/user-subscriptions", response_model=AdminUserSubscriptionsResponse)
async def get_user_subscriptions(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all user subscription records (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Calculate offset
    offset = (page - 1) * limit
    
    # Base query - get all users with their subscription info
    query = db.query(User).outerjoin(Subscription, 
        (User.id == Subscription.user_id) & (Subscription.is_active == True)
    )
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.name.ilike(search_term)) |
            (User.email.ilike(search_term)) |
            (User.username.ilike(search_term))
        )
    
    if is_active is not None:
        if is_active:
            # Users with active subscriptions
            query = query.filter(Subscription.is_active == True)
        else:
            # Users without active subscriptions (free tier)
            query = query.filter(Subscription.id.is_(None))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    users = query.offset(offset).limit(limit).all()
    
    # Build response data
    user_records = []
    for user in users:
        # Get active subscription for this user
        active_subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.is_active == True
        ).first()
        
        # Determine subscription plan details
        if active_subscription:
            subscription_plan = active_subscription.name
            is_active_sub = True
            start_date = active_subscription.current_period_start
            end_date = active_subscription.current_period_end
            amount = active_subscription.price
            resumes_limit = active_subscription.resume_limit if active_subscription.resume_limit != -1 else 999999
            cover_letters_limit = active_subscription.cover_letter_limit if active_subscription.cover_letter_limit != -1 else 999999
            ai_credits_limit = active_subscription.ai_credits_limit or 0
            subscription_id = active_subscription.subscription_id
            payment_status = "paid" if active_subscription.payment_provider else "manual"
            created_at = active_subscription.created_at
            updated_at = active_subscription.updated_at
        else:
            # User is on free tier
            subscription_plan = "Free"
            is_active_sub = False
            start_date = None
            end_date = None
            amount = 0.0
            subscription_id = None
            payment_status = "unpaid"
            created_at = user.created_at
            updated_at = user.updated_at
            
            # Check if user has used free limits
            if user.has_used_free_limits:
                resumes_limit = 0
                cover_letters_limit = 0
            else:
                resumes_limit = 20
                cover_letters_limit = 20
            ai_credits_limit = 0
        
        user_record = AdminUserSubscriptionRecord(
            subscription_id=subscription_id,
            user_id=user.id,
            user_name=user.name or user.username,
            email=user.email,
            subscription_plan=subscription_plan,
            is_active=is_active_sub,
            start_date=start_date,
            end_date=end_date,
            created_at=created_at,
            updated_at=updated_at,
            payment_status=payment_status,
            amount=amount,
            currency="USD",
            resumes_limit=resumes_limit,
            cover_letters_limit=cover_letters_limit,
            ai_credits_limit=ai_credits_limit,
            has_used_free_limits=user.has_used_free_limits or False,
            subscription_tokens_used=user.subscription_tokens_used or 0
        )
        user_records.append(user_record)
    
    # Calculate pagination info
    total_pages = (total + limit - 1) // limit
    pagination = PaginationInfo(
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )
    
    return AdminUserSubscriptionsResponse(
        success=True,
        data=user_records,
        pagination=pagination
    )

@router.post("/admin/plans", response_model=SubscriptionResponse)
async def create_plan(
    plan_in: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new subscription plan (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Create a new plan - use current admin user as the template owner
    plan_data = plan_in.dict()
    plan_data['user_id'] = current_user.id  # Use the admin user's ID instead of 0
    db_plan = Subscription(**plan_data)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    
    return db_plan

@router.put("/admin/plans/{plan_id}", response_model=SubscriptionResponse)
async def update_plan(
    plan_id: int,
    plan_in: SubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a subscription plan (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    plan = db.query(Subscription).filter(Subscription.id == plan_id).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    # Update plan fields
    for key, value in plan_in.dict(exclude_unset=True).items():
        setattr(plan, key, value)
    
    db.commit()
    db.refresh(plan)
    
    return plan

@router.get("/usage")
async def get_subscription_usage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's subscription usage and limits"""
    try:
        usage_summary = SubscriptionService.get_usage_summary(db, current_user.id)
        return usage_summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving subscription usage: {str(e)}"
        )

@router.get("/can-create-resume")
async def can_create_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Check if user can create a new resume"""
    try:
        can_create = SubscriptionService.check_resume_limit(db, current_user.id)
        return {"can_create": can_create}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking resume creation permission: {str(e)}"
        )

@router.get("/can-create-cover-letter")
async def can_create_cover_letter(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Check if user can create a new cover letter"""
    try:
        can_create = SubscriptionService.check_cover_letter_limit(db, current_user.id)
        return {"can_create": can_create}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking cover letter creation permission: {str(e)}"
        )
