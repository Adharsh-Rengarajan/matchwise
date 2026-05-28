import json
from app.services.llm_service import LLMService
from app.utils.prompt_builder import PromptBuilder
from app.models.match_result_model import MatchResult


class LLMMatchingStrategy:

    @staticmethod
    def _coerce_score(value):
        """Force any provider score into a valid 0-100 float."""
        try:
            score = float(value)
        except (TypeError, ValueError):
            return 0.0
        return max(0.0, min(100.0, round(score, 2)))

    @staticmethod
    def _build_result(payload: dict, provider: str, model: str):
        return MatchResult(
            score=LLMMatchingStrategy._coerce_score(payload.get("score", 0)),
            matched_skills=payload.get("matched_skills", []) or [],
            missing_skills=payload.get("missing_skills", []) or [],
            transferable_skills=payload.get("transferable_skills", []) or [],
            explanation=payload.get("explanation") or "",
            provider=provider,
            model=model,
        )

    @staticmethod
    async def generate_match(resume_text: str, job_description: str):
        llm = LLMService.instance()
        prompt = PromptBuilder.build_match_prompt(resume_text, job_description)

        raw = await llm.generate_match(prompt, resume_text, job_description)

        # If fallback was used
        if raw["provider"] == "local-fallback":
            return LLMMatchingStrategy._build_result(
                raw["json"], "local-fallback", "rule-based"
            )

        # Otherwise parse OpenRouter / HF JSON
        try:
            j = json.loads(raw["text"])
            return LLMMatchingStrategy._build_result(j, raw["provider"], raw["model"])
        except Exception as e:
            print("JSON parsing error:", e)
            fb = llm.fallback.analyze(resume_text, job_description)
            return LLMMatchingStrategy._build_result(fb, "local-fallback", "rule-based")