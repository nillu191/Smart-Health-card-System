from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings

# Format and normalize database URL
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    # Fix SQLAlchemy 1.4+ deprecated dialect prefix
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine_kwargs = {}
if "sqlite" in db_url:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Supabase / PostgreSQL cloud optimization settings
    engine_kwargs["pool_pre_ping"] = True      # Verify connection validity before querying
    engine_kwargs["pool_recycle"] = 300       # Recycle connections every 5 minutes to avoid stale timeouts
    engine_kwargs["pool_size"] = 10           # Base connection pool size
    engine_kwargs["max_overflow"] = 20        # Allow up to 20 extra bursting connections

engine = create_engine(
    db_url, **engine_kwargs
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
