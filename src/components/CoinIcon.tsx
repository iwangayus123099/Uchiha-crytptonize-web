import { getAsset } from '@/data/fixtures'

export function CoinIcon({ symbol, size = 28 }: { symbol: string; size?: number }) {
  const color = symbol === 'USDT' ? '#26a17b' : (getAsset(symbol)?.color ?? '#2a3445')
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-1 ring-white/10"
      style={{ width: size, height: size, background: `radial-gradient(circle at 30% 25%, ${color}, ${color}aa 60%, #0a0e15)`, fontSize: size * 0.36 }}
      aria-hidden
    >
      {symbol.slice(0, symbol.length > 3 ? 2 : 1)}
    </span>
  )
}
