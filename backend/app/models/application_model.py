from datetime import datetime
from typing import List, Dict, Any
from app.models.match_result_model import MatchResult
from app.models.application_note_model import ApplicationNote


class Application:
    def __init__(
        self,
        job_id: str,
        jobseeker_id: str,
        questions: List[Dict[str, Any]],
        answers: List[Dict[str, Any]],
        resume_file_id: str,
        resume_text: str,
        match_result: MatchResult = None,
        notes: List[ApplicationNote] = None,
        application_status: str = "PENDING",
    ):
        self.job_id = job_id
        self.jobseeker_id = jobseeker_id
        self.questions = questions
        self.answers = answers
        self.resume_file_id = resume_file_id
        self.resume_text = resume_text

        self.match_result = match_result  # NEW
        self.notes = notes or []          # NEW

        self.application_status = application_status
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            "job_id": self.job_id,
            "jobseeker_id": self.jobseeker_id,
            "questions": self.questions,
            "answers": self.answers,
            "resume_file_id": self.resume_file_id,
            "resume_text": self.resume_text,
            "match_result": (
                self.match_result.to_dict() if self.match_result else None
            ),
            "notes": [n.to_dict() for n in self.notes],
            "application_status": self.application_status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
