from datetime import datetime


class MatchResult:
    """
    Represents AI-based compatibility evaluation stored inside Application.
    """

    def __init__(
        self,
        score: float,
        matched_skills: list,
        missing_skills: list,
        transferable_skills: list,
        explanation: str,
        provider: str,
        model: str,
    ):
        self.score = score
        self.matched_skills = matched_skills
        self.missing_skills = missing_skills
        self.transferable_skills = transferable_skills
        self.explanation = explanation
        self.provider = provider
        self.model = model
        self.generated_at = datetime.utcnow()

    def to_dict(self):
        return {
            "score": self.score,
            "matched_skills": self.matched_skills,
            "missing_skills": self.missing_skills,
            "transferable_skills": self.transferable_skills,
            "explanation": self.explanation,
            "provider": self.provider,
            "model": self.model,
            "generated_at": self.generated_at,
        }
