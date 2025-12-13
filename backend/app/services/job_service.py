from bson import ObjectId
from datetime import datetime, date
from app.database import get_database
from app.utils.mongo import sanitize_document


class JobService:

    @staticmethod
    async def create_job(payload):
        db = await get_database()

        def convert_date_to_datetime(d):
            if d is None:
                return None
            if isinstance(d, date) and not isinstance(d, datetime):
                return datetime.combine(d, datetime.min.time())
            return d

        job_data = {
            "recruiter_id": payload.recruiter_id,
            "title": payload.title,
            "description": payload.description,
            "location": payload.location,
            "type": payload.type,
            "salary": payload.salary,
            "start_date": convert_date_to_datetime(payload.start_date),
            "end_date": convert_date_to_datetime(payload.end_date),
            "skills_required": payload.skills_required,
            "questions": [q.dict() for q in payload.questions] if payload.questions else [],
            "status": "OPEN",
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

        query = {"status": "OPEN"}

        if filter_data.location:
            query["location"] = {"$regex": filter_data.location, "$options": "i"}

        if filter_data.type:
            query["type"] = filter_data.type

        if filter_data.title:
            query["title"] = {"$regex": filter_data.title, "$options": "i"}

        if filter_data.keyword:
            query["$or"] = [
                {"title": {"$regex": filter_data.keyword, "$options": "i"}},
                {"description": {"$regex": filter_data.keyword, "$options": "i"}},
            ]

        if filter_data.skills:
            query["skills_required"] = {"$in": filter_data.skills}

        cursor = db.jobs.find(query).sort("created_at", -1)
        jobs = [sanitize_document(job) async for job in cursor]

        return {"results": jobs, "count": len(jobs)}

    @staticmethod
    async def get_top_candidates(job_id: str):
        db = await get_database()

        job = await JobService.get_job_by_id(job_id)
        if not job:
            return []

        applications = []
        cursor = db.applications.find({"job_id": job_id}).sort(
            "match_result.score", -1
        )
        async for app in cursor:
            applications.append(sanitize_document(app))

        return applications
