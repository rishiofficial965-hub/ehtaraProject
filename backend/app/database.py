import os
import sys
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database")

load_dotenv()

# Database URL formulation
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logger.error("\n========================================================================\n"
                 "CRITICAL CONFIGURATION ERROR: DATABASE_URL environment variable is not set.\n"
                 "Please set the DATABASE_URL environment variable (e.g., in a .env file or container settings)\n"
                 "before running the application.\n"
                 "========================================================================")
    sys.exit(1)

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
