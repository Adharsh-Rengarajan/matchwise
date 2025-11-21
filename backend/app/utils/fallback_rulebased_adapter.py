import re
from collections import Counter

class RuleBasedFallbackAdapter:
    """
    Local rule-based scoring when both AI providers fail.
    No token usage.
    """

    @staticmethod
    def jaccard_similarity(a: set, b: set):
        if not a or not b:
            return 0.0
        return len(a & b) / len(a | b)

    def analyze(self, resume_text: str, job_text: str):
        resume_words = set(re.findall(r"\w+", resume_text.lower()))
        job_words = set(re.findall(r"\w+", job_text.lower()))

        score = round(self.jaccard_similarity(resume_words, job_words) * 100, 2)

        return {
            "score": score,
            "matched_skills": list(resume_words & job_words),
            "missing_skills": list(job_words - resume_words),
            "transferable_skills": list(resume_words - job_words),
            "explanation": "Rule-based fallback used.",
            "provider": "local-fallback",
            "model": "rule-based"
        }
