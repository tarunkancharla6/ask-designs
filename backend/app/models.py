import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def utcnow():
    return datetime.now(timezone.utc)


class PaymentMethod(str, enum.Enum):
    CASH = "Cash"
    UPI = "UPI"
    CARD = "Card"


class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    shop_name = Column(String(200), default="ASK DESIGNS")
    created_at = Column(DateTime, default=utcnow)


class Printer(Base):
    __tablename__ = "printers"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    model = Column(String(100), default="")
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    date = Column(DateTime, nullable=False, default=utcnow)
    printer_id = Column(String, ForeignKey("printers.id"), nullable=False)
    service_type = Column(String(100), nullable=False)
    quantity = Column(Integer, default=0)
    rate = Column(Float, default=0)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(20), default="Cash")
    customer_name = Column(String(200), default="")
    customer_phone = Column(String(20), default="")
    remarks = Column(String(500), default="")
    type = Column(String(10), default="income")
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    printer = relationship("Printer")
    user = relationship("User")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, default=generate_uuid)
    date = Column(DateTime, nullable=False, default=utcnow)
    printer_id = Column(String, ForeignKey("printers.id"), nullable=False)
    expense_type = Column(String(100), nullable=False)
    vendor = Column(String(200), default="")
    amount = Column(Float, nullable=False)
    payment_mode = Column(String(20), default="Cash")
    remarks = Column(String(500), default="")
    type = Column(String(10), default="expense")
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    printer = relationship("Printer")
    user = relationship("User")
