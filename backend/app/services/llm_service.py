import os
from app.utils.openrouter_adapter import OpenRouterAdapter
from app.utils.huggingface_adapter import HuggingFaceAdapter
from app.utils.fallback_rulebased_adapter import RuleBasedFallbackAdapter
from app.utils.provider_selector import ProviderSelector

class LLMService:

    _instance = None

    @staticmethod
    def instance():
        if LLMService._instance is None:
            LLMService()
        return LLMService._instance

    def __init__(self):
        if LLMService._instance is not None:
            return

        or_keys_raw = [
            os.getenv("OR_KEY_1"),
            os.getenv("OR_KEY_2"),
            os.getenv("OR_KEY_3")
        ]
        hf_keys_raw = [
            os.getenv("HF_KEY_1"),
            os.getenv("HF_KEY_2"),
            os.getenv("HF_KEY_3")
        ]

        self.or_keys = [k for k in or_keys_raw if k]
        self.hf_keys = [k for k in hf_keys_raw if k]

        self.or_index = {"i": 0}
        self.hf_index = {"i": 0}

        print("\n" + "="*60)
        print("🔧 LLM SERVICE INITIALIZATION")
        print("="*60)
        print(f"✅ OpenRouter Keys: {len(self.or_keys)} loaded")
        for i, key in enumerate(self.or_keys, 1):
            print(f"   OR_KEY_{i}: {key[:15]}...{key[-5:]}")
        print(f"✅ HuggingFace Keys: {len(self.hf_keys)} loaded")
        for i, key in enumerate(self.hf_keys, 1):
            print(f"   HF_KEY_{i}: {key[:15]}...{key[-5:]}")
        print("="*60 + "\n")

        self.fallback = RuleBasedFallbackAdapter()
        LLMService._instance = self

    async def run_openrouter(self, prompt: str):
        if not self.or_keys:
            print("⚠️  No OpenRouter keys configured")
            return None

        print("\n=== Trying OpenRouter Providers ===")
        for _ in range(len(self.or_keys)):
            key = ProviderSelector.next_key(self.or_keys, self.or_index)
            print(f" -> Trying OpenRouter key: {key[:15]}...{key[-5:]}")

            adapter = OpenRouterAdapter(api_key=key)
            out = await adapter.generate(prompt)

            if out:
                print(" ✓ OpenRouter succeeded")
                return out

            print(" ✗ OpenRouter failed, trying next key...")

        print(" !!! All OpenRouter keys failed")
        return None

    async def run_huggingface(self, prompt: str):
        if not self.hf_keys:
            print("⚠️  No HuggingFace keys configured")
            return None

        print("\n=== Trying HuggingFace Providers ===")
        for _ in range(len(self.hf_keys)):
            key = ProviderSelector.next_key(self.hf_keys, self.hf_index)
            print(f" -> Trying HuggingFace key: {key[:15]}...{key[-5:]}")

            adapter = HuggingFaceAdapter(api_key=key)
            out = await adapter.generate(prompt)

            if out:
                print(" ✓ HuggingFace succeeded")
                return out

            print(" ✗ HuggingFace failed, trying next key...")

        print(" !!! All HuggingFace keys failed")
        return None

    async def generate_match(self, prompt: str, resume_text: str, job_text: str):
        result = await self.run_openrouter(prompt)
        if result:
            return {"provider": "openrouter", "model": "openrouter-model", "text": result}

        result = await self.run_huggingface(prompt)
        if result:
            return {"provider": "huggingface", "model": "huggingface-model", "text": result}

        print("### Using local fallback strategy ###")
        fb = self.fallback.analyze(resume_text, job_text)
        return {
            "provider": "local-fallback",
            "model": "rule-based",
            "json": fb
        }
