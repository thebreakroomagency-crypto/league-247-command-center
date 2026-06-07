"""GoHighLevel / LeadConnector API service."""
import httpx
from typing import Any
from ..core.config import settings

GHL_BASE = "https://services.leadconnectorhq.com"
GHL_VERSION = "2021-07-28"

# ── Stage ID → frontend LeadStage mapping ────────────────────
STAGE_MAP: dict[str, str] = {
    # AI Voice Clients
    "c472bb6b-6c75-419d-bd07-a8eb25f6b498": "new",          # New Application
    "59ac3b63-38ee-4e22-80f0-82d425dbf7ff": "contacted",    # Discovery Call Scheduled
    "f93cade2-4437-4bd5-a760-a7892acaf742": "proposal",     # Proposal Sent
    "fe671c81-ea44-455f-8bc3-cd79132ede07": "won",          # Contract Signed
    "7ae01ac2-7465-4f9f-ba98-71ab71f02f4e": "won",          # Sub-Account Created
    "f90829d3-f994-4079-89c2-19d808b30c0c": "won",          # Phone Ported
    "f822f23c-2551-4bfe-aca4-6aaac713926e": "won",          # Agent Built
    "75e70e09-5b2a-473c-8ce4-47b1d705df9d": "won",          # KB Trained
    "deb4dc2c-256c-4575-aecb-0c8349ac1609": "won",          # Testing
    "df922340-cf36-41de-ae37-fa93aa1623a2": "won",          # Client Training
    "f69b91a8-3c2c-4c43-85c7-b9839f3aec30": "won",          # Live / Optimized
    "a8ff778f-924f-466a-a9a0-f2599522e2a6": "won",          # Monthly Review
    # Proposal Pipeline
    "54abff9a-e1b6-4f88-ab6b-b57f410a1f36": "new",          # New Inquiry
    "4e08ca47-499e-4f7c-b571-187fcfac39f9": "proposal",     # Proposal Sent
    "2d9cd290-cec4-4750-ad15-7a338bb75711": "proposal",     # Proposal Viewed
    "0802ba6e-3d91-47c4-95a8-ab06158a1efa": "contacted",    # Follow-Up
    "2c1c5e94-c563-40d7-8478-996d94744e86": "negotiation",  # Negotiating
    "05159573-a39b-499a-bb91-3dc5b1314cd8": "won",          # Signed — Won
    "d51cdddc-e679-457a-b7a4-c0934f07dcc0": "lost",         # Lost — Expired
    # Referral Program
    "4051c7bb-d9dd-4b68-95c6-337f54805fe3": "new",          # Referral Submitted
    "cb9e4e97-4744-4f05-8a9f-a4f2d540a00b": "contacted",    # Contact Attempted
    "c4c79504-be43-4665-bd6a-5177ae8c165a": "contacted",    # Intro Call Booked
    "09465a83-c880-42ae-b91b-df703c5d9380": "proposal",     # Proposal Sent
    "6ef31bea-fe41-438d-9366-b86dc9b78185": "negotiation",  # Decision Pending
    "070010b3-ad67-4aa1-b0ed-d1366140a060": "won",          # Closed Won
    "1be4ce76-62aa-4d43-85ba-7d1c347c62f4": "lost",         # Closed Lost
    "63e9c05b-52b4-457d-8b81-2caee4b4bf6a": "won",          # Reward Processing
    "548b7967-33bc-4e6d-9868-cb3363f7649e": "won",          # Reward Paid
    # High-Ticket Video
    "ed731cba-5352-4484-a01c-f62d7da694d8": "new",          # Lead Captured
    "54f548ad-e6ea-4a44-8681-618e089c62b7": "contacted",    # Discovery Call Booked
    "a77cac1d-070c-4b3b-a475-c558d4a6e2d1": "proposal",     # Proposal Sent
    "df63c04e-bbf9-40be-a450-0ce8b7418284": "contacted",    # Follow-Up
    "3695306b-01a4-4d0a-991a-6f0d00423495": "won",          # Closed Won
    # Website Launch Engine
    "89a3fe7e-aaa4-4e33-bad6-351e7291b69d": "new",          # New Lead
    "2da62416-5c63-4b5f-a105-fee7bda51634": "contacted",    # Qualification Sent
    "920a689a-6a79-4e55-9715-61cc59e842f3": "qualified",    # Qualified Lead
    "06b585b0-a2d3-4e65-8480-40a05db213f7": "proposal",     # Payment Sent
    "6d2ca4a5-72a6-4ddd-9515-317d630ce472": "won",          # Paid / Onboarding
    "df2c482f-e50c-462e-a847-17da4712ddcc": "won",          # Website In Production
    "c43c3e9c-763f-4603-a199-49869e8cdb1e": "won",          # Review Sent
    "916e2320-e710-4df2-bc45-3264463a069e": "won",          # Website Live
    "81a57609-2240-4afc-af93-de395a332c0c": "won",          # Continuity Offer Sent
    "c3d06870-2ab0-4f62-b1b9-b6b5d0e845b5": "won",          # Active Monthly Client
    "af08b3fc-da21-4c54-beed-db33c456b8dd": "contacted",    # Client Reactivation
}

PIPELINE_NAMES: dict[str, str] = {
    "sJgtTzFIOiXRsbK70oQM": "AI Voice Clients",
    "R3abXHWG2HIXvTijvdTj": "BR247 Referral",
    "H0LEUcSgbNTiRq1WoNax": "Proposal Pipeline",
    "nKLJHq7Oh2cN2M1yMWwf": "High-Ticket Video",
    "wKVt25VyXt7xICjr9ZA4": "Website Launch Engine",
}

