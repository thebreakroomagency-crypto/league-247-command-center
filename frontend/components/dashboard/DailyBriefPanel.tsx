'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Loader2, Zap } from 'lucide-react'
import { formatTimestamp } from '@/lib/utils'
import type { DailyBrief } from '@/lib/types'

interface DailyBriefPanelProps {
  brief: DailyBrief | null
  isLoading: boolean
  bigHomieOnline: boolean
  onRun: () => void
}

type SectionKey = 'priorities' | 'clients' | 'sales' | 'riley' | 'production' | 'ghl' | 'team' | 'revenue' | 'rob' | 'eod'

const SECTIONS: { key: SectionKey; label: string; color: string }[] = [
  { key: 'priorities',  label: '01 · TOP PRIORITIES',          color: 'text-cmd-red' },
  { key: 'clients',     label: '02 · CLIENT ATTENTION',        color: 'text-cmd-orange' },
  { key: 'sales',       label: '03 · SALES OPPORTUNITIES',     color: 'text-cmd-yellow' },
  { key: 'riley',       label: '04 · RILEY STONE TASKS',       color: 'text-cmd-cyan' },
  { key: 'production',  label: '05 · PRODUCTION QUEUE',        color: 'text-cmd-green' },
  { key: 'ghl',         label: '06 · GHL / CRM FOLLOW-UPS',    color: 'text-cmd-purple' },
  { key: 'team',        label: '07 · TEAM ASSIGNMENTS',        color: 'text-cmd-orange' },
  { key: 'revenue',     label: '08 · REVENUE OPPORTUNITIES',   color: 'text-cmd-yellow' },
  { key: 'rob',         label: '09 · ROB DOES THIS FIRST',     color: 'text-cmd-red' },
  { key: 'eod',         label: '10 · END-OF-DAY CHECKLIST',    color: 'text-slate-400' },
]

export function DailyBriefPanel({ brief, isLoading, bigHomieOnline, onRun }: DailyBriefPanelProps) {
  const [expanded, setExpanded] = useState<SectionKey | null>('priorities')

  return (
    <div className="panel-glass h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cmd-border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${bigHomieOnline ? 'bg-cmd-orange animate-pulse' : 'bg-slate-600'}`} />
          <div>
            <h2 className="font-display text-xs font-bold text-cmd-orange tracking-widest">
              BIG HOMIE — DAILY BRIEF
            </h2>
            {brief && (
              <p className="font-mono text-[10px] text-slate-500 mt-0.5">
                Generated {formatTimestamp(brief.generatedAt)}
              </p>
            )}
          </div>
        </div>
        {!bigHomieOnline && (
          <button
            onClick={onRun}
            className="font-mono text-[10px] text-cmd-orange border border-cmd-orange/40 px-2 py-1 rounded hover:bg-cmd-orange/10 transition-colors"
          >
            RUN BIG HOMIE
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-cmd-orange animate-spin" />
          <div className="font-mono text-xs text-cmd-orange animate-pulse">GENERATING BRIEF...</div>
          <TerminalLines />
        </div>
      )}

      {/* Not started */}
      {!isLoading && !brief && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-cmd-orange/30 flex items-center justify-center">
            <Zap className="w-8 h-8 text-cmd-orange/50" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white">BIG HOMIE OFFLINE</p>
            <p className="font-mono text-xs text-slate-500 mt-1">Say "Run BIG HOMIE" to activate</p>
          </div>
          <button
            onClick={onRun}
            className="px-6 py-2 bg-cmd-orange text-black font-display text-xs font-bold tracking-widest rounded hover:bg-cmd-orange-dim transition-colors"
          >
            ACTIVATE BIG HOMIE
          </button>
        </div>
      )}

      {/* Brief content */}
      {!isLoading && brief && (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Greeting */}
          <div className="px-4 py-3 border-b border-cmd-border/50 bg-cmd-orange/5">
            <p className="font-mono text-xs text-cmd-orange italic">"{brief.greeting}"</p>
          </div>

          {/* Sections */}
          <div className="divide-y divide-cmd-border/30">
            {SECTIONS.map(({ key, label, color }) => {
              const content = getSectionContent(brief, key)
              const isOpen = expanded === key
              return (
                <div key={key}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : key)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-cmd-glass-2 transition-colors text-left"
                  >
                    <span className={`font-mono text-[10px] font-bold tracking-widest ${color}`}>{label}</span>
                    <span className="text-slate-600">
                      {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 space-y-1.5">
                          {content.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-start gap-2"
                            >
                              <span className="text-cmd-orange mt-0.5 flex-shrink-0 font-mono text-[10px]">▸</span>
                              <span className="font-mono text-[11px] text-slate-300 leading-relaxed">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function getSectionContent(brief: DailyBrief, key: SectionKey): string[] {
  switch (key) {
    case 'priorities':  return brief.priorities
    case 'clients':     return brief.clientAttention.map((c) => `${c.client} — ${c.issue} → ${c.action}`)
    case 'sales':       return brief.salesOpportunities.map((s) => `${s.lead}${s.value ? ` ($${s.value.toLocaleString()}/mo)` : ''} — ${s.nextStep}`)
    case 'riley':       return brief.rileyTasks
    case 'production':  return brief.productionQueue
    case 'ghl':         return brief.ghlFollowUps
    case 'team':        return brief.teamAssignments.map((t) => `${t.agent}: ${t.task}`)
    case 'revenue':     return brief.revenueOpportunities
    case 'rob':         return brief.robShouldDoFirst
    case 'eod':         return brief.endOfDayChecklist
  }
}

function TerminalLines() {
  const lines = [
    'Connecting to GoHighLevel CRM...',
    'Loading Google Sheets data...',
    'Scanning Riley Stone content queue...',
    'Analyzing pipeline opportunities...',
    'Compiling Command Brief...',
  ]
  return (
    <div className="space-y-1 text-left">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1] }}
          transition={{ delay: i * 0.3 }}
          className="font-mono text-[10px] text-slate-500"
        >
          <span className="text-cmd-orange">$</span> {line}
        </motion.div>
      ))}
    </div>
  )
}
