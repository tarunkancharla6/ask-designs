from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import init_db, SessionLocal
from app.models import User, Printer
from app.auth import get_password_hash
from app.routes.auth import router as auth_router
from app.routes.printers import router as printer_router
from app.routes.transactions import router as transaction_router
from app.routes.expenses import router as expense_router
from app.routes.customers import router as customer_router

app = FastAPI(title="ASK DESIGNS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(printer_router)
app.include_router(transaction_router)
app.include_router(expense_router)
app.include_router(customer_router)


@app.on_event("startup")
def on_startup():
    init_db()
    db: Session = SessionLocal()
    try:
        user = db.query(User).first()
        if not user:
            user = User(
                username="admin",
                password_hash=get_password_hash("admin"),
                shop_name="ASK DESIGNS",
            )
            db.add(user)
            db.flush()

            default_printers = [
                {"name": "KYOCERA", "model": "Kyocera"},
                {"name": "KONICA", "model": "Konica Minolta"},
                {"name": "EPSON", "model": "Epson"},
            ]
            for p in default_printers:
                printer = Printer(name=p["name"], model=p["model"], user_id=user.id)
                db.add(printer)
            db.commit()
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok", "app": "ASK DESIGNS API"}
