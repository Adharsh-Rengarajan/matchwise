from fastapi import APIRouter, HTTPException
from app.schemas.job_schema import JobCreateRequest, JobUpdateStatusRequest
from app.services.job_service import JobService
from app.services.user_service import UserService
from app.utils.response import api_response

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/")
async def create_job(payload: JobCreateRequest):
    recruiter = await UserService.get_user_by_id(payload.recruiter_id)

    if not recruiter or recruiter["role"] != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can create jobs")

    job = await JobService.create_job(payload)
    return api_response(201, "Job created successfully", job)


@router.patch("/")
async def update_job_status(payload: JobUpdateStatusRequest):
    updated = await JobService.update_job_status(payload.job_id, payload.status)
    return api_response(200, "Job status updated", updated)


@router.get("/{recruiter_id}")
async def get_jobs(recruiter_id: str):
    jobs = await JobService.get_jobs_by_recruiter(recruiter_id)
    return api_response(200, "Jobs fetched", jobs)


@router.get("/job/{job_id}")
async def get_job(job_id: str):
    job = await JobService.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return api_response(200, "Job fetched", job)
