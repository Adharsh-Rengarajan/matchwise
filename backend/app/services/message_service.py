from datetime import datetime
from app.database import get_database
from app.utils.mongo import sanitize_document

class MessageService:

    @staticmethod
    async def send_message(data: dict):
        db = await get_database()
        data["created_at"] = datetime.utcnow()

        result = await db.messages.insert_one(data)
        data["_id"] = result.inserted_id

        return sanitize_document(data)

    @staticmethod
    async def get_conversation(user1: str, user2: str):
        db = await get_database()

        cursor = db.messages.find({
            "$or": [
                {"sender_id": user1, "receiver_id": user2},
                {"sender_id": user2, "receiver_id": user1}
            ]
        }).sort("created_at", 1)

        return [sanitize_document(m) async for m in cursor]
