from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # API Keys
    gemini_api_key: str
    class Config:
        env_file = ".env"
    # Arize Phoenix Telemetry Config
    phoenix_collector_endpoint: str = "http://localhost:6006/v1/traces"
    phoenix_project_name: str = "medical-simplifier"
    
    # Loads variables from a local .env file
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

# Instantiate once to use across the application
settings = Settings()