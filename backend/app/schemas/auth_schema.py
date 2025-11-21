from pydantic import BaseModel, EmailStr
from datetime import date
from typing import List, Optional

class Experience(BaseModel):
    title: str
    company: str
    start_date: date
    end_date: Optional[date]

class Education(BaseModel):
    degree: str
    institution: str
    start_date: date
    end_date: Optional[date]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RecruiterRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    company: Optional[str] = None
    designation: Optional[str] = None
    role: str = "recruiter"

class JobSeekerRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    skills: List[str] = []
    experience: List[Experience] = []
    education: List[Education] = []
    role: str = "jobseeker"
