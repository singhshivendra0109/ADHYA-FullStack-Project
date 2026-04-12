from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False) 
    role = Column(String, default="student")
    is_verified = Column(Boolean, default=False)
    interview_status = Column(String, server_default='pending', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("TeacherProfile", back_populates="owner", uselist=False)
    # Relationship for Student Profile
    student_profile = relationship("StudentProfile", back_populates="owner", uselist=False)

class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    full_name = Column(String, nullable=False)
    subject = Column(String, nullable=False) 
    bio = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)
    monthly_rate = Column(Integer, nullable=False) 
    profile_picture = Column(String, nullable=True)
    city = Column(String(100), nullable=True) 

    owner = relationship("User", back_populates="profile")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    full_name = Column(String, nullable=False)
    grade_class = Column(String, nullable=False) 
    city = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)

    owner = relationship("User", back_populates="student_profile")

class TeacherAvailability(Base):
    __tablename__ = "teacher_availability"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    month_year = Column(String, nullable=False) 
    time_slot = Column(String, nullable=False)  
    is_active = Column(Boolean, default=True)

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    subject = Column(String, nullable=False)
    month_year = Column(String, nullable=False) 
    time_slot = Column(String, nullable=False)  
    status = Column(String, default="pending") 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# NEW CHAT MODELS

class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    tutor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    # status values: 'pending', 'active', 'blocked'
    status = Column(String, default="pending") 
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"))
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    content = Column(Text, nullable=False) 
    timestamp = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

#  OTHER MODELS 
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    
    rating = Column(Integer, nullable=False)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User", foreign_keys=[student_id])
    booking = relationship("Booking")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String, nullable=False)
    score = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    detail = Column(String, nullable=True)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    color_theme = Column(String, default="bg-blue-50") 
    is_featured = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    teacher = relationship("User")