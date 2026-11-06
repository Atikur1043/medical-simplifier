import uuid
import csv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer

# 1. Initialize local Qdrant client and embedding model
client = QdrantClient(path="./qdrant_data")
model = SentenceTransformer("all-MiniLM-L6-v2")
collection_name = "medical_dictionary_v4"

# 2. Create collection
if not client.collection_exists(collection_name):
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE),
    )

# 3. Read the CSV file
medical_terms = {}
csv_file_path = "medicalTermsStudySet_v1.csv"

# Using utf-8-sig to handle any hidden BOM characters from Excel/Kaggle exports
with open(csv_file_path, mode="r", encoding="utf-8-sig") as file:
    reader = csv.DictReader(file)
    for row in reader:
        term = row.get("term", "").strip()
        # Grabbing the exact column name 'defintion' from your CSV
        definition = row.get("defintion", "").strip() 
        
        if term and definition:
            medical_terms[term] = definition

print(f"Parsed {len(medical_terms)} terms from CSV. Generating vectors...")

# 4. Generate vectors and upload to Qdrant
points = []
for term, definition in medical_terms.items():
    vector = model.encode(term).tolist()
    points.append(
        PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={"term": term, "definition": definition}
        )
    )

client.upsert(collection_name=collection_name, points=points)
print(f"Successfully loaded {len(points)} terms into Qdrant v4.")