from fastapi import APIRouter, HTTPException
from app.schemas.auth_schema import JobSeekerRegisterRequest
from app.services.user_service import UserService
from app.utils.response import api_response

router = APIRouter(prefix="/jobseekers", tags=["JobSeekers"])

@router.post("/register")
async def register_jobseeker(payload: JobSeekerRegisterRequest):
    try:
        user = await UserService.register(payload)
        return api_response(201, "JobSeeker registered successfully", user)
    except ValueError as e:
        raise HTTPException(400, str(e))
