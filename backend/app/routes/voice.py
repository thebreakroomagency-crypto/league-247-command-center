"""Voice routes: Whisper STT + ElevenLabs TTS."""
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from ..core.config import settings

router = APIRouter(prefix="/voice", tags=["voice"])

# Each agent has a distinct ElevenLabs voice matched to their personality
AGENT_VOICES: dict[str, str] = {
    "BIG_HOMIE": "wBXNqKUATyqu0RtYt25i",  # Adam — commanding, authoritative
    "PLUG":      "cjVigY5qzO86Huf0OWal",  # Eric — smooth, trustworthy
    "HUNTER":    "TX3LPaxmHKxFdv7VOQHJ",  # Liam — energetic, driven
    "CLOSER":    "SOYHLrjzK2X1ezoPC6cr",  # Harry — fierce, intense
    "SAUCE":     "iP95p4xoKVk53GoZ742B",  # Chris — charming, creative
    "CUTTY":     "CwhRBWXzGAHq8TQ4Fs17",  # Roger — laid-back, casual
    "HUSTLE":    "IKne3meq5aSn9XLyUdCD",  # Charlie — deep, confident, energetic
    "LOOKOUT":   "SAz9YHcvj6GT2YYXdXww",  # River — relaxed, informative
    "GEAR":      "onwK4e9ZLuTAKqWW03F9",  # Daniel — steady broadcaster
    "OG":        "pqHfZKP75CvOlQylNhV4",  # Bill — wise, mature, balanced
    "BAGMAN":    "nPczCjzI2devNBz1zQrb",  # Brian — deep, resonant, comforting
    "RILEY":     "cgSgspJ2msm6clMCkdW9",  # Jessica — playful, bright, warm
}


class SpeakRequest(BaseModel):
    text: str
    agent_id: Optional[str] = None


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


@router.get("/voices")
async def list_agent_voices():
    """Return the voice ID assigned to each agent."""
    return {"voices": AGENT_VOICES}


@router.post("/speak")
async def speak(req: SpeakRequest):
    """Convert text to speech via ElevenLabs, using the agent's assigned voice."""
    if not settings.ELEVENLABS_API_KEY:
        raise HTTPException(status_code=503, detail="ElevenLabs not configured")

    voice_id = AGENT_VOICES.get(req.agent_id or "BIG_HOMIE", settings.ELEVENLABS_VOICE_ID)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
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

        agent = req.agent_id or "BIG_HOMIE"
        return StreamingResponse(
            iter([response.content]),
            media_type="audio/mpeg",
            headers={"Content-Disposition": f"inline; filename={agent.lower()}.mp3"},
        )
