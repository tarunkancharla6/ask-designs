from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Expense, User
from app.schemas import ExpenseCreate, ExpenseResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.get("", response_model=List[ExpenseResponse])
def list_expenses(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    printer_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Expense).filter(Expense.user_id == current_user.id)
    if start_date:
        q = q.filter(Expense.date >= datetime.fromisoformat(start_date))
    if end_date:
        q = q.filter(Expense.date < datetime.fromisoformat(end_date))
    if printer_id:
        q = q.filter(Expense.printer_id == printer_id)
    return q.order_by(desc(Expense.date)).all()


@router.post("", response_model=ExpenseResponse, status_code=201)
def create_expense(
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exp = Expense(
        date=datetime.fromisoformat(data.date) if data.date else datetime.utcnow(),
        printer_id=data.printer_id,
        expense_type=data.expense_type,
        vendor=data.vendor,
        amount=data.amount,
        payment_mode=data.payment_mode,
        remarks=data.remarks,
        user_id=current_user.id,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exp = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == current_user.id)
        .first()
    )
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(exp)
    db.commit()
