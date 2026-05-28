class PromptBuilder:
    """Builds a compact, token-efficient prompt for resume/job matching."""

    # Caps to keep per-call input cost bounded (~4 chars/token).
    MAX_RESUME_CHARS = 6000   # ~1.5k tokens
    MAX_JOB_CHARS = 3000      # ~0.75k tokens

    @staticmethod
    def _truncate(text: str, limit: int) -> str:
        text = (text or "").strip()
        return text if len(text) <= limit else text[:limit] + " ...[truncated]"

    @staticmethod
    def build_match_prompt(resume_text: str, job_description: str, preferences: dict | None = None):
        resume = PromptBuilder._truncate(resume_text, PromptBuilder.MAX_RESUME_CHARS)
        job = PromptBuilder._truncate(job_description, PromptBuilder.MAX_JOB_CHARS)

        return f"""Score how well this resume fits the job. Use only evidence in the resume; don't invent skills.
Score 0-100 weighted ~50% required-skill match, 25% experience relevance, 15% transferable skills, 10% education.
Skill arrays = short skill names (e.g. "Python"), not sentences. Explanation = 2-3 sentences: fit, top strength, biggest gap.
Empty/unreadable resume -> score 0, empty arrays.
Return ONLY this JSON, nothing else:
{{"score":<0-100>,"matched_skills":[],"missing_skills":[],"transferable_skills":[],"explanation":""}}

JOB:
{job}

RESUME:
{resume}
"""