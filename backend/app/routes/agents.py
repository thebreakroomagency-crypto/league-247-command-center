from fastapi import APIRouter
from datetime import datetime
from ..services.mock_data import get_agents, get_agent_logs
from ..models.agents import AgentActivateRequest, AgentLog
from ..core.websocket_manager import ws_manager

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/status")
async def get_agent_status():
    return {"agents": [a.model_dump() for a in get_agents()]}


@router.post("/{agent_id}/activate")
async def activate_agent(agent_id: str, req: AgentActivateRequest):
    log = AgentLog(
        id=f"log-{int(datetime.utcnow().timestamp())}",
        timestamp=datetime.utcnow().isoformat() + "Z",
        agent=agent_id,
        action="AGENT ACTIVATED",
        details=req.message or f"{agent_id} activated via Command Center.",
        type="activation",
    )
    await ws_manager.broadcast("new_log", log.model_dump())
    await ws_manager.broadcast("agent_status", {"id": agent_id, "status": "active"})
    return {"success": True, "log": log.model_dump()}


@router.get("/logs")
async def get_logs(limit: int = 50):
    logs = get_agent_logs()
    return {"logs": [l.model_dump() for l in logs[:limit]]}
