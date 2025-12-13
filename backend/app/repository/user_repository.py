from bson import ObjectId
from app.database import get_database
from typing import Optional, Dict, Any

class UserRepository:
    
    @staticmethod
    async def find_by_email(email: str) -> Optional[Dict[str, Any]]:
        db = await get_database()
        return await db.users.find_one({"email": email})
    
    @staticmethod
    async def find_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        db = await get_database()
        if not ObjectId.is_valid(user_id):
            return None
        return await db.users.find_one({"_id": ObjectId(user_id)})
    
    @staticmethod
    async def insert_one(user_data: Dict[str, Any]) -> Any:
        db = await get_database()
        result = await db.users.insert_one(user_data)
        return result.inserted_id
    
    @staticmethod
    async def update_by_id(user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        db = await get_database()
        if not ObjectId.is_valid(user_id):
            return None
        result = await db.users.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
            return_document=True
        )
        return result
    
    @staticmethod
    async def find_jobseekers(filters: Dict[str, Any] = None, skip: int = 0, limit: int = 0):
        db = await get_database()
        query = {"role": "jobseeker"}
        if filters:
            query.update(filters)
        cursor = db.users.find(query).skip(skip).limit(limit)
        return [user async for user in cursor]
    
    @staticmethod
    async def count_jobseekers(filters: Dict[str, Any] = None) -> int:
        db = await get_database()
        query = {"role": "jobseeker"}
        if filters:
            query.update(filters)
        return await db.users.count_documents(query)