"""Supabase data endpoints — League 247 Command Center."""
from fastapi import APIRouter
from ..services.supabase_service import get_recent_logs, get_last_brief

router = APIRouter(prefix="/db", tags=["database"])


@router.get("/logs")
async def db_logs(limit: int = 50):
    logs = get_recent_logs(limit=limit)
    return {"logs": logs, "count": len(logs), "source": "supabase"}


@router.get("/brief/last")
async def last_brief():
    brief = get_last_brief()
    if not brief:
        return {"brief": None, "message": "No briefs saved yet"}
    return {"brief": brief, "source": "supabase"}
