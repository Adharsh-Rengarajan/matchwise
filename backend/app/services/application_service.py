from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from bson import ObjectId
from datetime import datetime
from app.database import get_database
from app.utils.mongo import sanitize_document
import tempfile
from pdfminer.high_level import extract_text
import docx


class ApplicationService:

    @staticmethod
    async def extract_text_from_resume(file_bytes: bytes, filename: str):
        """
        Extracts text from PDF or DOCX resume files.
        """
        # PDF
        if filename.lower().endswith(".pdf"):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(file_bytes)
                tmp.flush()
                return extract_text(tmp.name)

        # DOCX
        if filename.lower().endswith(".docx"):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
                tmp.write(file_bytes)
                tmp.flush()
                document = docx.Document(tmp.name)
                return "\n".join([p.text for p in document.paragraphs])

        # Unknown file types
        return ""

    @staticmethod
    async def create_application(
        job_id,
        jobseeker_id,
        job_questions,
        answers,
        ai_score,
        ai_feedback,
        keyword_score,
        application_status,
        resume_file
    ):
        db = await get_database()
        fs = AsyncIOMotorGridFSBucket(db)

        # Prevent duplicate applications
        existing = await db.applications.find_one({
            "job_id": job_id,
            "jobseeker_id": jobseeker_id
        })

        if existing:
            return {
                "error": True,
                "message": "You have already applied to this job"
            }

        # Read uploaded resume file bytes
        resume_bytes = await resume_file.read()

        # Upload resume to GridFS
        file_id = await fs.upload_from_stream(resume_file.filename, resume_bytes)

        # Extract resume content
        resume_text = await ApplicationService.extract_text_from_resume(
            resume_bytes, resume_file.filename
        )

        # Create application document
        data = {
            "job_id": job_id,
            "jobseeker_id": jobseeker_id,
            "questions": job_questions,     # job's questions stored here
            "answers": answers,             # jobseeker answers
            "ai_score": ai_score,
            "ai_feedback": ai_feedback,
            "keyword_score": keyword_score,
            "application_status": application_status,
            "resume_file_id": str(file_id),
            "resume_text": resume_text,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = await db.applications.insert_one(data)
        data["_id"] = result.inserted_id

        return sanitize_document(data)

    @staticmethod
    async def get_resume(file_id: str):
        db = await get_database()
        fs = AsyncIOMotorGridFSBucket(db)
        oid = ObjectId(file_id)

        # Download resume file from GridFS
        stream = await fs.open_download_stream(oid)
        data = await stream.read()

        filename = stream.filename
        content_type = (
            "application/pdf"
            if filename.lower().endswith(".pdf")
            else "application/octet-stream"
        )

        return data, filename, content_type
