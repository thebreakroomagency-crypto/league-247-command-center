'use client'
import { motion } from 'framer-motion'
import { Activity, Wifi, WifiOff, Zap } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { CommandSummary } from '@/lib/types'

interface CommandHeaderProps {
  summary: CommandSummary
  wsConnected: boolean
  onRunBigHomie: () => void
  isBigHomieLoading: boolean
}

export function CommandHeader({ summary, wsConnected, onRunBigHomie, isBigHomieLoading }: CommandHeaderProps) {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <header className="relative border-b border-cmd-border bg-cmd-panel/80 backdrop-blur-sm px-6 py-4">
      {/* Scan line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cmd-orange to-transparent opacity-60" />

      <div className="flex items-center justify-between gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-cmd-orange flex items-center justify-center animate-pulse-orange">
              <Zap className="w-5 h-5 text-cmd-orange" />
            </div>
            <div className="absolute -inset-1 rounded-full border border-cmd-orange/30 animate-ping" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white tracking-widest leading-none">
              LEAGUE <span className="text-cmd-orange">247</span>
            </h1>
            <p className="font-mono text-[10px] text-slate-500 tracking-[0.2em] mt-0.5">
              COMMAND CENTER · THE BREAKROOM 247
            </p>
          </div>
        </div>

        {/* Center: Stats Bar */}
        <div className="hidden lg:flex items-center gap-6">
          <StatPill label="AGENTS ONLINE" value={`${summary.activeAgents}/${summary.totalAgents}`} color="cmd-green" />
          <StatPill label="TASKS ACTIVE" value={String(summary.tasksInProgress)} color="cmd-orange" />
          <StatPill label="PIPELINE LEADS" value={String(summary.leadsInPipeline)} color="cmd-cyan" />
          <StatPill label="CURRENT MRR" value={formatCurrency(summary.currentMRR)} color="cmd-yellow" />
          <StatPill label="RILEY POSTS/WK" value={String(summary.rileyPostsThisWeek)} color="cmd-red" />
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* System Status */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {wsConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-cmd-green" />
                <span className="text-cmd-green">LIVE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500">MOCK</span>
              </>
            )}
          </div>

          {/* Clock */}
          <div className="hidden md:block text-right font-mono">
            <div className="text-cmd-orange text-sm font-bold tracking-widest">{timeStr}</div>
            <div className="text-slate-500 text-[10px] tracking-wider">{dateStr}</div>
          </div>

          {/* BIG HOMIE Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRunBigHomie}
            disabled={isBigHomieLoading}
            className="relative px-5 py-2.5 font-display text-sm font-bold tracking-widest text-black bg-cmd-orange border border-cmd-orange rounded disabled:opacity-60 overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {isBigHomieLoading ? 'BRIEFING...' : 'RUN BIG HOMIE'}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
          </motion.button>
        </div>
      </div>

      {/* Bottom scan line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cmd-orange/40 to-transparent" />
    </header>
  )
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`font-mono text-sm font-bold text-${color}`}>{value}</div>
      <div className="font-mono text-[9px] text-slate-600 tracking-wider mt-0.5">{label}</div>
    </div>
  )
}
