from fastapi import APIRouter, HTTPException
from app.schemas.auth_schema import RecruiterRegisterRequest
from app.services.user_service import UserService
from app.utils.response import api_response
from app.schemas.note_schema import ApplicationNoteSchema
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/recruiters", tags=["Recruiters"])

@router.post("/register")
async def register_recruiter(payload: RecruiterRegisterRequest):
    try:
        user = await UserService.register(payload)
        return api_response(201, "Recruiter registered successfully", user)
    except ValueError as e:
        raise HTTPException(400, str(e))

@router.post("/applications/{application_id}/notes")
async def add_note(application_id: str, payload: ApplicationNoteSchema):
    try:
        updated = await ApplicationService.add_note(application_id, payload.dict())
        return api_response(200, "Note added", updated)
    except Exception as e:
        raise HTTPException(500, f"Error adding note: {str(e)}")
