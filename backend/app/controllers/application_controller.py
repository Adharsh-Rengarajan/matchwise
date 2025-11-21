from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from app.services.application_service import ApplicationService
from app.services.job_service import JobService
from app.utils.response import api_response
import json
import io

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/")
async def create_application(
    job_id: str = Form(...),
    jobseeker_id: str = Form(...),
    answers: str = Form(...),  # JSON list of {questionNo, answer}
    ai_score: int = Form(...),
    ai_feedback: str = Form(...),
    keyword_score: int = Form(...),
    application_status: str = Form(...),
    resume: UploadFile = File(...)
):
    # Parse answers JSON
    try:
        answers_list = json.loads(answers)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid answers format. Must be JSON.")

    # Fetch job to get its questions
    job = await JobService.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job_questions = job.get("questions", [])

    # Validation: answers must match job questions
    if len(answers_list) != len(job_questions):
        raise HTTPException(
            status_code=400,
            detail=f"Incorrect number of answers. Expected {len(job_questions)}."
        )

    # Ensure each answer has a valid questionNo
    job_question_numbers = {q["questionNo"] for q in job_questions}
    payload_question_numbers = {a["questionNo"] for a in answers_list}

    if job_question_numbers != payload_question_numbers:
        raise HTTPException(
            status_code=400,
            detail="Answer questionNo mismatch with job questions."
        )

    # Create application entry
    result = await ApplicationService.create_application(
        job_id,
        jobseeker_id,
        job_questions,        # original job questions
        answers_list,         # jobseeker answers
        ai_score,
        ai_feedback,
        keyword_score,
        application_status,
        resume
    )

    if "error" in result:
        raise HTTPException(status_code=409, detail=result["message"])

    return api_response(201, "Application created successfully", result)


@router.get("/resume/{file_id}")
async def get_resume(file_id: str):
    data, filename, content_type = await ApplicationService.get_resume(file_id)

    return StreamingResponse(
        io.BytesIO(data),
        media_type=content_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
