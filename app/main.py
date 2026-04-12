from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Absolute imports for Render/Production consistency
from app.database import engine, get_db
from app import models
from app.routers import users, auth, profiles, student_profile, bookings, reviews, achievements, admin, chat

# Create the tables in the database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ADHYA: Backend Hub")

# CORS CONFIGURATION
origins = [
    "http://localhost:5173", 
    "http://localhost:5174", 
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "ws://localhost:5173",    
    "ws://127.0.0.1:5173"
    "https://adhya-full-stack.vercel.app", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api/auth") 
app.include_router(users.router, prefix="/api/users")
app.include_router(profiles.router, prefix="/api/profiles")
app.include_router(student_profile.router, prefix="/api/student")
app.include_router(bookings.router, prefix="/api/bookings")
app.include_router(reviews.router, prefix="/api/reviews")
app.include_router(achievements.router, prefix="/api/achievements")
app.include_router(admin.router, prefix="/api/admin")
app.include_router(chat.router, prefix="/api/chat")

@app.get("/")
def root():
    return {"status": "ADHYA API is Online"}


@app.get("/make-admin/admin@gmail.com")
def setup_final_admin(db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == "admin@gmail.com").first()
    
    if not user:
        return {
            "status": "Error", 
            "message": "User 'admin@gmail.com' nahi mila. Pehle website par ja kar is email se SIGNUP karein!"
        }

    user.role = "admin"
    user.is_verified = True
    db.commit()
    
    return {
        "status": "Success", 
        "message": "Mubarak ho! admin@gmail.com ab Admin ban chuka hai."
    }

@app.get("/activate-admin-adhya")
def activate_admin(db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == "admin@gmail.com").first()
    
    if not user:
        return {"status": "error", "message": "User admin@gmail.com not found. Pehle signup karein!"}

    user.role = "admin"
    user.is_verified = True
    db.commit()
    
    return {"status": "success", "message": "admin@gmail.com is now a Verified ADMIN!"}