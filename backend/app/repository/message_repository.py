from bson import ObjectId
from app.database import get_database
from typing import Dict, Any, List

class MessageRepository:
    
    @staticmethod
    async def insert_one(message_data: Dict[str, Any]) -> Any:
        db = await get_database()
        result = await db.messages.insert_one(message_data)
        return result.inserted_id
    
    @staticmethod
    async def find_conversation(user1: str, user2: str) -> List[Dict[str, Any]]:
        db = await get_database()
        cursor = db.messages.find({
            "$or": [
                {"sender_id": user1, "receiver_id": user2},
                {"sender_id": user2, "receiver_id": user1}
            ]
        }).sort("created_at", 1)
        return [message async for message in cursor]
    
    @staticmethod
    async def aggregate(pipeline: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        db = await get_database()
        result = await db.messages.aggregate(pipeline).to_list(None)
        return result
    
    @staticmethod
    async def update_many(filter_query: Dict[str, Any], update_data: Dict[str, Any]) -> Dict[str, int]:
        db = await get_database()
        result = await db.messages.update_many(filter_query, update_data)
        return {
            "modified_count": result.modified_count,
            "matched_count": result.matched_count
        }