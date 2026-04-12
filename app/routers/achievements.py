from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, oauth2
from ..database import get_db

router = APIRouter(prefix="", tags=['Hall of Fame'])

#  ADMIN ONLY: Add a Success Story 
@router.post("", response_model=schemas.AchievementOut, status_code=status.HTTP_201_CREATED)
def add_achievement(
    data: schemas.AchievementCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    #  Security Check
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can update the Success Wall"
        )

    #  Verify Teacher Exists (Fetch from TeacherProfile to get the real name)
    teacher_profile = db.query(models.TeacherProfile).filter(models.TeacherProfile.user_id == data.teacher_id).first()
    
    if not teacher_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Teacher Profile with User ID {data.teacher_id} not found."
        )

    # Create Achievement
    new_achievement = models.Achievement(**data.model_dump())
    
    db.add(new_achievement)
    db.commit()
    db.refresh(new_achievement)
    
    #  Attach name for the Schema response
    setattr(new_achievement, "teacher_name", teacher_profile.full_name)
    
    return new_achievement

#  PUBLIC/ADMIN: Fetch all for Slider & Management 
@router.get("", response_model=List[schemas.AchievementOut])
def get_hall_of_fame(db: Session = Depends(get_db)):
    """Fetch success stories. Used by both Landing Page and Admin Dashboard."""
    
    # We fetch all achievements.
    achievements = db.query(models.Achievement).all()
    
    for a in achievements:
        # Join logic to pull the teacher's name from TeacherProfile
        teacher = db.query(models.TeacherProfile).filter(models.TeacherProfile.user_id == a.teacher_id).first()
        if teacher:
            a.teacher_name = teacher.full_name
        else:
            a.teacher_name = "Adhya Mentor"
            
    return achievements

#  ADMIN ONLY: Delete an Achievement 
@router.delete("/{achievement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_achievement(
    achievement_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Allows Admin to remove a story from the Success Wall."""
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    achievement = db.query(models.Achievement).filter(models.Achievement.id == achievement_id).first()
    
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")

    db.delete(achievement)
    db.commit()
    return None