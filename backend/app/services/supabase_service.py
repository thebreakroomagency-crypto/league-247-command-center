"""Supabase persistence service — League 247 Command Center."""
from typing import Any
from supabase import create_client, Client

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        from ..core.config import settings
        key = settings.SUPABASE_SERVICE_KEY or settings.SUPABASE_ANON_KEY
        _client = create_client(settings.SUPABASE_URL, key)
    return _client


# ── Agent Logs ────────────────────────────────────────────────

def log_agent_action(
    agent: str,
    action: str,
    details: str = '',
    type: str = 'system',
    session_id: str | None = None,
) -> dict[str, Any]:
    try:
        row = {
            'agent': agent,
            'action': action,
            'details': details,
            'type': type,
        }
        if session_id:
            row['session_id'] = session_id
        result = get_client().table('agent_logs').insert(row).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f'[Supabase] log_agent_action error: {e}')
        return {}


def get_recent_logs(limit: int = 50) -> list[dict[str, Any]]:
    try:
        result = (
            get_client()
            .table('agent_logs')
            .select('*')
            .order('created_at', desc=True)
            .limit(limit)
            .execute()
        )
        return result.data or []
    except Exception as e:
        print(f'[Supabase] get_recent_logs error: {e}')
        return []


# ── Daily Briefs ──────────────────────────────────────────────

def save_daily_brief(brief: dict[str, Any]) -> dict[str, Any]:
    try:
        row = {
            'greeting': brief.get('greeting', ''),
            'priorities': brief.get('priorities', []),
            'client_attention': brief.get('client_attention', []),
            'sales_opportunities': brief.get('sales_opportunities', []),
            'riley_tasks': brief.get('riley_tasks', []),
            'production_queue': brief.get('production_queue', []),
            'ghl_follow_ups': brief.get('ghl_follow_ups', []),
            'team_assignments': brief.get('team_assignments', []),
            'revenue_opportunities': brief.get('revenue_opportunities', []),
            'rob_should_do_first': brief.get('rob_should_do_first', []),
            'end_of_day_checklist': brief.get('end_of_day_checklist', []),
            'raw_response': brief.get('raw_response', ''),
        }
        result = get_client().table('daily_briefs').insert(row).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f'[Supabase] save_daily_brief error: {e}')
        return {}


def get_last_brief() -> dict[str, Any] | None:
    try:
        result = (
            get_client()
            .table('daily_briefs')
            .select('*')
            .order('created_at', desc=True)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception as e:
        print(f'[Supabase] get_last_brief error: {e}')
        return None


# ── Voice Sessions ────────────────────────────────────────────

def save_voice_session(
    transcript: str,
    response: str,
    agent: str = 'BIG_HOMIE',
    duration_ms: int = 0,
) -> dict[str, Any]:
    try:
        row = {
            'transcript': transcript,
            'response': response,
            'agent': agent,
            'duration_ms': duration_ms,
        }
        result = get_client().table('voice_sessions').insert(row).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f'[Supabase] save_voice_session error: {e}')
        return {}


# ── Revenue Snapshots ─────────────────────────────────────────

def save_revenue_snapshot(revenue: dict[str, Any]) -> dict[str, Any]:
    try:
        row = {
            'current_mrr': revenue.get('currentMRR', 0),
            'mrr_target': revenue.get('mrrTarget', 20000),
            'total_clients': revenue.get('totalClients', 0),
            'pipeline_value': revenue.get('pipeline', 0),
            'source': revenue.get('source', 'sheets'),
            'raw_data': revenue,
        }
        result = get_client().table('revenue_snapshots').insert(row).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f'[Supabase] save_revenue_snapshot error: {e}')
        return {}
