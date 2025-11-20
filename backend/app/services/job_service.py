from app.database import get_database
from bson import ObjectId
from datetime import datetime
from app.utils.mongo import sanitize_document
from app.utils.date import to_datetime


class JobService:

    @staticmethod
    async def create_job(payload):
        db = await get_database()

        job_dict = payload.dict()

        job_dict["start_date"] = to_datetime(job_dict["start_date"])
        job_dict["end_date"] = to_datetime(job_dict.get("end_date"))

        job_dict["created_at"] = datetime.utcnow()
        job_dict["updated_at"] = datetime.utcnow()

        result = await db.jobs.insert_one(job_dict)
        job_dict["_id"] = result.inserted_id

        return sanitize_document(job_dict)

    @staticmethod
    async def update_job_status(job_id, status):
        db = await get_database()

        # Convert Enum → String
        if hasattr(status, "value"):
            status = status.value

        await db.jobs.update_one(
            {"_id": ObjectId(job_id)},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )

        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            return None

        return sanitize_document(job)

    @staticmethod
    async def get_jobs_by_recruiter(recruiter_id):
        db = await get_database()
        cursor = db.jobs.find({"recruiter_id": recruiter_id})

        jobs = []
        async for job in cursor:
            jobs.append(sanitize_document(job))

        return jobs

    @staticmethod
    async def get_job(job_id):
        db = await get_database()
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            return None

        return sanitize_document(job)
