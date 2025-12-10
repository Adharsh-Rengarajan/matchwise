from pydantic import BaseModel
from typing import Optional

class MessageSchema(BaseModel):
    sender_id: str
    receiver_id: str
    content: str
    message_type: str = "text"
    job_context: Optional[str] = None
    application_id: Optional[str] = None
    isOpened: bool = False