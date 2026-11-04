from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import our custom modules
from core.telemetry import setup_telemetry
from security.pii_masking import PIIProcessor
from security.guardrails import SecurityGuard
from graph.workflow import run_medical_graph

# 1. Initialize Telemetry on server startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_telemetry()
    yield
    # Cleanup logic (if any) goes here

app = FastAPI(title="Medical Report Simplifier API", lifespan=lifespan)

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize security engines
pii_processor = PIIProcessor()
guardrails = SecurityGuard()

class ReportRequest(BaseModel):
    raw_report_text: str

@app.post("/api/v1/process-report")
async def process_report(request: ReportRequest):
    if not request.raw_report_text:
        raise HTTPException(status_code=400, detail="Report text cannot be empty.")
    
    # Step 1: NeMo Guardrails Check (Prevent prompt injections / diagnosing requests)
    # Note: We check this BEFORE masking to catch malicious instructions quickly
    security_check = await guardrails.verify_query(request.raw_report_text)
    if not security_check["is_safe"]:
        return {
            "status": "blocked",
            "simplified_report": security_check["content"],
            "pii_mapping": {}
        }

    # Step 2: Presidio PII Masking (Strip patient data)
    masking_result = pii_processor.mask_text(request.raw_report_text)
    
    # Step 3: Run the LangGraph State Machine
    initial_state = {"masked_report": masking_result["masked_text"]}
    
    # Execute the graph
    final_state = run_medical_graph.invoke(initial_state)
    final_output = final_state.get("draft_explanation", "Error generating explanation.")
    
    # Step 4: Return the AI output and the mapping dictionary
    # The React frontend will use the mapping to replace <PERSON> with the real name.
    return {
        "status": "success",
        "simplified_report": final_output,
        "pii_mapping": masking_result["mapping"]
    }

# To run the server:
# uvicorn main:app --reload