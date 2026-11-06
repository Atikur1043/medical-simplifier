from typing import List
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from graph.state import MedicalGraphState
from core.config import settings

# Initialize the free Gemini model using our config manager
llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite", 
    temperature=0,
    google_api_key=settings.gemini_api_key
)

class JargonList(BaseModel):
    """Schema to force the LLM to output a clean Python list."""
    terms: List[str] = Field(description="List of complex medical terms found in the text.")

def triage_agent(state: MedicalGraphState):
    """Classifies the report type to route it correctly."""
    masked_text = state["masked_report"]
    
    prompt = ChatPromptTemplate.from_template(
        "Classify this medical report into exactly one word (e.g., blood_test, mri, pathology): {text}"
    )
    chain = prompt | llm
    
    response = chain.invoke({"text": masked_text})
    
    # Clean up the output to ensure it's just the category string
    category = response.content.strip().lower()
    return {"report_category": category}

def jargon_extractor_agent(state: MedicalGraphState):
    """Identifies complex terms that need plain-English definitions."""
    masked_text = state["masked_report"]
    
    prompt = ChatPromptTemplate.from_template(
        "Extract all complex medical jargon from this report that a normal person wouldn't understand: {text}"
    )
    
    # .with_structured_output forces the LLM to return data matching our Pydantic model
    structured_llm = llm.with_structured_output(JargonList)
    chain = prompt | structured_llm
    
    result = chain.invoke({"text": masked_text})
    # Add a safety check to prevent the NoneType crash
    if result is None or not hasattr(result, 'terms'):
        return {"extracted_jargon": []}
    
    return {"extracted_jargon": result.terms}

def simplifier_agent(state: MedicalGraphState):
    """Translates the report using the vetted definitions."""
    masked_text = state["masked_report"]
    definitions = state.get("medical_definitions", {})
    
    # Format the definitions into a readable string for the prompt
    def_string = "\n".join([f"- {k}: {v}" for k, v in definitions.items()])
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a medical translator. Explain the report at a 6th-grade reading level. "
                   "Only use the provided definitions to explain terms. NEVER diagnose, suggest treatments, "
                   "or invent medical advice. If you are unsure, state that the user should consult their doctor."),
        ("user", "Report: {text}\n\nDefinitions to use:\n{defs}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({"text": masked_text, "defs": def_string})
    
    return {"draft_explanation": response.content}