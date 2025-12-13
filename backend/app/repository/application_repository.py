from bson import ObjectId
from app.database import get_database
from typing import Optional, Dict, Any, List

class ApplicationRepository:
    
    @staticmethod
    async def insert_one(application_data: Dict[str, Any]) -> Any:
        db = await get_database()
        result = await db.applications.insert_one(application_data)
        return result.inserted_id
    
    @staticmethod
    async def find_by_id(application_id: str) -> Optional[Dict[str, Any]]:
        db = await get_database()
        if not ObjectId.is_valid(application_id):
            return None
        return await db.applications.find_one({"_id": ObjectId(application_id)})
    
    @staticmethod
    async def update_by_id(application_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        db = await get_database()
        if not ObjectId.is_valid(application_id):
            return None
        result = await db.applications.find_one_and_update(
            {"_id": ObjectId(application_id)},
            {"$set": update_data},
            return_document=True
        )
        return result
    
    @staticmethod
    async def find_by_job_id(job_id: str) -> List[Dict[str, Any]]:
        db = await get_database()
        cursor = db.applications.find({"job_id": job_id})
        return [app async for app in cursor]
    
    @staticmethod
    async def find_by_jobseeker_id(jobseeker_id: str) -> List[Dict[str, Any]]:
        db = await get_database()
        cursor = db.applications.find({"jobseeker_id": jobseeker_id}).sort("created_at", -1)
        return [app async for app in cursor]
    
    @staticmethod
    async def find_one(query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        db = await get_database()
        return await db.applications.find_one(query)
    
    @staticmethod
    async def aggregate(pipeline: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        db = await get_database()
        result = await db.applications.aggregate(pipeline).to_list(None)
        return result