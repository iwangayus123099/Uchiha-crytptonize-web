import { useEffect, useMemo, useRef, useState } from 'react'
import type { Candle } from '@/data/fixtures'
import { fmtAmount, fmtPrice } from '@/lib/format'

const PAD_R = 72
const PAD_B = 22
const VOL_H = 0.18

/** Candlestick chart with volume, MA(20) and a crosshair readout. */
export function CandleChart({ candles, livePrice, height = 420 }: { candles: Candle[]; livePrice?: number; height?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(900)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(320, e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Fold the live price into the last candle so the chart moves with the feed.
  const data = useMemo(() => {
    if (!livePrice || !candles.length) return candles
    const last = candles[candles.length - 1]
    return [...candles.slice(0, -1), { ...last, c: livePrice, h: Math.max(last.h, livePrice), l: Math.min(last.l, livePrice) }]
  }, [candles, livePrice])

  const plotW = width - PAD_R
  const plotH = height - PAD_B
  const priceH = plotH * (1 - VOL_H) - 8
  const hi = Math.max(...data.map((c) => c.h))
  const lo = Math.min(...data.map((c) => c.l))
  const range = hi - lo || 1
  const top = hi + range * 0.06
  const bot = lo - range * 0.06
  const y = (p: number) => ((top - p) / (top - bot)) * priceH
  const step = plotW / data.length
  const bodyW = Math.max(1.5, step * 0.62)
  const maxVol = Math.max(...data.map((c) => c.v))

  const ma = data.map((_, i) => {
    if (i < 19) return null
    let s = 0
    for (let j = i - 19; j <= i; j++) s += data[j].c
    return s / 20
  })
  const maPath = ma
    .map((v, i) => (v == null ? '' : `${ma[i - 1] == null ? 'M' : 'L'}${(i * step + step / 2).toFixed(1)},${y(v).toFixed(1)}`))
    .join(' ')

  const ticks = Array.from({ length: 6 }, (_, i) => bot + ((top - bot) * i) / 5)
  const last = data[data.length - 1]
  const lastUp = last.c >= last.o
  const shown = hover != null ? data[hover] : last
  const timeLabels = data.map((c, i) => ({ i, c })).filter(({ i }) => i % Math.ceil(data.length / 6) === 0)

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      <div className="num pointer-events-none absolute left-3 top-2 z-10 flex flex-wrap gap-x-3 text-[11px] text-ink-400">
        <span>O <b className="font-normal text-ink-100">{fmtPrice(shown.o)}</b></span>
        <span>H <b className="font-normal text-ink-100">{fmtPrice(shown.h)}</b></span>
        <span>L <b className="font-normal text-ink-100">{fmtPrice(shown.l)}</b></span>
        <span>C <b className={`font-normal ${shown.c >= shown.o ? 'text-bull' : 'text-bear'}`}>{fmtPrice(shown.c)}</b></span>
        <span>Vol <b className="font-normal text-ink-100">{fmtAmount(shown.v / shown.c)}</b></span>
        <span className="text-volt">MA20</span>
      </div>
      <svg
        width={width}
        height={height}
        className="block"
        onMouseMove={(e) => {
          const x = e.clientX - e.currentTarget.getBoundingClientRect().left
          const i = Math.floor(x / step)
          setHover(i >= 0 && i < data.length ? i : null)
        }}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Chart candlestick, harga terakhir ${fmtPrice(last.c)}`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={0} x2={plotW} y1={y(t)} y2={y(t)} stroke="rgb(255 255 255 / 0.05)" />
            <text x={plotW + 8} y={y(t) + 4} className="num" fontSize="10.5" fill="var(--color-ink-400)">
              {fmtPrice(t)}
            </text>
          </g>
        ))}
        {timeLabels.map(({ i, c }) => (
          <text key={i} x={i * step + step / 2} y={height - 6} fontSize="10.5" textAnchor="middle" fill="var(--color-ink-400)" className="num">
            {new Date(c.t).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })}
          </text>
        ))}

        {data.map((c, i) => {
          const up = c.c >= c.o
          const color = up ? 'var(--color-bull)' : 'var(--color-bear)'
          const cx = i * step + step / 2
          const vh = (c.v / maxVol) * plotH * VOL_H
          return (
            <g key={c.t}>
              <rect x={cx - bodyW / 2} y={plotH - vh} width={bodyW} height={vh} fill={color} opacity={0.22} />
              <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth={1} />
              <rect
                x={cx - bodyW / 2}
                y={y(Math.max(c.o, c.c))}
                width={bodyW}
                height={Math.max(1, Math.abs(y(c.o) - y(c.c)))}
                fill={color}
                rx={0.5}
              />
            </g>
          )
        })}

        <path d={maPath} fill="none" stroke="var(--color-volt)" strokeWidth={1.3} opacity={0.85} />

        <line x1={0} x2={plotW} y1={y(last.c)} y2={y(last.c)} stroke={lastUp ? 'var(--color-bull)' : 'var(--color-bear)'} strokeDasharray="3 3" opacity={0.7} />
        <rect x={plotW + 2} y={y(last.c) - 9} width={PAD_R - 4} height={18} rx={3} fill={lastUp ? 'var(--color-bull)' : 'var(--color-bear)'} />
        <text x={plotW + 8} y={y(last.c) + 4} fontSize="10.5" fill="#05070b" fontWeight={600} className="num">
          {fmtPrice(last.c)}
        </text>

        {hover != null && (
          <g pointerEvents="none">
            <line x1={hover * step + step / 2} x2={hover * step + step / 2} y1={0} y2={plotH} stroke="rgb(255 255 255 / 0.25)" strokeDasharray="2 3" />
            <rect x={hover * step + step / 2 - bodyW / 2 - 2} y={0} width={bodyW + 4} height={plotH} fill="rgb(255 255 255 / 0.03)" />
          </g>
        )}
      </svg>
    </div>
  )
}
