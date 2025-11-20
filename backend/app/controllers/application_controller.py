from fastapi import APIRouter, HTTPException
from app.schemas.application_schema import (
    ApplicationCreateRequest,
    ApplicationStatusUpdateRequest
)
from app.services.application_service import ApplicationService
from app.services.user_service import UserService
from app.utils.response import api_response

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/")
async def create_application(payload: ApplicationCreateRequest):
    payload.validate_status()

    user = await UserService.get_user_by_id(payload.jobseeker_id)

    if not user or user["role"] != "jobseeker":
        raise HTTPException(status_code=403, detail="Only jobseekers can apply")

    result = await ApplicationService.create_application(payload)

    if "error" in result:
        raise HTTPException(status_code=409, detail=result["message"])

    return api_response(201, "Application created", result)



@router.get("/{job_id}")
async def get_applications(job_id: str):
    apps = await ApplicationService.get_applications_by_job(job_id)
    return api_response(200, "Applications fetched", apps)


@router.get("/application/{application_id}")
async def get_application(application_id: str):
    app = await ApplicationService.get_application(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return api_response(200, "Application fetched", app)


@router.patch("/")
async def update_application_status(payload: ApplicationStatusUpdateRequest):
    payload.validate_status()

    updated = await ApplicationService.update_application_status(
        payload.application_id,
        payload.application_status
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Application not found")

    return api_response(200, "Application status updated", updated)
