from datetime import datetime
from app.utils.mongo import sanitize_document
from app.repository.message_repository import MessageRepository

class MessageService:

    @staticmethod
    async def send_message(data: dict):
        data["created_at"] = datetime.utcnow()
        data["isOpened"] = False

        inserted_id = await MessageRepository.insert_one(data)
        data["_id"] = inserted_id

        return sanitize_document(data)

    @staticmethod
    async def get_conversation(user1: str, user2: str):
        messages = await MessageRepository.find_conversation(user1, user2)
        return [sanitize_document(m) for m in messages]

    @staticmethod
    async def get_conversations_for_recruiter(recruiter_id: str):
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

        result = await MessageRepository.aggregate(pipeline)
        return [sanitize_document(conv) for conv in result]

    @staticmethod
    async def mark_messages_as_read(sender_id: str, receiver_id: str):
        filter_query = {
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "isOpened": False
        }
        
        update_data = {
            "$set": {"isOpened": True, "opened_at": datetime.utcnow()}
        }

        result = await MessageRepository.update_many(filter_query, update_data)
        return result