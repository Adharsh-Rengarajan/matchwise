import os
import tempfile
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from bson import ObjectId
from datetime import datetime
from app.database import get_database
from app.utils.mongo import sanitize_document
from app.services.matching_strategy import LLMMatchingStrategy
from app.repository.application_repository import ApplicationRepository
from app.services.job_service import JobService
from pdfminer.high_level import extract_text
import docx


ALLOWED_RESUME_EXTENSIONS = (".pdf", ".docx")
MAX_RESUME_BYTES = 5 * 1024 * 1024  # 5 MB


class ApplicationService:

    @staticmethod
    async def extract_text_from_resume(file_bytes: bytes, filename: str):
        lower = filename.lower()

        if lower.endswith(".pdf"):
            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                    tmp.write(file_bytes)
                    tmp.flush()
                    tmp_path = tmp.name
                return extract_text(tmp_path)
            finally:
                if tmp_path and os.path.exists(tmp_path):
                    os.remove(tmp_path)

        if lower.endswith(".docx"):
            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
                    tmp.write(file_bytes)
                    tmp.flush()
                    tmp_path = tmp.name
                doc = docx.Document(tmp_path)
                return "\n".join(p.text for p in doc.paragraphs)
            finally:
                if tmp_path and os.path.exists(tmp_path):
                    os.remove(tmp_path)

        return ""

    @staticmethod
    async def create_application(job_id, jobseeker_id, job_questions, answers, application_status, resume_file):
        db = await get_database()
        fs = AsyncIOMotorGridFSBucket(db)

        existing = await ApplicationRepository.find_one({
            "job_id": job_id,
            "jobseeker_id": jobseeker_id,
            "application_status": {"$ne": "PENDING"}
        })
        if existing:
            return {"error": True, "message": "You have already applied to this job"}

        pending_existing = await ApplicationRepository.find_one({
            "job_id": job_id,
            "jobseeker_id": jobseeker_id,
            "application_status": "PENDING"
        })
        if pending_existing:
            await db.applications.delete_one({"_id": pending_existing["_id"]})
            if pending_existing.get("resume_file_id"):
                try:
                    await fs.delete(ObjectId(pending_existing["resume_file_id"]))
                except Exception:
                    pass

        # --- Upload validation (before any storage work) ---
        filename = resume_file.filename or ""
        if not filename.lower().endswith(ALLOWED_RESUME_EXTENSIONS):
            return {"error": True, "message": "Resume must be a PDF or DOCX file"}

        resume_bytes = await resume_file.read()
        if not resume_bytes:
            return {"error": True, "message": "Uploaded resume is empty"}
        if len(resume_bytes) > MAX_RESUME_BYTES:
            return {"error": True, "message": "Resume exceeds the 5 MB size limit"}

        resume_text = await ApplicationService.extract_text_from_resume(resume_bytes, filename)
        if not resume_text or not resume_text.strip():
            return {
                "error": True,
                "message": "Could not extract any text from the resume. "
                           "Please upload a text-based PDF or DOCX file.",
            }

        job = await JobService.get_job_by_id(job_id)
        if not job:
            return {"error": True, "message": "Job not found"}
        job_description = job.get("description", "")

        # Only persist the file once we know the submission is valid.
        file_id = await fs.upload_from_stream(filename, resume_bytes)

        match_result = await LLMMatchingStrategy.generate_match(resume_text, job_description)

        data = {
            "job_id": job_id,
            "jobseeker_id": jobseeker_id,
            "questions": job_questions,
            "answers": answers,
            "match_result": match_result.to_dict(),
            "application_status": application_status,
            "resume_file_id": str(file_id),
            "resume_text": resume_text,
            "notes": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        inserted_id = await ApplicationRepository.insert_one(data)
        data["_id"] = inserted_id

        return sanitize_document(data)

    @staticmethod
    async def get_application_by_id(application_id: str):
        application = await ApplicationRepository.find_by_id(application_id)
        if application:
            return sanitize_document(application)
        return None

    @staticmethod
    async def update_application_status(application_id: str, status: str):
        update_data = {
            "application_status": status,
            "updated_at": datetime.utcnow()
        }

        result = await ApplicationRepository.update_by_id(application_id, update_data)
        if result:
            return sanitize_document(result)
        return None

    @staticmethod
    async def get_resume(file_id: str):
        db = await get_database()
        fs = AsyncIOMotorGridFSBucket(db)

        oid = ObjectId(file_id)
        stream = await fs.open_download_stream(oid)
        data = await stream.read()

        filename = stream.filename
        content_type = "application/pdf" if filename.lower().endswith(".pdf") else "application/octet-stream"

        return data, filename, content_type

    @staticmethod
    async def get_applications_by_job(job_id: str):
        """Return all applications for a given job (recruiter view)."""
        applications = await ApplicationRepository.find_by_job_id(job_id)
        return [sanitize_document(application) for application in applications]

    @staticmethod
    async def get_applications_by_jobseeker(jobseeker_id: str):
        applications = await ApplicationRepository.find_by_jobseeker_id(jobseeker_id)
        return [sanitize_document(application) for application in applications]

    @staticmethod
    async def add_note(application_id, note: dict):
        note_id = str(ObjectId())
        note_data = {
            "note_id": note_id,
            "recruiter_id": note.get("recruiter_id"),
            "note": note.get("note"),
            "created_at": datetime.utcnow()
        }

        application = await ApplicationRepository.find_by_id(application_id)
        if not application:
            return None

        notes = application.get("notes", [])
        notes.append(note_data)

        update_data = {
            "notes": notes,
            "updated_at": datetime.utcnow()
        }

        result = await ApplicationRepository.update_by_id(application_id, update_data)
        return sanitize_document(result) if result else None

    @staticmethod
    async def delete_note(application_id: str, note_id: str):
        application = await ApplicationRepository.find_by_id(application_id)
        if not application:
            return None

        notes = application.get("notes", [])
        notes = [n for n in notes if n.get("note_id") != note_id]

        update_data = {
            "notes": notes,
            "updated_at": datetime.utcnow()
        }

        result = await ApplicationRepository.update_by_id(application_id, update_data)
        return sanitize_document(result) if result else None

    @staticmethod
    async def update_note(application_id: str, note_id: str, new_note: str):
        application = await ApplicationRepository.find_by_id(application_id)
        if not application:
            return None

        notes = application.get("notes", [])
        for note in notes:
            if note.get("note_id") == note_id:
                note["note"] = new_note
                note["updated_at"] = datetime.utcnow()
                break
        else:
            return None

        update_data = {
            "notes": notes,
            "updated_at": datetime.utcnow()
        }

        result = await ApplicationRepository.update_by_id(application_id, update_data)
        return sanitize_document(result) if result else None