from datetime import datetime
from typing import List, Dict, Any


class Application:
    def __init__(
        self,
        job_id: str,
        jobseeker_id: str,
        questions: List[Dict[str, Any]],
        answers: List[Dict[str, Any]],
        ai_score: int,
        ai_feedback: str,
        keyword_score: int,
        application_status: str,
        resume_file_id: str,
        resume_text: str
    ):
        self.job_id = job_id
        self.jobseeker_id = jobseeker_id
        self.questions = questions         
        self.answers = answers             
        self.ai_score = ai_score
        self.ai_feedback = ai_feedback
        self.keyword_score = keyword_score
        self.application_status = application_status
        self.resume_file_id = resume_file_id
        self.resume_text = resume_text
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            "job_id": self.job_id,
            "jobseeker_id": self.jobseeker_id,
            "questions": self.questions,
            "answers": self.answers,
            "ai_score": self.ai_score,
            "ai_feedback": self.ai_feedback,
            "keyword_score": self.keyword_score,
            "application_status": self.application_status,
            "resume_file_id": self.resume_file_id,
            "resume_text": self.resume_text,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
