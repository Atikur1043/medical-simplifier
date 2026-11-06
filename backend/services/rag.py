from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from graph.state import MedicalGraphState

# 1. Initialize the exact same local model used in ingest.py
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 2. Connect to local Qdrant folder
client = QdrantClient(path="./qdrant_data")
COLLECTION_NAME = "medical_dictionary_v4"

# 3. Connect to the existing vector store (DO NOT delete or recreate it here)
vector_store = QdrantVectorStore(
    client=client,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
)

# Set up the retriever to fetch the single most relevant chunk (k=1)
retriever = vector_store.as_retriever(search_kwargs={"k": 1})

def retrieve_definitions_node(state: MedicalGraphState):
    """Fetches vetted definitions for each jargon term from the vector database."""
    jargon_list = state.get("extracted_jargon", [])
    definitions = {}
    
    for term in jargon_list:
        docs = retriever.invoke(f"Definition of {term}")
        
        if docs:
            definitions[term] = docs[0].page_content
        else:
            definitions[term] = "No vetted definition found in the system."
            
    return {"medical_definitions": definitions}