STAGE_NAMES: dict[str, str] = {
    "c472bb6b-6c75-419d-bd07-a8eb25f6b498": "New Application",
    "59ac3b63-38ee-4e22-80f0-82d425dbf7ff": "Discovery Call Scheduled",
    "f93cade2-4437-4bd5-a760-a7892acaf742": "Proposal Sent",
    "fe671c81-ea44-455f-8bc3-cd79132ede07": "Contract Signed",
    "54abff9a-e1b6-4f88-ab6b-b57f410a1f36": "New Inquiry",
    "4e08ca47-499e-4f7c-b571-187fcfac39f9": "Proposal Sent",
    "2c1c5e94-c563-40d7-8478-996d94744e86": "Negotiating",
    "05159573-a39b-499a-bb91-3dc5b1314cd8": "Signed — Won",
    "d51cdddc-e679-457a-b7a4-c0934f07dcc0": "Lost — Expired",
    "ed731cba-5352-4484-a01c-f62d7da694d8": "Lead Captured",
    "89a3fe7e-aaa4-4e33-bad6-351e7291b69d": "New Lead",
    "920a689a-6a79-4e55-9715-61cc59e842f3": "Qualified Lead",
    "6d2ca4a5-72a6-4ddd-9515-317d630ce472": "Paid / Onboarding",
    "c3d06870-2ab0-4f62-b1b9-b6b5d0e845b5": "Active Monthly Client",
}


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {settings.GHL_API_KEY}",
        "Version": GHL_VERSION,
        "Content-Type": "application/json",
    }


def _map_opportunity(opp: dict[str, Any]) -> dict[str, Any]:
    stage_id = opp.get("pipelineStageId", "")
    contact = opp.get("contact") or {}
    pipeline_id = opp.get("pipelineId", "")
    return {
        "id": opp.get("id", ""),
        "name": (opp.get("name") or "").strip(" —") or contact.get("name", "Unknown"),
        "company": contact.get("companyName") or "",
        "source": opp.get("source") or "GHL",
        "stage": STAGE_MAP.get(stage_id, "new"),
        "stageName": STAGE_NAMES.get(stage_id, "Unknown Stage"),
        "pipeline": PIPELINE_NAMES.get(pipeline_id, pipeline_id),
        "estimatedValue": float(opp.get("monetaryValue") or 0),
        "assignedAgent": "HUNTER",
        "lastActivity": opp.get("lastActivityAt") or opp.get("createdAt") or "",
        "nextStep": _suggest_next_step(STAGE_MAP.get(stage_id, "new"), contact.get("name", "")),
        "contact": {
            "name": contact.get("name", ""),
            "email": contact.get("email", ""),
            "phone": contact.get("phone", ""),
        },
        "ghlId": opp.get("id"),
        "status": opp.get("status", "open"),
    }


def _suggest_next_step(stage: str, name: str) -> str:
    suggestions = {
        "new":         f"Reach out to {name} — fresh lead",
        "contacted":   f"Follow up with {name} — schedule next touch",
        "qualified":   f"Book discovery call with {name}",
        "proposal":    f"Follow up on proposal with {name}",
        "negotiation": f"Close {name} — address objections",
        "won":         f"Onboard {name} — deliver value fast",
        "lost":        f"Re-engage {name} or mark closed",
    }
    return suggestions.get(stage, f"Action required: {name}")


async def get_opportunities() -> list[dict]:
    """Fetch all open opportunities across all pipelines."""
    if not settings.GHL_API_KEY:
        return []

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{GHL_BASE}/opportunities/search",
            params={"location_id": settings.GHL_LOCATION_ID, "limit": 100},
            headers=_headers(),
        )
        resp.raise_for_status()
        data = resp.json()
        opps = data.get("opportunities", [])
        return [_map_opportunity(o) for o in opps]


async def get_pipelines() -> list[dict]:
    """Fetch all pipeline definitions with stages."""
    if not settings.GHL_API_KEY:
        return []

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{GHL_BASE}/opportunities/pipelines",
            params={"locationId": settings.GHL_LOCATION_ID},
            headers=_headers(),
        )
        resp.raise_for_status()
        return resp.json().get("pipelines", [])


async def get_contacts(limit: int = 50) -> list[dict]:
    """Fetch contacts from GHL."""
    if not settings.GHL_API_KEY:
        return []

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{GHL_BASE}/contacts/",
            params={"locationId": settings.GHL_LOCATION_ID, "limit": limit},
            headers=_headers(),
        )
        resp.raise_for_status()
        data = resp.json()
        contacts = data.get("contacts", [])
        return [
            {
                "id": c.get("id"),
                "name": f"{c.get('firstName','')} {c.get('lastName','')}".strip(),
                "email": c.get("email", ""),
                "phone": c.get("phone", ""),
                "tags": c.get("tags", []),
                "source": c.get("source", ""),
                "createdAt": c.get("dateAdded", ""),
            }
            for c in contacts
        ]


async def get_pipeline_summary() -> dict:
    """Aggregate pipeline metrics for the dashboard."""
    opps = await get_opportunities()
    open_opps = [o for o in opps if o["status"] == "open" and o["stage"] != "lost"]
    total_value = sum(o["estimatedValue"] for o in open_opps)
    by_stage: dict[str, int] = {}
    for o in opps:
        by_stage[o["stage"]] = by_stage.get(o["stage"], 0) + 1

    return {
        "totalOpportunities": len(opps),
        "openOpportunities": len(open_opps),
        "totalPipelineValue": total_value,
        "byStage": by_stage,
        "opportunities": opps,
    }
