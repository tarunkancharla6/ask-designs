from pydantic_settings import BaseSettings


import os


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./ask_designs.db"
    SECRET_KEY: str = "ask-designs-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"


settings = Settings()

if "VERCEL" in os.environ and settings.DATABASE_URL.startswith("sqlite"):
    import tempfile
    db_path = os.path.join(tempfile.gettempdir(), "ask_designs.db")
    settings.DATABASE_URL = f"sqlite:///{db_path}"
