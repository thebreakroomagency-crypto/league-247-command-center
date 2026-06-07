'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, Loader2, X } from 'lucide-react'

interface VoiceAssistantProps {
  onCommand?: (transcript: string, response: string) => void
  onLogEvent?: (text: string) => void
}

type VoiceState = 'idle' | 'recording' | 'processing' | 'speaking' | 'error'

export function VoiceAssistant({ onCommand, onLogEvent }: VoiceAssistantProps) {
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudio(blob)
      }

      recorder.start()
      setState('recording')
    } catch {
      setError('Microphone access denied. Allow mic in browser settings.')
      setState('error')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setState('processing')
    }
  }, [])

  const processAudio = async (blob: Blob) => {
    // --- Whisper STT ---
    let text = ''
    try {
      const formData = new FormData()
      formData.append('file', blob, 'recording.webm')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voice/transcribe`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        text = data.transcript || ''
      }
    } catch {
      // Backend offline — use simulated response for MVP
      text = '[Voice input — backend offline]'
    }

    setTranscript(text)

    // --- BIG HOMIE via Claude ---
    let reply = ''
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bighomie/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (res.ok) {
        const data = await res.json()
        reply = data.response || ''
      }
    } catch {
      reply = text.toLowerCase().includes('run big homie')
        ? "What's up Rob — BIG HOMIE is online. Generating your Daily Command Brief now. Three critical priorities today: Tanya Rivera needs a call, Riley's reel needs approval, and the Holt proposal is due Friday."
        : `BIG HOMIE received: "${text}". Backend offline — running in mock mode.`
    }

    setResponse(reply)
    onCommand?.(text, reply)
    onLogEvent?.(`[VOICE] ${text}`)

    // --- ElevenLabs TTS ---
    setState('speaking')
    try {
      const ttsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voice/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply }),
      })
      if (ttsRes.ok) {
        const audioBlob = await ttsRes.blob()
        const url = URL.createObjectURL(audioBlob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => { setState('idle'); URL.revokeObjectURL(url) }
        await audio.play()
      } else {
        setState('idle')
      }
    } catch {
      setState('idle')
    }
  }

  const handleMicClick = () => {
    if (state === 'recording') stopRecording()
    else if (state === 'idle' || state === 'error') startRecording()
  }

  const stopSpeaking = () => {
    audioRef.current?.pause()
    setState('idle')
  }

  return (
    <>
      {/* Floating voice button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cmd-panel border-2 border-cmd-orange flex items-center justify-center shadow-orange-glow"
      >
        <Mic className="w-6 h-6 text-cmd-orange" />
        {(state === 'recording' || state === 'speaking') && (
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-cmd-orange opacity-50"
          />
        )}
      </motion.button>

      {/* Voice panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-80 panel-glass border border-cmd-border rounded-xl overflow-hidden shadow-orange-glow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-cmd-border bg-cmd-orange/5">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${state === 'idle' ? 'bg-slate-600' : 'bg-cmd-orange animate-pulse'}`} />
                <span className="font-display text-xs font-bold text-cmd-orange tracking-widest">VOICE — BIG HOMIE</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Mic button */}
              <div className="flex flex-col items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMicClick}
                  disabled={state === 'processing' || state === 'speaking'}
                  className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
                    state === 'recording'
                      ? 'border-cmd-red bg-cmd-red/20 shadow-[0_0_20px_rgba(255,34,0,0.5)]'
                      : 'border-cmd-orange bg-cmd-orange/10 hover:bg-cmd-orange/20'
                  } disabled:opacity-40`}
                >
                  {state === 'processing' ? (
                    <Loader2 className="w-7 h-7 text-cmd-orange animate-spin" />
                  ) : state === 'speaking' ? (
                    <Volume2 className="w-7 h-7 text-cmd-green animate-pulse" />
                  ) : state === 'recording' ? (
                    <MicOff className="w-7 h-7 text-cmd-red" />
                  ) : (
                    <Mic className="w-7 h-7 text-cmd-orange" />
                  )}
                </motion.button>

                <div className="font-mono text-xs text-center text-slate-400">
                  {state === 'idle' && 'Tap mic — speak to BIG HOMIE'}
                  {state === 'recording' && (
                    <span className="text-cmd-red animate-pulse">● RECORDING — Tap to stop</span>
                  )}
                  {state === 'processing' && (
                    <span className="text-cmd-orange">PROCESSING via Whisper...</span>
                  )}
                  {state === 'speaking' && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-cmd-green">BIG HOMIE SPEAKING</span>
                      <button onClick={stopSpeaking} className="text-[10px] text-slate-500 underline">stop</button>
                    </div>
                  )}
                  {state === 'error' && <span className="text-cmd-red">{error}</span>}
                </div>
              </div>

              {/* Waveform viz */}
              {state === 'recording' && (
                <div className="flex items-center justify-center gap-0.5 h-8">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [`${4 + Math.random() * 20}px`, `${4 + Math.random() * 28}px`] }}
                      transition={{ duration: 0.3 + Math.random() * 0.3, repeat: Infinity, repeatType: 'reverse' }}
                      className="w-1 bg-cmd-red rounded-full"
                    />
                  ))}
                </div>
              )}

              {/* Transcript */}
              {transcript && (
                <div className="bg-slate-900/60 border border-slate-700/50 rounded p-2">
                  <div className="font-mono text-[9px] text-slate-500 mb-1">YOU SAID:</div>
                  <div className="font-mono text-xs text-white">{transcript}</div>
                </div>
              )}

              {/* Response */}
              {response && (
                <div className="bg-cmd-orange/5 border border-cmd-orange/30 rounded p-2">
                  <div className="font-mono text-[9px] text-cmd-orange mb-1">BIG HOMIE:</div>
                  <div className="font-mono text-xs text-slate-300 leading-relaxed">{response}</div>
                </div>
              )}

              <p className="font-mono text-[9px] text-slate-600 text-center">
                Try: "Run BIG HOMIE" or "What's the pipeline?"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
