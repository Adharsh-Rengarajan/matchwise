from bson import ObjectId
from datetime import datetime
from app.database import get_database
from app.utils.mongo import sanitize_document


class JobService:

    @staticmethod
    async def create_job(payload):
        db = await get_database()

        job_data = {
            "recruiter_id": payload.recruiter_id,
            "title": payload.title,
            "description": payload.description,
            "location": payload.location,
            "type": payload.type,
            "salary": payload.salary,
            "start_date": payload.start_date,
            "end_date": payload.end_date,
            "skills_required": payload.skills_required,
            "questions": [q.dict() for q in payload.questions] if payload.questions else [],
            "status": "ACTIVE",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        result = await db.jobs.insert_one(job_data)
        job_data["_id"] = result.inserted_id

        return sanitize_document(job_data)

    @staticmethod
    async def update_job_status(payload):
        db = await get_database()

        result = await db.jobs.find_one_and_update(
            {"_id": ObjectId(payload.job_id)},
            {
                "$set": {
                    "status": payload.status,
                    "updated_at": datetime.utcnow(),
                }
            },
            return_document=True,
        )

        return sanitize_document(result) if result else None

    @staticmethod
    async def get_jobs_by_recruiter(recruiter_id: str):
        db = await get_database()

        cursor = db.jobs.find({"recruiter_id": recruiter_id}).sort("created_at", -1)
        return [sanitize_document(job) async for job in cursor]

    @staticmethod
    async def get_job_by_id(job_id: str):
        db = await get_database()

        if not ObjectId.is_valid(job_id):
            return None

        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
        return sanitize_document(job) if job else None

    @staticmethod
    async def search_jobs(filter_data):
        db = await get_database()

        query = {"status": "ACTIVE"}

        if filter_data.location:
            query["location"] = {"$regex": filter_data.location, "$options": "i"}

        if filter_data.keyword:
            keyword_regex = {"$regex": filter_data.keyword, "$options": "i"}
            query["$or"] = [{"title": keyword_regex}, {"description": keyword_regex}]

        if filter_data.type:
            query["type"] = filter_data.type

        if filter_data.skills:
            query["skills_required"] = {"$all": filter_data.skills}

        cursor = db.jobs.find(query).sort("created_at", -1)
        return [sanitize_document(job) async for job in cursor]

    @staticmethod
    async def get_top_candidates(job_id: str):
        db = await get_database()

        cursor = db.applications.find({
            "job_id": job_id,
            "application_status": {"$ne": "PENDING"}
        })
        apps = [sanitize_document(a) async for a in cursor]

        for a in apps:
            if not a.get("match_result"):
                a["match_result"] = {"score": 0}

        apps = sorted(apps, key=lambda x: x["match_result"]["score"], reverse=True)
        return apps