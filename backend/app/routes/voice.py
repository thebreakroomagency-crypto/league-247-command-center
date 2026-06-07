"""Voice routes: Whisper STT + ElevenLabs TTS."""
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ..core.config import settings

router = APIRouter(prefix="/voice", tags=["voice"])


class SpeakRequest(BaseModel):
    text: str


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """Transcribe audio via OpenAI Whisper API."""
    if not settings.OPENAI_API_KEY:
        return {"transcript": "[Whisper STT — OPENAI_API_KEY not set]"}

    audio_data = await file.read()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
            files={"file": (file.filename or "audio.webm", audio_data, "audio/webm")},
            data={"model": "whisper-1"},
            timeout=30.0,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Whisper error")

        return {"transcript": response.json().get("text", "")}


@router.post("/speak")
async def speak(req: SpeakRequest):
    """Convert text to speech via ElevenLabs."""
    if not settings.ELEVENLABS_API_KEY or not settings.ELEVENLABS_VOICE_ID:
        raise HTTPException(status_code=503, detail="ElevenLabs not configured")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{settings.ELEVENLABS_VOICE_ID}",
            headers={
                "xi-api-key": settings.ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "text": req.text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
            },
            timeout=30.0,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="ElevenLabs error")

        return StreamingResponse(
            iter([response.content]),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=bighomie.mp3"},
        )
