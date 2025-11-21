from pydantic import BaseModel

class ApplicationNoteSchema(BaseModel):
    recruiter_id: str
    note: str
