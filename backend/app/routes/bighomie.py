from fastapi import APIRouter
from pydantic import BaseModel
from ..services.claude_service import run_big_homie, generate_brief_with_claude
from ..services.supabase_service import save_daily_brief, log_agent_action
from ..core.websocket_manager import ws_manager
from datetime import datetime

router = APIRouter(prefix="/bighomie", tags=["bighomie"])


class BigHomieRunRequest(BaseModel):
    message: str
    context: dict | None = None


@router.post("/run")
async def run(req: BigHomieRunRequest):
    response = await run_big_homie(req.message, req.context)

    log_agent_action('BIG_HOMIE', 'COMMAND RECEIVED', req.message[:120], 'voice')
    await ws_manager.broadcast("new_log", {
        "id": f"log-{int(datetime.utcnow().timestamp())}",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "agent": "BIG_HOMIE",
        "action": "COMMAND RECEIVED",
        "details": req.message[:120],
        "type": "voice",
    })

    return {"response": response, "agent": "BIG_HOMIE"}


@router.post("/brief")
async def generate_brief(req: BigHomieRunRequest):
    brief = await generate_brief_with_claude(context=req.context)

    # Persist brief to Supabase
    save_daily_brief(brief)
    log_agent_action('BIG_HOMIE', 'BRIEF GENERATED', f"{len(brief.get('priorities', []))} priorities", 'brief')

    await ws_manager.broadcast("brief_update", brief)
    return brief
