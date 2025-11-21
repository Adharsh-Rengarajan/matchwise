from datetime import datetime


class ApplicationNote:
    """
    Notes added by recruiter on applications.
    """

    def __init__(self, recruiter_id: str, note: str):
        self.recruiter_id = recruiter_id
        self.note = note
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "recruiter_id": self.recruiter_id,
            "note": self.note,
            "created_at": self.created_at,
        }
