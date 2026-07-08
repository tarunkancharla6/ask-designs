from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Printer, User
from app.schemas import PrinterCreate, PrinterUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/api/printers", tags=["Printers"])

def printer_dict(p):
    return {"id": p.id, "name": p.name, "model": p.model, "created_at": p.created_at.isoformat()}


@router.get("")
def list_printers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [printer_dict(p) for p in db.query(Printer).filter(Printer.user_id == current_user.id).all()]


@router.post("", status_code=201)
def create_printer(
    data: PrinterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        printer = Printer(name=data.name, model=data.model, user_id=current_user.id)
        db.add(printer)
        db.commit()
        db.refresh(printer)
        return printer_dict(printer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{printer_id}")
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
    return printer_dict(printer)


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
