from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Printer, User
from app.schemas import PrinterCreate, PrinterUpdate, PrinterResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/printers", tags=["Printers"])


@router.get("", response_model=List[PrinterResponse])
def list_printers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Printer).filter(Printer.user_id == current_user.id).all()


@router.post("", response_model=PrinterResponse, status_code=201)
def create_printer(
    data: PrinterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    printer = Printer(name=data.name, model=data.model, user_id=current_user.id)
    db.add(printer)
    db.commit()
    db.refresh(printer)
    return printer


@router.put("/{printer_id}", response_model=PrinterResponse)
def update_printer(
    printer_id: str,
    data: PrinterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    printer = (
        db.query(Printer)
        .filter(Printer.id == printer_id, Printer.user_id == current_user.id)
        .first()
    )
    if not printer:
        raise HTTPException(status_code=404, detail="Printer not found")
    if data.name is not None:
        printer.name = data.name
    if data.model is not None:
        printer.model = data.model
    db.commit()
    db.refresh(printer)
    return printer


@router.delete("/{printer_id}", status_code=204)
def delete_printer(
    printer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    printer = (
        db.query(Printer)
        .filter(Printer.id == printer_id, Printer.user_id == current_user.id)
        .first()
    )
    if not printer:
        raise HTTPException(status_code=404, detail="Printer not found")
    db.delete(printer)
    db.commit()
