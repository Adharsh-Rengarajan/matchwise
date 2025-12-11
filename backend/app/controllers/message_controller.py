from fastapi import APIRouter, HTTPException, Body
from app.schemas.message_schema import MessageSchema
from app.services.message_service import MessageService
from app.utils.response import api_response

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("/")
async def send_message(payload: MessageSchema):
    try:
        saved = await MessageService.send_message(payload.dict())
        return api_response(201, "Message sent", saved)
    except Exception as e:
        raise HTTPException(500, f"Error sending message: {str(e)}")

@router.get("/{user1}/{user2}")
async def get_conversation(user1: str, user2: str):
    try:
        msgs = await MessageService.get_conversation(user1, user2)
        return api_response(200, "Conversation retrieved", msgs)
    except Exception as e:
        raise HTTPException(500, f"Error retrieving conversation: {str(e)}")

@router.get("/recruiter/{recruiter_id}")
async def get_recruiter_conversations(recruiter_id: str):
    try:
        conversations = await MessageService.get_conversations_for_recruiter(recruiter_id)
        return api_response(200, "Conversations retrieved", conversations)
    except Exception as e:
        raise HTTPException(500, f"Error retrieving conversations: {str(e)}")

@router.patch("/mark-read")
async def mark_as_read(payload: dict = Body(...)):
    try:
        sender_id = payload.get("sender_id")
        receiver_id = payload.get("receiver_id")
        
        if not sender_id or not receiver_id:
            raise HTTPException(400, "sender_id and receiver_id are required")
        
        result = await MessageService.mark_messages_as_read(sender_id, receiver_id)
        return api_response(200, "Messages marked as read", result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error marking messages as read: {str(e)}")