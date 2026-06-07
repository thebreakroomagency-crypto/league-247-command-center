'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { statusColor } from '@/lib/utils'
import type { AgentGraph, AgentStatus } from '@/lib/types'

const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  { ssr: false, loading: () => <GraphSkeleton /> }
)

interface AgentNetworkGraphProps {
  graph: AgentGraph
  activeAgentId?: string | null
  onNodeClick?: (nodeId: string) => void
}

export function AgentNetworkGraph({ graph, activeAgentId, onNodeClick }: AgentNetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 320 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const drawNode = useCallback((node: { id?: string | number; name?: string; color?: string; status?: AgentStatus; val?: number; x?: number; y?: number }, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const { x = 0, y = 0, name = '', color = '#ff6b00', status = 'idle', val = 8, id } = node as { id: string; name: string; color: string; status: AgentStatus; val: number; x: number; y: number }
    const isCenter = id === 'BIG_HOMIE'
    const isActive = id === activeAgentId
    const radius = isCenter ? 18 : (val ?? 8)
    const nodeColor = statusColor(status as AgentStatus)

    // Outer glow
    const glowRadius = isCenter ? radius * 2.5 : radius * 2
    const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, glowRadius)
    gradient.addColorStop(0, color + '60')
    gradient.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.arc(x, y, glowRadius, 0, 2 * Math.PI)
    ctx.fillStyle = gradient
    ctx.fill()

    // Pulse ring for active/processing
    if (status === 'active' || status === 'processing' || isActive) {
      ctx.beginPath()
      ctx.arc(x, y, radius + 4, 0, 2 * Math.PI)
      ctx.strokeStyle = color + '80'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Main circle
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = '#0c0c14'
    ctx.fill()
    ctx.strokeStyle = isActive ? color : color + 'cc'
    ctx.lineWidth = isCenter ? 2.5 : 1.5
    ctx.stroke()

    // Status dot
    ctx.beginPath()
    ctx.arc(x, y, radius * 0.35, 0, 2 * Math.PI)
    ctx.fillStyle = nodeColor
    ctx.fill()

    // Label
    const fontSize = isCenter ? 10 / globalScale : 8 / globalScale
    ctx.font = `bold ${Math.max(6, fontSize)}px 'JetBrains Mono', monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = isCenter ? '#ff6b00' : '#e2e8f0'
    ctx.fillText(name as string, x, y + radius + 10 / globalScale)
  }, [activeAgentId])

  return (
    <div className="panel-glass h-full flex flex-col">
      <PanelHeader title="AGENT NETWORK" subtitle="League 247 · 12-Agent Roster" />
      <div ref={containerRef} className="flex-1 relative min-h-0">
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graph}
          nodeCanvasObject={drawNode}
          nodeCanvasObjectMode={() => 'replace'}
          linkColor={() => 'rgba(255,107,0,0.15)'}
          linkWidth={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleColor={() => '#ff6b00'}
          backgroundColor="transparent"
          onNodeClick={(node) => onNodeClick?.(String(node.id))}
          cooldownTicks={80}
          enableNodeDrag={false}
          nodeRelSize={4}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,107,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
    </div>
  )
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-cmd-border">
      <div>
        <h2 className="font-display text-xs font-bold text-cmd-orange tracking-widest">{title}</h2>
        <p className="font-mono text-[10px] text-slate-600 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex gap-1">
        {['active', 'processing', 'idle'].map((s) => (
          <div key={s} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor(s as AgentStatus) }} />
            <span className="font-mono text-[9px] text-slate-600">{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function GraphSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="font-mono text-xs text-cmd-orange"
      >
        INITIALIZING NETWORK...
      </motion.div>
    </div>
  )
}
