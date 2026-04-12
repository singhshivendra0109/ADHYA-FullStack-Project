from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas, oauth2
from ..database import get_db

router = APIRouter(prefix="/api/analytics", tags=['Analytics & Admin'])

# 1. PUBLIC STATS (For  Hero Section)
@router.get("/hero-stats")
def get_hero_stats(db: Session = Depends(get_db)):
    # Count only active tutors
    tutor_count = db.query(models.User).filter(models.User.role == "teacher").count()
    # Count students
    student_count = db.query(models.User).filter(models.User.role == "student").count()
    # Average rating across all reviews
    avg_rating = db.query(func.avg(models.Review.rating)).scalar() or 0.0
    
    return {
        "total_tutors": tutor_count,
        "total_students": student_count,
        "average_rating": round(float(avg_rating), 1)
    }

# 2. ADMIN: GET UNVERIFIED TEACHERS
@router.get("/unverified-tutors", response_model=List[schemas.TutorProfileOut])
def get_pending_verification(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Security: Only Admin can see this list
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return db.query(models.TutorProfile).filter(models.TutorProfile.is_verified == False).all()

# 3. ADMIN: TOGGLE VERIFICATION (The Verify Button)
@router.patch("/verify/{profile_id}")
def toggle_verify(
    profile_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    profile = db.query(models.TutorProfile).filter(models.TutorProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Flip the status
    profile.is_verified = not profile.is_verified
    db.commit()
    db.refresh(profile)
    
    return {"msg": f"Verification status updated to {profile.is_verified}"}