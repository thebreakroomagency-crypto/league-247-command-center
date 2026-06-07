'use client'
import { motion } from 'framer-motion'
import { priorityColor, taskStatusColor } from '@/lib/utils'
import type { Task } from '@/lib/types'

interface ProductionQueueProps {
  tasks: Task[]
}

const STATUS_ICON: Record<Task['status'], string> = {
  pending: '○',
  in_progress: '◈',
  review: '◎',
  completed: '✓',
  blocked: '✕',
}

export function ProductionQueue({ tasks }: ProductionQueueProps) {
  const inProgress = tasks.filter((t) => t.status === 'in_progress')
  const pending = tasks.filter((t) => t.status === 'pending')
  const review = tasks.filter((t) => t.status === 'review')
  const completed = tasks.filter((t) => t.status === 'completed')

  const sorted = [...inProgress, ...review, ...pending, ...completed]

  return (
    <div className="panel-glass h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cmd-border">
        <div>
          <h2 className="font-display text-xs font-bold text-cmd-orange tracking-widest">PRODUCTION QUEUE</h2>
          <p className="font-mono text-[10px] text-slate-600 mt-0.5">All Agents · Active Work</p>
        </div>
        <div className="flex gap-2 font-mono text-[9px]">
          <span className="text-cmd-orange">{inProgress.length} ACTIVE</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{pending.length} PENDING</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-1.5">
        {sorted.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex items-start gap-3 p-2.5 rounded border transition-colors ${
              task.status === 'completed'
                ? 'border-slate-800/50 bg-transparent opacity-40'
                : 'border-cmd-border/30 bg-cmd-glass hover:border-cmd-orange/20'
            }`}
          >
            <span className={`font-mono text-sm flex-shrink-0 mt-0.5 ${taskStatusColor(task.status)}`}>
              {STATUS_ICON[task.status]}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span className={`font-mono text-xs leading-tight ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                  {task.title}
                </span>
                <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${priorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-[9px] text-cmd-orange">{task.agent}</span>
                <span className="font-mono text-[9px] text-slate-600">{task.dueDate}</span>
                <span className="font-mono text-[9px] text-slate-700 capitalize">{task.category}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary bar */}
      <div className="px-4 py-2 border-t border-cmd-border/30 flex gap-4">
        {[
          { label: 'IN PROGRESS', count: inProgress.length, color: 'text-cmd-orange' },
          { label: 'REVIEW', count: review.length, color: 'text-cmd-cyan' },
          { label: 'PENDING', count: pending.length, color: 'text-slate-400' },
          { label: 'DONE', count: completed.length, color: 'text-cmd-green' },
        ].map(({ label, count, color }) => (
          <div key={label} className="text-center flex-1">
            <div className={`font-mono text-sm font-bold ${color}`}>{count}</div>
            <div className="font-mono text-[8px] text-slate-600">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
