from datetime import datetime
from app.utils.mongo import sanitize_document
from app.repository.message_repository import MessageRepository


class MessageService:

    @staticmethod
    async def send_message(data: dict):
        data["created_at"] = datetime.utcnow()
        data.setdefault("isOpened", False)

        inserted_id = await MessageRepository.insert_one(data)
        data["_id"] = inserted_id

        return sanitize_document(data)

    @staticmethod
    async def get_conversation(user1: str, user2: str):
        messages = await MessageRepository.find_conversation(user1, user2)
        return [sanitize_document(m) for m in messages]

    @staticmethod
    async def get_conversations_for_user(user_id: str):
        """
        Build the conversation list for ANY user (recruiter or job seeker).
        Each row represents the other participant in a thread.
        """
        pipeline = [
            {
                "$match": {
                    "$or": [
                        {"sender_id": user_id},
                        {"receiver_id": user_id}
                    ]
                }
            },
            {"$sort": {"created_at": -1}},
            {
                "$group": {
                    "_id": {
                        "$cond": [
                            {"$eq": ["$sender_id", user_id]},
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
                                        {"$eq": ["$receiver_id", user_id]},
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
            # Everyone lives in `users`. Grouped _id is a string; users._id is an
            # ObjectId, so convert before the join.
            {
                "$lookup": {
                    "from": "users",
                    "let": {"pid": "$_id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": [
                                        "$_id",
                                        {
                                            "$convert": {
                                                "input": "$$pid",
                                                "to": "objectId",
                                                "onError": None,
                                                "onNull": None
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        {"$project": {"name": 1, "role": 1, "company": 1}}
                    ],
                    "as": "participant"
                }
            },
            {"$addFields": {"participant": {"$arrayElemAt": ["$participant", 0]}}},
            {
                "$project": {
                    # Emit a non-_id key so sanitize_document doesn't rename it.
                    "_id": 0,
                    "participantId": "$_id",
                    "participantName": {"$ifNull": ["$participant.name", "Unknown User"]},
                    "company": {"$ifNull": ["$participant.company", ""]},
                    "lastMessage": 1,
                    "timestamp": "$lastMessageTime",
                    "unread": {"$gt": ["$unreadCount", 0]},
                    "unreadCount": 1,
                    "jobTitle": {
                        "$cond": [
                            {"$eq": ["$participant.role", "recruiter"]},
                            "Recruiter",
                            "Job Seeker"
                        ]
                    },
                    # Crash-safe palette pick (old $toInt on hex chars threw).
                    "avatarColor": {
                        "$let": {
                            "vars": {
                                "palette": ["#3b82f6", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981"],
                                "hexchars": ["0", "1", "2", "3", "4", "5", "6", "7",
                                             "8", "9", "a", "b", "c", "d", "e", "f"],
                                "lastChar": {
                                    "$toLower": {
                                        "$substrCP": [
                                            "$_id",
                                            {"$subtract": [{"$strLenCP": "$_id"}, 1]},
                                            1
                                        ]
                                    }
                                }
                            },
                            "in": {
                                "$arrayElemAt": [
                                    "$$palette",
                                    {"$mod": [{"$max": [0, {"$indexOfArray": ["$$hexchars", "$$lastChar"]}]}, 5]}
                                ]
                            }
                        }
                    }
                }
            },
            {"$sort": {"timestamp": -1}}
        ]

        result = await MessageRepository.aggregate(pipeline)
        return [sanitize_document(conv) for conv in result]

    # Backwards-compatible alias for the existing recruiter route.
    @staticmethod
    async def get_conversations_for_recruiter(recruiter_id: str):
        return await MessageService.get_conversations_for_user(recruiter_id)

    @staticmethod
    async def mark_messages_as_read(sender_id: str, receiver_id: str):
        filter_query = {
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "isOpened": False
        }
        update_data = {"$set": {"isOpened": True, "opened_at": datetime.utcnow()}}

        result = await MessageRepository.update_many(filter_query, update_data)
        return result