from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from .. import models, schemas, oauth2
from ..database import get_db

router = APIRouter(prefix="", tags=['Teacher Profiles'])

# --- 1. PROFILE CREATION & AUTO-UPDATE (UPSERT) ---
@router.post("", response_model=schemas.TeacherProfileOut)
def create_teacher_profile(
    profile_data: schemas.TeacherProfileCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Only teachers can manage professional profiles."
        )

    existing_profile_query = db.query(models.TeacherProfile).filter(
        models.TeacherProfile.user_id == current_user.id
    )
    existing_profile = existing_profile_query.first()
    
    if existing_profile:
        existing_profile_query.update(profile_data.model_dump(exclude_unset=True), synchronize_session=False)
        db.commit()
        return existing_profile_query.first()

    new_profile = models.TeacherProfile(
        user_id=current_user.id, 
        **profile_data.model_dump()
    )
    
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

# --- 2. DASHBOARD DATA FETCH ---
@router.get("/me", response_model=schemas.TeacherProfileOut)
def get_my_own_profile(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(oauth2.get_current_user)
):
    profile = db.query(models.TeacherProfile).filter(
        models.TeacherProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    stats = db.query(
        func.avg(models.Review.rating).label('average'),
        func.count(models.Review.id).label('count')
    ).filter(models.Review.teacher_id == current_user.id).first()

    p_data = schemas.TeacherProfileOut.model_validate(profile)
    p_data.is_verified = current_user.is_verified
    p_data.average_rating = round(stats.average or 0.0, 1)
    p_data.total_reviews = stats.count or 0
        
    return p_data

# --- 3. UPDATE TEACHER PROFILE (PATCH) ---
@router.patch("/me", response_model=schemas.TeacherProfileOut)
def update_teacher_profile(
    profile_update: schemas.TeacherProfileUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Unauthorized")

    profile_query = db.query(models.TeacherProfile).filter(models.TeacherProfile.user_id == current_user.id)
    profile = profile_query.first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile_query.update(profile_update.model_dump(exclude_unset=True), synchronize_session=False)
    db.commit()
    return profile_query.first()

# --- 4. DISCOVERY ---
@router.get("/all", response_model=List[schemas.TeacherProfileOut])
def get_all_teachers(
    db: Session = Depends(get_db),
    subject: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    city: Optional[str] = None,           
    min_experience: Optional[int] = None  
):
    query = db.query(
        models.TeacherProfile,
        models.User.is_verified
    ).join(
        models.User, models.TeacherProfile.user_id == models.User.id
    ).filter(
        models.User.is_verified == True
    )

    if subject:
        query = query.filter(models.TeacherProfile.subject.ilike(f"%{subject}%"))
    if min_price is not None:
        query = query.filter(models.TeacherProfile.monthly_rate >= min_price)
    if max_price is not None:
        query = query.filter(models.TeacherProfile.monthly_rate <= max_price)
    if city:
        query = query.filter(models.TeacherProfile.city.ilike(f"%{city}%"))
    if min_experience is not None:
        query = query.filter(models.TeacherProfile.experience_years >= min_experience)

    results = query.all()
    
    final_profiles = []
    for profile_obj, is_verified in results:
        stats = db.query(
            func.avg(models.Review.rating).label('average'),
            func.count(models.Review.id).label('count')
        ).filter(models.Review.teacher_id == profile_obj.user_id).first()
        
        p_data = schemas.TeacherProfileOut.model_validate(profile_obj)
        p_data.is_verified = is_verified
        p_data.average_rating = round(stats.average or 0.0, 1)
        p_data.total_reviews = stats.count or 0
        final_profiles.append(p_data)
        
    return final_profiles

# --- 5. TEACHER AVAILABILITY (POST) ---
@router.post("/availability", response_model=schemas.AvailabilityOut)
def set_availability(
    data: schemas.AvailabilityCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can set availability")

    existing_slot = db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.teacher_id == current_user.id,
        models.TeacherAvailability.month_year == data.month_year,
        models.TeacherAvailability.time_slot == data.time_slot
    ).first()

    if existing_slot:
        raise HTTPException(status_code=400, detail="This slot is already marked as available")

    new_slot = models.TeacherAvailability(
        teacher_id=current_user.id,
        **data.model_dump()
    )
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    return new_slot

# --- 6. TEACHER AVAILABILITY (GET - STRICT GLOBAL CHECK) ---
@router.get("/availability/{teacher_id}", response_model=List[schemas.AvailabilityOut])
def get_teacher_availability(teacher_id: int, month_year: str, db: Session = Depends(get_db)):
    # 1. Teacher ke saare active slots fetch karein
    slots = db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.teacher_id == teacher_id,
        models.TeacherAvailability.month_year == month_year,
        models.TeacherAvailability.is_active == True
    ).all()

    # 2. Saare "accepted" bookings fetch karein is teacher ke liye
    accepted_bookings = db.query(models.Booking).filter(
        models.Booking.teacher_id == teacher_id,
        models.Booking.month_year == month_year,
        models.Booking.status == "accepted"
    ).all()

    # 🔥 STRICT FORMATTING: Dono sides se extra spaces hatao aur lowercase karo
    booked_time_slots = {b.time_slot.strip().lower() for b in accepted_bookings}

    results = []
    for slot in slots:
        # Pydantic model to Dict
        slot_dict = schemas.AvailabilityOut.model_validate(slot).model_dump()
        
        # 🔥 Match check with clean strings
        current_slot_clean = slot.time_slot.strip().lower()
        slot_dict["is_booked"] = current_slot_clean in booked_time_slots
        
        results.append(slot_dict)

    return results

# --- 7. MANAGE BOOKINGS ---
@router.get("/bookings", response_model=List[schemas.BookingOut])
def get_incoming_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can access this list")
    
    return db.query(models.Booking).filter(models.Booking.teacher_id == current_user.id).all()

@router.patch("/bookings/{booking_id}", response_model=schemas.BookingOut)
def update_hire_request(
    booking_id: int,
    status_update: schemas.BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id, 
        models.Booking.teacher_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking request not found")

    booking.status = status_update.status
    db.commit()
    db.refresh(booking)
    return booking

# --- 8. TEACHER DASHBOARD STATS ---
@router.get("/dashboard/stats")
def get_teacher_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Unauthorized")

    student_count = db.query(models.Booking).filter(
        models.Booking.teacher_id == current_user.id,
        models.Booking.status == "accepted"
    ).count()

    earnings = db.query(func.sum(models.TeacherProfile.monthly_rate)).join(
        models.Booking, models.Booking.teacher_id == models.TeacherProfile.user_id
    ).filter(
        models.Booking.teacher_id == current_user.id,
        models.Booking.status == "accepted"
    ).scalar() or 0

    return {
        "active_students": student_count,
        "monthly_revenue": earnings,
        "pending_requests": db.query(models.Booking).filter(
            models.Booking.teacher_id == current_user.id, 
            models.Booking.status == "pending"
        ).count()
    }

# --- 9. DELETE AVAILABILITY SLOT ---
@router.delete("/availability/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Unauthorized")

    slot = db.query(models.TeacherAvailability).filter(
        models.TeacherAvailability.id == slot_id,
        models.TeacherAvailability.teacher_id == current_user.id
    ).first()

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found or you are not the owner")

    db.delete(slot)
    db.commit()
    return None 

# --- 10. SPECIFIC PROFILE BY USER ID ---
@router.get("/user/{u_id}", response_model=schemas.TeacherProfileOut)
def get_profile_by_user_id(u_id: int, db: Session = Depends(get_db)):
    result = db.query(
        models.TeacherProfile,
        models.User.is_verified
    ).join(
        models.User, models.TeacherProfile.user_id == models.User.id
    ).filter(models.TeacherProfile.user_id == u_id).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Mentor Profile Not Found")

    profile_obj, is_verified = result

    stats = db.query(
        func.avg(models.Review.rating).label('average'),
        func.count(models.Review.id).label('count')
    ).filter(models.Review.teacher_id == u_id).first()

    p_data = schemas.TeacherProfileOut.model_validate(profile_obj)
    p_data.is_verified = is_verified
    p_data.average_rating = round(stats.average or 0.0, 1)
    p_data.total_reviews = stats.count or 0
        
    return p_data