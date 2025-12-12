from fastapi import APIRouter, HTTPException
from app.services.user_service import UserService
from app.utils.response import api_response
from app.schemas.note_schema import ApplicationNoteSchema
from app.services.application_service import ApplicationService
from app.schemas.auth_schema import RecruiterRegisterRequest
router = APIRouter(prefix="/recruiters", tags=["Recruiters"])

@router.post("/register")
async def register_recruiter(payload: RecruiterRegisterRequest): 
    try:
        user = await UserService.register(payload)
        return api_response(201, "Recruiter registered successfully", user)
    except ValueError as e:
        raise HTTPException(400, str(e))

@router.post("/applications/{application_id}/notes")
async def add_note(application_id: str, payload: dict):
    try:
        note_data = {
            "recruiter_id": payload.get("recruiter_id"),
            "note": payload.get("note")
        }
        
        if not note_data["note"]:
            raise HTTPException(400, "Note content is required")
        
        updated = await ApplicationService.add_note(application_id, note_data)
        if not updated:
            raise HTTPException(404, "Application not found")
        
        return api_response(200, "Note added successfully", updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error adding note: {str(e)}")

@router.delete("/applications/{application_id}/notes/{note_id}")
async def delete_note(application_id: str, note_id: str):
    try:
        updated = await ApplicationService.delete_note(application_id, note_id)
        if not updated:
            raise HTTPException(404, "Note not found")
        
        return api_response(200, "Note deleted successfully", updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error deleting note: {str(e)}")

@router.put("/applications/{application_id}/notes/{note_id}")
async def update_note(application_id: str, note_id: str, payload: dict):
    try:
        new_note = payload.get("note")
        
        if not new_note:
            raise HTTPException(400, "Note content is required")
        
        updated = await ApplicationService.update_note(application_id, note_id, new_note)
        if not updated:
            raise HTTPException(404, "Note not found")
        
        return api_response(200, "Note updated successfully", updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error updating note: {str(e)}")