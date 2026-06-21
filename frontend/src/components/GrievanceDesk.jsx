import { useEffect, useRef, useState } from 'react'
import { Send, Loader2, MessageSquareHeart } from 'lucide-react'
import { api } from '../api'

const CATEGORY_TONE = {
  Canteen: 'bg-teal-100 text-teal-700',
  Hostel: 'bg-cyan-100 text-cyan-700',
  Maintenance: 'bg-amber-100 text-amber-700',
  Safety: 'bg-rose-100 text-rose-700',
  General: 'bg-stone-200 text-stone-600',
}

const GREETING = {
  bot: true,
  text:
    "Hi! I'm the SustainIQ support assistant. Tell me about any issue — canteen, hostel, " +
    'maintenance, safety, or anything else — and I’ll route it to the right place.',
}

export default function GrievanceDesk({ showToast }) {
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, sending])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setMessages((prev) => [...prev, { bot: false, text }])
    setInput('')
    setSending(true)
    try {
      const result = await api.submitGrievance(text)
      const { category, reply } = result.data
      setMessages((prev) => [...prev, { bot: true, text: reply, category }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { bot: true, text: `Sorry — I couldn’t log that. ${err.message}` },
      ])
      showToast(err.message, 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden flex flex-col h-[560px]">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-100">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-emerald-600 text-white">
            <MessageSquareHeart size={18} />
          </span>
          <div>
            <p className="font-semibold text-stone-800">Campus Support Desk</p>
            <p className="text-xs text-stone-500">Rule-based triage · routes your concern to the right office</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-soft p-5 space-y-4 bg-stone-50/60">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.bot ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.bot
                    ? 'bg-white border border-stone-200 text-stone-700'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {msg.category && (
                  <span
                    className={`inline-block mb-1.5 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      CATEGORY_TONE[msg.category] || CATEGORY_TONE.General
                    }`}
                  >
                    {msg.category}
                  </span>
                )}
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-stone-200 rounded-2xl px-4 py-2.5 text-sm text-stone-400 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Logging your concern…
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-stone-100 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Describe your issue (e.g. the water tap in A-103 is broken)…"
            className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="grid place-items-center w-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 text-white transition-colors"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
