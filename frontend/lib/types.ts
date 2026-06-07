// ============================================================
// LEAGUE 247 COMMAND CENTER — CORE TYPE DEFINITIONS
// ============================================================

export type AgentStatus = 'active' | 'idle' | 'processing' | 'offline' | 'briefing'
export type AgentId =
  | 'BIG_HOMIE' | 'PLUG' | 'HUNTER' | 'CLOSER'
  | 'SAUCE' | 'CUTTY' | 'HUSTLE' | 'LOOKOUT'
  | 'GEAR' | 'OG' | 'BAGMAN' | 'RILEY'

export interface Agent {
  id: AgentId
  name: string
  role: string
  status: AgentStatus
  lastActive: string
  tasksCompleted: number
  tasksTotal: number
  currentTask?: string
  color: string
  glowColor: string
}

export interface AgentNode {
  id: string
  name: string
  role: string
  status: AgentStatus
  color: string
  val: number        // node size
  fx?: number        // fixed x (for BIG HOMIE center)
  fy?: number        // fixed y
}

export interface AgentLink {
  source: string
  target: string
  value: number
}

export interface AgentGraph {
  nodes: AgentNode[]
  links: AgentLink[]
}

// -----------------------------------------------------------

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked'

export interface Client {
  id: string
  name: string
  company: string
  status: 'active' | 'prospect' | 'at_risk' | 'churned'
  monthlyValue: number
  nextAction: string
  assignedAgent: AgentId
  lastContact: string
}

export interface Lead {
  id: string
  name: string
  company?: string
  source: string
  stage: LeadStage
  estimatedValue: number
  assignedAgent: AgentId
  lastActivity: string
  nextStep: string
}

export interface Task {
  id: string
  title: string
  description?: string
  agent: AgentId
  priority: Priority
  status: TaskStatus
  dueDate: string
  category: 'client' | 'content' | 'sales' | 'ops' | 'marketing' | 'development'
  completedAt?: string
}

// -----------------------------------------------------------

export interface RevenueMonth {
  month: string
  mrr: number
  newRevenue: number
  target: number
  churn: number
}

export interface RevenueSnapshot {
  currentMRR: number
  mrrTarget: number
  mrrGrowth: number
  totalClients: number
  avgDealSize: number
  pipeline: number
  history: RevenueMonth[]
}

// -----------------------------------------------------------

export type ContentPlatform = 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook' | 'LinkedIn' | 'Twitter/X'
export type ContentType = 'Reel' | 'Post' | 'Story' | 'Video' | 'Blog' | 'Thread'
export type ContentStatus = 'idea' | 'scripting' | 'recording' | 'editing' | 'review' | 'scheduled' | 'published'

export interface RileyContent {
  id: string
  title: string
  platform: ContentPlatform
  type: ContentType
  status: ContentStatus
  scheduledDate?: string
  publishedDate?: string
  views?: number
  engagement?: number
  notes?: string
}

// -----------------------------------------------------------

export type LogType = 'activation' | 'task_complete' | 'brief' | 'alert' | 'system' | 'ghl' | 'voice' | 'error'

export interface AgentLog {
  id: string
  timestamp: string
  agent: AgentId | 'SYSTEM'
  action: string
  details: string
  type: LogType
}

// -----------------------------------------------------------

export interface DailyBrief {
  generatedAt: string
  greeting: string
  priorities: string[]
  clientAttention: { client: string; issue: string; action: string }[]
  salesOpportunities: { lead: string; value: number; nextStep: string }[]
  rileyTasks: string[]
  productionQueue: string[]
  ghlFollowUps: string[]
  teamAssignments: { agent: AgentId; task: string }[]
  revenueOpportunities: string[]
  robShouldDoFirst: string[]
  endOfDayChecklist: string[]
}

export interface CommandSummary {
  timestamp: string
  activeAgents: number
  totalAgents: number
  tasksInProgress: number
  tasksCompletedToday: number
  leadsInPipeline: number
  newLeadsToday: number
  currentMRR: number
  rileyPostsThisWeek: number
  systemStatus: 'nominal' | 'degraded' | 'offline'
}

export interface WebSocketEvent {
  type: 'agent_status' | 'new_log' | 'task_update' | 'brief_update' | 'voice_response' | 'ghl_update'
  payload: unknown
  timestamp: string
}
