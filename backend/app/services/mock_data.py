"""Mock data service — returns structured mock data for MVP.
Replace individual methods with real API calls as integrations are built."""

from datetime import datetime
from ..models.agents import Agent, AgentLog
from ..models.revenue import RevenueSnapshot, RevenueMonth
from ..models.brief import DailyBrief, CommandSummary, ClientAttentionItem, SalesOpportunity, TeamAssignment


def get_agents() -> list[Agent]:
    return [
        Agent(id="BIG_HOMIE", name="BIG HOMIE", role="Master Orchestrator", status="active",
              last_active="NOW", tasks_completed=247, tasks_total=247,
              current_task="Generating Daily Command Brief", color="#ff6b00", glow_color="rgba(255,107,0,0.8)"),
        Agent(id="PLUG", name="PLUG", role="Partnerships & Opportunities", status="active",
              last_active="2m ago", tasks_completed=12, tasks_total=15,
              current_task="Scanning partnership opportunities", color="#8b5cf6", glow_color="rgba(139,92,246,0.7)"),
        Agent(id="HUNTER", name="HUNTER", role="Lead Generation", status="processing",
              last_active="1m ago", tasks_completed=34, tasks_total=40,
              current_task="Qualifying 6 new leads from Facebook Ads", color="#00d4ff", glow_color="rgba(0,212,255,0.7)"),
        Agent(id="CLOSER", name="CLOSER", role="Sales", status="active",
              last_active="5m ago", tasks_completed=8, tasks_total=12,
              current_task="Following up with Apex Media proposal", color="#ff2200", glow_color="rgba(255,34,0,0.7)"),
        Agent(id="SAUCE", name="SAUCE", role="Creative Strategy", status="idle",
              last_active="22m ago", tasks_completed=19, tasks_total=22,
              current_task=None, color="#ffd700", glow_color="rgba(255,215,0,0.7)"),
        Agent(id="CUTTY", name="CUTTY", role="Content & Media", status="processing",
              last_active="3m ago", tasks_completed=28, tasks_total=35,
              current_task="Editing Riley Stone Week 24 Reel", color="#00ff88", glow_color="rgba(0,255,136,0.7)"),
        Agent(id="HUSTLE", name="HUSTLE", role="Advertising & Growth", status="active",
              last_active="8m ago", tasks_completed=15, tasks_total=18,
              current_task="Optimizing Facebook Ad campaigns", color="#ff6b00", glow_color="rgba(255,107,0,0.6)"),
        Agent(id="LOOKOUT", name="LOOKOUT", role="Market Intelligence", status="active",
              last_active="4m ago", tasks_completed=41, tasks_total=45,
              current_task="Monitoring competitor content performance", color="#00d4ff", glow_color="rgba(0,212,255,0.6)"),
        Agent(id="GEAR", name="GEAR", role="Development & Automation", status="processing",
              last_active="1m ago", tasks_completed=22, tasks_total=30,
              current_task="Building Command Center WebSocket bridge", color="#8b5cf6", glow_color="rgba(139,92,246,0.6)"),
        Agent(id="OG", name="OG", role="Operations & Compliance", status="idle",
              last_active="1h ago", tasks_completed=33, tasks_total=35,
              current_task=None, color="#ffd700", glow_color="rgba(255,215,0,0.6)"),
        Agent(id="BAGMAN", name="BAGMAN", role="Finance", status="idle",
              last_active="2h ago", tasks_completed=11, tasks_total=12,
              current_task=None, color="#00ff88", glow_color="rgba(0,255,136,0.6)"),
        Agent(id="RILEY", name="RILEY", role="Riley Stone Influencer Division", status="active",
              last_active="15m ago", tasks_completed=47, tasks_total=52,
              current_task="Scheduling Week 25 content calendar", color="#ff2200", glow_color="rgba(255,34,0,0.6)"),
    ]


def get_revenue() -> RevenueSnapshot:
    return RevenueSnapshot(
        current_mrr=14800,
        mrr_target=20000,
        mrr_growth=18.4,
        total_clients=8,
        avg_deal_size=2600,
        pipeline=17200,
        history=[
            RevenueMonth(month="Jan", mrr=7200, new_revenue=1200, target=10000, churn=0),
            RevenueMonth(month="Feb", mrr=8400, new_revenue=1800, target=11000, churn=600),
            RevenueMonth(month="Mar", mrr=9800, new_revenue=2200, target=12000, churn=800),
            RevenueMonth(month="Apr", mrr=11200, new_revenue=2800, target=13000, churn=1400),
            RevenueMonth(month="May", mrr=12500, new_revenue=3200, target=15000, churn=1900),
            RevenueMonth(month="Jun", mrr=14800, new_revenue=5000, target=20000, churn=2700),
        ]
    )


