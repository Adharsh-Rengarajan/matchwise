from fastapi import APIRouter, HTTPException
from app.schemas.auth_schema import RecruiterRegisterRequest
from app.services.user_service import UserService
from app.utils.response import api_response

router = APIRouter(prefix="/recruiters", tags=["Recruiters"])


@router.post("/register")
async def register_recruiter(payload: RecruiterRegisterRequest):
    try:
        user = await UserService.register(payload)
        return api_response(201, "Recruiter registered successfully", user)
    except ValueError as e:
        raise HTTPException(400, str(e))
