from fastapi import APIRouter, HTTPException
from ..services.mock_data import get_command_summary, get_agent_logs
from ..services.ghl_service import get_opportunities, get_pipeline_summary
from ..services.sheets_service import (
    get_clients, get_tasks, get_revenue, get_riley_content, get_production_queue
)
from ..services.supabase_service import save_revenue_snapshot, log_agent_action

router = APIRouter(prefix="/command-center", tags=["command-center"])


@router.get("/summary")
async def summary():
    base = get_command_summary().model_dump()
    try:
        pipeline = await get_pipeline_summary()
        base["leadsInPipeline"] = pipeline["openOpportunities"]
        base["pipelineValue"] = pipeline["totalPipelineValue"]
    except Exception:
        pass
    try:
        rev = get_revenue()
        base["currentMRR"] = rev["currentMRR"]
        base["totalClients"] = rev["totalClients"]
    except Exception:
        pass
    return base


@router.get("/revenue")
async def revenue():
    try:
        data = get_revenue()
        save_revenue_snapshot(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Sheets error: {e}")


@router.get("/clients")
async def clients():
    try:
        data = get_clients()
        return {"clients": data, "source": "sheets", "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Sheets error: {e}")


@router.get("/tasks")
async def tasks():
    try:
        sheets_tasks = get_tasks()
        prod = get_production_queue()
        all_tasks = sheets_tasks + prod
        return {"tasks": all_tasks, "source": "sheets", "count": len(all_tasks)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Sheets error: {e}")


@router.get("/production")
async def production():
    try:
        data = get_production_queue()
        return {"tasks": data, "source": "sheets", "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Sheets error: {e}")


@router.get("/riley")
async def riley():
    try:
        data = get_riley_content()
        return {"content": data, "source": "sheets", "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Sheets error: {e}")


@router.get("/leads")
async def leads():
    try:
        opps = await get_opportunities()
        return {"leads": opps, "source": "ghl", "count": len(opps)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"GHL error: {e}")


@router.get("/pipeline")
async def pipeline():
    try:
        return await get_pipeline_summary()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"GHL error: {e}")


@router.get("/logs")
async def logs(limit: int = 50):
    return {"logs": [l.model_dump() for l in get_agent_logs()[:limit]]}
