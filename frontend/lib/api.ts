const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

export const api = {
  agents: {
    list: () => fetchAPI('/agents/status'),
    activate: (id: string) => fetchAPI(`/agents/${id}/activate`, { method: 'POST' }),
  },
  brief: {
    daily: () => fetchAPI('/brief/daily'),
    generate: (prompt?: string) =>
      fetchAPI('/brief/generate', { method: 'POST', body: JSON.stringify({ prompt }) }),
  },
  commandCenter: {
    summary: () => fetchAPI('/command-center/summary'),
    leads: () => fetchAPI('/command-center/leads'),
    clients: () => fetchAPI('/command-center/clients'),
    tasks: () => fetchAPI('/command-center/tasks'),
    revenue: () => fetchAPI('/command-center/revenue'),
    logs: (limit = 50) => fetchAPI(`/command-center/logs?limit=${limit}`),
  },
  riley: {
    content: () => fetchAPI('/riley/content'),
    schedule: () => fetchAPI('/riley/schedule'),
  },
  voice: {
    speak: (text: string) =>
      fetchAPI('/voice/speak', { method: 'POST', body: JSON.stringify({ text }) }),
    transcribe: (formData: FormData) =>
      fetchAPI('/voice/transcribe', { method: 'POST', body: formData, headers: {} }),
  },
  bigHomie: {
    run: (message: string) =>
      fetchAPI('/bighomie/run', { method: 'POST', body: JSON.stringify({ message }) }),
  },
}

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
