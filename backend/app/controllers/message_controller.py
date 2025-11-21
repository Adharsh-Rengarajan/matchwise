from fastapi import APIRouter, HTTPException
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
