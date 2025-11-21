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
    answers: str = Form(...),
    application_status: str = Form(...),
    resume: UploadFile = File(...)
):
    try:
        answers_list = json.loads(answers)
    except Exception:
        raise HTTPException(400, "Invalid answers JSON")

    job = await JobService.get_job_by_id(job_id)
    if not job:
        raise HTTPException(404, "Job not found")

    job_questions = job.get("questions", [])

    if len(answers_list) != len(job_questions):
        raise HTTPException(400, "Incorrect number of answers")

    job_question_numbers = {q["questionNo"] for q in job_questions}
    payload_question_numbers = {a["questionNo"] for a in answers_list}

    if job_question_numbers != payload_question_numbers:
        raise HTTPException(400, "Question numbers mismatch")

    result = await ApplicationService.create_application(
        job_id,
        jobseeker_id,
        job_questions,
        answers_list,
        application_status,
        resume
    )

    if "error" in result:
        raise HTTPException(409, result["message"])

    return api_response(201, "Application created successfully", result)

@router.post("/preview-score")
async def preview_score(job_id: str = Form(...), resume: UploadFile = File(...)):
    try:
        job = await JobService.get_job_by_id(job_id)
        if not job:
            raise HTTPException(404, "Job not found")

        resume_bytes = await resume.read()
        resume_text = await ApplicationService.extract_text_from_resume(resume_bytes, resume.filename)

        from app.services.matching_strategy import LLMMatchingStrategy
        match = await LLMMatchingStrategy.generate_match(resume_text, job["description"])

        return api_response(200, "Score generated", match.to_dict())

    except Exception as e:
        raise HTTPException(500, f"Error generating preview score: {str(e)}")

@router.get("/resume/{file_id}")
async def get_resume(file_id: str):
    data, filename, content_type = await ApplicationService.get_resume(file_id)

    return StreamingResponse(
        io.BytesIO(data),
        media_type=content_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
