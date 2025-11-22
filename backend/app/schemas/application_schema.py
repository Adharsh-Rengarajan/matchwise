from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ApplicationNote(BaseModel):
    recruiter_id: str
    note: str
    created_at: Optional[str] = None

class MatchResult(BaseModel):
    score: float
    matched_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []
    transferable_skills: Optional[List[str]] = []
    explanation: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    generated_at: Optional[str] = None

class ApplicationQuestion(BaseModel):
    questionNo: int
    question: str

class ApplicationAnswer(BaseModel):
    questionNo: int
    answer: str

class ApplicationCreateRequest(BaseModel):
    job_id: str
    jobseeker_id: str
    resume_file_id: str
    questions: Optional[List[ApplicationQuestion]] = []
    answers: Optional[List[ApplicationAnswer]] = []
    match_result: Optional[MatchResult] = None
    resume_text: Optional[str] = None

class ApplicationUpdateRequest(BaseModel):
    application_status: Optional[str] = None
    notes: Optional[List[ApplicationNote]] = None
    match_result: Optional[MatchResult] = None

class ApplicationStatusUpdate(BaseModel):
    application_status: str = Field(..., pattern="^(APPLIED|REVIEWING|SHORTLISTED|INTERVIEW|OFFER|HIRED|REJECTED)$")