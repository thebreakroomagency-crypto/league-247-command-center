'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { RevenueSnapshot } from '@/lib/types'

interface RevenueTrackerProps {
  revenue: RevenueSnapshot
}

export function RevenueTracker({ revenue }: RevenueTrackerProps) {
  const pct = Math.round((revenue.currentMRR / revenue.mrrTarget) * 100)

  return (
    <div className="panel-glass h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cmd-border">
        <div>
          <h2 className="font-display text-xs font-bold text-cmd-orange tracking-widest">REVENUE TRACKER</h2>
          <p className="font-mono text-[10px] text-slate-600 mt-0.5">BAGMAN · MRR Intelligence</p>
        </div>
        <div className="flex items-center gap-1 text-cmd-green">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="font-mono text-xs font-bold">+{revenue.mrrGrowth}%</span>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-2">
          <MetricBox label="CURRENT MRR" value={formatCurrency(revenue.currentMRR)} color="text-cmd-green" />
          <MetricBox label="MRR TARGET" value={formatCurrency(revenue.mrrTarget)} color="text-cmd-orange" />
          <MetricBox label="PIPELINE" value={formatCurrency(revenue.pipeline)} color="text-cmd-cyan" />
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1.5">
            <span>PROGRESS TO TARGET</span>
            <span className="text-cmd-orange">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cmd-orange to-cmd-yellow rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(pct, 100)}%`, boxShadow: '0 0 8px rgba(255,107,0,0.5)' }}
            />
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-0" style={{ height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue.history} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ff6b00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffd700" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ffd700" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: '#475569', fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#0c0c14', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 4, fontFamily: 'monospace', fontSize: 10 }}
                labelStyle={{ color: '#ff6b00' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(v: number) => [formatCurrency(v)]}
              />
              <ReferenceLine y={revenue.mrrTarget} stroke="#ffd70040" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="target" stroke="#ffd700" strokeWidth={1} fill="url(#targetGrad)" strokeDasharray="4 2" dot={false} />
              <Area type="monotone" dataKey="mrr" stroke="#ff6b00" strokeWidth={2} fill="url(#mrrGrad)" dot={{ fill: '#ff6b00', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom stats */}
        <div className="flex justify-between font-mono text-[10px] text-slate-500 pt-1 border-t border-cmd-border/30">
          <span>CLIENTS <span className="text-white">{revenue.totalClients}</span></span>
          <span>AVG DEAL <span className="text-white">{formatCurrency(revenue.avgDealSize)}</span></span>
        </div>
      </div>
    </div>
  )
}

function MetricBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-900/50 border border-cmd-border/30 rounded p-2 text-center">
      <div className={`font-mono text-sm font-bold ${color}`}>{value}</div>
      <div className="font-mono text-[8px] text-slate-600 mt-0.5">{label}</div>
    </div>
  )
}
