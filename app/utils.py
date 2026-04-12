import os
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Hashing Configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security Settings
SECRET_KEY = os.getenv("SECRET_KEY", "YOUR_SUPER_SECRET_KEY_FOR_SMVIT_PROJECT") 
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)) 


#  1. PASSWORD HASHING 
def hash_password(password: str):
    """Encodes plain text password into a secure bcrypt hash."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    """Checks if the login attempt matches the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


#  2. JWT TOKEN GENERATION 
def create_access_token(data: dict):
    """Generates a JWT 'Digital ID' for the user session."""
    to_encode = data.copy()
    
    # Set expiration using UTC
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Sign the token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# 3. JWT TOKEN VERIFICATION 
def verify_access_token(token: str):
    """
    Decodes the JWT token and returns the payload if valid.
    Used by get_current_user in auth.py.
    """
    try:
        # Token ko decode karo secret key aur algorithm use karke
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Check karo ki payload empty toh nahi hai
        if not payload:
            return None
            
        return payload
    except JWTError:
        # Agar token expired hai ya invalid, toh None return karo
        return None