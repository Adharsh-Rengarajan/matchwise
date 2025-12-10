from datetime import datetime
from bson import ObjectId

class Message:
    def __init__(
        self,
        sender_id: str,
        receiver_id: str,
        content: str,
        message_type: str = "text",
        job_context: str | None = None,
        application_id: str | None = None,
        isOpened: bool = False,
        _id: ObjectId | None = None
    ):
        self._id = _id or ObjectId()
        self.sender_id = sender_id
        self.receiver_id = receiver_id
        self.content = content
        self.message_type = message_type
        self.job_context = job_context
        self.application_id = application_id
        self.isOpened = isOpened
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "_id": self._id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "content": self.content,
            "message_type": self.message_type,
            "job_context": self.job_context,
            "application_id": self.application_id,
            "isOpened": self.isOpened,
            "created_at": self.created_at,
        }