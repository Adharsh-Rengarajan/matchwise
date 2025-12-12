from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional
from enum import Enum

class JobType(str, Enum):
    FULL_TIME = "Full-Time"
    PART_TIME = "Part-Time"
    CONTRACT = "Contract"
    INTERNSHIP = "Internship"
    CO_OP = "Co-op"

class JobStatus(str, Enum):
    OPEN = "OPEN"
    HIRING = "HIRING"
    EXPIRED = "EXPIRED"

class JobQuestion(BaseModel):
    questionNo: int
    question: str

class JobCreateRequest(BaseModel):
    recruiter_id: str
    title: str
    description: str
    salary: str
    location: str
    type: JobType
    start_date: date
    end_date: Optional[date] = None
    skills_required: List[str]
    status: JobStatus = JobStatus.OPEN
    questions: List[JobQuestion] = []

class JobUpdateStatusRequest(BaseModel):
    job_id: str
    status: JobStatus

class JobResponse(BaseModel):
    id: str
    recruiter_id: str
    title: str
    description: str
    salary: str
    location: str
    type: JobType
    start_date: date
    end_date: Optional[date]
    skills_required: List[str]
    status: JobStatus
    created_at: str
    updated_at: str
    questions: List[JobQuestion]

class FilterRequest(BaseModel):
    title: Optional[str] = None
    keyword: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    skills: Optional[List[str]] = None