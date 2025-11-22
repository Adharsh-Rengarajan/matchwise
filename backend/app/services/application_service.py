from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from bson import ObjectId
from datetime import datetime
from app.database import get_database
from app.utils.mongo import sanitize_document
from app.services.matching_strategy import LLMMatchingStrategy
import tempfile
from pdfminer.high_level import extract_text
import docx

class ApplicationService:

    @staticmethod
    async def extract_text_from_resume(file_bytes: bytes, filename: str):
        if filename.lower().endswith(".pdf"):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(file_bytes)
                tmp.flush()
                return extract_text(tmp.name)

        if filename.lower().endswith(".docx"):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
                tmp.write(file_bytes)
                tmp.flush()
                doc = docx.Document(tmp.name)
                return "\n".join([p.text for p in doc.paragraphs])

        return ""

    @staticmethod
    async def create_application(job_id, jobseeker_id, job_questions, answers, application_status, resume_file):
        db = await get_database()
        fs = AsyncIOMotorGridFSBucket(db)

        existing = await db.applications.find_one({"job_id": job_id, "jobseeker_id": jobseeker_id})
        if existing:
            return {"error": True, "message": "You have already applied to this job"}

        resume_bytes = await resume_file.read()
        file_id = await fs.upload_from_stream(resume_file.filename, resume_bytes)
        resume_text = await ApplicationService.extract_text_from_resume(resume_bytes, resume_file.filename)

        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
        job_description = job["description"]

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

        result = await db.applications.insert_one(data)
        data["_id"] = result.inserted_id

        return sanitize_document(data)

    @staticmethod
    async def get_application_by_id(application_id: str):
        db = await get_database()
        application = await db.applications.find_one({"_id": ObjectId(application_id)})
        if application:
            return sanitize_document(application)
        return None

    @staticmethod
    async def update_application_status(application_id: str, status: str):
        db = await get_database()
        
        result = await db.applications.find_one_and_update(
            {"_id": ObjectId(application_id)},
            {
                "$set": {
                    "application_status": status,
                    "updated_at": datetime.utcnow()
                }
            },
            return_document=True
        )
        
        if result:
            return sanitize_document(result)
        return None

    @staticmethod
    async def add_note(application_id, note: dict):
        db = await get_database()

        note["created_at"] = note.get("created_at", datetime.utcnow().isoformat())

        await db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {
                "$push": {"notes": note},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )

        updated = await db.applications.find_one({"_id": ObjectId(application_id)})
        return sanitize_document(updated)

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
    async def get_applications_by_jobseeker(jobseeker_id: str):
        db = await get_database()
        applications = []
        cursor = db.applications.find({"jobseeker_id": jobseeker_id})
        
        async for application in cursor:
            applications.append(sanitize_document(application))
        
        return applications