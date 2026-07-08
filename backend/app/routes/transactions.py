from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Transaction, User
from app.schemas import TransactionCreate, TransactionResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    printer_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if start_date:
        q = q.filter(Transaction.date >= datetime.fromisoformat(start_date))
    if end_date:
        q = q.filter(Transaction.date < datetime.fromisoformat(end_date))
    if printer_id:
        q = q.filter(Transaction.printer_id == printer_id)
    return q.order_by(desc(Transaction.date)).all()


@router.post("", response_model=TransactionResponse, status_code=201)
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txn = Transaction(
        date=datetime.fromisoformat(data.date) if data.date else datetime.utcnow(),
        printer_id=data.printer_id,
        service_type=data.service_type,
        quantity=data.quantity,
        rate=data.rate,
        amount=data.amount,
        payment_method=data.payment_method,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        remarks=data.remarks,
        user_id=current_user.id,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txn = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(txn)
    db.commit()
