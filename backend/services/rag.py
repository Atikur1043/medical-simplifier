from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from graph.state import MedicalGraphState
from core.config import settings

# Initialize the Google embedding model
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-2",
    google_api_key=settings.gemini_api_key
)

# Connect to Qdrant (using in-memory for testing)
client = QdrantClient(":memory:")
COLLECTION_NAME = "medical_dictionary"

# 1. Delete the existing collection if it exists to clear the old 768-dimension setup
if client.collection_exists(COLLECTION_NAME):
    client.delete_collection(COLLECTION_NAME)

# 2. Recreate it with the correct 3072 dimensions
client.create_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(size=3072, distance=Distance.COSINE),
)

# 3. Initialize the vector store (removed the invalid force_recreate argument)
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