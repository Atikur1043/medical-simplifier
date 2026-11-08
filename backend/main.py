from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import io
import pymupdf  # PyMuPDF for PDFs
from PIL import Image
import google.generativeai as genai

# Import our custom modules
from core.config import settings
from core.telemetry import setup_telemetry
from security.pii_masking import PIIProcessor
from security.guardrails import SecurityGuard
from graph.workflow import run_medical_graph

# Configure Gemini for the OCR endpoint
genai.configure(api_key=settings.gemini_api_key)

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
    
    # Step 1: NeMo Guardrails Check
    security_check = await guardrails.verify_query(request.raw_report_text)
    if not security_check["is_safe"]:
        return {
            "status": "blocked",
            "simplified_report": security_check["content"],
            "pii_mapping": {}
        }

    # Step 2: Presidio PII Masking
    masking_result = pii_processor.mask_text(request.raw_report_text)
    
    # Step 3: Run the LangGraph State Machine
    initial_state = {"masked_report": masking_result["masked_text"]}
    final_state = run_medical_graph.invoke(initial_state)
    final_output = final_state.get("draft_explanation", "Error generating explanation.")
    
    # Step 4: Return the AI output and the mapping dictionary
    return {
        "status": "success",
        "simplified_report": final_output,
        "pii_mapping": masking_result["mapping"]
    }

@app.post("/api/v1/ocr-report")
async def extract_text_from_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        extracted_text = ""
        
        # 1. If it's an Image, use Gemini's native Vision OCR
        if file.content_type.startswith("image/"):
            image = Image.open(io.BytesIO(contents))
            model = genai.GenerativeModel("gemini-3.5-flash-lite")
            response = model.generate_content([
                "Extract all the text from this medical report exactly as written. Return ONLY the text, with no conversational filler.", 
                image
            ])
            extracted_text = response.text
            
        # 2. If it's a PDF, use PyMuPDF to extract the digital text
        elif file.content_type == "application/pdf":
            doc = pymupdf.open(stream=contents, filetype="pdf")
            for page in doc:
                extracted_text += page.get_text()
                
        else:
            return {"error": "Unsupported file format. Please upload an image or PDF."}
            
        return {"extracted_text": extracted_text.strip()}
    
    except Exception as e:
        return {"error": str(e)}