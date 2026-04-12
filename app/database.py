import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv


load_dotenv()

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")

# Local Development
if not SQLALCHEMY_DATABASE_URL:
    raw_password = "Singh0109@"
    safe_password = urllib.parse.quote_plus(raw_password)
    SQLALCHEMY_DATABASE_URL = f"postgresql://postgres:{safe_password}@127.0.0.1:5432/tutor_db"
else:
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)


engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


Base = declarative_base()

#  Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# create the tables in the database
def init_db():
    Base.metadata.create_all(bind=engine)