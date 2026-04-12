from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, oauth2, database
from sqlalchemy import func
from typing import List

router = APIRouter(prefix="", tags=['Student Profiles'])

# 1. PUBLIC: FETCH ALL STUDENT NAMES 
@router.get("/all-names", response_model=List[schemas.StudentProfileOut])
def get_public_student_names(db: Session = Depends(database.get_db)):
    """A public route that only returns basic profile info for UI name mapping."""
    return db.query(models.StudentProfile).all()

# 2. CREATE PROFILE 
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.StudentProfileOut)
def create_student_profile(
    profile: schemas.StudentProfileCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user) 
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only students can create a student profile"
        )

    existing_profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == current_user.id
    ).first()
    
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Profile already exists for this user. Use PATCH to update."
        )

    new_profile = models.StudentProfile(
        user_id=current_user.id, 
        **profile.model_dump()
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

#  3. FETCH OWN PROFILE
@router.get("/me", response_model=schemas.StudentProfileOut)
def get_my_profile(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

#  4. UPDATE OWN PROFILE 
@router.patch("/me", response_model=schemas.StudentProfileOut)
def update_student_profile(
    profile_update: schemas.StudentProfileUpdate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    profile_query = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == current_user.id
    )
    profile = profile_query.first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile_query.update(profile_update.model_dump(exclude_unset=True), synchronize_session=False)
    db.commit()
    return profile_query.first()

#  5. DASHBOARD STATS
@router.get("/dashboard-stats", status_code=status.HTTP_200_OK)
def get_student_dashboard_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")

    active_teachers = db.query(models.Booking).filter(
        models.Booking.student_id == current_user.id,
        models.Booking.status == "accepted"
    ).count()

    pending_count = db.query(models.Booking).filter(
        models.Booking.student_id == current_user.id,
        models.Booking.status == "pending"
    ).count()

    reviews_count = db.query(models.Review).filter(
        models.Review.student_id == current_user.id
    ).count()

    return {
        "total_active_teachers": active_teachers,
        "pending_requests": pending_count,
        "total_reviews_given": reviews_count
    }

#  6. BOOKING HISTORY 
@router.get("/my-bookings", response_model=List[schemas.BookingOut])
def get_student_booking_history(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")

    return db.query(models.Booking).filter(models.Booking.student_id == current_user.id).all()

# 7. FETCH SPECIFIC STUDENT (For Admin/Teacher Discovery)
@router.get("/{user_id}", response_model=schemas.StudentProfileOut)
def get_student_by_id(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Allows authenticated users (Admins/Teachers) to view a specific student profile."""
    profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == user_id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Student profile data not found."
        )
        
    return profile