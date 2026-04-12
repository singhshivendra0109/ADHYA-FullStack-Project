from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, utils
from sqlalchemy import func

router = APIRouter(tags=['Users'])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        # 1. Email check
        existing_user = db.query(models.User).filter(models.User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # 2. Password Hashing 
        hashed_pwd = utils.hash_password(user.password)
        
        # 3. DB Instance creation

        new_user = models.User(
            email=user.email,
            password=hashed_pwd, 
            role=user.role
            # Baaki columns default value le lenge
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
        
    except Exception as e:
        # Isse  terminal mein dikh jayega ki asali galti kya hai
        print(f"DATABASE ERROR: {e}")
        # Raising the specific error detail helps you debug in Postman
        raise HTTPException(status_code=500, detail=str(e))
    

