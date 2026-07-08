from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    shop_name: str

    class Config:
        from_attributes = True


class PrinterCreate(BaseModel):
    name: str
    model: str = ""


class PrinterUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None


class PrinterResponse(BaseModel):
    id: str
    name: str
    model: str
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    date: Optional[str] = None
    printer_id: str
    service_type: str
    quantity: float = 0
    rate: float = 0
    amount: float
    payment_method: str = "Cash"
    customer_name: str = ""
    customer_phone: str = ""
    remarks: str = ""


class TransactionResponse(BaseModel):
    id: str
    date: datetime
    printer_id: str
    service_type: str
    quantity: float
    rate: float
    amount: float
    payment_method: str
    customer_name: str
    customer_phone: str
    remarks: str
    type: str
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    date: Optional[str] = None
    printer_id: str
    expense_type: str
    vendor: str = ""
    amount: float
    payment_mode: str = "Cash"
    remarks: str = ""


class ExpenseResponse(BaseModel):
    id: str
    date: datetime
    printer_id: str
    expense_type: str
    vendor: str
    amount: float
    payment_mode: str
    remarks: str
    type: str
    created_at: datetime

    class Config:
        from_attributes = True
