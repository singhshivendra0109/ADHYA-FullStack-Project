from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, oauth2
from ..database import get_db

router = APIRouter(prefix="", tags=['Reviews'])

@router.post("", response_model=schemas.ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: schemas.ReviewCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # 1. Security: Only students can leave reviews
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can leave reviews")

    # 2. Validation: Did this student actually have an ACCEPTED booking?
    booking = db.query(models.Booking).filter(
        models.Booking.id == review_data.booking_id,
        models.Booking.student_id == current_user.id,
        models.Booking.teacher_id == review_data.teacher_id,
        models.Booking.status == "accepted"
    ).first()

    if not booking:
        raise HTTPException(
            status_code=400, 
            detail="You can only review a teacher after an accepted booking."
        )

    # 3. Prevent Duplicate Reviews: One review per booking
    existing_review = db.query(models.Review).filter(models.Review.booking_id == review_data.booking_id).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this session.")

    # 4. Save Review
    new_review = models.Review(student_id=current_user.id, **review_data.model_dump())
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review


# Add this ABOVE the @router.get
@router.get("/", response_model=List[schemas.ReviewOut])
def get_all_reviews(db: Session = Depends(get_db)):
    return db.query(models.Review).all()

# 5. Get all reviews for a specific teacher
@router.get("/{teacher_id}", response_model=List[schemas.ReviewOut])
def get_teacher_reviews(teacher_id: int, db: Session = Depends(get_db)):
    return db.query(models.Review).filter(models.Review.teacher_id == teacher_id).all()