from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

class PIIProcessor:
    def __init__(self):
        # Initialize Presidio engines
        self.analyzer = AnalyzerEngine()
        self.anonymizer = AnonymizerEngine()
        
        # HIPAA identifiers and standard PII we want to block
        self.entities_to_mask = [
            "PERSON", 
            "PHONE_NUMBER", 
            "EMAIL_ADDRESS", 
            "LOCATION", 
            "MEDICAL_LICENSE",
            "ORGANIZATION" # Catches hospital names and clinics
        ]

    def mask_text(self, raw_text: str) -> dict:
        """Scans for PII and replaces it with anonymous tags."""
        
        # 1. Identify sensitive data
        results = self.analyzer.analyze(
            text=raw_text,
            entities=self.entities_to_mask,
            language='en'
        )
        
        # 2. Mask the identified data
        anonymized_result = self.anonymizer.anonymize(
            text=raw_text,
            analyzer_results=results
        )
        
        masked_text = anonymized_result.text
        
        # 3. Create a mapping dictionary to restore the original text on the client-side
        entity_mapping = {}
        
        for item in anonymized_result.items:
            # Presidio replaces text with the entity type (e.g., <PERSON>)
            placeholder = f"<{item.entity_type}>"
            
            # Save the original value mapped to its placeholder
            # Note: In a production system, append unique IDs (e.g., <PERSON_1>) for duplicates
            original_value = raw_text[item.start:item.end]
            entity_mapping[placeholder] = original_value

        return {
            "masked_text": masked_text,
            "mapping": entity_mapping
        }