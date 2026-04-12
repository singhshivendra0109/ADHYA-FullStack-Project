from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import time, datetime

# --- 1. USER & AUTH SCHEMAS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str 

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_verified: bool
    created_at: datetime
    interview_status: str = "pending" 
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int 

class TokenData(BaseModel):
    id: Optional[int] = None

# 2. TEACHER PROFILE SCHEMAS 
class TeacherProfileBase(BaseModel):
    full_name: str
    subject: str
    bio: Optional[str] = None
    experience_years: int = Field(default=0, ge=0)
    monthly_rate: int = Field(..., gt=0)
    profile_picture: Optional[str] = None
    city: Optional[str] = None 

class TeacherProfileCreate(TeacherProfileBase):
    pass 

class TeacherProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    subject: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    monthly_rate: Optional[int] = None
    profile_picture: Optional[str] = None
    city: Optional[str] = None 

class TeacherProfileOut(TeacherProfileBase):
    id: int
    user_id: int
    is_verified: bool = False 
    available_slots: List["AvailabilityOut"] = [] 
    average_rating: float = 0.0
    total_reviews: int = 0
    
    model_config = ConfigDict(from_attributes=True)

#  3. STUDENT PROFILE SCHEMAS 
class StudentProfileCreate(BaseModel):
    full_name: str
    grade_class: str
    city: Optional[str] = None
    profile_picture: Optional[str] = None

class StudentProfileOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    grade_class: str
    city: Optional[str]
    profile_picture: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    grade_class: Optional[str] = None
    city: Optional[str] = None
    profile_picture: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

#  4. AVAILABILITY & BOOKING SCHEMAS
class AvailabilityCreate(BaseModel):
    month_year: str
    time_slot: str

class AvailabilityOut(AvailabilityCreate):
    id: int
    teacher_id: int
    is_active: bool
    is_booked: bool = False 

    model_config = ConfigDict(from_attributes=True)

class BookingCreate(BaseModel):
    teacher_id: int
    subject: str
    month_year: str
    time_slot: str

class BookingOut(BaseModel):
    id: int
    student_id: int
    teacher_id: int
    subject: str
    month_year: str
    time_slot: str
    status: str 
    created_at: datetime
    
    student_name: Optional[str] = None
    teacher_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class BookingStatusUpdate(BaseModel):
    status: str 

#  5. REVIEW & ACHIEVEMENT SCHEMAS 
class ReviewCreate(BaseModel):
    teacher_id: int
    booking_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    student_id: int
    teacher_id: int
    booking_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    
    student_name: Optional[str] = None
    teacher_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class AchievementCreate(BaseModel):
    student_name: str
    score: str
    subject: str
    detail: Optional[str] = None
    teacher_id: int
    color_theme: Optional[str] = "bg-blue-50"

class AchievementOut(AchievementCreate):
    id: int
    teacher_name: str 

    model_config = ConfigDict(from_attributes=True)

#  6. ADMIN SCHEMAS 
class TeacherStatusUpdate(BaseModel):
    new_status: str # 'pending', 'scheduled', 'rejected', 'verified' 

class AdminAnalyticsOut(BaseModel):
    total_revenue_volume: float
    active_partnerships: int
    user_breakdown: dict

    model_config = ConfigDict(from_attributes=True) 

#  7. CHAT & MESSAGE SCHEMAS

class ChatMessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatPermissionOut(BaseModel):
    can_chat: bool
    status: str # 'new', 'pending', 'active'
    reason: str

class ConversationOut(BaseModel):
    id: int
    other_user_id: int
    other_user_name: str
    other_user_pic: Optional[str] = None
    last_message: Optional[str] = None
    status: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WebSocketMessage(BaseModel):
    receiver_id: int
    content: str