from fastapi import APIRouter
from ..services.mock_data import get_daily_brief
from ..services.claude_service import generate_brief_with_claude, run_big_homie
from ..models.brief import BriefGenerateRequest
from ..core.websocket_manager import ws_manager
from pydantic import BaseModel

router = APIRouter(prefix="/brief", tags=["brief"])


@router.get("/daily")
async def daily_brief():
    brief = get_daily_brief()
    return brief.model_dump()


@router.post("/generate")
async def generate_brief(req: BriefGenerateRequest):
    brief_data = await generate_brief_with_claude(context=req.context)
    await ws_manager.broadcast("brief_update", brief_data)
    return brief_data


class BigHomieRequest(BaseModel):
    message: str
    context: dict | None = None


@router.post("/bighomie")
async def bighomie_command(req: BigHomieRequest):
    response = await run_big_homie(req.message, req.context)
    return {"response": response, "agent": "BIG_HOMIE"}
