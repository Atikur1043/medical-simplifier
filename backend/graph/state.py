from typing import TypedDict, List, Dict, Optional

class MedicalGraphState(TypedDict):
    masked_report: str               # The raw text stripped of PII
    report_category: Optional[str]   # e.g., "blood_test", "mri", "general"
    extracted_jargon: List[str]      # Difficult terms flagged by the LLM
    medical_definitions: Dict[str, str] # Vetted definitions from our RAG database
    draft_explanation: Optional[str] # The simplified output before final safety checks