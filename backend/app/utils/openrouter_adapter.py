import httpx
import os
import re
import json

class OpenRouterAdapter:

    MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-flash-1.5")
    BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

    def __init__(self, api_key: str):
        self.api_key = api_key

    def extract_json(self, text: str):
        if not text:
            return None
        
        text = text.strip()
        
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if json_match:
            return json_match.group(1)
        
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', text, re.DOTALL)
        if json_match:
            return json_match.group(0)
        
        return text

    async def generate(self, prompt: str):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://matchwise.app",
            "X-Title": "MatchWise"
        }
        payload = {
            "model": self.MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an AI that evaluates resume-to-job matching. "
                        "You MUST respond with ONLY valid JSON, no markdown, no explanation, no code blocks. "
                        "The JSON must have exactly these fields: "
                        '{"score": number, "matched_skills": array, "missing_skills": array, '
                        '"transferable_skills": array, "explanation": string}'
                    )
                },
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 1000
        }

        try:
            print("OpenRouter Request Sent")
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(self.BASE_URL, headers=headers, json=payload)
            print("OpenRouter Status:", r.status_code)

            if r.status_code != 200:
                print("OpenRouter ERROR TEXT:", r.text)
                return None

            response_data = r.json()
            raw_content = response_data["choices"][0]["message"]["content"]
            
            print(f"Raw AI Response (first 200 chars): {raw_content[:200]}")
            
            json_text = self.extract_json(raw_content)
            
            try:
                parsed = json.loads(json_text)
                print("✓ Successfully parsed JSON")
                return json_text
            except:
                print(f"✗ Failed to parse extracted JSON: {json_text[:200]}")
                return None

        except Exception as e:
            print("OpenRouter Exception:", e)
            return None
