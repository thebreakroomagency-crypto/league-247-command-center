from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

AgentStatus = Literal["active", "idle", "processing", "offline", "briefing"]

AgentId = Literal[
    "BIG_HOMIE", "PLUG", "HUNTER", "CLOSER",
    "SAUCE", "CUTTY", "HUSTLE", "LOOKOUT",
    "GEAR", "OG", "BAGMAN", "RILEY"
]


class Agent(BaseModel):
    id: str
    name: str
    role: str
    status: AgentStatus
    last_active: str
    tasks_completed: int
    tasks_total: int
    current_task: Optional[str] = None
    color: str
    glow_color: str


class AgentActivateRequest(BaseModel):
    message: Optional[str] = None


class AgentLog(BaseModel):
    id: str
    timestamp: str
    agent: str
    action: str
    details: str
    type: Literal["activation", "task_complete", "brief", "alert", "system", "ghl", "voice", "error"]
