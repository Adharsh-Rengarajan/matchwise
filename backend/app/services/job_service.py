from bson import ObjectId
from datetime import datetime, date
from app.utils.mongo import sanitize_document
from app.repository.job_repository import JobRepository
from app.database import get_database


class JobService:

    @staticmethod
    async def create_job(payload):
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

        inserted_id = await JobRepository.insert_one(job_data)
        job_data["_id"] = inserted_id

        return sanitize_document(job_data)

    @staticmethod
    async def update_job_status(payload):
        update_data = {
            "status": payload.status,
            "updated_at": datetime.utcnow(),
        }

        result = await JobRepository.update_by_id(payload.job_id, update_data)
        return sanitize_document(result) if result else None

    @staticmethod
    async def get_jobs_by_recruiter(recruiter_id: str):
        jobs = await JobRepository.find_by_recruiter(recruiter_id)
        return [sanitize_document(job) for job in jobs]

    @staticmethod
    async def get_job_by_id(job_id: str):
        job = await JobRepository.find_by_id(job_id)
        return sanitize_document(job) if job else None

    @staticmethod
    async def search_jobs(filter_data):
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

        jobs = await JobRepository.find_with_filters(query)
        return {"results": [sanitize_document(job) for job in jobs], "count": len(jobs)}

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