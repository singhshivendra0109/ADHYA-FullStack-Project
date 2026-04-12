from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
from .. import database, models, utils, schemas

router = APIRouter(tags=['Authentication'])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='api/auth/login')

# 1. LOGIN
@router.post('/login', response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    
    # Fetch user by email 
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid Credentials"
        )

    # Verify the hashed password
    if not utils.verify_password(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid Credentials"
        )

    # Create the JWT Token (Includes user_id and role)
    access_token = utils.create_access_token(data={"user_id": user.id, "role": user.role})

    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role,
        "user_id": user.id 
    }

#  2. GET CURRENT USER DEPENDENCY 
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Decode payload via utils
        payload = utils.verify_access_token(token)
        
        # 2. Check if payload is None before calling .get()
        if payload is None:
            raise credentials_exception
            
        user_id: str = payload.get("user_id")
        
        if user_id is None:
            raise credentials_exception
            
    except (JWTError, Exception):
        # Catch all JWT errors to prevent server crash
        raise credentials_exception
        
    # 3. Database lookup for the user
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if user is None:
        raise credentials_exception
        
    return user