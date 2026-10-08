from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


engine = create_engine(settings.database_url, pool_pre_ping=True)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Import every mapped model once the declarative base exists. This ensures
# string-based SQLAlchemy relationships are registered before the first query.
from app import models as _models  # noqa: E402,F401
