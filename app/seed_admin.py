import os
import sys
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Path detection: Isse script ko pata chalta hai ki .env kahan hai
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(BASE_DIR, ".env")

# Pehle check karo agar .env file physically exist karti hai toh load karo
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)

# System path mein root folder add karo taaki 'app.database' mil sake
sys.path.append(BASE_DIR)

from app.database import SessionLocal, engine
from app import models
from app.utils import hash_password

def seed_admin():
    db = SessionLocal()
    try:
        # Production ready: Dashboard ya .env dono se utha sakta hai
        admin_email = os.environ.get("ADMIN_EMAIL")
        admin_pass = os.environ.get("ADMIN_PASSWORD")

        if not admin_email or not admin_pass:
            print(f" ERROR: Credentials not found.")
            print(f"DEBUG: Checked system env and file at: {env_path}")
            return

        # Tables create karo agar nahi hain
        models.Base.metadata.create_all(bind=engine)

        user = db.query(models.User).filter(models.User.email == admin_email).first()

        if not user:
            print(f" Creating new Admin: {admin_email}")
            new_admin = models.User(
                email=admin_email,
                password=hash_password(admin_pass),
                role="admin",
                is_verified=True
            )
            db.add(new_admin)
            db.commit()
            print(" Admin created successfully!")
        else:
            # Role update logic (Important for production)
            user.role = "admin"
            user.is_verified = True
            db.commit()
            print(f" User {admin_email} is now an Admin.")

    except Exception as e:
        print(f" CRITICAL ERROR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()