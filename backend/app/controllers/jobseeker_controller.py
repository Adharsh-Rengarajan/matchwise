from fastapi import APIRouter, HTTPException, Depends
from app.schemas.auth_schema import JobSeekerRegisterRequest, JobSeekerUpdateRequest
from app.services.user_service import UserService
from app.utils.response import api_response
from bson import ObjectId
from app.middleware.auth_middleware import require_auth

router = APIRouter(prefix="/jobseekers", tags=["JobSeekers"])


@router.post("/register")
async def register_jobseeker(payload: JobSeekerRegisterRequest):
    try:
        user = await UserService.register(payload)
        return api_response(201, "JobSeeker registered successfully", user)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("/{jobseeker_id}", dependencies=[Depends(require_auth())])
async def get_jobseeker_profile(jobseeker_id: str):
    try:
        if not ObjectId.is_valid(jobseeker_id):
            raise HTTPException(400, "Invalid jobseeker ID")
        
        user = await UserService.get_user_by_id(jobseeker_id)
        
        if not user:
            raise HTTPException(404, "JobSeeker not found")
        
        if user.get("role") != "jobseeker":
            raise HTTPException(400, "User is not a jobseeker")
        
        return api_response(200, "JobSeeker profile retrieved", user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error fetching profile: {str(e)}")


@router.patch("/{jobseeker_id}", dependencies=[Depends(require_auth(["jobseeker"]))])
async def update_jobseeker_profile(jobseeker_id: str, payload: JobSeekerUpdateRequest):
    try:
        if not ObjectId.is_valid(jobseeker_id):
            raise HTTPException(400, "Invalid jobseeker ID")
        
        user = await UserService.get_user_by_id(jobseeker_id)
        
        if not user:
            raise HTTPException(404, "JobSeeker not found")
        
        if user.get("role") != "jobseeker":
            raise HTTPException(400, "User is not a jobseeker")
        
        updated_user = await UserService.update_jobseeker_profile(jobseeker_id, payload.dict(exclude_unset=True))
        
        if not updated_user:
            raise HTTPException(500, "Failed to update profile")
        
        return api_response(200, "Profile updated successfully", updated_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error updating profile: {str(e)}")