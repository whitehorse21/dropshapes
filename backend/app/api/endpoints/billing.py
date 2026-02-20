from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import stripe
import os
from datetime import datetime

from app.db.session import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.billing import Invoice
from app.schemas.billing import (
    InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceDetailsResponse,
    BillingHistoryResponse, BillingSummary, PaymentStats
)
from app.services.billing_service import BillingService

router = APIRouter()

@router.get("/history", response_model=BillingHistoryResponse)
async def get_billing_history(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status (paid, pending, failed, etc.)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's billing history with pagination"""
    try:
        billing_history = BillingService.get_user_billing_history(
            db=db,
            user_id=current_user.id,
            page=page,
            per_page=per_page,
            status_filter=status
        )
        return billing_history
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving billing history: {str(e)}"
        )

@router.get("/summary", response_model=BillingSummary)
async def get_billing_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive billing summary"""
    try:
        summary = BillingService.get_billing_summary(db, current_user.id)
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving billing summary: {str(e)}"
        )

@router.get("/stats", response_model=PaymentStats)
async def get_payment_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get payment statistics for the user"""
    try:
        stats = BillingService.get_payment_stats(db, current_user.id)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving payment statistics: {str(e)}"
        )

@router.get("/invoices/{invoice_number}", response_model=InvoiceDetailsResponse)
async def get_invoice_details(
    invoice_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed information about a specific invoice"""
    try:
        invoice = BillingService.get_invoice_by_number(db, invoice_number, current_user.id)
        
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        # Convert to response format
        response = InvoiceDetailsResponse(
            id=invoice.invoice_number,
            invoice_number=invoice.invoice_number,
            date=invoice.invoice_date,
            due_date=invoice.due_date,
            status=invoice.status,
            payment_status=invoice.payment_status,
            subtotal=invoice.subtotal,
            tax_amount=invoice.tax_amount,
            total_amount=invoice.total_amount,
            currency=invoice.currency,
            plan_name=invoice.plan_name,
            billing_period=invoice.billing_period,
            billing_period_start=invoice.billing_period_start,
            billing_period_end=invoice.billing_period_end,
            payment_method=invoice.payment_method,
            paid_at=invoice.paid_at,
            description=invoice.description,
            notes=invoice.notes,
            line_items=[{
                "id": item.id,
                "invoice_id": item.invoice_id,
                "description": item.description,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": item.total_price,
                "product_type": item.product_type,
                "product_id": item.product_id,
                "period_start": item.period_start,
                "period_end": item.period_end,
                "created_at": item.created_at,
                "updated_at": item.updated_at
            } for item in invoice.line_items]
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving invoice details: {str(e)}"
        )

@router.post("/invoices/{invoice_number}/download")
async def download_invoice(
    invoice_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate and download invoice PDF"""
    try:
        invoice = BillingService.get_invoice_by_number(db, invoice_number, current_user.id)
        
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        # TODO: Implement PDF generation logic
        # For now, return a placeholder response
        return {
            "message": "PDF generation feature coming soon",
            "invoice_number": invoice_number,
            "download_url": f"/api/billing/invoices/{invoice_number}/pdf"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating invoice PDF: {str(e)}"
        )

# Admin endpoints for creating invoices manually
@router.post("/admin/invoices", response_model=InvoiceResponse)
async def create_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new invoice (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        invoice = BillingService.create_invoice(db, invoice_data)
        return invoice
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating invoice: {str(e)}"
        )

@router.put("/admin/invoices/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int,
    update_data: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an invoice (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        updated_invoice = BillingService.update_invoice(db, invoice, update_data)
        return updated_invoice
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating invoice: {str(e)}"
        )

@router.post("/admin/invoices/{invoice_id}/mark-paid", response_model=InvoiceResponse)
async def mark_invoice_paid(
    invoice_id: int,
    payment_method: Optional[str] = None,
    payment_intent_id: Optional[str] = None,
    external_invoice_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark an invoice as paid (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        updated_invoice = BillingService.mark_invoice_as_paid(
            db=db,
            invoice=invoice,
            payment_method=payment_method,
            payment_intent_id=payment_intent_id,
            external_invoice_id=external_invoice_id
        )
        
        return updated_invoice
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking invoice as paid: {str(e)}"
        )

# Webhook endpoint for payment provider notifications
@router.post("/webhook/stripe")
async def handle_stripe_billing_webhook(
    payload: dict,
    db: Session = Depends(get_db)
):
    """Handle Stripe billing webhook events"""
    
    stripe_api_key = os.getenv("STRIPE_API_KEY")
    if not stripe_api_key:
        return {"status": "success", "message": "Stripe not configured"}
    
    try:
        event_type = payload.get("type")
        event_data = payload.get("data", {}).get("object", {})
        
        if event_type == "invoice.payment_succeeded":
            invoice_id = event_data.get("id")
            customer_id = event_data.get("customer")
            amount_paid = event_data.get("amount_paid", 0) / 100  # Convert from cents
            
            # Find the invoice in our database by external_invoice_id
            invoice = db.query(Invoice).filter(
                Invoice.external_invoice_id == invoice_id
            ).first()
            
            if invoice:
                BillingService.mark_invoice_as_paid(
                    db=db,
                    invoice=invoice,
                    payment_method="stripe",
                    external_invoice_id=invoice_id
                )
                print(f"Invoice {invoice.invoice_number} marked as paid via Stripe")
        
        elif event_type == "invoice.payment_failed":
            invoice_id = event_data.get("id")
            
            # Find and update the invoice
            invoice = db.query(Invoice).filter(
                Invoice.external_invoice_id == invoice_id
            ).first()
            
            if invoice:
                update_data = InvoiceUpdate(
                    status="failed",
                    payment_status="failed"
                )
                BillingService.update_invoice(db, invoice, update_data)
                print(f"Invoice {invoice.invoice_number} marked as failed via Stripe")
        
        elif event_type == "invoice.created":
            # Handle new invoice creation from Stripe
            invoice_id = event_data.get("id")
            customer_id = event_data.get("customer")
            amount_due = event_data.get("amount_due", 0) / 100
            
            # You can create a corresponding invoice in your database here
            print(f"New Stripe invoice created: {invoice_id}")
        
        return {"status": "success"}
        
    except Exception as e:
        print(f"Error processing Stripe billing webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook processing error: {str(e)}"
        )