def get_daily_brief() -> DailyBrief:
    return DailyBrief(
        generated_at=datetime.utcnow().isoformat() + "Z",
        greeting="What's up Rob — BIG HOMIE is online. Here's your Command Brief.",
        priorities=[
            "Close Holt Construction — proposal due by end of day Friday",
            "Call Midwest Realty (Tanya Rivera) — 12 days no contact, at risk",
            "Approve Riley Stone Week 24 Reel before 5PM for tomorrow schedule",
        ],
        client_attention=[
            ClientAttentionItem(client="Midwest Realty (Tanya)", issue="12 days no contact — at-risk flag", action="Schedule call today"),
            ClientAttentionItem(client="Apex Media (Marcus)", issue="Q3 report overdue by 2 days", action="CLOSER sends by EOD"),
            ClientAttentionItem(client="Central MN Dental (Priya)", issue="Ads audit needed before Fri meeting", action="HUSTLE delivers audit by Thu"),
        ],
        sales_opportunities=[
            SalesOpportunity(lead="Torres Aesthetics — Angela", value=3200, next_step="Negotiate timeline, close this week"),
            SalesOpportunity(lead="Mills Law Group — Sarah", value=4500, next_step="Proposal follow-up call today"),
            SalesOpportunity(lead="Fletcher Financial — Tom", value=5000, next_step="Start onboarding ASAP — already won"),
            SalesOpportunity(lead="Holt Construction — Jason", value=0, next_step="Send proposal by Friday EOD"),
        ],
        riley_tasks=[
            "Approve Week 24 'Morning Mindset' Reel — due today, posts Jun 7",
            "CUTTY: Final edit on Week 24 Reel by 5PM",
            "RILEY: Lock in Week 25 content calendar by Monday",
            "SAUCE: Review YouTube script outline — 'Top 5 Tools'",
        ],
        production_queue=[
            "Riley Stone Week 24 Reel (CUTTY — IN PROGRESS)",
            "Fletcher Financial Onboarding Deck (SAUCE — IN PROGRESS)",
            "Apex Media Q3 Content Report (CLOSER — PENDING)",
            "Holt Construction Proposal (CLOSER — PENDING)",
            "Partnership Deck TBR 247 (PLUG — PENDING)",
        ],
        ghl_follow_ups=[
            "Angela Torres — Negotiation stage, last touch 3h ago",
            "Sarah Mills — Proposal sent, awaiting response",
            "Kevin Bauer — Qualified, book discovery call",
            "Mike Carlson — Send case studies (5 days cold)",
            "Midwest Realty — Mark as at-risk in GHL, schedule task",
        ],
        team_assignments=[
            TeamAssignment(agent="CLOSER", task="Apex Media report + Holt proposal + Torres close"),
            TeamAssignment(agent="CUTTY", task="Riley Week 24 final edit"),
            TeamAssignment(agent="HUSTLE", task="Central MN Dental ads audit"),
            TeamAssignment(agent="OG", task="Midwest Realty client recovery call"),
            TeamAssignment(agent="SAUCE", task="Fletcher onboarding deck"),
            TeamAssignment(agent="RILEY", task="Week 25 calendar lock"),
        ],
        revenue_opportunities=[
            "Torres Aesthetics close = +$3,200/mo MRR",
            "Mills Law Group = +$4,500/mo MRR if proposal converts",
            "Holt Construction = est. +$2,000-3,500/mo",
            "Fletcher Financial already won = +$5,000/mo starting Jun 15",
        ],
        rob_should_do_first=[
            "1. Call Tanya Rivera (Midwest Realty) — retention priority",
            "2. Approve Riley Stone Reel — unlock CUTTY's delivery pipeline",
            "3. Review Torres Aesthetics negotiation notes with CLOSER",
            "4. Confirm Holt Construction proposal is locked for Friday",
        ],
        end_of_day_checklist=[
            "☐ Riley Reel approved and scheduled",
            "☐ Apex Media report sent",
            "☐ Midwest Realty contact made",
            "☐ Holt proposal finalized",
            "☐ GHL pipeline updated",
            "☐ BAGMAN runs EOD revenue check",
            "☐ BIG HOMIE end-of-day debrief logged",
        ],
    )


def get_command_summary() -> CommandSummary:
    return CommandSummary(
        timestamp=datetime.utcnow().isoformat() + "Z",
        active_agents=7,
        total_agents=12,
        tasks_in_progress=5,
        tasks_completed_today=3,
        leads_in_pipeline=5,
        new_leads_today=2,
        current_mrr=14800,
        riley_posts_this_week=3,
        system_status="nominal",
    )


def get_agent_logs() -> list[AgentLog]:
    return [
        AgentLog(id="log1", timestamp="2026-06-06T09:47:00Z", agent="SYSTEM",
                 action="COMMAND CENTER ONLINE", details="League 247 Command Center initialized.", type="system"),
        AgentLog(id="log2", timestamp="2026-06-06T09:47:03Z", agent="BIG_HOMIE",
                 action="AGENT ONLINE", details="What's up Rob — BIG HOMIE is online.", type="activation"),
        AgentLog(id="log3", timestamp="2026-06-06T09:47:15Z", agent="BIG_HOMIE",
                 action="BRIEF GENERATED", details="Daily Command Brief complete. 3 critical priorities.", type="brief"),
        AgentLog(id="log4", timestamp="2026-06-06T09:48:02Z", agent="HUNTER",
                 action="LEADS SCANNED", details="Pulled 6 new leads from GHL pipeline.", type="ghl"),
        AgentLog(id="log5", timestamp="2026-06-06T09:51:00Z", agent="CUTTY",
                 action="TASK STARTED", details="Riley Stone Week 24 Reel — entering final edit. ETA: 4h.", type="task_complete"),
        AgentLog(id="log6", timestamp="2026-06-06T09:52:45Z", agent="CLOSER",
                 action="FOLLOW-UP SENT", details="Apex Media proposal follow-up sent via GHL.", type="ghl"),
        AgentLog(id="log7", timestamp="2026-06-06T09:55:12Z", agent="OG",
                 action="ALERT", details="⚠ Midwest Realty — 12 days without contact.", type="alert"),
        AgentLog(id="log8", timestamp="2026-06-06T10:01:00Z", agent="HUSTLE",
                 action="CAMPAIGN OPTIMIZED", details="Central MN Dental Facebook Ads: CPL reduced 23%.", type="task_complete"),
    ]
