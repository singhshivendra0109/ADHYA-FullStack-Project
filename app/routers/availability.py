from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, oauth2
from ..database import get_db

router = APIRouter(
    prefix="/availability",
    tags=['Availability']
)

# 1. Add new availability slots
@router.post("/", response_model=List[schemas.AvailabilityOut])
def create_availability(
    slots: List[schemas.AvailabilityCreate], 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Only tutors should set availability
    if current_user.role == "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Students cannot set availability"
        )

    # Find the tutor's profile
    tutor_profile = db.query(models.TutorProfile).filter(models.TutorProfile.user_id == current_user.id).first()
    if not tutor_profile:
        raise HTTPException(status_code=404, detail="Tutor profile not found. Create a profile first.")

    new_slots = []
    for slot in slots:
        db_slot = models.Availability(tutor_id=tutor_profile.id, **slot.model_dump())
        db.add(db_slot)
        new_slots.append(db_slot)
    
    db.commit()
    
    # Refresh to get IDs for the response
    for slot in new_slots:
        db.refresh(slot)
        
    return new_slots

# 2. Get availability for a specific tutor (Public)
@router.get("/{tutor_id}", response_model=List[schemas.AvailabilityOut])
def get_tutor_availability(tutor_id: int, db: Session = Depends(get_db)):
    return db.query(models.Availability).filter(models.Availability.tutor_id == tutor_id).all()

# 3. Delete a slot
@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(
    slot_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    slot_query = db.query(models.Availability).filter(models.Availability.id == slot_id)
    slot = slot_query.first()

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    # Security: Ensure this slot belongs to the logged-in tutor
    tutor_profile = db.query(models.TutorProfile).filter(models.TutorProfile.user_id == current_user.id).first()
    if not tutor_profile or slot.tutor_id != tutor_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this slot")

    slot_query.delete(synchronize_session=False)
    db.commit()
    return None