from datetime import datetime
from app.database import get_database
from app.utils.mongo import sanitize_document
from bson import ObjectId

class MessageService:

    @staticmethod
    async def send_message(data: dict):
        db = await get_database()
        data["created_at"] = datetime.utcnow()
        data["_id"] = ObjectId()

        result = await db.messages.insert_one(data)
        data["_id"] = str(result.inserted_id)

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

    @staticmethod
    async def get_conversations_for_recruiter(recruiter_id: str):
        """Get all conversations for a recruiter grouped by candidates"""
        db = await get_database()
        
        cursor = db.messages.find({
            "receiver_id": recruiter_id
        }).sort("created_at", -1)

        messages = [sanitize_document(m) async for m in cursor]
        
        conversations = {}
        for msg in messages:
            key = f"{msg['sender_id']}_{msg.get('application_id', '')}"
            if key not in conversations:
                # Fetch user and job details
                try:
                    candidate_data = await db.users.find_one({"_id": ObjectId(msg["sender_id"])})
                    job_data = await db.jobs.find_one({"_id": ObjectId(msg.get("job_context", ""))})
                except:
                    candidate_data = None
                    job_data = None
                
                conversations[key] = {
                    "candidateId": msg["sender_id"][:2].upper() if len(msg["sender_id"]) >= 2 else "C",
                    "candidateName": candidate_data.get("name", "Unknown") if candidate_data else "Unknown",
                    "candidateUserId": msg["sender_id"],
                    "applicationId": msg.get("application_id", ""),
                    "jobId": msg.get("job_context", ""),
                    "jobTitle": job_data.get("title", "Unknown Job") if job_data else "Unknown Job",
                    "messages": [],
                    "lastMessage": msg["content"],
                    "timestamp": msg["created_at"].isoformat(),
                    "unread": not msg.get("isOpened", False)
                }
            conversations[key]["messages"].append(msg)

        return list(conversations.values())

    @staticmethod
    async def mark_messages_as_read(sender_id: str, receiver_id: str):
        """Mark all unread messages as read"""
        db = await get_database()
        
        result = await db.messages.update_many(
            {
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "isOpened": False
            },
            {"$set": {"isOpened": True}}
        )

        return {"modified_count": result.modified_count}