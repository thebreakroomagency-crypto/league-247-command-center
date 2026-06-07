'use client'
import { motion } from 'framer-motion'
import { contentStatusColor } from '@/lib/utils'
import type { RileyContent, ContentStatus } from '@/lib/types'

interface RileyContentPanelProps {
  content: RileyContent[]
}

const PLATFORM_ICON: Record<string, string> = {
  Instagram: '📸',
  TikTok: '🎵',
  YouTube: '▶',
  Facebook: '📘',
  'Twitter/X': '𝕏',
  LinkedIn: '💼',
}

const STATUS_ORDER: ContentStatus[] = ['editing', 'review', 'recording', 'scripting', 'scheduled', 'published', 'idea']

export function RileyContentPanel({ content }: RileyContentPanelProps) {
  const publishedCount = content.filter((c) => c.status === 'published').length
  const scheduledCount = content.filter((c) => c.status === 'scheduled').length
  const inProductionCount = content.filter((c) => !['published', 'idea'].includes(c.status)).length

  const sorted = [...content].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  )

  return (
    <div className="panel-glass h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cmd-border">
        <div>
          <h2 className="font-display text-xs font-bold text-cmd-red tracking-widest">RILEY STONE</h2>
          <p className="font-mono text-[10px] text-slate-600 mt-0.5">RILEY · CUTTY · Influencer Division</p>
        </div>
        <div className="flex gap-3 font-mono text-[9px]">
          <span className="text-cmd-green">{publishedCount} LIVE</span>
          <span className="text-cmd-cyan">{scheduledCount} SCHED</span>
          <span className="text-cmd-orange">{inProductionCount} PROD</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-2">
        {sorted.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-cmd-border/30 bg-cmd-glass rounded p-3 hover:border-red-900/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm flex-shrink-0">{PLATFORM_ICON[item.platform] ?? '📱'}</span>
                <span className="font-mono text-xs text-white font-medium truncate">{item.title}</span>
              </div>
              <span className={`font-mono text-[9px] font-bold flex-shrink-0 uppercase ${contentStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-[9px] text-slate-500">{item.type}</span>
              <span className="font-mono text-[9px] text-slate-600">{item.platform}</span>
              {item.scheduledDate && (
                <span className="font-mono text-[9px] text-cmd-cyan">⏱ {item.scheduledDate}</span>
              )}
              {item.publishedDate && (
                <span className="font-mono text-[9px] text-slate-600">✓ {item.publishedDate}</span>
              )}
            </div>

            {/* Engagement stats for published */}
            {item.status === 'published' && item.views != null && (
              <div className="flex gap-4 mt-1.5">
                <span className="font-mono text-[9px] text-slate-400">
                  👁 {item.views.toLocaleString()}
                </span>
                {item.engagement != null && (
                  <span className="font-mono text-[9px] text-cmd-green">
                    ⚡ {item.engagement}% eng
                  </span>
                )}
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className="mt-1.5 font-mono text-[9px] text-slate-500 italic border-l border-cmd-red/30 pl-2">
                {item.notes}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
