import { useEffect, useRef, useCallback, useState } from "react";

// Only connect WebSocket in development or if explicitly enabled
const WS_ENABLED = import.meta.env.DEV || import.meta.env.VITE_WS_ENABLED === 'true'

export function useAdminWS(onNewOrder) {
  const wsRef        = useRef(null)
  const retryRef     = useRef(null)
  const retryCount   = useRef(0)
  const isUnmounting = useRef(false)
  const [connected, setConnected] = useState(false)

  const connect = useCallback(() => {
    // Skip WebSocket entirely in production on Render
    if (!WS_ENABLED) {
      console.info('WebSocket disabled in production — using polling fallback')
      return
    }

    const WS_BASE = (import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000').replace(/\/$/, '')
    const token   = localStorage.getItem('access_token')
    const url     = `${WS_BASE}/ws/admin/notifications/?token=${token || ''}`

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        retryCount.current = 0
        clearTimeout(retryRef.current)
      }

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === 'new_order') onNewOrder(data)
        } catch {}
      }

      ws.onerror = () => {} // suppress — onclose handles retry

      ws.onclose = (e) => {
        setConnected(false)
        if (isUnmounting.current) return
        if (e.code === 1000) return
        // Exponential backoff, max 30s
        const delay = Math.min(2000 * 2 ** retryCount.current, 30000)
        retryCount.current += 1
        retryRef.current = setTimeout(connect, delay)
      }
    } catch {}
  }, [onNewOrder])

  useEffect(() => {
    isUnmounting.current = false
    connect()
    return () => {
      isUnmounting.current = true
      clearTimeout(retryRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close(1000, 'Unmount')
      }
    }
  }, [connect])

  return WS_ENABLED ? connected : false
}