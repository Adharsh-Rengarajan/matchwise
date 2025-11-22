from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Response
from typing import Optional, List
from app.services.application_service import ApplicationService
from app.utils.response import api_response
from bson import ObjectId
import json

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("")
async def create_application(
    job_id: str = Form(...),
    jobseeker_id: str = Form(...),
    job_questions: str = Form(...),
    answers: str = Form(...),
    application_status: str = Form("APPLIED"),
    resume_file: UploadFile = File(...)
):
    try:
        job_questions_list = json.loads(job_questions)
        answers_list = json.loads(answers)
        
        application = await ApplicationService.create_application(
            job_id, 
            jobseeker_id, 
            job_questions_list, 
            answers_list, 
            application_status, 
            resume_file
        )
        
        if application.get("error"):
            raise HTTPException(400, application.get("message"))
            
        return api_response(201, "Application created successfully", application)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Error creating application: {str(e)}")

@router.get("/{application_id}")
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

@router.patch("/{application_id}")
async def update_application_status(application_id: str, payload: dict):
    try:
        if not ObjectId.is_valid(application_id):
            raise HTTPException(400, "Invalid application ID")
        
        status = payload.get("application_status") or payload.get("status")
        
        if not status:
            raise HTTPException(400, "No valid status provided")
        
        valid_statuses = ["APPLIED", "REVIEWING", "SHORTLISTED", "INTERVIEW", "OFFER", "HIRED", "REJECTED"]
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

@router.get("/resume/{file_id}")
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

@router.post("/{application_id}/notes")
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

@router.get("/jobseeker/{jobseeker_id}")
async def get_applications_by_jobseeker(jobseeker_id: str):
    try:
        applications = await ApplicationService.get_applications_by_jobseeker(jobseeker_id)
        return api_response(200, "Applications retrieved", applications)
    except Exception as e:
        raise HTTPException(500, f"Error fetching applications: {str(e)}")