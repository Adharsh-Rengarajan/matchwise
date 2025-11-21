from app.database import get_database
from bson import ObjectId
from datetime import datetime
from app.utils.mongo import sanitize_document
from app.utils.date import to_datetime


class JobService:

    @staticmethod
    async def create_job(payload):
        db = await get_database()

        # Convert payload to dict
        job_dict = payload.dict()

        # Date conversions
        job_dict["start_date"] = to_datetime(job_dict["start_date"])
        job_dict["end_date"] = (
            to_datetime(job_dict["end_date"]) if job_dict["end_date"] else None
        )

        # Add timestamps
        job_dict["created_at"] = datetime.utcnow()
        job_dict["updated_at"] = datetime.utcnow()

        # Mongo inserts the job
        result = await db.jobs.insert_one(job_dict)
        job_dict["_id"] = result.inserted_id

        return sanitize_document(job_dict)

    @staticmethod
    async def update_job_status(payload):
        db = await get_database()

        job_id = payload.job_id
        new_status = payload.status

        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            return None

        await db.jobs.update_one(
            {"_id": ObjectId(job_id)},
            {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
        )

        updated = await db.jobs.find_one({"_id": ObjectId(job_id)})
        return sanitize_document(updated)

    @staticmethod
    async def get_jobs_by_recruiter(recruiter_id: str):
        db = await get_database()

        cursor = db.jobs.find({"recruiter_id": recruiter_id}).sort("created_at", -1)
        jobs = [sanitize_document(job) async for job in cursor]

        return jobs

    @staticmethod
    async def get_job_by_id(job_id: str):
        db = await get_database()

        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            return None

        return sanitize_document(job)

    @staticmethod
    async def search_jobs(filter_data):
        db = await get_database()
        query = {}

        # Title filter
        if filter_data.title:
            query["title"] = {"$regex": filter_data.title, "$options": "i"}

        # Keyword filter (search in title + description)
        if filter_data.keyword:
            keyword_regex = {"$regex": filter_data.keyword, "$options": "i"}
            query["$or"] = [
                {"title": keyword_regex},
                {"description": keyword_regex}
            ]

        # Job type
        if filter_data.type:
            query["type"] = filter_data.type

        # Skill matching (must contain ALL given skills)
        if filter_data.skills:
            query["skills_required"] = {"$all": filter_data.skills}

        # Fetch from DB
        cursor = db.jobs.find(query).sort("created_at", -1)
        jobs = [sanitize_document(job) async for job in cursor]

        return jobs
