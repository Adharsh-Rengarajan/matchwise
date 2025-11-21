class PromptBuilder:
    """
    Builds a structured prompt for LLM-based matching.
    """

    @staticmethod
    def build_match_prompt(resume_text: str, job_description: str):
        return f"""
        You are an AI that evaluates job fit between a resume and job description.

        Resume:
        {resume_text}

        Job Description:
        {job_description}

        Return JSON with:
        - score (0-100)
        - matched_skills
        - missing_skills
        - transferable_skills
        - explanation
        """
