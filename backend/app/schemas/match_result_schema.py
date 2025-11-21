from pydantic import BaseModel
from typing import List

class MatchResultSchema(BaseModel):
    score: float
    matched_skills: List[str]
    missing_skills: List[str]
    transferable_skills: List[str]
    explanation: str
    provider: str
    model: str
    generated_at: str
