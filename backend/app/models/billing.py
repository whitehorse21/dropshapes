from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True)
    
    # Invoice details
    invoice_number = Column(String, unique=True, nullable=False, index=True)
    invoice_date = Column(DateTime(timezone=True), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    
    # Amounts
    subtotal = Column(Float, nullable=False, default=0.0)
    tax_amount = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False)
    
    # Status
    status = Column(String, nullable=False, default="pending")  # pending, paid, failed, cancelled, refunded
    payment_status = Column(String, nullable=True)  # paid, unpaid, overdue
    
    # Plan details
    plan_name = Column(String, nullable=True)
    billing_period = Column(String, nullable=True)  # "January 2025", "Q1 2025", etc.
    billing_period_start = Column(DateTime(timezone=True), nullable=True)
    billing_period_end = Column(DateTime(timezone=True), nullable=True)
    
    # Payment provider details
    payment_provider = Column(String, nullable=True)  # stripe, paypal, manual
    external_invoice_id = Column(String, nullable=True)  # Stripe invoice ID, PayPal invoice ID, etc.
    payment_method = Column(String, nullable=True)  # card, bank_transfer, paypal, etc.
    
    # Additional details
    currency = Column(String, nullable=False, default="USD")
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Payment details
    paid_at = Column(DateTime(timezone=True), nullable=True)
    payment_intent_id = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="invoices")
    subscription = relationship("Subscription", back_populates="invoices")
    line_items = relationship("InvoiceLineItem", back_populates="invoice", cascade="all, delete-orphan")

class InvoiceLineItem(Base):
    __tablename__ = "invoice_line_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    
    # Line item details
    description = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Product/service details
    product_type = Column(String, nullable=True)  # subscription, one_time, credit, etc.
    product_id = Column(String, nullable=True)  # Reference to product/plan ID
    
    # Period for recurring items
    period_start = Column(DateTime(timezone=True), nullable=True)
    period_end = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    invoice = relationship("Invoice", back_populates="line_items")
