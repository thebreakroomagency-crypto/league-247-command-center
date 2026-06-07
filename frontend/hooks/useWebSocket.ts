'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import type { WebSocketEvent } from '@/lib/types'

interface UseWebSocketOptions {
  onMessage?: (event: WebSocketEvent) => void
  onConnect?: () => void
  onDisconnect?: () => void
  reconnectDelay?: number
}

export function useWebSocket(path: string, options: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [connected, setConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null)

  const connect = useCallback(() => {
    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000') + path

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        options.onConnect?.()
      }

      ws.onmessage = (e) => {
        try {
          const event: WebSocketEvent = JSON.parse(e.data)
          setLastEvent(event)
          options.onMessage?.(event)
        } catch {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        setConnected(false)
        options.onDisconnect?.()
        // reconnect
        reconnectTimer.current = setTimeout(connect, options.reconnectDelay ?? 3000)
      }

      ws.onerror = () => {
        ws.close()
      }
    } catch {
      reconnectTimer.current = setTimeout(connect, options.reconnectDelay ?? 3000)
    }
  }, [path]) // eslint-disable-line react-hooks/exhaustive-deps

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { connected, lastEvent, send }
}
