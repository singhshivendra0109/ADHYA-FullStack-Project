from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, oauth2
from ..database import get_db

router = APIRouter(prefix="", tags=['Bookings'])

#  1. HIRE A TEACHER (Student Only)
@router.post("", response_model=schemas.BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: schemas.BookingCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Allows students to request a hire. Includes double-booking prevention."""
    # Security: Ensure only students can book
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only students can book teachers"
        )

    # PREVENT DOUBLE BOOKING: Check if an 'accepted' booking already exists
    existing_booking = db.query(models.Booking).filter(
        models.Booking.teacher_id == booking_data.teacher_id,
        models.Booking.month_year == booking_data.month_year,
        models.Booking.time_slot == booking_data.time_slot,
        models.Booking.status == "accepted"
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="This slot is already booked and accepted by another student."
        )

    # Create the pending booking
    new_booking = models.Booking(
        student_id=current_user.id,
        **booking_data.model_dump()
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking

# 2. UPDATE STATUS (Teacher Only - Approve/Reject) 
@router.patch("/{booking_id}/status", response_model=schemas.BookingOut)
def update_booking_status(
    booking_id: int,
    status_update: schemas.BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Allows teachers to Accept/Reject requests. Locks the slot upon acceptance."""
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    # Security: Only the assigned teacher can change the status
    if booking.teacher_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this booking")

    # Final conflict check before allowing 'accepted' status
    if status_update.status == "accepted":
        conflict = db.query(models.Booking).filter(
            models.Booking.id != booking_id,
            models.Booking.teacher_id == current_user.id,
            models.Booking.month_year == booking.month_year,
            models.Booking.time_slot == booking.time_slot,
            models.Booking.status == "accepted"
        ).first()
        
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="You already have an accepted booking for this slot."
            )

    booking.status = status_update.status
    db.commit()
    db.refresh(booking)
    return booking

#  3. STUDENT DASHBOARD (Fetch My Hires)
@router.get("/my-bookings", response_model=List[schemas.BookingOut])
def get_student_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Fetch all hire requests made by the logged-in student."""
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can view their booking history")
        
    return db.query(models.Booking).filter(models.Booking.student_id == current_user.id).all()

#  4. TEACHER DASHBOARD (Fetch Incoming Requests) 
@router.get("/incoming", response_model=List[schemas.BookingOut])
def get_teacher_incoming_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Fetches all hire requests sent to the logged-in teacher."""
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can view incoming requests")

    return db.query(models.Booking).filter(models.Booking.teacher_id == current_user.id).all()

#  5. WITHDRAW BOOKING (Student Only - Delete logic) 
@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def withdraw_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Allows a student to delete/withdraw their booking request."""
    booking_query = db.query(models.Booking).filter(models.Booking.id == booking_id)
    booking = booking_query.first()

    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    # Security: Ensure only the student who created the booking can delete it
    if booking.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You are not authorized to withdraw this booking"
        )

    #  Prevent deleting if the teacher already accepted it
    if booking.status == "accepted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Cannot withdraw an accepted booking. Please contact the mentor directly."
        )

    booking_query.delete(synchronize_session=False)
    db.commit()
    return None