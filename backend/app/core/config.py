from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # Anthropic
    ANTHROPIC_API_KEY: str = ""

    # ElevenLabs
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = ""

    # Google
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_SHEETS_SPREADSHEET_ID: str = ""

    # GoHighLevel
    GHL_API_KEY: str = ""
    GHL_LOCATION_ID: str = ""
    GHL_BASE_URL: str = "https://services.leadconnectorhq.com"

    # Database
    DATABASE_URL: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # OpenAI (Whisper)
    OPENAI_API_KEY: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
