from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Response, Depends
from typing import Optional, List
from app.services.application_service import ApplicationService
from app.services.job_service import JobService
from app.utils.response import api_response
from bson import ObjectId
import json
from app.middleware.auth_middleware import require_auth

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/", dependencies=[Depends(require_auth(["jobseeker"]))])
async def create_application(
    job_id: str = Form(...),
    jobseeker_id: str = Form(...),
    answers: str = Form(...),
    application_status: str = Form(...),
    resume: UploadFile = File(...)
):
    try:
        job = await JobService.get_job_by_id(job_id)
        if not job:
            raise HTTPException(404, "Job not found")

        job_questions = job.get("questions", [])

        answers_list = json.loads(answers)

        if len(answers_list) != len(job_questions):
            raise HTTPException(400, f"Incorrect number of answers. Expected {len(job_questions)}, got {len(answers_list)}")

        application = await ApplicationService.create_application(
            job_id,
            jobseeker_id,
            job_questions,
            answers_list,
            application_status,
            resume
        )

        if application.get("error"):
            raise HTTPException(400, application.get("message"))

        return api_response(201, "Application created successfully", application)
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(400, "Invalid JSON format for answers")
    except Exception as e:
        raise HTTPException(500, f"Error creating application: {str(e)}")


@router.get("/{application_id}/", dependencies=[Depends(require_auth())])
async def get_application(application_id: str):
    try:
        if not ObjectId.is_valid(application_id):
            raise HTTPException(400, "Invalid application ID")

        application = await ApplicationService.get_application_by_id(application_id)
        if not application:
            raise HTTPException(404, "Application not found")

        return api_response(200, "Application retrieved", application)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error fetching application: {str(e)}")


@router.patch("/{application_id}/", dependencies=[Depends(require_auth())])
async def update_application_status(application_id: str, payload: dict):
    try:
        if not ObjectId.is_valid(application_id):
            raise HTTPException(400, "Invalid application ID")

        status = payload.get("application_status") or payload.get("status")

        if not status:
            raise HTTPException(400, "No valid status provided")

        valid_statuses = ["PENDING", "APPLIED", "REVIEWING", "SHORTLISTED", "INTERVIEW", "OFFER", "HIRED", "REJECTED"]
        if status not in valid_statuses:
            raise HTTPException(400, f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

        updated = await ApplicationService.update_application_status(application_id, status)
        if not updated:
            raise HTTPException(404, "Application not found")

        return api_response(200, "Application status updated", updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error updating application: {str(e)}")


@router.get("/resume/{file_id}/", dependencies=[Depends(require_auth())])
async def get_resume(file_id: str):
    try:
        if not ObjectId.is_valid(file_id):
            raise HTTPException(400, "Invalid file ID")

        data, filename, content_type = await ApplicationService.get_resume(file_id)

        return Response(
            content=data,
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        raise HTTPException(500, f"Error fetching resume: {str(e)}")


@router.post("/{application_id}/notes/", dependencies=[Depends(require_auth(["recruiter"]))])
async def add_note(application_id: str, payload: dict):
    try:
        if not ObjectId.is_valid(application_id):
            raise HTTPException(400, "Invalid application ID")

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


@router.get("/job/{job_id}/", dependencies=[Depends(require_auth(["recruiter"]))])
async def get_job_applications(job_id: str):
    try:
        if not ObjectId.is_valid(job_id):
            raise HTTPException(400, "Invalid job ID")

        applications = await ApplicationService.get_applications_by_job(job_id)
        return api_response(200, "Applications retrieved", applications)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error fetching applications: {str(e)}")


@router.get("/jobseeker/{jobseeker_id}/", dependencies=[Depends(require_auth(["jobseeker"]))])
async def get_applications_by_jobseeker(jobseeker_id: str):
    try:
        applications = await ApplicationService.get_applications_by_jobseeker(jobseeker_id)
        return api_response(200, "Applications retrieved", applications)
    except Exception as e:
        raise HTTPException(500, f"Error fetching applications: {str(e)}")