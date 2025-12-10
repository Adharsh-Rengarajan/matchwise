from datetime import datetime
from bson import ObjectId
from app.database import get_database
from app.utils.mongo import sanitize_document

class MessageService:

    @staticmethod
    async def send_message(data: dict):
        db = await get_database()
        data["created_at"] = datetime.utcnow()
        data["isOpened"] = False

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

    @staticmethod
    async def get_conversations_for_recruiter(recruiter_id: str):
        db = await get_database()

        pipeline = [
            {
                "$match": {
                    "$or": [
                        {"sender_id": recruiter_id},
                        {"receiver_id": recruiter_id}
                    ]
                }
            },
            {
                "$sort": {"created_at": -1}
            },
            {
                "$group": {
                    "_id": {
                        "$cond": [
                            {"$eq": ["$sender_id", recruiter_id]},
                            "$receiver_id",
                            "$sender_id"
                        ]
                    },
                    "lastMessage": {"$first": "$content"},
                    "lastMessageTime": {"$first": "$created_at"},
                    "unreadCount": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$and": [
                                        {"$eq": ["$receiver_id", recruiter_id]},
                                        {"$eq": ["$isOpened", False]}
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                "$lookup": {
                    "from": "jobseekers",
                    "localField": "_id",
                    "foreignField": "_id",
                    "as": "jobseekerData"
                }
            },
            {
                "$lookup": {
                    "from": "recruiters",
                    "localField": "_id",
                    "foreignField": "_id",
                    "as": "recruiterData"
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "participantName": {
                        "$cond": [
                            {"$gt": [{"$size": "$jobseekerData"}, 0]},
                            {"$arrayElemAt": ["$jobseekerData.full_name", 0]},
                            {"$arrayElemAt": ["$recruiterData.company_name", 0]}
                        ]
                    },
                    "lastMessage": 1,
                    "timestamp": "$lastMessageTime",
                    "unread": {"$gt": ["$unreadCount", 0]},
                    "jobTitle": {
                        "$cond": [
                            {"$gt": [{"$size": "$jobseekerData"}, 0]},
                            "Job Seeker",
                            "Recruiter"
                        ]
                    },
                    "avatarColor": {
                        "$arrayElemAt": [
                            ["#3b82f6", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981"],
                            {"$mod": [{"$toInt": {"$substr": ["$_id", 0, 2]}}, 5]}
                        ]
                    }
                }
            },
            {
                "$sort": {"timestamp": -1}
            }
        ]

        result = await db.messages.aggregate(pipeline).to_list(None)
        return [sanitize_document(conv) for conv in result]

    @staticmethod
    async def mark_messages_as_read(sender_id: str, receiver_id: str):
        db = await get_database()

        result = await db.messages.update_many(
            {
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "isOpened": False
            },
            {
                "$set": {"isOpened": True, "opened_at": datetime.utcnow()}
            }
        )

        return {
            "modified_count": result.modified_count,
            "matched_count": result.matched_count
        }