import httpx
import os
import re
import json


class HuggingFaceAdapter:
   
    MODEL = os.getenv("HUGGINGFACE_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
    BASE_URL = "https://router.huggingface.co/v1/chat/completions"

    def __init__(self, api_key: str):
        self.api_key = api_key

    def extract_json(self, text: str):
        if not text:
            return None

        text = text.strip()

        # ```json { ... } ```
        m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if m:
            return m.group(1)

        # first balanced-ish { ... } block
        m = re.search(r"\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}", text, re.DOTALL)
        if m:
            return m.group(0)

        return text

    async def generate(self, prompt: str):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an AI that evaluates resume-to-job matching. "
                        "You MUST respond with ONLY valid JSON, no markdown, no "
                        "explanation, no code blocks. The JSON must have exactly "
                        "these fields: "
                        '{"score": number, "matched_skills": array, '
                        '"missing_skills": array, "transferable_skills": array, '
                        '"explanation": string}'
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "max_tokens": 1000,
            "stream": False,
        }

        try:
            print("HuggingFace Request Sent")
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(self.BASE_URL, headers=headers, json=payload)
            print("HuggingFace Status:", r.status_code)

            if r.status_code != 200:
                print("HuggingFace ERROR TEXT:", r.text)
                return None

            response_data = r.json()
            raw_content = response_data["choices"][0]["message"]["content"]

            print(f"Raw HF Response (first 200 chars): {raw_content[:200]}")

            json_text = self.extract_json(raw_content)

            try:
                json.loads(json_text)  # validate only
                print("\u2713 HuggingFace JSON parsed")
                return json_text
            except Exception:
                print(f"\u2717 Failed to parse HF JSON: {str(json_text)[:200]}")
                return None

        except Exception as e:
            print("HuggingFace Exception:", e)
            return None