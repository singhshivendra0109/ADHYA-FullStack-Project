from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas, oauth2, database

router = APIRouter(prefix="", tags=['Admin Dashboard'])

# 1. PUBLIC ANALYTICS 

@router.get("/hero-stats")
def get_hero_stats(db: Session = Depends(database.get_db)):
    """
    Publicly accessible stats for the Hero section.
    Does NOT require login/admin role.
    """
    # Count Tutors
    tutor_count = db.query(models.User).filter(models.User.role == "teacher").count()
    # Count Students
    student_count = db.query(models.User).filter(models.User.role == "student").count()
    # Average Rating across all reviews
    avg_rating = db.query(func.avg(models.Review.rating)).scalar() or 0.0
    
    return {
        "total_tutors": tutor_count,
        "total_students": student_count,
        "average_rating": round(float(avg_rating), 1)
    }

#  2. USER MANAGEMENT 

@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return db.query(models.User).all()

@router.patch("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = not user.is_verified 
    db.commit()
    
    status_msg = "activated" if user.is_verified else "deactivated"
    return {"message": f"User {user.email} has been {status_msg}"}

# 3. TEACHER VERIFICATION FLOW

@router.get("/pending-teachers", response_model=List[schemas.TeacherProfileOut])
def get_pending_verifications(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Adjusted to filter specifically for teachers who need the green light
    return db.query(models.TeacherProfile).join(models.User).filter(models.User.is_verified == False).all()

@router.patch("/teacher/{teacher_id}/verify-flow", response_model=schemas.UserOut)
def update_teacher_verification(
    teacher_id: int,
    status_data: schemas.TeacherStatusUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    teacher = db.query(models.User).filter(models.User.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    teacher.interview_status = status_data.new_status
    
    if status_data.new_status == "verified":
        teacher.is_verified = True
    else:
        teacher.is_verified = False
        
    db.commit()
    db.refresh(teacher)
    return teacher

#  4. DEEP ANALYTICS (Admin Only) 

@router.get("/analytics")
def get_platform_analytics(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    return {
        "total_revenue_volume": db.query(func.sum(models.TeacherProfile.monthly_rate)).join(
            models.Booking, models.Booking.teacher_id == models.TeacherProfile.user_id
        ).filter(models.Booking.status == "accepted").scalar() or 0,
        "active_partnerships": db.query(models.Booking).filter(models.Booking.status == "accepted").count(),
        "user_breakdown": {
            "students": db.query(models.User).filter(models.User.role == "student").count(),
            "verified_teachers": db.query(models.User).filter(models.User.role == "teacher", models.User.is_verified == True).count(),
            "pending_teachers": db.query(models.User).filter(models.User.role == "teacher", models.User.is_verified == False).count()
        }
    }