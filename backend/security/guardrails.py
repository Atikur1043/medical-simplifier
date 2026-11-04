import os
from nemoguardrails import LLMRails, RailsConfig
from nemoguardrails.llm.providers import register_llm_provider
from langchain_google_genai import ChatGoogleGenerativeAI
from core.config import settings

# 1. Provide the API key globally
os.environ["GOOGLE_API_KEY"] = settings.gemini_api_key

# 2. Bridge class for NeMo compatibility
class GuardrailsGemini(ChatGoogleGenerativeAI):
    def _call(self, prompt: str, **kwargs) -> str:
        return self.invoke(prompt, **kwargs).content

    async def _acall(self, prompt: str, **kwargs) -> str:
        response = await self.ainvoke(prompt, **kwargs)
        return response.content

# 3. Register our patched wrapper
register_llm_provider("google_genai", GuardrailsGemini)

yaml_content = """
models:
  - type: main
    engine: google_genai
    model: gemini-2.5-flash
"""

# Colang configuration with a SAFE path added
COLANG_CONFIG = """
define user provide medical report
  "Patient Sk Atikur underwent a lipid panel test."
  "Results show serum cholesterol is 240 mg/dL."
  "The patient complains of severe angina."
  "Recommendation: Initiate dual antiplatelet therapy."
  "Here are my lab results."

define bot allow processing
  "Report accepted."

define flow
  user provide medical report
  bot allow processing

define user ask for diagnosis
  "Can you diagnose me?"
  "What disease do I have?"
  "Does this mean I have cancer?"
  "What medication should I take?"
  "Am I going to die?"
  "Do I have a brain tumor?"

define bot refuse diagnosis
  "I am a medical translator, not a doctor. I cannot provide diagnoses, analyze symptoms, or suggest treatments based on this report. Please consult your healthcare provider immediately."

define flow
  user ask for diagnosis
  bot refuse diagnosis
"""

class SecurityGuard:
    def __init__(self):
        config = RailsConfig.from_content(
            yaml_content=yaml_content,
            colang_content=COLANG_CONFIG
        )
        self.rails = LLMRails(config)

    async def verify_query(self, user_input: str) -> dict:
        response = await self.rails.generate_async(messages=[{
            "role": "user",
            "content": user_input
        }])
        
        is_blocked = "I am a medical translator, not a doctor." in response['content']
        
        return {
            "is_safe": not is_blocked,
            "content": response['content']
        }