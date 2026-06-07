'use client'
import { motion } from 'framer-motion'
import { leadStageColor, formatCurrency } from '@/lib/utils'
import type { Lead, LeadStage } from '@/lib/types'

const STAGE_ORDER: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won']

interface SalesPipelineProps {
  leads: Lead[]
  source?: 'mock' | 'ghl'
}

export function SalesPipeline({ leads, source = 'mock' }: SalesPipelineProps) {
  const pipelineTotal = leads
    .filter((l) => l.stage !== 'lost' && l.stage !== 'won')
    .reduce((sum, l) => sum + l.estimatedValue, 0)

  const wonTotal = leads
    .filter((l) => l.stage === 'won')
    .reduce((sum, l) => sum + l.estimatedValue, 0)

  return (
    <div className="panel-glass h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cmd-border">
        <div>
          <h2 className="font-display text-xs font-bold text-cmd-orange tracking-widest">SALES PIPELINE</h2>
          <p className="font-mono text-[10px] text-slate-600 mt-0.5">
            CLOSER · HUNTER ·{' '}
            <span className={source === 'ghl' ? 'text-cmd-green' : 'text-slate-600'}>
              {source === 'ghl' ? '● GHL LIVE' : '○ MOCK DATA'}
            </span>
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs font-bold text-cmd-yellow">{formatCurrency(pipelineTotal)}</div>
          <div className="font-mono text-[9px] text-slate-500">open pipeline</div>
        </div>
      </div>

      {/* Stage summary bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
          {STAGE_ORDER.map((stage) => {
            const count = leads.filter((l) => l.stage === stage).length
            const pct = (count / leads.length) * 100
            return (
              <div
                key={stage}
                className="h-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: stageBarColor(stage) }}
                title={`${stage}: ${count}`}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          {STAGE_ORDER.map((stage) => (
            <div key={stage} className="text-center">
              <div className="font-mono text-[8px] text-slate-500">{stage.toUpperCase()}</div>
              <div className="font-mono text-[9px] text-white">{leads.filter((l) => l.stage === stage).length}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3 space-y-2">
        {leads.map((lead, i) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-cmd-border/30 bg-cmd-glass rounded p-3 hover:border-cmd-orange/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <div className="font-mono text-xs font-bold text-white">{lead.name}</div>
                {lead.company && (
                  <div className="font-mono text-[10px] text-slate-500">{lead.company}</div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {lead.estimatedValue > 0 && (
                  <span className="font-mono text-[10px] text-cmd-yellow">{formatCurrency(lead.estimatedValue)}</span>
                )}
                <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${leadStageColor(lead.stage)}`}>
                  {lead.stage.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-slate-500 truncate flex-1">{lead.nextStep}</span>
              <span className="font-mono text-[9px] text-slate-600 ml-2 flex-shrink-0">{lead.assignedAgent}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Won this period */}
      {wonTotal > 0 && (
        <div className="px-4 py-2 border-t border-cmd-border/30 flex justify-between">
          <span className="font-mono text-[10px] text-slate-500">WON THIS PERIOD</span>
          <span className="font-mono text-[10px] text-cmd-green font-bold">{formatCurrency(wonTotal)}/mo</span>
        </div>
      )}
    </div>
  )
}

function stageBarColor(stage: LeadStage): string {
  switch (stage) {
    case 'new':         return '#475569'
    case 'contacted':   return '#3b82f6'
    case 'qualified':   return '#eab308'
    case 'proposal':    return '#f97316'
    case 'negotiation': return '#a855f7'
    case 'won':         return '#22c55e'
    case 'lost':        return '#ef4444'
  }
}
