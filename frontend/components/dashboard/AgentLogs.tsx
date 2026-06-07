'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatTimestamp } from '@/lib/utils'
import type { AgentLog, LogType } from '@/lib/types'

interface AgentLogsProps {
  logs: AgentLog[]
}

const LOG_COLORS: Record<LogType, string> = {
  activation:    'text-cmd-orange',
  task_complete: 'text-cmd-green',
  brief:         'text-cmd-cyan',
  alert:         'text-cmd-red',
  system:        'text-slate-400',
  ghl:           'text-cmd-purple',
  voice:         'text-cmd-yellow',
  error:         'text-cmd-red',
}

const LOG_PREFIX: Record<LogType, string> = {
  activation:    '[ACT]',
  task_complete: '[TASK]',
  brief:         '[BRIEF]',
  alert:         '[ALERT]',
  system:        '[SYS]',
  ghl:           '[GHL]',
  voice:         '[VOICE]',
  error:         '[ERR]',
}

export function AgentLogs({ logs }: AgentLogsProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to latest if near bottom
    const container = containerRef.current
    if (!container) return
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 60
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  return (
    <div className="panel-glass h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cmd-border">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-cmd-green"
          />
          <div>
            <h2 className="font-display text-xs font-bold text-cmd-orange tracking-widest">AGENT LOGS</h2>
            <p className="font-mono text-[10px] text-slate-600 mt-0.5">Live Terminal · All Agents</p>
          </div>
        </div>
        <span className="font-mono text-[10px] text-slate-500">{logs.length} EVENTS</span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin p-3 font-mono text-[10px] space-y-0.5"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 leading-relaxed py-0.5 border-b border-white/[0.02] hover:bg-white/[0.02] px-1 rounded"
            >
              <span className="text-slate-600 flex-shrink-0">{formatTimestamp(log.timestamp)}</span>
              <span className={`flex-shrink-0 font-bold ${LOG_COLORS[log.type]}`}>
                {LOG_PREFIX[log.type]}
              </span>
              <span className="text-cmd-orange flex-shrink-0">[{log.agent}]</span>
              <span className="text-slate-300 flex-shrink-0">{log.action}</span>
              <span className="text-slate-500 min-w-0 truncate">— {log.details}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Terminal cursor */}
      <div className="px-4 py-2 border-t border-cmd-border/30 flex items-center gap-2">
        <span className="font-mono text-[10px] text-cmd-orange">$</span>
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="font-mono text-[10px] text-cmd-orange"
        >
          █
        </motion.span>
        <span className="font-mono text-[10px] text-slate-600">LEAGUE 247 COMMAND CENTER — ALL SYSTEMS NOMINAL</span>
      </div>
    </div>
  )
}
