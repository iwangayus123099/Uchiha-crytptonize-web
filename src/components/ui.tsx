import type { ReactNode } from 'react'

export const fieldCls =
  'w-full rounded-md border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-100 outline-none transition focus:border-volt'
export const btnCls =
  'rounded-md bg-volt px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-volt-dim disabled:opacity-50'
export const btnGhostCls =
  'rounded-md border border-ink-700 px-3 py-1.5 text-sm text-ink-300 transition hover:border-ink-600 hover:text-ink-100'
export const btnDangerCls = 'rounded-md border border-bear/40 px-3 py-1.5 text-sm text-bear transition hover:bg-bear/10'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-ink-300">{label}</span>
      {children}
    </label>
  )
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700">
      <div className="h-full bg-bull transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-ink-100">{title}</h1>
      {sub && <p className="mt-1 text-sm text-ink-400">{sub}</p>}
    </div>
  )
}
