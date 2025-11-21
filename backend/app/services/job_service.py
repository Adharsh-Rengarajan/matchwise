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
        job_dict["end_date"] = to_datetime(job_dict["end_date"]) if job_dict["end_date"] else None
        job_dict["created_at"] = datetime.utcnow()
        job_dict["updated_at"] = datetime.utcnow()

        result = await db.jobs.insert_one(job_dict)
        job_dict["_id"] = result.inserted_id
        return sanitize_document(job_dict)

    @staticmethod
    async def update_job_status(payload):
        db = await get_database()

        job = await db.jobs.find_one({"_id": ObjectId(payload.job_id)})
        if not job:
            return None

        await db.jobs.update_one(
            {"_id": ObjectId(payload.job_id)},
            {"$set": {"status": payload.status, "updated_at": datetime.utcnow()}}
        )

        updated = await db.jobs.find_one({"_id": ObjectId(payload.job_id)})
        return sanitize_document(updated)

    @staticmethod
    async def get_jobs_by_recruiter(recruiter_id: str):
        db = await get_database()

        cursor = db.jobs.find({"recruiter_id": recruiter_id}).sort("created_at", -1)
        return [sanitize_document(job) async for job in cursor]

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

        if filter_data.title:
            query["title"] = {"$regex": filter_data.title, "$options": "i"}

        if filter_data.keyword:
            keyword_regex = {"$regex": filter_data.keyword, "$options": "i"}
            query["$or"] = [{"title": keyword_regex}, {"description": keyword_regex}]

        if filter_data.type:
            query["type"] = filter_data.type

        if filter_data.skills:
            query["skills_required"] = {"$all": filter_data.skills}

        cursor = db.jobs.find(query).sort("created_at", -1)
        return [sanitize_document(job) async for job in cursor]

    # NEW METHOD: Top candidates ranked by match_result.score
    @staticmethod
    async def get_top_candidates(job_id: str):
        db = await get_database()

        cursor = db.applications.find({"job_id": job_id})
        apps = [sanitize_document(a) async for a in cursor]

        # if no match results found
        for a in apps:
            if not a.get("match_result"):
                a["match_result"] = {"score": 0}

        apps = sorted(apps, key=lambda x: x["match_result"]["score"], reverse=True)
        return apps
