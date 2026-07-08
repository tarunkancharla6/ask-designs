from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Transaction, User
from app.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime


class CustomerResponse(BaseModel):
    name: str
    phone: str
    total_spent: float
    visit_count: int
    last_visit: datetime

    class Config:
        from_attributes = True


router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.get("", response_model=List[CustomerResponse])
def list_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(
            Transaction.customer_name,
            Transaction.customer_phone,
            func.sum(Transaction.amount).label("total_spent"),
            func.count(Transaction.id).label("visit_count"),
            func.max(Transaction.date).label("last_visit"),
        )
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.customer_name != "",
        )
        .group_by(Transaction.customer_name, Transaction.customer_phone)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )
    return [
        CustomerResponse(
            name=r.customer_name,
            phone=r.customer_phone,
            total_spent=float(r.total_spent),
            visit_count=r.visit_count,
            last_visit=r.last_visit,
        )
        for r in rows
    ]
