from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func, case
from typing import List, Optional, Tuple
from datetime import datetime, timedelta
import uuid
from math import ceil

from app.models.billing import Invoice, InvoiceLineItem
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.billing import (
    InvoiceCreate, InvoiceUpdate, BillingHistoryItem, 
    BillingHistoryResponse, PaymentStats, BillingSummary
)

class BillingService:
    
    @staticmethod
    def generate_invoice_number(year: int = None) -> str:
        """Generate a unique invoice number in format INV-YYYY-XXX"""
        if year is None:
            year = datetime.now().year
        
        # Generate a unique suffix using timestamp and random component
        timestamp = int(datetime.now().timestamp() * 1000) % 10000
        random_suffix = str(uuid.uuid4().hex)[:3].upper()
        
        return f"INV-{year}-{timestamp}{random_suffix}"
    
    @staticmethod
    def create_invoice(db: Session, invoice_data: InvoiceCreate) -> Invoice:
        """Create a new invoice with line items"""
        
        # Generate invoice number if not provided
        if not invoice_data.invoice_number:
            invoice_data.invoice_number = BillingService.generate_invoice_number()
        
        # Create invoice
        db_invoice = Invoice(
            user_id=invoice_data.user_id,
            subscription_id=invoice_data.subscription_id,
            invoice_number=invoice_data.invoice_number,
            invoice_date=invoice_data.invoice_date,
            due_date=invoice_data.due_date,
            subtotal=invoice_data.subtotal,
            tax_amount=invoice_data.tax_amount,
            total_amount=invoice_data.total_amount,
            status=invoice_data.status,
            payment_status=invoice_data.payment_status,
            plan_name=invoice_data.plan_name,
            billing_period=invoice_data.billing_period,
            billing_period_start=invoice_data.billing_period_start,
            billing_period_end=invoice_data.billing_period_end,
            payment_provider=invoice_data.payment_provider,
            external_invoice_id=invoice_data.external_invoice_id,
            payment_method=invoice_data.payment_method,
            currency=invoice_data.currency,
            description=invoice_data.description,
            notes=invoice_data.notes,
            paid_at=invoice_data.paid_at,
            payment_intent_id=invoice_data.payment_intent_id
        )
        
        db.add(db_invoice)
        db.flush()  # To get the invoice ID
        
        # Create line items
        for item_data in invoice_data.line_items:
            line_item = InvoiceLineItem(
                invoice_id=db_invoice.id,
                description=item_data.description,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total_price=item_data.total_price,
                product_type=item_data.product_type,
                product_id=item_data.product_id,
                period_start=item_data.period_start,
                period_end=item_data.period_end
            )
            db.add(line_item)
        
        db.commit()
        db.refresh(db_invoice)
        return db_invoice
    
    @staticmethod
    def create_subscription_invoice(
        db: Session, 
        user_id: int, 
        subscription: Subscription, 
        billing_period_start: datetime,
        billing_period_end: datetime
    ) -> Invoice:
        """Create an invoice for a subscription billing period"""
        
        # Generate billing period description
        billing_period = billing_period_start.strftime("%B %Y")
        if subscription.interval == "yearly":
            billing_period = f"{billing_period_start.year}"
        
        # Calculate amounts
        subtotal = subscription.price
        tax_rate = 0.0  # You can implement tax calculation logic here
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount
        
        # Create invoice data
        invoice_data = InvoiceCreate(
            user_id=user_id,
            subscription_id=subscription.id,
            invoice_number=BillingService.generate_invoice_number(),
            invoice_date=datetime.now(),
            due_date=datetime.now() + timedelta(days=7),  # 7 days to pay
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            status="pending",
            payment_status="unpaid",
            plan_name=subscription.name,
            billing_period=billing_period,
            billing_period_start=billing_period_start,
            billing_period_end=billing_period_end,
            currency="USD",
            description=f"Subscription: {subscription.name} - {billing_period}",
            line_items=[{
                "description": f"{subscription.name} - {billing_period}",
                "quantity": 1,
                "unit_price": subscription.price,
                "total_price": subscription.price,
                "product_type": "subscription",
                "product_id": str(subscription.id),
                "period_start": billing_period_start,
                "period_end": billing_period_end
            }]
        )
        
        return BillingService.create_invoice(db, invoice_data)
    
    @staticmethod
    def get_user_billing_history(
        db: Session, 
        user_id: int, 
        page: int = 1, 
        per_page: int = 10,
        status_filter: Optional[str] = None
    ) -> BillingHistoryResponse:
        """Get paginated billing history for a user"""
        
        # Build query
        query = db.query(Invoice).filter(Invoice.user_id == user_id)
        
        if status_filter:
            query = query.filter(Invoice.status == status_filter)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        invoices = query.order_by(desc(Invoice.invoice_date)).offset(offset).limit(per_page).all()
        
        # Convert to response format
        billing_items = []
        for invoice in invoices:
            billing_items.append(BillingHistoryItem(
                id=invoice.invoice_number,
                date=invoice.invoice_date.strftime("%Y-%m-%d"),
                amount=invoice.total_amount,
                status=invoice.status,
                plan=invoice.plan_name or "Unknown Plan",
                period=invoice.billing_period or "N/A",
                invoice_number=invoice.invoice_number,
                payment_method=invoice.payment_method,
                currency=invoice.currency
            ))
        
        # Calculate pagination info
        total_pages = ceil(total_count / per_page)
        has_next = page < total_pages
        has_previous = page > 1
        
        return BillingHistoryResponse(
            invoices=billing_items,
            total_count=total_count,
            current_page=page,
            total_pages=total_pages,
            has_next=has_next,
            has_previous=has_previous
        )
    
    @staticmethod
    def get_invoice_by_number(db: Session, invoice_number: str, user_id: int) -> Optional[Invoice]:
        """Get invoice by number for a specific user"""
        return db.query(Invoice).filter(
            and_(Invoice.invoice_number == invoice_number, Invoice.user_id == user_id)
        ).first()
    
    @staticmethod
    def update_invoice(db: Session, invoice: Invoice, update_data: InvoiceUpdate) -> Invoice:
        """Update an existing invoice"""
        
        update_dict = update_data.dict(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(invoice, key, value)
        
        db.commit()
        db.refresh(invoice)
        return invoice
    
    @staticmethod
    def mark_invoice_as_paid(
        db: Session, 
        invoice: Invoice, 
        payment_method: str = None,
        payment_intent_id: str = None,
        external_invoice_id: str = None
    ) -> Invoice:
        """Mark an invoice as paid"""
        
        update_data = InvoiceUpdate(
            status="paid",
            payment_status="paid",
            paid_at=datetime.now(),
            payment_method=payment_method,
            payment_intent_id=payment_intent_id,
            external_invoice_id=external_invoice_id
        )
        
        return BillingService.update_invoice(db, invoice, update_data)
    
    @staticmethod
    def get_payment_stats(db: Session, user_id: int) -> PaymentStats:
        """Get payment statistics for a user"""
        
        # Aggregate payment data using proper SQLAlchemy case syntax
        stats = db.query(
            func.sum(case((Invoice.status == 'paid', Invoice.total_amount), else_=0)).label('total_paid'),
            func.sum(case((Invoice.status == 'pending', Invoice.total_amount), else_=0)).label('total_pending'),
            func.sum(case((Invoice.status == 'failed', Invoice.total_amount), else_=0)).label('total_failed'),
            func.count(Invoice.id).label('total_invoices'),
            func.avg(case((Invoice.status == 'paid', Invoice.total_amount), else_=None)).label('average_payment')
        ).filter(Invoice.user_id == user_id).first()
        
        return PaymentStats(
            total_paid=float(stats.total_paid or 0),
            total_pending=float(stats.total_pending or 0),
            total_failed=float(stats.total_failed or 0),
            total_invoices=int(stats.total_invoices or 0),
            average_payment=float(stats.average_payment or 0)
        )
    
    @staticmethod
    def get_billing_summary(db: Session, user_id: int) -> BillingSummary:
        """Get comprehensive billing summary for a user"""
        
        # Get current subscription
        current_subscription = db.query(Subscription).filter(
            and_(Subscription.user_id == user_id, Subscription.is_active == True)
        ).first()
        
        # Get recent invoices (last 5)
        recent_invoices_query = db.query(Invoice).filter(
            Invoice.user_id == user_id
        ).order_by(desc(Invoice.invoice_date)).limit(5).all()
        
        recent_invoices = []
        for invoice in recent_invoices_query:
            recent_invoices.append(BillingHistoryItem(
                id=invoice.invoice_number,
                date=invoice.invoice_date.strftime("%Y-%m-%d"),
                amount=invoice.total_amount,
                status=invoice.status,
                plan=invoice.plan_name or "Unknown Plan",
                period=invoice.billing_period or "N/A",
                invoice_number=invoice.invoice_number,
                payment_method=invoice.payment_method,
                currency=invoice.currency
            ))
        
        # Calculate next billing info
        next_billing_date = None
        next_billing_amount = None
        if current_subscription and current_subscription.current_period_end:
            next_billing_date = current_subscription.current_period_end
            next_billing_amount = current_subscription.price
        
        # Get payment stats
        payment_stats = BillingService.get_payment_stats(db, user_id)
        
        return BillingSummary(
            current_subscription=current_subscription.name if current_subscription else None,
            next_billing_date=next_billing_date,
            next_billing_amount=next_billing_amount,
            payment_method=current_subscription.payment_provider if current_subscription else None,
            recent_invoices=recent_invoices,
            payment_stats=payment_stats
        )
