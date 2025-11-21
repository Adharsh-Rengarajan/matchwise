import httpx
import os

class HuggingFaceAdapter:
    """
    Secondary LLM provider: HuggingFace text generation.
    Generates JSON match results.
    """

    MODEL = os.getenv("HUGGINGFACE_MODEL", "HuggingFaceH4/zephyr-7b-beta")
    BASE_URL = f"https://api-inference.huggingface.co/models/{MODEL}"

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate(self, prompt: str):
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {"inputs": prompt}

        try:
            print("HuggingFace Request Sent")
            async with httpx.AsyncClient(timeout=20) as client:
                r = await client.post(self.BASE_URL, headers=headers, json=payload)
            print("HuggingFace Status:", r.status_code)

            if r.status_code != 200:
                print("HuggingFace ERROR TEXT:", r.text)
                return None

            print("HuggingFace Response OK")
            return r.json()[0]["generated_text"]

        except Exception as e:
            print("HuggingFace Exception:", e)
            return None
