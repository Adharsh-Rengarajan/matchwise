from fastapi import APIRouter, HTTPException
from app.schemas.job_schema import JobCreateRequest, JobUpdateStatusRequest, FilterRequest
from app.services.job_service import JobService
from app.services.user_service import UserService
from app.utils.response import api_response

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/")
async def create_job(payload: JobCreateRequest):
    recruiter = await UserService.get_user_by_id(payload.recruiter_id)
    if not recruiter or recruiter.get("role") != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can create jobs")

    job = await JobService.create_job(payload)
    return api_response(201, "Job created successfully", job)

@router.patch("/")
async def update_job_status(payload: JobUpdateStatusRequest):
    updated_job = await JobService.update_job_status(payload)
    if not updated_job:
        raise HTTPException(status_code=404, detail="Job not found")

    return api_response(200, "Job status updated successfully", updated_job)

@router.get("/{recruiter_id}")
async def get_jobs_by_recruiter(recruiter_id: str):
    jobs = await JobService.get_jobs_by_recruiter(recruiter_id)
    return api_response(200, "Jobs retrieved successfully", jobs)

@router.get("/job/{job_id}")
async def get_job_by_id(job_id: str):
    job = await JobService.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return api_response(200, "Job retrieved successfully", job)

@router.post("/search")
async def search_jobs(filters: FilterRequest):
    result = await JobService.search_jobs(filters)
    return api_response(200, "Job search results", result)

@router.get("/{job_id}/top-candidates")
async def top_candidates(job_id: str):
    try:
        candidates = await JobService.get_top_candidates(job_id)
        return api_response(200, "Top candidates retrieved", candidates)
    except Exception as e:
        raise HTTPException(500, f"Error ranking candidates: {str(e)}")
