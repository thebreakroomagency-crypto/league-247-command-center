from pydantic import BaseModel
from typing import List, Dict, Any


class ClientAttentionItem(BaseModel):
    client: str
    issue: str
    action: str


class SalesOpportunity(BaseModel):
    lead: str
    value: float
    next_step: str


class TeamAssignment(BaseModel):
    agent: str
    task: str


class DailyBrief(BaseModel):
    generated_at: str
    greeting: str
    priorities: List[str]
    client_attention: List[ClientAttentionItem]
    sales_opportunities: List[SalesOpportunity]
    riley_tasks: List[str]
    production_queue: List[str]
    ghl_follow_ups: List[str]
    team_assignments: List[TeamAssignment]
    revenue_opportunities: List[str]
    rob_should_do_first: List[str]
    end_of_day_checklist: List[str]


class BriefGenerateRequest(BaseModel):
    prompt: str | None = None
    context: Dict[str, Any] | None = None


class CommandSummary(BaseModel):
    timestamp: str
    active_agents: int
    total_agents: int
    tasks_in_progress: int
    tasks_completed_today: int
    leads_in_pipeline: int
    new_leads_today: int
    current_mrr: float
    riley_posts_this_week: int
    system_status: str
