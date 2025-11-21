import json
from app.services.llm_service import LLMService
from app.utils.prompt_builder import PromptBuilder
from app.models.match_result_model import MatchResult

class LLMMatchingStrategy:

    @staticmethod
    async def generate_match(resume_text: str, job_description: str):
        llm = LLMService.instance()
        prompt = PromptBuilder.build_match_prompt(resume_text, job_description)

        raw = await llm.generate_match(prompt, resume_text, job_description)

        # If fallback was used
        if raw["provider"] == "local-fallback":
            fb = raw["json"]
            return MatchResult(
                score=fb["score"],
                matched_skills=fb["matched_skills"],
                missing_skills=fb["missing_skills"],
                transferable_skills=fb["transferable_skills"],
                explanation=fb["explanation"],
                provider="local-fallback",
                model="rule-based"
            )

        # Otherwise parse OpenRouter / HF JSON
        try:
            j = json.loads(raw["text"])
            return MatchResult(
                score=j["score"],
                matched_skills=j["matched_skills"],
                missing_skills=j["missing_skills"],
                transferable_skills=j["transferable_skills"],
                explanation=j["explanation"],
                provider=raw["provider"],
                model=raw["model"]
            )
        except Exception as e:
            print("JSON parsing error:", e)
            # fallback
            fb = llm.fallback.analyze(resume_text, job_description)
            return MatchResult(
                score=fb["score"],
                matched_skills=fb["matched_skills"],
                missing_skills=fb["missing_skills"],
                transferable_skills=fb["transferable_skills"],
                explanation=fb["explanation"],
                provider="local-fallback",
                model="rule-based"
            )
