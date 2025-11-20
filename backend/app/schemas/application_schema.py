from pydantic import BaseModel, Field
from typing import List, Dict, Any


VALID_STATUSES = {"APPLIED", "UNDER_REVIEW", "INTERVIEWING", "REJECTED"}


class ApplicationCreateRequest(BaseModel):
    job_id: str
    jobseeker_id: str
    questions: List[Dict[str, Any]]  
    ai_score: int = Field(..., ge=1, le=100)  
    ai_feedback: str  
    keyword_score: int = Field(..., ge=1, le=100)  
    application_status: str = Field(...)

    def validate_status(self):
        if self.application_status not in VALID_STATUSES:
            raise ValueError("Invalid application status.")

class ApplicationStatusUpdateRequest(BaseModel):
    application_id: str
    application_status: str

    def validate_status(self):
        if self.application_status not in VALID_STATUSES:
            raise ValueError("Invalid application status.")
