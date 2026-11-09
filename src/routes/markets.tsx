import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowDown, ArrowUp, Flame, Search, TrendingDown, TrendingUp } from 'lucide-react'
import { assets, categories, sparkline } from '@/data/fixtures'
import { useQuotes } from '@/lib/store'
import { fmtCompact, fmtPct, fmtPrice } from '@/lib/format'
import { CoinIcon } from '@/components/CoinIcon'
import { Sparkline } from '@/components/Sparkline'

export const Route = createFileRoute('/markets')({
  head: () => ({ meta: [{ title: 'Pasar Kripto · Cryptonize' }] }),
  component: MarketsPage,
})

type SortKey = 'marketCap' | 'price' | 'change24h' | 'volume24h'

const sparks = Object.fromEntries(assets.map((a) => [a.symbol, sparkline(a)]))

function MarketsPage() {
  const quotes = useQuotes()
  const [cat, setCat] = useState<(typeof categories)[number]>('Semua')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'marketCap', dir: -1 })

  const rows = assets
    .map((a) => ({ ...a, price: quotes[a.symbol].price, change24h: quotes[a.symbol].change24h }))
    .filter((a) => (cat === 'Semua' || a.category === cat) && (a.symbol + a.name).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a[sort.key] - b[sort.key]) * sort.dir)

  const live = assets.map((a) => ({ ...a, change24h: quotes[a.symbol].change24h }))
  const gainers = [...live].sort((a, b) => b.change24h - a.change24h).slice(0, 3)
  const losers = [...live].sort((a, b) => a.change24h - b.change24h).slice(0, 3)
  const hot = [...live].sort((a, b) => b.volume24h - a.volume24h).slice(0, 3)
  const totalCap = assets.reduce((s, a) => s + a.marketCap, 0)
  const totalVol = assets.reduce((s, a) => s + a.volume24h, 0)

  const toggle = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }))

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Pasar</h1>
          <p className="mt-1 text-sm text-ink-400">
            Kapitalisasi pasar <span className="num text-ink-100">{fmtCompact(totalCap)}</span> · Volume 24j{' '}
            <span className="num text-ink-100">{fmtCompact(totalVol)}</span>
          </p>
        </div>
        <label className="flex w-full items-center gap-2 rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 sm:w-72 focus-within:border-volt/60">
          <Search className="h-4 w-4 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau simbol" className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400" />
        </label>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Highlight title="Kenaikan teratas" icon={<TrendingUp className="h-4 w-4 text-bull" />} items={gainers} />
        <Highlight title="Penurunan teratas" icon={<TrendingDown className="h-4 w-4 text-bear" />} items={losers} />
        <Highlight title="Volume tertinggi" icon={<Flame className="h-4 w-4 text-volt" />} items={hot} />
      </div>

      <div className="scroll-thin mt-8 flex gap-1 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition ${cat === c ? 'bg-volt text-ink-950 font-semibold' : 'bg-ink-900 text-ink-300 hover:text-ink-100'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="panel scroll-thin mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="text-left text-xs text-ink-400">
            <tr className="border-b border-ink-700/70">
              <th className="w-10 px-4 py-3 font-normal">#</th>
              <th className="px-4 py-3 font-normal">Aset</th>
              <SortTh label="Harga" k="price" sort={sort} onClick={toggle} />
              <SortTh label="24j" k="change24h" sort={sort} onClick={toggle} />
              <SortTh label="Volume 24j" k="volume24h" sort={sort} onClick={toggle} />
              <SortTh label="Kap. Pasar" k="marketCap" sort={sort} onClick={toggle} />
              <th className="px-4 py-3 text-right font-normal">24 jam terakhir</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((a, i) => (
              <tr key={a.symbol} className="border-b border-ink-700/40 transition last:border-0 hover:bg-ink-850">
                <td className="num px-4 py-3 text-ink-400">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link to="/trade" search={{ pair: a.symbol }} className="flex items-center gap-3">
                    <CoinIcon symbol={a.symbol} />
                    <span>
                      <span className="block font-semibold">{a.name}</span>
                      <span className="text-xs text-ink-400">{a.symbol} · {a.category}</span>
                    </span>
                  </Link>
                </td>
                <td className="num px-4 py-3 text-right">${fmtPrice(a.price)}</td>
                <td className={`num px-4 py-3 text-right ${a.change24h >= 0 ? 'text-bull' : 'text-bear'}`}>{fmtPct(a.change24h)}</td>
                <td className="num px-4 py-3 text-right text-ink-300">{fmtCompact(a.volume24h)}</td>
                <td className="num px-4 py-3 text-right text-ink-300">{fmtCompact(a.marketCap)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Sparkline data={sparks[a.symbol]} width={110} height={32} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to="/trade" search={{ pair: a.symbol }} className="rounded-md border border-ink-600 px-3 py-1.5 text-xs font-medium hover:border-volt hover:text-volt">
                    Trade
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-14 text-center text-ink-400">Tidak ada aset yang cocok dengan “{q}”.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}

function SortTh({ label, k, sort, onClick }: { label: string; k: SortKey; sort: { key: SortKey; dir: 1 | -1 }; onClick: (k: SortKey) => void }) {
  const active = sort.key === k
  return (
    <th className="px-4 py-3 text-right font-normal">
      <button onClick={() => onClick(k)} className={`inline-flex items-center gap-1 ${active ? 'text-ink-100' : 'hover:text-ink-100'}`}>
        {label}
        {active && (sort.dir === -1 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />)}
      </button>
    </th>
  )
}

function Highlight({ title, icon, items }: { title: string; icon: React.ReactNode; items: { symbol: string; name: string; change24h: number }[] }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 text-sm text-ink-300">{icon}{title}</div>
      <ul className="mt-3 space-y-2">
        {items.map((a) => (
          <li key={a.symbol}>
            <Link to="/trade" search={{ pair: a.symbol }} className="flex items-center justify-between rounded-md px-1 py-1 hover:bg-ink-800">
              <span className="flex items-center gap-2 text-sm">
                <CoinIcon symbol={a.symbol} size={20} />
                <b className="font-semibold">{a.symbol}</b>
                <span className="text-xs text-ink-400">{a.name}</span>
              </span>
              <span className={`num text-sm ${a.change24h >= 0 ? 'text-bull' : 'text-bear'}`}>{fmtPct(a.change24h)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
