'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CommandHeader } from '@/components/dashboard/CommandHeader'
import { AgentNetworkGraph } from '@/components/dashboard/AgentNetworkGraph'
import { AgentStatusCards } from '@/components/dashboard/AgentStatusCards'
import { DailyBriefPanel } from '@/components/dashboard/DailyBriefPanel'
import { RevenueTracker } from '@/components/dashboard/RevenueTracker'
import { SalesPipeline } from '@/components/dashboard/SalesPipeline'
import { ProductionQueue } from '@/components/dashboard/ProductionQueue'
import { AgentLogs } from '@/components/dashboard/AgentLogs'
import { RileyContentPanel } from '@/components/dashboard/RileyContentPanel'
import { VoiceAssistant } from '@/components/voice/VoiceAssistant'
import { useCommandCenter } from '@/hooks/useCommandCenter'
import { useWebSocket } from '@/hooks/useWebSocket'
import { AGENT_GRAPH } from '@/lib/mockData'

type PanelView = 'overview' | 'sales' | 'content' | 'ops'

export default function CommandCenterPage() {
  const cc = useCommandCenter()
  const [activeView, setActiveView] = useState<PanelView>('overview')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // WebSocket (gracefully degrades if backend is offline)
  const { connected: wsConnected } = useWebSocket('/ws/events', {
    onMessage: cc.actions.handleWebSocketEvent,
  })

  useEffect(() => setMounted(true), [])

  const AGENT_LINES: Record<string, string> = {
    BIG_HOMIE: "What's up Rob — BIG HOMIE is online.",
    PLUG:      "PLUG here. Scanning for partnership opportunities.",
    HUNTER:    "HUNTER online. I'm on the hunt — leads incoming.",
    CLOSER:    "CLOSER ready. Let's get that deal locked in.",
    SAUCE:     "SAUCE activated. Creative strategy is flowing.",
    CUTTY:     "CUTTY in the building. Content's looking clean.",
    HUSTLE:    "HUSTLE online. Ads are running, growth is moving.",
    LOOKOUT:   "LOOKOUT active. Market intel is updated.",
    GEAR:      "GEAR online. Systems are running smooth.",
    OG:        "OG here. Operations are tight, compliance is clear.",
    BAGMAN:    "BAGMAN active. The numbers are looking good.",
    RILEY:     "Riley here. Content calendar is locked and loaded.",
  }

  const handleAgentClick = (agentId: string) => {
    setActiveAgentId(agentId === activeAgentId ? null : agentId)
    cc.actions.activateAgent(agentId)
    const line = AGENT_LINES[agentId]
    if (line) cc.actions.speakText(line, agentId)
  }

  if (!mounted) return <BootScreen />

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <CommandHeader
        summary={cc.summary}
        wsConnected={wsConnected}
        onRunBigHomie={cc.actions.runBigHomie}
        isBigHomieLoading={cc.isBriefLoading}
      />

      {/* View tabs */}
      <div className="flex items-center gap-0 px-6 pt-2 border-b border-cmd-border/50">
        {([
          { key: 'overview', label: 'OVERVIEW' },
          { key: 'sales', label: 'SALES' },
          { key: 'content', label: 'RILEY / CONTENT' },
          { key: 'ops', label: 'OPS' },
        ] as { key: PanelView; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={`font-mono text-[10px] tracking-widest px-4 py-2 border-b-2 transition-all ${
              activeView === key
                ? 'border-cmd-orange text-cmd-orange'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto font-mono text-[9px] text-slate-600 pb-2">
          League 247 · Built for Content. Wired for Growth.
        </div>
      </div>

      {/* Main layout */}
      <main className="flex-1 overflow-hidden p-3 min-h-0">
        {activeView === 'overview' && (
          <OverviewLayout cc={cc} activeAgentId={activeAgentId} onAgentClick={handleAgentClick} />
        )}
        {activeView === 'sales' && (
          <SalesLayout cc={cc} />
        )}
        {activeView === 'content' && (
          <ContentLayout cc={cc} />
        )}
        {activeView === 'ops' && (
          <OpsLayout cc={cc} />
        )}
      </main>

      {/* Data stream overlay */}
      <DataStreams />

      {/* Voice Assistant */}
      <VoiceAssistant
        onCommand={(t, r) => {
          cc.actions.addLog({ agent: 'BIG_HOMIE', action: 'VOICE COMMAND', details: t, type: 'voice' })
          if (t.toLowerCase().includes('run big homie') || t.toLowerCase().includes('big homie')) {
            cc.actions.runBigHomie()
          }
        }}
      />
    </div>
  )
}

// ============================================================
// OVERVIEW LAYOUT
// ============================================================
function OverviewLayout({ cc, activeAgentId, onAgentClick }: {
  cc: ReturnType<typeof useCommandCenter>
  activeAgentId: string | null
  onAgentClick: (id: string) => void
}) {
  return (
    <div className="grid h-full gap-3" style={{ gridTemplateColumns: '280px 1fr 280px', gridTemplateRows: '1fr 1fr' }}>
      {/* Left col: agents */}
      <div style={{ gridRow: '1 / 3' }}>
        <AgentStatusCards agents={cc.agents} onActivate={onAgentClick} />
      </div>

      {/* Center top: network graph */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <AgentNetworkGraph graph={AGENT_GRAPH} activeAgentId={activeAgentId} onNodeClick={onAgentClick} />
      </motion.div>

      {/* Right col: daily brief */}
      <div style={{ gridRow: '1 / 3' }}>
        <DailyBriefPanel
          brief={cc.brief}
          isLoading={cc.isBriefLoading}
          bigHomieOnline={cc.bigHomieOnline}
          onRun={cc.actions.runBigHomie}
        />
      </div>

      {/* Center bottom: split revenue + logs */}
      <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <RevenueTracker revenue={cc.revenue} />
        <AgentLogs logs={cc.logs} />
      </div>
    </div>
  )
}

// ============================================================
// SALES LAYOUT
// ============================================================
function SalesLayout({ cc }: { cc: ReturnType<typeof useCommandCenter> }) {
  return (
    <div className="grid h-full gap-3" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
      <div style={{ gridRow: '1 / 3' }}>
        <SalesPipeline leads={cc.leads} source={cc.leadsSource} />
      </div>
      <RevenueTracker revenue={cc.revenue} />
      <AgentLogs logs={cc.logs} />
    </div>
  )
}

// ============================================================
// CONTENT LAYOUT
// ============================================================
function ContentLayout({ cc }: { cc: ReturnType<typeof useCommandCenter> }) {
  return (
    <div className="grid h-full gap-3" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' }}>
      <RileyContentPanel content={cc.rileyContent} />
      <ProductionQueue tasks={cc.tasks} />
    </div>
  )
}

// ============================================================
// OPS LAYOUT
// ============================================================
function OpsLayout({ cc }: { cc: ReturnType<typeof useCommandCenter> }) {
  return (
    <div className="grid h-full gap-3" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' }}>
      <ProductionQueue tasks={cc.tasks} />
      <AgentLogs logs={cc.logs} />
    </div>
  )
}

// ============================================================
// BOOT SCREEN
// ============================================================
function BootScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 cmd-grid-bg">
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-center"
      >
        <div className="font-display text-4xl font-black text-cmd-orange tracking-widest mb-2">LEAGUE 247</div>
        <div className="font-mono text-sm text-slate-500 tracking-widest">COMMAND CENTER INITIALIZING...</div>
      </motion.div>
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ height: [8, 24, 8] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            className="w-1 bg-cmd-orange rounded-full"
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// DATA STREAM OVERLAY
// ============================================================
function DataStreams() {
  const streams = [8, 18, 32, 52, 68, 82, 92]
  return (
    <div className="data-stream-container">
      {streams.map((left, i) => (
        <div
          key={i}
          className="data-stream"
          style={{
            left: `${left}%`,
            height: `${80 + Math.random() * 80}px`,
            animationDuration: `${6 + i * 2}s`,
            animationDelay: `${i * 1.3}s`,
          }}
        />
      ))}
    </div>
  )
}
