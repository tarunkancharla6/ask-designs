import json
import os
import urllib.request
import urllib.error

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import User, Printer, Transaction, Expense
from app.auth import get_password_hash

GIST_ID = os.environ.get("DATA_GIST_ID", "")
GH_TOKEN = os.environ.get("GH_TOKEN", "")


def _gist_api(method="GET", data=None):
    if not GIST_ID or not GH_TOKEN:
        return None
    url = f"https://api.github.com/gists/{GIST_ID}"
    headers = {
        "Authorization": f"Bearer {GH_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "ask-designs/1.0",
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except Exception:
        return None


def load_from_gist():
    result = _gist_api("GET")
    if not result:
        return None
    content = result.get("files", {}).get("ask-designs-backup.json", {}).get("content", "")
    if not content:
        return None
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return None


def save_to_gist(data: dict):
    payload = {
        "files": {
            "ask-designs-backup.json": {
                "content": json.dumps(data, indent=2, default=str)
            }
        }
    }
    _gist_api("PATCH", payload)


def export_db():
    db: Session = SessionLocal()
    try:
        users = []
        for u in db.query(User).all():
            users.append({
                "id": u.id,
                "username": u.username,
                "password_hash": u.password_hash,
                "shop_name": u.shop_name,
                "created_at": str(u.created_at),
            })
        printers = []
        for p in db.query(Printer).all():
            printers.append({
                "id": p.id,
                "name": p.name,
                "model": p.model,
                "user_id": p.user_id,
                "created_at": str(p.created_at),
            })
        transactions = []
        for t in db.query(Transaction).all():
            transactions.append({
                "id": t.id,
                "date": str(t.date),
                "printer_id": t.printer_id,
                "service_type": t.service_type,
                "quantity": t.quantity,
                "rate": t.rate,
                "amount": t.amount,
                "payment_method": t.payment_method,
                "customer_name": t.customer_name,
                "customer_phone": t.customer_phone,
                "remarks": t.remarks,
                "type": t.type,
                "user_id": t.user_id,
                "created_at": str(t.created_at),
            })
        expenses = []
        for e in db.query(Expense).all():
            expenses.append({
                "id": e.id,
                "date": str(e.date),
                "printer_id": e.printer_id,
                "expense_type": e.expense_type,
                "vendor": e.vendor,
                "amount": e.amount,
                "payment_mode": e.payment_mode,
                "remarks": e.remarks,
                "type": e.type,
                "user_id": e.user_id,
                "created_at": str(e.created_at),
            })
        return {
            "version": "1",
            "users": users,
            "printers": printers,
            "transactions": transactions,
            "expenses": expenses,
        }
    finally:
        db.close()


def import_db(data: dict):
    db: Session = SessionLocal()
    try:
        for table in [Transaction, Expense, Printer, User]:
            db.query(table).delete()
        db.commit()

        for u in data.get("users", []):
            db.add(User(
                id=u["id"],
                username=u["username"],
                password_hash=u["password_hash"],
                shop_name=u.get("shop_name", "ASK DESIGNS"),
            ))
        db.commit()

        for p in data.get("printers", []):
            db.add(Printer(
                id=p["id"],
                name=p["name"],
                model=p.get("model", ""),
                user_id=p["user_id"],
            ))
        db.commit()

        for t in data.get("transactions", []):
            db.add(Transaction(
                id=t["id"],
                printer_id=t["printer_id"],
                service_type=t["service_type"],
                quantity=t.get("quantity", 0),
                rate=t.get("rate", 0),
                amount=t["amount"],
                payment_method=t.get("payment_method", "Cash"),
                customer_name=t.get("customer_name", ""),
                customer_phone=t.get("customer_phone", ""),
                remarks=t.get("remarks", ""),
                type=t.get("type", "income"),
                user_id=t["user_id"],
            ))
        db.commit()

        for e in data.get("expenses", []):
            db.add(Expense(
                id=e["id"],
                printer_id=e["printer_id"],
                expense_type=e["expense_type"],
                vendor=e.get("vendor", ""),
                amount=e["amount"],
                payment_mode=e.get("payment_mode", "Cash"),
                remarks=e.get("remarks", ""),
                type=e.get("type", "expense"),
                user_id=e["user_id"],
            ))
        db.commit()
    finally:
        db.close()


def backup():
    data = export_db()
    save_to_gist(data)


def restore():
    data = load_from_gist()
    if data:
        import_db(data)
        return True
    return False
