import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()
# Database URL formulation
# Default to Docker-compose PostgreSQL service name 'db'
DATABASE_URL = os.getenv(
    "DATABASE_URL"
)

if not DATABASE_URL:
    raise ValueError("Database_url is not set")

# SQLite fallback can be helpful for debugging/local testing, but database requirements specify PostgreSQL.
# If database URL starts with postgres://, replace with postgresql:// to ensure SQLAlchemy compatibility (especially on platforms like Render)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
