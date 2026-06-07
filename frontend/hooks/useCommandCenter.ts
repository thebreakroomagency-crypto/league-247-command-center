'use client'
import { useState, useEffect, useCallback } from 'react'
import { AGENTS, DAILY_BRIEF, COMMAND_SUMMARY, AGENT_LOGS, LEADS, CLIENTS, TASKS, REVENUE_SNAPSHOT, RILEY_CONTENT } from '@/lib/mockData'
import type { Agent, AgentId, AgentLog, DailyBrief, Lead, WebSocketEvent } from '@/lib/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Central store for the Command Center — uses mock data, swappable with real API
export function useCommandCenter() {
  const [agents, setAgents] = useState<Agent[]>(AGENTS)
  const [logs, setLogs] = useState<AgentLog[]>(AGENT_LOGS)
  const [brief, setBrief] = useState<DailyBrief>(DAILY_BRIEF)
  const [leads, setLeads] = useState<Lead[]>(LEADS)
  const [leadsSource, setLeadsSource] = useState<'mock' | 'ghl'>('mock')
  const [tasks, setTasks] = useState(TASKS)
  const [revenue, setRevenue] = useState(REVENUE_SNAPSHOT)
  const [rileyContent, setRileyContent] = useState(RILEY_CONTENT)
  const [sheetsConnected, setSheetsConnected] = useState(false)
  const [bigHomieOnline, setBigHomieOnline] = useState(false)
  const [isBriefLoading, setIsBriefLoading] = useState(false)

  const addLog = useCallback((log: Omit<AgentLog, 'id' | 'timestamp'>) => {
    const newLog: AgentLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log,
    }
    setLogs((prev) => [newLog, ...prev].slice(0, 100))
  }, [])

  const activateAgent = useCallback((agentId: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId ? { ...a, status: 'active', lastActive: 'NOW' } : a
      )
    )
    const agent = agents.find((a) => a.id === agentId)
    if (agent) {
      addLog({
        agent: agentId as Agent['id'],
        action: 'AGENT ACTIVATED',
        details: `${agent.name} (${agent.role}) activated by Rob.`,
        type: 'activation',
      })
    }
  }, [agents, addLog])

  const speakText = useCallback(async (text: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/voice/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => URL.revokeObjectURL(url)
      await audio.play()
    } catch {
      // ElevenLabs unavailable — silent fallback
    }
  }, [])

  const runBigHomie = useCallback(async () => {
    setIsBriefLoading(true)
    setBigHomieOnline(true)

    addLog({
      agent: 'BIG_HOMIE',
      action: 'AGENT ONLINE',
      details: "What's up Rob — BIG HOMIE is online. Generating Daily Command Brief...",
      type: 'activation',
    })

    // Speak the activation line while the brief loads
    speakText("What's up Rob — BIG HOMIE is online. Generating your Daily Command Brief now.")

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API}/bighomie/brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Generate daily command brief' }),
      })

      if (res.ok) {
        const data = await res.json()
        // Map snake_case API response to camelCase frontend types
        const mapped: DailyBrief = {
          generatedAt:        data.generated_at        ?? new Date().toISOString(),
          greeting:           data.greeting            ?? data.response ?? "BIG HOMIE online.",
          priorities:         data.priorities          ?? [],
          clientAttention:    (data.client_attention   ?? []).map((c: {client:string;issue:string;action:string}) => ({ client: c.client, issue: c.issue, action: c.action })),
          salesOpportunities: (data.sales_opportunities ?? []).map((s: {lead:string;value:number;next_step:string}) => ({ lead: s.lead, value: s.value ?? 0, nextStep: s.next_step })),
          rileyTasks:         data.riley_tasks         ?? [],
          productionQueue:    data.production_queue    ?? [],
          ghlFollowUps:       data.ghl_follow_ups      ?? [],
          teamAssignments:    (data.team_assignments   ?? []).map((t: {agent:string;task:string}) => ({ agent: t.agent as AgentId, task: t.task })),
          revenueOpportunities: data.revenue_opportunities ?? [],
          robShouldDoFirst:   data.rob_should_do_first ?? [],
          endOfDayChecklist:  data.end_of_day_checklist ?? [],
        }
        setBrief(mapped)
        addLog({
          agent: 'BIG_HOMIE',
          action: 'BRIEF GENERATED',
          details: `Daily Command Brief complete via Claude. ${mapped.priorities.length} critical priorities loaded.`,
          type: 'brief',
        })
      } else {
        // Fall back to mock brief
        setBrief(DAILY_BRIEF)
        addLog({ agent: 'BIG_HOMIE', action: 'BRIEF (MOCK)', details: 'API unavailable — using mock brief.', type: 'brief' })
      }
    } catch {
      setBrief(DAILY_BRIEF)
      addLog({ agent: 'BIG_HOMIE', action: 'BRIEF (MOCK)', details: 'Network error — using mock brief.', type: 'brief' })
    }

    setIsBriefLoading(false)
  }, [addLog, speakText])

  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    switch (event.type) {
      case 'agent_status':
        setAgents((prev) =>
          prev.map((a) =>
            a.id === (event.payload as { id: string }).id
              ? { ...a, ...(event.payload as Partial<Agent>) }
              : a
          )
        )
        break
      case 'new_log':
        setLogs((prev) => [event.payload as AgentLog, ...prev].slice(0, 100))
        break
      case 'brief_update':
        setBrief(event.payload as DailyBrief)
        break
    }
  }, [])

  // Fetch Sheets data on mount, refresh every 3 minutes
  const fetchSheetsData = useCallback(async () => {
    try {
      const [tasksRes, revenueRes, rileyRes] = await Promise.all([
        fetch(`${API}/command-center/tasks`),
        fetch(`${API}/command-center/revenue`),
        fetch(`${API}/command-center/riley`),
      ])

      if (tasksRes.ok) {
        const d = await tasksRes.json()
        if (d.tasks?.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setTasks(d.tasks.map((t: any) => ({
            id: t.id, title: t.title, description: t.description,
            agent: t.agent, priority: t.priority, status: t.status,
            dueDate: t.dueDate, category: t.category,
          })))
        }
      }

      if (revenueRes.ok) {
        const d = await revenueRes.json()
        if (d.source === 'sheets' && d.currentMRR) {
          setRevenue({
            currentMRR: d.currentMRR,
            mrrTarget: d.mrrTarget ?? 20000,
            mrrGrowth: d.mrrGrowth ?? 18.4,
            totalClients: d.totalClients ?? 0,
            avgDealSize: d.avgDealSize ?? 0,
            pipeline: d.pipeline ?? 0,
            history: d.history ?? [],
          })
        }
      }

      if (rileyRes.ok) {
        const d = await rileyRes.json()
        if (d.content?.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setRileyContent(d.content.map((c: any) => ({
            id: c.id, title: c.title, platform: c.platform,
            type: c.type, status: c.status,
            scheduledDate: c.scheduledDate, notes: c.notes,
          })))
          setSheetsConnected(true)
          addLog({ agent: 'GEAR', action: 'SHEETS SYNC', details: `Synced ${d.content.length} Riley content items, tasks, and revenue from Google Sheets.`, type: 'system' })
        }
      }
    } catch {
      // Sheets unavailable — keep mock data
    }
  }, [addLog])

  useEffect(() => {
    fetchSheetsData()
    const interval = setInterval(fetchSheetsData, 3 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchSheetsData])

  // Fetch real GHL leads on mount, refresh every 2 minutes
  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`${API}/command-center/leads`)
      if (!res.ok) return
      const data = await res.json()
      if (data.leads?.length) {
        // Map GHL response to frontend Lead type
        const mapped: Lead[] = data.leads.map((l: Record<string, unknown>) => ({
          id: String(l.id ?? ''),
          name: String(l.contact && typeof l.contact === 'object' ? (l.contact as Record<string,unknown>).name ?? l.name : l.name ?? ''),
          company: String(l.company ?? ''),
          source: String(l.source ?? 'GHL'),
          stage: (l.stage as Lead['stage']) ?? 'new',
          estimatedValue: Number(l.estimatedValue ?? 0),
          assignedAgent: (l.assignedAgent as Lead['assignedAgent']) ?? 'HUNTER',
          lastActivity: String(l.lastActivity ?? ''),
          nextStep: String(l.nextStep ?? ''),
        }))
        setLeads(mapped)
        setLeadsSource('ghl')
        addLog({ agent: 'HUNTER', action: 'GHL SYNC', details: `Pulled ${mapped.length} live opportunities from GoHighLevel.`, type: 'ghl' })
      }
    } catch {
      // Backend offline — keep mock leads
    }
  }, [addLog])

  useEffect(() => {
    fetchLeads()
    const interval = setInterval(fetchLeads, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchLeads])

  // Simulate live agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses = ['active', 'processing', 'idle'] as const
      const randomAgent = agents[Math.floor(Math.random() * (agents.length - 1)) + 1]
      if (randomAgent) {
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
        setAgents((prev) =>
          prev.map((a) => a.id === randomAgent.id ? { ...a, status: newStatus } : a)
        )
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [agents])

  return {
    agents,
    logs,
    brief,
    bigHomieOnline,
    isBriefLoading,
    leads,
    leadsSource,
    clients: CLIENTS,
    tasks,
    revenue,
    rileyContent,
    sheetsConnected,
    summary: COMMAND_SUMMARY,
    actions: {
      runBigHomie,
      activateAgent,
      addLog,
      handleWebSocketEvent,
    },
  }
}
