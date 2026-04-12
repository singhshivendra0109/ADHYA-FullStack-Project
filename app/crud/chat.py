from sqlalchemy.orm import Session
from datetime import datetime
from app.models import User, Booking, Conversation, ChatMessage

def check_chat_permission(db: Session, student_id: int, tutor_id: int):
    """
    Check karta hai ki student message bhej sakta hai ya nahi.
    """
    # Priority 1: Agar booking accepted hai, toh hamesha 'active'
    booking = db.query(Booking).filter(
        Booking.student_id == student_id,
        Booking.teacher_id == tutor_id,
        Booking.status == "accepted"
    ).first()
    
    if booking:
        return True, "active"

    # Priority 2: Conversation status check karein
    conv = db.query(Conversation).filter(
        Conversation.student_id == student_id, 
        Conversation.tutor_id == tutor_id
    ).first()

    if not conv:
        return True, "new" # Pehla inquiry allowed hai
    
    if conv.status == "active":
        return True, "active"

    # Blocked if status is 'pending' (Waiting for tutor)
    return False, "pending"

#  2. CORE LOGIC: SAVE MESSAGE & AUTO-ACTIVATE 
def save_message(db: Session, conversation_id: int, sender_id: int, content: str):
    """
    Message save karta hai aur agar teacher reply kare toh chat unlock kar deta hai.
    """
    # 1. Message object create karein
    new_msg = ChatMessage(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content,
        timestamp=datetime.utcnow()
    )
    db.add(new_msg)
    
    # 2. STATUS SYNC LOGIC (Most Important)
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    sender = db.query(User).filter(User.id == sender_id).first()

    if conv and sender:
        # Agar status 'pending' tha aur reply dene wala 'teacher' hai
        # toh status ko 'active' kar do taaki student reply kar sake.
        if sender.role == "teacher" and conv.status == "pending":
            conv.status = "active"
            conv.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(new_msg)
    return new_msg

# 3. STATUS CHECKER FOR REST API 
def get_chat_status(db: Session, student_id: int, tutor_id: int):
    return check_chat_permission(db, student_id, tutor_id)

#  4. CONVERSATION FACTORY 
def get_or_create_conversation(db: Session, student_id: int, tutor_id: int):
    """
    Purani chat dhundta hai ya nayi conversation create karta hai.
    """
    conv = db.query(Conversation).filter(
        Conversation.student_id == student_id,
        Conversation.tutor_id == tutor_id
    ).first()

    if not conv:
        conv = Conversation(
            student_id=student_id,
            tutor_id=tutor_id,
            status="pending", # Inquiry ke baad pending ho jayega
            created_at=datetime.utcnow()
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
    
    return conv