import { useSelector } from '@tanstack/react-store'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { toastStore } from '@/lib/store'

export function Toaster() {
  const toasts = useSelector(toastStore)
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-80 flex-col gap-2" aria-live="polite">
      {toasts.map((t) => {
        const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'error' ? AlertTriangle : Info
        const tone = t.tone === 'success' ? 'text-bull' : t.tone === 'error' ? 'text-bear' : 'text-volt'
        return (
          <div key={t.id} className="rise pointer-events-auto flex items-start gap-3 rounded-lg border border-ink-700 bg-ink-850/95 px-4 py-3 text-sm shadow-2xl backdrop-blur">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} />
            <span>{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
