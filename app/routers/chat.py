from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from typing import List, Dict
import json
from datetime import datetime

# Internal Project Imports
from app.database import get_db, SessionLocal 
from app import models
from app.crud import chat as chat_crud
from app.schemas import ChatMessageOut, ConversationOut, ChatPermissionOut
from app.routers.auth import get_current_user 

router = APIRouter(prefix="", tags=["Real-time Chat Engine"])

#  1. WEBSOCKET CONNECTION MANAGER 
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"DEBUG: User {user_id} connected. Active: {list(self.active_connections.keys())}")

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"DEBUG: User {user_id} disconnected.")

    async def send_personal_message(self, message: dict, receiver_id: int):
        if receiver_id in self.active_connections:
            try:
                await self.active_connections[receiver_id].send_json(message)
            except Exception as e:
                print(f"DEBUG: Failed to send to {receiver_id}: {e}")
                self.disconnect(receiver_id)

manager = ConnectionManager()

#  2. PERMISSION CHECK 
@router.get("/check-permission/{tutor_id}", response_model=ChatPermissionOut)
async def check_perm(
    tutor_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    can_chat, status = chat_crud.get_chat_status(db, current_user.id, tutor_id)
    reason_map = {
        "active": "Conversation is active or booking verified.",
        "new": "You can send an initial inquiry.",
        "pending": "Waiting for the tutor to reply."
    }
    return {"can_chat": can_chat, "status": status, "reason": reason_map.get(status, "Status unknown")}

#  3. CHAT HISTORY 
@router.get("/messages/{other_user_id}", response_model=List[ChatMessageOut])
async def get_history(
    other_user_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    conv = db.query(models.Conversation).filter(
        ((models.Conversation.student_id == current_user.id) & (models.Conversation.tutor_id == other_user_id)) |
        ((models.Conversation.student_id == other_user_id) & (models.Conversation.tutor_id == current_user.id))
    ).first()
    
    if not conv:
        return []
    
    return db.query(models.ChatMessage).filter(models.ChatMessage.conversation_id == conv.id).order_by(models.ChatMessage.timestamp.asc()).all()

#  4. INBOX / CONVERSATIONS LIST 
@router.get("/inbox", response_model=List[ConversationOut])
async def get_inbox(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == "student":
        chats = db.query(models.Conversation).filter(models.Conversation.student_id == current_user.id).all()
    else:
        chats = db.query(models.Conversation).filter(models.Conversation.tutor_id == current_user.id).all()

    inbox_list = []
    for chat in chats:
        other_id = chat.tutor_id if current_user.role == "student" else chat.student_id
        other_user = db.query(models.User).filter(models.User.id == other_id).first()
        if not other_user: continue

        if other_user.role == "student":
            profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == other_id).first()
        else:
            profile = db.query(models.TeacherProfile).filter(models.TeacherProfile.user_id == other_id).first()

        last_msg = db.query(models.ChatMessage).filter(models.ChatMessage.conversation_id == chat.id).order_by(models.ChatMessage.timestamp.desc()).first()

        inbox_list.append({
            "id": chat.id,
            "other_user_id": other_id,
            "other_user_name": profile.full_name if profile else other_user.email,
            "other_user_pic": profile.profile_picture if profile else None,
            "last_message": last_msg.content if last_msg else "No messages yet",
            "status": chat.status,
            "updated_at": last_msg.timestamp if last_msg else chat.created_at
        })
    return inbox_list

#  5. REAL-TIME WEBSOCKET ENDPOINT
@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
   
    db = SessionLocal()
    
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg_payload = json.loads(data)
            
            receiver_id = int(msg_payload['receiver_id'])
            content = msg_payload['content']

            # Use threadpool for sync DB operations
            user = await run_in_threadpool(lambda: db.query(models.User).filter(models.User.id == user_id).first())
            
            if not user:
                await websocket.send_json({"error": "Unauthorized user"})
                break

            s_id = user_id if user.role == "student" else receiver_id
            t_id = receiver_id if user.role == "student" else user_id

            # Gatekeeping for students
            if user.role == "student":
                can_send, _ = await run_in_threadpool(chat_crud.get_chat_status, db, user_id, receiver_id)
                if not can_send:
                    await websocket.send_json({"error": "Waiting for tutor reply"})
                    continue

            # Find or create conversation
            conv = await run_in_threadpool(
                lambda: db.query(models.Conversation).filter(
                    models.Conversation.student_id == s_id, 
                    models.Conversation.tutor_id == t_id
                ).first()
            )
            
            if not conv:
                conv = models.Conversation(student_id=s_id, tutor_id=t_id, status="pending")
                db.add(conv)
                await run_in_threadpool(db.commit)
                await run_in_threadpool(db.refresh, conv)

            # Save Message
            saved_msg = await run_in_threadpool(chat_crud.save_message, db, conv.id, user_id, content)

            broadcast_data = {
                "id": saved_msg.id,
                "sender_id": user_id,
                "receiver_id": receiver_id,
                "content": content,
                "timestamp": saved_msg.timestamp.isoformat(),
                "status": conv.status
            }

            # Broadcoast to both
            await manager.send_personal_message(broadcast_data, receiver_id)
            await manager.send_personal_message(broadcast_data, user_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"DEBUG ERROR for user {user_id}: {e}")
        manager.disconnect(user_id)
    finally:
        db.close() 