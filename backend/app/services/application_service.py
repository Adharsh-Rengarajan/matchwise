from datetime import datetime
from bson import ObjectId
from app.database import get_database
from app.utils.mongo import sanitize_document


class ApplicationService:

    @staticmethod
    async def create_application(payload):
        db = await get_database()

        payload.validate_status()

        # ❗Check if user already applied
        existing = await db.applications.find_one({
            "job_id": payload.job_id,
            "jobseeker_id": payload.jobseeker_id
        })

        if existing:
            return {
                "error": True,
                "status": 409,
                "message": "You have already applied to this job",
                "application": sanitize_document(existing)
            }

        data = {
            "job_id": payload.job_id,
            "jobseeker_id": payload.jobseeker_id,
            "questions": payload.questions,
            "ai_score": payload.ai_score,
            "ai_feedback": payload.ai_feedback,
            "keyword_score": payload.keyword_score,
            "application_status": payload.application_status,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = await db.applications.insert_one(data)
        data["_id"] = result.inserted_id

        return sanitize_document(data)


    @staticmethod
    async def get_applications_by_job(job_id):
        db = await get_database()

        cursor = db.applications.find({"job_id": job_id})
        apps = []

        async for app in cursor:
            apps.append(sanitize_document(app))  # FIXED

        return apps

    @staticmethod
    async def get_application(application_id):
        db = await get_database()

        app = await db.applications.find_one({"_id": ObjectId(application_id)})
        if not app:
            return None

        return sanitize_document(app)  # FIXED

    @staticmethod
    async def update_application_status(application_id, new_status):
        db = await get_database()

        await db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {
                "$set": {
                    "application_status": new_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        updated = await db.applications.find_one({"_id": ObjectId(application_id)})
        if not updated:
            return None

        return sanitize_document(updated)  # FIXED
