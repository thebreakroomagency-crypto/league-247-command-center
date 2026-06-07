'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { statusColor, agentStatusLabel } from '@/lib/utils'
import type { Agent } from '@/lib/types'

interface AgentStatusCardsProps {
  agents: Agent[]
  onActivate?: (agentId: string) => void
}

export function AgentStatusCards({ agents, onActivate }: AgentStatusCardsProps) {
  return (
    <div className="panel-glass h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cmd-border">
        <div>
          <h2 className="font-display text-xs font-bold text-cmd-orange tracking-widest">AGENT ROSTER</h2>
          <p className="font-mono text-[10px] text-slate-600 mt-0.5">League 247 · All Units</p>
        </div>
        <span className="font-mono text-[10px] text-slate-500">
          {agents.filter((a) => a.status !== 'offline').length}/{agents.length} ONLINE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 grid grid-cols-1 gap-2">
        <AnimatePresence>
          {agents.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} onActivate={onActivate} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function AgentCard({ agent, index, onActivate }: { agent: Agent; index: number; onActivate?: (id: string) => void }) {
  const sColor = statusColor(agent.status)
  const progress = agent.tasksTotal > 0 ? (agent.tasksCompleted / agent.tasksTotal) * 100 : 0
  const isBigHomie = agent.id === 'BIG_HOMIE'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onActivate?.(agent.id)}
      className={`relative group cursor-pointer rounded border p-3 transition-all duration-300 ${
        isBigHomie
          ? 'border-cmd-orange/60 bg-cmd-orange/5 hover:bg-cmd-orange/10'
          : 'border-cmd-border bg-cmd-glass hover:border-cmd-orange/30 hover:bg-cmd-glass-2'
      }`}
      style={isBigHomie ? { boxShadow: '0 0 20px rgba(255,107,0,0.15)' } : undefined}
    >
      {/* Active pulse indicator */}
      {(agent.status === 'active' || agent.status === 'processing') && (
        <div
          className="absolute -right-px -top-px w-2 h-2 rounded-full"
          style={{ backgroundColor: sColor, boxShadow: `0 0 6px ${sColor}` }}
        />
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Color orb */}
          <div
            className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: sColor, boxShadow: `0 0 6px ${sColor}80` }}
          />
          <div className="min-w-0">
            <div className={`font-display text-xs font-bold truncate ${isBigHomie ? 'text-cmd-orange' : 'text-white'}`}>
              {agent.name}
            </div>
            <div className="font-mono text-[9px] text-slate-500 truncate">{agent.role}</div>
          </div>
        </div>
        <span className="font-mono text-[9px] flex-shrink-0" style={{ color: sColor }}>
          {agentStatusLabel(agent.status)}
        </span>
      </div>

      {/* Current task */}
      {agent.currentTask && (
        <div className="font-mono text-[10px] text-slate-400 mb-2 truncate pl-4">
          ↳ {agent.currentTask}
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-0.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: index * 0.05 }}
            className="h-full rounded-full"
            style={{ backgroundColor: sColor }}
          />
        </div>
        <span className="font-mono text-[9px] text-slate-600">
          {agent.tasksCompleted}/{agent.tasksTotal}
        </span>
      </div>
    </motion.div>
  )
}
