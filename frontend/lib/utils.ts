import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { AgentStatus, Priority, TaskStatus, LeadStage, ContentStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function statusColor(status: AgentStatus): string {
  switch (status) {
    case 'active':     return '#00ff88'
    case 'processing': return '#ff6b00'
    case 'idle':       return '#ffd700'
    case 'briefing':   return '#00d4ff'
    case 'offline':    return '#64748b'
  }
}

export function priorityColor(priority: Priority): string {
  switch (priority) {
    case 'critical': return 'text-cmd-red border-cmd-red/40 bg-cmd-red/10'
    case 'high':     return 'text-cmd-orange border-cmd-orange/40 bg-cmd-orange/10'
    case 'medium':   return 'text-cmd-yellow border-cmd-yellow/40 bg-cmd-yellow/10'
    case 'low':      return 'text-slate-400 border-slate-700 bg-slate-800/30'
  }
}

export function taskStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'in_progress': return 'text-cmd-orange'
    case 'completed':   return 'text-cmd-green'
    case 'pending':     return 'text-slate-400'
    case 'review':      return 'text-cmd-cyan'
    case 'blocked':     return 'text-cmd-red'
  }
}

export function leadStageColor(stage: LeadStage): string {
  switch (stage) {
    case 'new':         return 'bg-slate-700 text-slate-300'
    case 'contacted':   return 'bg-blue-900/50 text-blue-300'
    case 'qualified':   return 'bg-yellow-900/50 text-yellow-300'
    case 'proposal':    return 'bg-orange-900/50 text-orange-300'
    case 'negotiation': return 'bg-purple-900/50 text-purple-300'
    case 'won':         return 'bg-green-900/50 text-green-300'
    case 'lost':        return 'bg-red-900/50 text-red-300'
  }
}

export function contentStatusColor(status: ContentStatus): string {
  switch (status) {
    case 'published':  return 'text-cmd-green'
    case 'scheduled':  return 'text-cmd-cyan'
    case 'review':     return 'text-cmd-orange'
    case 'editing':    return 'text-cmd-yellow'
    case 'scripting':  return 'text-cmd-purple'
    case 'recording':  return 'text-cmd-red'
    case 'idea':       return 'text-slate-400'
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function agentStatusLabel(status: AgentStatus): string {
  switch (status) {
    case 'active':     return '● ACTIVE'
    case 'processing': return '◈ PROCESSING'
    case 'idle':       return '○ IDLE'
    case 'briefing':   return '◎ BRIEFING'
    case 'offline':    return '✕ OFFLINE'
  }
}
