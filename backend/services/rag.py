from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from graph.state import MedicalGraphState

# 1. Initialize the exact same local model used in ingest.py
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 2. Connect to local Qdrant folder
client = QdrantClient(path="./qdrant_data")
COLLECTION_NAME = "medical_dictionary_v4"

# 3. Connect to the existing vector store
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
            # FALLBACK: If exact match fails, split multi-word terms and search individually
            if " " in term:
                sub_terms = term.split()
                fallback_results = []
                
                for st in sub_terms:
                    # Ignore small connecting words
                    if len(st) <= 2 or st.lower() in ["and", "or", "of", "the", "in", "to"]:
                        continue
                        
                    sub_docs = retriever.invoke(f"Definition of {st}")
                    if sub_docs:
                        # Append the word and its definition
                        fallback_results.append(f"({st}: {sub_docs[0].page_content})")
                
                if fallback_results:
                    definitions[term] = " Combined definitions: " + " | ".join(fallback_results)
                else:
                    definitions[term] = "No vetted definition found in the system."
            else:
                definitions[term] = "No vetted definition found in the system."
            
    return {"medical_definitions": definitions}