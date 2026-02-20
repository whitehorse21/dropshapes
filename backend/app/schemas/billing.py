from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Invoice Line Item schemas
class InvoiceLineItemBase(BaseModel):
    description: str
    quantity: int = 1
    unit_price: float
    total_price: float
    product_type: Optional[str] = None
    product_id: Optional[str] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None

class InvoiceLineItemCreate(InvoiceLineItemBase):
    pass

class InvoiceLineItemResponse(InvoiceLineItemBase):
    id: int
    invoice_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Invoice schemas
class InvoiceBase(BaseModel):
    invoice_number: str
    invoice_date: datetime
    due_date: Optional[datetime] = None
    subtotal: float = 0.0
    tax_amount: float = 0.0
    total_amount: float
    status: str = "pending"
    payment_status: Optional[str] = None
    plan_name: Optional[str] = None
    billing_period: Optional[str] = None
    billing_period_start: Optional[datetime] = None
    billing_period_end: Optional[datetime] = None
    payment_provider: Optional[str] = None
    external_invoice_id: Optional[str] = None
    payment_method: Optional[str] = None
    currency: str = "USD"
    description: Optional[str] = None
    notes: Optional[str] = None
    paid_at: Optional[datetime] = None
    payment_intent_id: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    user_id: int
    subscription_id: Optional[int] = None
    line_items: Optional[List[InvoiceLineItemCreate]] = []

class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    paid_at: Optional[datetime] = None
    payment_intent_id: Optional[str] = None
    external_invoice_id: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class InvoiceResponse(InvoiceBase):
    id: int
    user_id: int
    subscription_id: Optional[int] = None
    line_items: List[InvoiceLineItemResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Simplified billing history response for frontend
class BillingHistoryItem(BaseModel):
    id: str = Field(description="Invoice ID formatted as INV-YYYY-XXX")
    date: str = Field(description="Invoice date in YYYY-MM-DD format")
    amount: float = Field(description="Total amount of the invoice")
    status: str = Field(description="Payment status (paid, pending, failed, etc.)")
    plan: str = Field(description="Subscription plan name")
    period: str = Field(description="Billing period description")
    invoice_number: Optional[str] = None
    payment_method: Optional[str] = None
    currency: str = "USD"

class BillingHistoryResponse(BaseModel):
    invoices: List[BillingHistoryItem]
    total_count: int
    current_page: int
    total_pages: int
    has_next: bool
    has_previous: bool

# Invoice details response
class InvoiceDetailsResponse(BaseModel):
    id: str
    invoice_number: str
    date: datetime
    due_date: Optional[datetime] = None
    status: str
    payment_status: Optional[str] = None
    subtotal: float
    tax_amount: float
    total_amount: float
    currency: str
    plan_name: Optional[str] = None
    billing_period: Optional[str] = None
    billing_period_start: Optional[datetime] = None
    billing_period_end: Optional[datetime] = None
    payment_method: Optional[str] = None
    paid_at: Optional[datetime] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    line_items: List[InvoiceLineItemResponse] = []
    download_url: Optional[str] = None  # For PDF download

# Payment statistics
class PaymentStats(BaseModel):
    total_paid: float
    total_pending: float
    total_failed: float
    total_invoices: int
    average_payment: float
    currency: str = "USD"

# Billing summary
class BillingSummary(BaseModel):
    current_subscription: Optional[str] = None
    next_billing_date: Optional[datetime] = None
    next_billing_amount: Optional[float] = None
    payment_method: Optional[str] = None
    billing_address: Optional[str] = None
    recent_invoices: List[BillingHistoryItem] = []
    payment_stats: PaymentStats
