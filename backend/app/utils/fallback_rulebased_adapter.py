import re

# Small stopword set so the fallback doesn't report words like "the" or "and"
# as matched/missing skills, which previously polluted the score and ranking.
STOPWORDS = {
    "the", "and", "for", "with", "you", "are", "our", "your", "this", "that",
    "from", "have", "has", "was", "were", "will", "would", "their", "they",
    "them", "into", "over", "under", "but", "not", "all", "any", "can", "out",
    "who", "why", "how", "what", "when", "where", "which", "able", "such",
    "per", "via", "etc", "job", "role", "work", "team", "years", "year",
    "experience", "skills", "skill", "ability", "strong", "good", "must",
}


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

    @staticmethod
    def _tokens(text: str):
        # keep alphanumerics including tech tokens like c++, c#, .net
        words = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.]{1,}", text.lower())
        return {
            w for w in words
            if len(w) > 2 and w not in STOPWORDS and not w.isdigit()
        }

    def analyze(self, resume_text: str, job_text: str):
        resume_words = self._tokens(resume_text)
        job_words = self._tokens(job_text)

        score = round(self.jaccard_similarity(resume_words, job_words) * 100, 2)

        return {
            "score": score,
            "matched_skills": sorted(resume_words & job_words),
            "missing_skills": sorted(job_words - resume_words),
            "transferable_skills": sorted(resume_words - job_words),
            "explanation": (
                "Rule-based keyword fallback used (LLM providers unavailable). "
                "Scores are approximate and not directly comparable to AI-generated scores."
            ),
            "provider": "local-fallback",
            "model": "rule-based"
        }