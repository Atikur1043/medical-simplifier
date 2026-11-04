from langgraph.graph import StateGraph, END
from graph.state import MedicalGraphState
from graph.agents import triage_agent, jargon_extractor_agent, simplifier_agent
from services.rag import retrieve_definitions_node


# ---------------------------------------------------------
# Routing Logic
# ---------------------------------------------------------
def route_after_triage(state: MedicalGraphState) -> str:
    """Decides where to send the report based on the Triage Agent's classification."""
    category = state.get("report_category", "general")
    
    # If it's a simple general note, skip the heavy RAG pipeline
    if category in ["general", "unknown"]:
        return "skip_to_simplify"
    
    # For clinical reports (blood_test, mri, etc.), send to extraction
    return "process_jargon"


# ---------------------------------------------------------
# Graph Construction
# ---------------------------------------------------------
# 1. Initialize the StateGraph with our schema
workflow = StateGraph(MedicalGraphState)

# 2. Add the nodes (each node is a Python function)
workflow.add_node("triage", triage_agent)
workflow.add_node("extract_jargon", jargon_extractor_agent)
workflow.add_node("retrieve_definitions", retrieve_definitions_node)
workflow.add_node("simplify_report", simplifier_agent)

# 3. Define the edges (the flow)
workflow.set_entry_point("triage")

# Add conditional routing out of the triage node
workflow.add_conditional_edges(
    "triage",
    route_after_triage,
    {
        "process_jargon": "extract_jargon",
        "skip_to_simplify": "simplify_report"
    }
)

# Linear flow for the jargon processing branch
workflow.add_edge("extract_jargon", "retrieve_definitions")
workflow.add_edge("retrieve_definitions", "simplify_report")

# End the graph after simplification
workflow.add_edge("simplify_report", END)

# 4. Compile the application into a runnable function
run_medical_graph = workflow.compile()