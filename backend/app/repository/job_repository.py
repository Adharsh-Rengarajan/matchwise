from bson import ObjectId
from app.database import get_database
from typing import Optional, Dict, Any, List

class JobRepository:
    
    @staticmethod
    async def insert_one(job_data: Dict[str, Any]) -> Any:
        db = await get_database()
        result = await db.jobs.insert_one(job_data)
        return result.inserted_id
    
    @staticmethod
    async def find_by_id(job_id: str) -> Optional[Dict[str, Any]]:
        db = await get_database()
        if not ObjectId.is_valid(job_id):
            return None
        return await db.jobs.find_one({"_id": ObjectId(job_id)})
    
    @staticmethod
    async def update_by_id(job_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        db = await get_database()
        if not ObjectId.is_valid(job_id):
            return None
        result = await db.jobs.find_one_and_update(
            {"_id": ObjectId(job_id)},
            {"$set": update_data},
            return_document=True
        )
        return result
    
    @staticmethod
    async def find_by_recruiter(recruiter_id: str) -> List[Dict[str, Any]]:
        db = await get_database()
        cursor = db.jobs.find({"recruiter_id": recruiter_id}).sort("created_at", -1)
        return [job async for job in cursor]
    
    @staticmethod
    async def find_with_filters(query: Dict[str, Any], skip: int = 0, limit: int = 0) -> List[Dict[str, Any]]:
        db = await get_database()
        cursor = db.jobs.find(query).skip(skip).limit(limit).sort("created_at", -1)
        return [job async for job in cursor]
    
    @staticmethod
    async def count_with_filters(query: Dict[str, Any]) -> int:
        db = await get_database()
        return await db.jobs.count_documents(query)