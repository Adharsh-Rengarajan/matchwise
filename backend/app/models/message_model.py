from datetime import datetime


class Message:
    """
    Represents chat messages between recruiter and jobseeker.
    """

    def __init__(
        self,
        sender_id: str,
        receiver_id: str,
        content: str,
        message_type: str = "text",
        job_context: str | None = None,
    ):
        self.sender_id = sender_id
        self.receiver_id = receiver_id
        self.content = content
        self.message_type = message_type  # text / system / note
        self.job_context = job_context
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "content": self.content,
            "message_type": self.message_type,
            "job_context": self.job_context,
            "created_at": self.created_at,
        }
