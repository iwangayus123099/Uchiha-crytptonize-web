import { USDT_TO_IDR } from '@/data/fixtures'

export function fmtPrice(n: number) {
  if (n >= 1_000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (n >= 1) return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 4 })
  if (n >= 0.01) return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 5 })
  return n.toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 })
}

export function fmtAmount(n: number, max = 6) {
  const digits = n >= 1_000 ? 2 : n >= 1 ? 4 : max
  return n.toLocaleString('en-US', { maximumFractionDigits: digits })
}

export function fmtUsd(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtCompact(n: number) {
  return '$' + Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n)
}

export function fmtIdr(usdt: number) {
  return 'Rp ' + Math.round(usdt * USDT_TO_IDR).toLocaleString('id-ID')
}

export function fmtPct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

export function fmtTime(ms: number) {
  return new Date(ms).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Jakarta' })
}

export function fmtDateTime(ms: number) {
  return new Date(ms).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
}
