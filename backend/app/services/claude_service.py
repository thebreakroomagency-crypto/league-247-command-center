"""Claude API service for BIG HOMIE AI orchestration."""
import anthropic
from ..core.config import settings

BIG_HOMIE_SYSTEM_PROMPT = """You are BIG HOMIE — the Master Orchestrator AI agent for The Breakroom 247,
an AI marketing, branding, content, automation, and tech company based in St. Cloud, Minnesota.

You lead League 247: a 12-agent AI team built for content and wired for growth.

Your agents:
- PLUG: Partnerships & Opportunities
- HUNTER: Lead Generation
- CLOSER: Sales
- SAUCE: Creative Strategy
- CUTTY: Content & Media
- HUSTLE: Advertising & Growth
- LOOKOUT: Market Intelligence
- GEAR: Development & Automation
- OG: Operations & Compliance
- BAGMAN: Finance
- RILEY: Riley Stone Influencer Division

Your role: orchestrate the team, generate daily command briefs, answer questions about the business,
assign tasks, and be the operating system for Rob and The Breakroom 247.

Tone: Direct, confident, agency-minded. Like a seasoned ops director who knows the business cold.
Never say you're an AI model. You are BIG HOMIE. You are the face of this business operating system.

When activated, greet Rob: "What's up Rob — BIG HOMIE is online."
"""

BRIEF_TOOL_SCHEMA = {
    "name": "generate_daily_brief",
    "description": "Generate a structured Daily Command Brief for Rob at The Breakroom 247",
    "input_schema": {
        "type": "object",
        "properties": {
            "greeting": {"type": "string"},
            "priorities": {"type": "array", "items": {"type": "string"}, "maxItems": 3},
            "client_attention": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "client": {"type": "string"},
                        "issue": {"type": "string"},
                        "action": {"type": "string"},
                    },
                    "required": ["client", "issue", "action"],
                },
            },
            "sales_opportunities": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "lead": {"type": "string"},
                        "value": {"type": "number"},
                        "next_step": {"type": "string"},
                    },
                    "required": ["lead", "next_step"],
                },
            },
            "riley_tasks": {"type": "array", "items": {"type": "string"}},
            "production_queue": {"type": "array", "items": {"type": "string"}},
            "ghl_follow_ups": {"type": "array", "items": {"type": "string"}},
            "team_assignments": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "agent": {"type": "string"},
                        "task": {"type": "string"},
                    },
                    "required": ["agent", "task"],
                },
            },
            "revenue_opportunities": {"type": "array", "items": {"type": "string"}},
            "rob_should_do_first": {"type": "array", "items": {"type": "string"}},
            "end_of_day_checklist": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["greeting", "priorities", "rob_should_do_first"],
    },
}


async def run_big_homie(message: str, context: dict | None = None) -> str:
    if not settings.ANTHROPIC_API_KEY:
        return (
            "What's up Rob — BIG HOMIE is online. "
            "Claude API key not configured — running in mock mode. "
            "Add ANTHROPIC_API_KEY to your .env to enable full AI responses."
        )

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    context_block = ""
    if context:
        context_block = f"\n\nCurrent business context:\n{context}"

    response = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=1024,
        system=BIG_HOMIE_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": message + context_block}],
    )

    return response.content[0].text if response.content else "BIG HOMIE processed your request."


async def generate_brief_with_claude(context: dict | None = None) -> dict:
    if not settings.ANTHROPIC_API_KEY:
        from .mock_data import get_daily_brief
        return get_daily_brief().model_dump()

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    context_str = str(context) if context else "Use your knowledge of The Breakroom 247 to generate the brief."

    response = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=2048,
        system=BIG_HOMIE_SYSTEM_PROMPT,
        tools=[BRIEF_TOOL_SCHEMA],
        tool_choice={"type": "tool", "name": "generate_daily_brief"},
        messages=[{
            "role": "user",
            "content": f"Generate today's Daily Command Brief for Rob.\n\nContext: {context_str}"
        }],
    )

    for block in response.content:
        if block.type == "tool_use" and block.name == "generate_daily_brief":
            from datetime import datetime
            result = block.input
            result["generated_at"] = datetime.utcnow().isoformat() + "Z"
            return result

    from .mock_data import get_daily_brief
    return get_daily_brief().model_dump()
