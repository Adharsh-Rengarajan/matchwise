import httpx
import os

class OpenRouterAdapter:
    """
    Primary LLM provider: OpenRouter
    Generates JSON match results.
    """

    MODEL = os.getenv("OPENROUTER_MODEL", "x-ai/grok-4.1-fast:free")
    BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate(self, prompt: str):
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "model": self.MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an AI that evaluates resume-to-job matching. "
                        "Return ONLY valid JSON containing: "
                        "{score, matched_skills, missing_skills, transferable_skills, explanation}"
                    )
                },
                {"role": "user", "content": prompt}
            ]
        }

        try:
            print("OpenRouter Request Sent")
            async with httpx.AsyncClient(timeout=15) as client:
                r = await client.post(self.BASE_URL, headers=headers, json=payload)
            print("OpenRouter Status:", r.status_code)

            if r.status_code != 200:
                print("OpenRouter ERROR TEXT:", r.text)
                return None

            print("OpenRouter Response OK")
            return r.json()["choices"][0]["message"]["content"]

        except Exception as e:
            print("OpenRouter Exception:", e)
            return None

