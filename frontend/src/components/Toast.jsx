import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const STYLES = {
  success: { ring: 'border-emerald-200 bg-emerald-50', icon: CheckCircle2, color: 'text-emerald-600' },
  error: { ring: 'border-rose-200 bg-rose-50', icon: AlertTriangle, color: 'text-rose-600' },
  info: { ring: 'border-stone-200 bg-white', icon: Info, color: 'text-stone-600' },
}

export default function Toast({ toast, onClose }) {
  if (!toast) return null
  const style = STYLES[toast.type] || STYLES.info
  const Icon = style.icon

  return (
    <div className="fixed top-5 right-5 z-[100] max-w-sm">
      <div
        role="status"
        className={`flex items-start gap-3 rounded-xl border ${style.ring} px-4 py-3 shadow-lg shadow-stone-900/5`}
      >
        <Icon size={18} className={`${style.color} mt-0.5 shrink-0`} />
        <p className="text-sm text-stone-700 leading-snug">{toast.message}</p>
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="ml-1 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
