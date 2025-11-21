import os
from app.utils.openrouter_adapter import OpenRouterAdapter
from app.utils.huggingface_adapter import HuggingFaceAdapter
from app.utils.fallback_rulebased_adapter import RuleBasedFallbackAdapter
from app.utils.provider_selector import ProviderSelector

class LLMService:
    """
    Clean, simple LLM fallback chain:
    1. OpenRouter
    2. HuggingFace
    3. Local fallback
    """

    _instance = None

    @staticmethod
    def instance():
        if LLMService._instance is None:
            LLMService()
        return LLMService._instance

    def __init__(self):
        if LLMService._instance is not None:
            return

        # Load all provider keys
        self.or_keys = [
            os.getenv("OR_KEY_1"),
            os.getenv("OR_KEY_2"),
            os.getenv("OR_KEY_3")
        ]
        self.hf_keys = [
            os.getenv("HF_KEY_1"),
            os.getenv("HF_KEY_2"),
            os.getenv("HF_KEY_3")
        ]

        self.or_index = {"i": 0}
        self.hf_index = {"i": 0}

        self.fallback = RuleBasedFallbackAdapter()
        LLMService._instance = self

    async def run_openrouter(self, prompt: str):
        print("\n=== Trying OpenRouter Providers ===")
        for _ in range(len(self.or_keys)):
            key = ProviderSelector.next_key(self.or_keys, self.or_index)
            print(f" -> Trying OpenRouter key: {key[:10]}...")

            adapter = OpenRouterAdapter(api_key=key)
            out = await adapter.generate(prompt)

            if out:
                print(" ✔ OpenRouter succeeded")
                return out

            print(" ✖ OpenRouter failed, trying next key...")

        print(" !!! All OpenRouter keys failed")
        return None

    async def run_huggingface(self, prompt: str):
        print("\n=== Trying HuggingFace Providers ===")
        for _ in range(len(self.hf_keys)):
            key = ProviderSelector.next_key(self.hf_keys, self.hf_index)
            print(f" -> Trying HuggingFace key: {key[:10]}...")

            adapter = HuggingFaceAdapter(api_key=key)
            out = await adapter.generate(prompt)

            if out:
                print(" ✔ HuggingFace succeeded")
                return out

            print(" ✖ HuggingFace failed, trying next key...")

        print(" !!! All HuggingFace keys failed")
        return None


    async def generate_match(self, prompt: str, resume_text: str, job_text: str):
        # 1. Try OpenRouter
        result = await self.run_openrouter(prompt)
        if result:
            return {"provider": "openrouter", "model": "openrouter-model", "text": result}

        # 2. Try HuggingFace
        result = await self.run_huggingface(prompt)
        if result:
            return {"provider": "huggingface", "model": "huggingface-model", "text": result}

        # 3. Fallback
        print("### Using local fallback strategy ###")
        fb = self.fallback.analyze(resume_text, job_text)
        return {
            "provider": "local-fallback",
            "model": "rule-based",
            "json": fb
        }
        
