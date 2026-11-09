import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search, Star, X } from 'lucide-react'
import {
  assets,
  generateCandles,
  generateOrderBook,
  generateTrades,
  getAsset,
  tickSize,
  timeframes,
  type OrderSide,
  type OrderType,
  type TimeframeId,
  type Trade,
} from '@/data/fixtures'
import { cancelOrder, placeOrder, toast, useAccount, useQuote, useQuotes } from '@/lib/store'
import { fmtAmount, fmtCompact, fmtDateTime, fmtPct, fmtPrice, fmtTime, fmtUsd } from '@/lib/format'
import { CandleChart } from '@/components/CandleChart'
import { CoinIcon } from '@/components/CoinIcon'

export const Route = createFileRoute('/trade')({
  // `pair` is optional so plain links to /trade stay valid; it defaults to BTC.
  validateSearch: (search: Record<string, unknown>): { pair?: string } => {
    const pair = typeof search.pair === 'string' ? search.pair.toUpperCase() : undefined
    return pair && getAsset(pair) ? { pair } : {}
  },
  head: ({ match }) => ({ meta: [{ title: `${match.search.pair ?? 'BTC'}/USDT · Trade · Cryptonize` }] }),
  component: TradePage,
})

function usePair() {
  return Route.useSearch().pair ?? 'BTC'
}

function TradePage() {
  const pair = usePair()
  const asset = getAsset(pair)!
  const quote = useQuote(pair)
  const [tf, setTf] = useState<TimeframeId>('1h')
  const candles = useMemo(() => generateCandles(asset, tf, 120), [asset, tf])
  const [picked, setPicked] = useState<{ symbol: string; price: number } | null>(null)

  return (
    <main className="mx-auto max-w-[1600px] p-2 sm:p-3">
      <PairBar />

      <div className="mt-2 grid gap-2 xl:grid-cols-[260px_1fr_300px_320px] lg:grid-cols-[1fr_300px]">
        <MarketList className="hidden xl:flex" />

        <section className="panel min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 border-b border-ink-700/70 px-3 py-2 text-sm">
            <span className="mr-2 text-ink-400">Waktu</span>
            {timeframes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTf(t.id)}
                className={`num rounded px-2 py-0.5 text-xs ${tf === t.id ? 'bg-ink-700 text-volt' : 'text-ink-300 hover:text-ink-100'}`}
              >
                {t.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-ink-400">Candlestick · MA20</span>
          </div>
          <CandleChart candles={candles} livePrice={quote.price} height={460} />
        </section>

        <OrderBook symbol={pair} onPick={(price) => setPicked({ symbol: pair, price })} />

        <OrderForm key={pair} symbol={pair} pickedPrice={picked?.symbol === pair ? picked.price : null} className="lg:col-span-2 xl:col-span-1" />
      </div>

      <OrdersPanel symbol={pair} />
    </main>
  )
}

/* ---------------------------- pair bar ---------------------------- */

function PairBar() {
  const pair = usePair()
  const asset = getAsset(pair)!
  const q = useQuote(pair)
  const [open, setOpen] = useState(false)
  const high = Math.max(asset.high24h, q.price)
  const low = Math.min(asset.low24h, q.price)

  return (
    <div className="panel relative flex flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-3 rounded-md pr-2 hover:bg-ink-800">
        <CoinIcon symbol={pair} size={34} />
        <div className="text-left">
          <div className="flex items-center gap-1 text-lg font-semibold">
            {pair}<span className="text-ink-400">/USDT</span>
            <ChevronDown className="h-4 w-4 text-ink-400" />
          </div>
          <div className="text-xs text-ink-400">{asset.name}</div>
        </div>
      </button>
      <div>
        <div key={q.tick} className={`num rounded px-1 text-2xl font-semibold ${q.dir === 'up' ? 'flash-up text-bull' : q.dir === 'down' ? 'flash-down text-bear' : ''}`}>
          {fmtPrice(q.price)}
        </div>
        <div className="num px-1 text-xs text-ink-400">≈ {fmtUsd(q.price)}</div>
      </div>
      <Stat label="Perubahan 24j" value={fmtPct(q.change24h)} tone={q.change24h >= 0 ? 'text-bull' : 'text-bear'} />
      <Stat label="Tertinggi 24j" value={fmtPrice(high)} />
      <Stat label="Terendah 24j" value={fmtPrice(low)} />
      <Stat label="Volume 24j" value={fmtCompact(asset.volume24h)} />
      <Stat label="Kap. Pasar" value={fmtCompact(asset.marketCap)} className="hidden md:block" />

      {open && (
        <div className="absolute left-2 top-full z-30 mt-2 h-[420px] w-[300px]">
          <MarketList className="flex h-full shadow-2xl" onPick={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, tone = '', className = '' }: { label: string; value: string; tone?: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs text-ink-400">{label}</div>
      <div className={`num text-sm ${tone}`}>{value}</div>
    </div>
  )
}

/* ---------------------------- market list ---------------------------- */

function MarketList({ className = '', onPick }: { className?: string; onPick?: () => void }) {
  const pair = usePair()
  const quotes = useQuotes()
  const [q, setQ] = useState('')
  const [favs, setFavs] = useState<string[]>(['BTC', 'ETH', 'SOL'])
  const [onlyFav, setOnlyFav] = useState(false)
  const list = assets.filter(
    (a) => (!onlyFav || favs.includes(a.symbol)) && (a.symbol + a.name).toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <aside className={`panel flex-col overflow-hidden ${className}`}>
      <div className="border-b border-ink-700/70 p-2">
        <label className="flex items-center gap-2 rounded-md bg-ink-800 px-2 py-1.5">
          <Search className="h-3.5 w-3.5 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari aset" className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400" />
        </label>
        <div className="mt-2 flex gap-1 text-xs">
          <button onClick={() => setOnlyFav(false)} className={`rounded px-2 py-0.5 ${!onlyFav ? 'bg-ink-700 text-ink-100' : 'text-ink-400'}`}>USDT</button>
          <button onClick={() => setOnlyFav(true)} className={`rounded px-2 py-0.5 ${onlyFav ? 'bg-ink-700 text-ink-100' : 'text-ink-400'}`}>Favorit</button>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-1.5 text-[11px] text-ink-400">
        <span>Pasangan</span><span className="text-right">Harga</span><span className="w-14 text-right">24j</span>
      </div>
      <ul className="scroll-thin flex-1 overflow-y-auto">
        {list.map((a) => {
          const qq = quotes[a.symbol]
          const fav = favs.includes(a.symbol)
          return (
            <li key={a.symbol}>
              <Link
                to="/trade"
                search={{ pair: a.symbol }}
                onClick={onPick}
                className={`grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-1.5 text-xs hover:bg-ink-800 ${a.symbol === pair ? 'bg-ink-800' : ''}`}
              >
                <span className="flex items-center gap-1.5">
                  <Star
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setFavs((f) => (fav ? f.filter((s) => s !== a.symbol) : [...f, a.symbol]))
                    }}
                    className={`h-3 w-3 ${fav ? 'fill-volt text-volt' : 'text-ink-600 hover:text-ink-300'}`}
                  />
                  <b className="font-semibold">{a.symbol}</b><span className="text-ink-400">/USDT</span>
                </span>
                <span className="num text-right">{fmtPrice(qq.price)}</span>
                <span className={`num w-14 text-right ${qq.change24h >= 0 ? 'text-bull' : 'text-bear'}`}>{fmtPct(qq.change24h)}</span>
              </Link>
            </li>
          )
        })}
        {list.length === 0 && <li className="px-3 py-6 text-center text-xs text-ink-400">Tidak ada aset yang cocok.</li>}
      </ul>
    </aside>
  )
}

/* ---------------------------- order book ---------------------------- */

function OrderBook({ symbol, onPick }: { symbol: string; onPick: (p: number) => void }) {
  const asset = getAsset(symbol)!
  const q = useQuote(symbol)
  const [tab, setTab] = useState<'book' | 'trades'>('book')
  const book = useMemo(() => generateOrderBook(q.price, symbol + q.tick, 12), [q.price, q.tick, symbol])
  const maxTotal = Math.max(book.asks[book.asks.length - 1].total, book.bids[book.bids.length - 1].total)
  const trades = useLiveTrades(symbol)
  const spread = book.asks[0].price - book.bids[0].price

  const Row = ({ l, side }: { l: { price: number; amount: number; total: number }; side: OrderSide }) => (
    <button onClick={() => onPick(l.price)} className="relative grid w-full grid-cols-3 px-3 py-[3px] text-[11.5px] hover:bg-ink-800">
      <span className={`absolute inset-y-0 right-0 ${side === 'buy' ? 'bg-bull/10' : 'bg-bear/10'}`} style={{ width: `${(l.total / maxTotal) * 100}%` }} />
      <span className={`num relative text-left ${side === 'buy' ? 'text-bull' : 'text-bear'}`}>{fmtPrice(l.price)}</span>
      <span className="num relative text-right">{fmtAmount(l.amount)}</span>
      <span className="num relative text-right text-ink-300">{fmtAmount(l.total)}</span>
    </button>
  )

  return (
    <section className="panel flex flex-col overflow-hidden">
      <div className="flex border-b border-ink-700/70 text-sm">
        {(['book', 'trades'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 ${tab === t ? 'border-b-2 border-volt text-ink-100' : 'text-ink-400'}`}>
            {t === 'book' ? 'Order Book' : 'Transaksi Terkini'}
          </button>
        ))}
      </div>
      {tab === 'book' ? (
        <>
          <div className="grid grid-cols-3 px-3 py-1.5 text-[11px] text-ink-400">
            <span>Harga (USDT)</span><span className="text-right">Jumlah ({asset.symbol})</span><span className="text-right">Total</span>
          </div>
          <div className="flex flex-col-reverse">{book.asks.map((l, i) => <Row key={i} l={l} side="sell" />)}</div>
          <div className="flex items-center justify-between border-y border-ink-700/70 bg-ink-850 px-3 py-2">
            <span className={`num text-base font-semibold ${q.dir === 'down' ? 'text-bear' : 'text-bull'}`}>{fmtPrice(q.price)}</span>
            <span className="num text-[11px] text-ink-400">Spread {fmtPrice(spread)}</span>
          </div>
          <div>{book.bids.map((l, i) => <Row key={i} l={l} side="buy" />)}</div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 px-3 py-1.5 text-[11px] text-ink-400">
            <span>Harga</span><span className="text-right">Jumlah</span><span className="text-right">Waktu</span>
          </div>
          <ul className="scroll-thin max-h-[520px] overflow-y-auto">
            {trades.map((t) => (
              <li key={t.id} className="grid grid-cols-3 px-3 py-[3px] text-[11.5px]">
                <span className={`num ${t.side === 'buy' ? 'text-bull' : 'text-bear'}`}>{fmtPrice(t.price)}</span>
                <span className="num text-right">{fmtAmount(t.amount)}</span>
                <span className="num text-right text-ink-400">{fmtTime(t.time)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function useLiveTrades(symbol: string) {
  const asset = getAsset(symbol)!
  const q = useQuote(symbol)
  const [trades, setTrades] = useState<Trade[]>(() => generateTrades(asset, 30))
  const last = useRef(symbol)
  useEffect(() => {
    if (last.current !== symbol) {
      last.current = symbol
      setTrades(generateTrades(asset, 30))
      return
    }
    if (q.tick === 0) return
    const tick = tickSize(q.price)
    setTrades((prev) => [
      {
        id: `${symbol}-live-${q.tick}`,
        price: q.price + (Math.random() - 0.5) * tick * 4,
        amount: (15_000 / q.price) * (0.05 + Math.random()),
        side: q.dir === 'down' ? 'sell' : 'buy',
        time: Date.now(),
      },
      ...prev.slice(0, 39),
    ])
  }, [q.tick, symbol]) // eslint-disable-line react-hooks/exhaustive-deps
  return trades
}

/* ---------------------------- order form ---------------------------- */

function OrderForm({ symbol, pickedPrice, className = '' }: { symbol: string; pickedPrice: number | null; className?: string }) {
  const q = useQuote(symbol)
  const balances = useAccount((a) => a.balances)
  const [side, setSide] = useState<OrderSide>('buy')
  const [type, setType] = useState<OrderType>('limit')
  const [price, setPrice] = useState(() => q.price.toFixed(decimals(q.price)))
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (pickedPrice != null) {
      setType('limit')
      setPrice(pickedPrice.toFixed(decimals(pickedPrice)))
    }
  }, [pickedPrice])

  const px = type === 'market' ? q.price : parseFloat(price) || 0
  const amt = parseFloat(amount) || 0
  const total = px * amt
  const available = side === 'buy' ? (balances.USDT ?? 0) : (balances[symbol] ?? 0)
  const fee = total * 0.001
  const buy = side === 'buy'

  const setPct = (pct: number) => {
    if (!px) return
    const a = buy ? (available * pct) / px : available * pct
    setAmount(a > 0 ? (Math.floor(a * 1e6) / 1e6).toString() : '')
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const res = placeOrder({ symbol, side, type, price: px, amount: amt })
    if (!res.ok) return toast(res.error, 'error')
    setAmount('')
    toast(
      res.order.status === 'filled'
        ? `${buy ? 'Beli' : 'Jual'} ${fmtAmount(amt)} ${symbol} @ ${fmtPrice(res.order.price)} berhasil`
        : `Order limit ${buy ? 'beli' : 'jual'} ${fmtAmount(amt)} ${symbol} @ ${fmtPrice(px)} dipasang`,
      'success',
    )
  }

  return (
    <section className={`panel p-3 ${className}`}>
      <div className="grid grid-cols-2 rounded-lg bg-ink-800 p-1 text-sm font-semibold">
        <button onClick={() => setSide('buy')} className={`rounded-md py-2 transition ${buy ? 'bg-bull text-ink-950' : 'text-ink-300'}`}>Beli</button>
        <button onClick={() => setSide('sell')} className={`rounded-md py-2 transition ${!buy ? 'bg-bear text-ink-950' : 'text-ink-300'}`}>Jual</button>
      </div>
      <div className="mt-3 flex gap-4 text-sm">
        {(['limit', 'market'] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={type === t ? 'text-volt' : 'text-ink-400 hover:text-ink-100'}>
            {t === 'limit' ? 'Limit' : 'Market'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-3 space-y-3">
        <div className="flex justify-between text-xs text-ink-400">
          <span>Tersedia</span>
          <span className="num text-ink-100">{fmtAmount(available)} {buy ? 'USDT' : symbol}</span>
        </div>
        <Field label="Harga" unit="USDT">
          {type === 'market' ? (
            <span className="num py-2 text-sm text-ink-400">Harga pasar terbaik</span>
          ) : (
            <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))} className="num w-full bg-transparent py-2 text-sm outline-none" />
          )}
        </Field>
        <Field label="Jumlah" unit={symbol}>
          <input inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} className="num w-full bg-transparent py-2 text-sm outline-none placeholder:text-ink-600" />
        </Field>
        <div className="grid grid-cols-4 gap-1">
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <button type="button" key={p} onClick={() => setPct(p)} className="rounded border border-ink-700 py-1 text-xs text-ink-300 hover:border-ink-400 hover:text-ink-100">
              {p * 100}%
            </button>
          ))}
        </div>
        <dl className="space-y-1.5 border-t border-ink-700/70 pt-3 text-xs">
          <div className="flex justify-between"><dt className="text-ink-400">Total</dt><dd className="num">{fmtAmount(total, 2)} USDT</dd></div>
          <div className="flex justify-between"><dt className="text-ink-400">Biaya (0,1%)</dt><dd className="num">{fmtAmount(fee, 4)} USDT</dd></div>
        </dl>
        <button type="submit" className={`w-full rounded-lg py-3 text-sm font-semibold text-ink-950 transition ${buy ? 'bg-bull hover:brightness-110' : 'bg-bear hover:brightness-110'}`}>
          {buy ? 'Beli' : 'Jual'} {symbol}
        </button>
      </form>

      <div className="mt-4 space-y-2 border-t border-ink-700/70 pt-3 text-xs">
        <div className="text-ink-400">Saldo akun</div>
        {['USDT', symbol].map((s) => (
          <div key={s} className="flex items-center justify-between">
            <span className="flex items-center gap-2"><CoinIcon symbol={s} size={18} />{s}</span>
            <span className="num">{fmtAmount(balances[s] ?? 0)}</span>
          </div>
        ))}
        <Link to="/wallet" className="block pt-1 text-volt hover:underline">Deposit / Lihat dompet →</Link>
      </div>
    </section>
  )
}

function Field({ label, unit, children }: { label: string; unit: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-850 px-3 focus-within:border-volt/60">
      <span className="w-14 shrink-0 text-xs text-ink-400">{label}</span>
      {children}
      <span className="shrink-0 text-xs text-ink-400">{unit}</span>
    </label>
  )
}

function decimals(p: number) {
  return p >= 1000 ? 2 : p >= 1 ? 4 : p >= 0.01 ? 5 : 8
}

/* ---------------------------- orders panel ---------------------------- */

function OrdersPanel({ symbol }: { symbol: string }) {
  const orders = useAccount((a) => a.orders)
  const [tab, setTab] = useState<'open' | 'history'>('open')
  const [onlyPair, setOnlyPair] = useState(false)
  const navigate = useNavigate()
  const list = orders.filter((o) => (tab === 'open' ? o.status === 'open' : o.status !== 'open') && (!onlyPair || o.symbol === symbol))
  const openCount = orders.filter((o) => o.status === 'open').length

  return (
    <section className="panel mt-2 overflow-hidden">
      <div className="flex items-center gap-4 border-b border-ink-700/70 px-3 text-sm">
        <button onClick={() => setTab('open')} className={`py-2.5 ${tab === 'open' ? 'border-b-2 border-volt' : 'text-ink-400'}`}>Order Terbuka ({openCount})</button>
        <button onClick={() => setTab('history')} className={`py-2.5 ${tab === 'history' ? 'border-b-2 border-volt' : 'text-ink-400'}`}>Riwayat Order</button>
        <label className="ml-auto flex items-center gap-2 text-xs text-ink-400">
          <input type="checkbox" checked={onlyPair} onChange={(e) => setOnlyPair(e.target.checked)} className="accent-[var(--color-volt)]" />
          Hanya {symbol}/USDT
        </label>
      </div>
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[760px] text-xs">
          <thead className="text-left text-ink-400">
            <tr>
              {['Waktu', 'Pasangan', 'Tipe', 'Sisi', 'Harga', 'Jumlah', 'Terisi', 'Total', tab === 'open' ? '' : 'Status'].map((h, i) => (
                <th key={i} className="px-3 py-2 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} className="border-t border-ink-700/50 hover:bg-ink-850">
                <td className="num px-3 py-2 text-ink-300">{fmtDateTime(o.createdAt)}</td>
                <td className="px-3 py-2">
                  <button onClick={() => navigate({ to: '/trade', search: { pair: o.symbol } })} className="font-semibold hover:text-volt">{o.symbol}/USDT</button>
                </td>
                <td className="px-3 py-2 capitalize">{o.type}</td>
                <td className={`px-3 py-2 font-medium ${o.side === 'buy' ? 'text-bull' : 'text-bear'}`}>{o.side === 'buy' ? 'Beli' : 'Jual'}</td>
                <td className="num px-3 py-2">{fmtPrice(o.price)}</td>
                <td className="num px-3 py-2">{fmtAmount(o.amount)}</td>
                <td className="num px-3 py-2">{((o.filled / o.amount) * 100).toFixed(0)}%</td>
                <td className="num px-3 py-2">{fmtAmount(o.amount * o.price, 2)} USDT</td>
                <td className="px-3 py-2">
                  {o.status === 'open' ? (
                    <button
                      onClick={() => {
                        cancelOrder(o.id)
                        toast(`Order ${o.symbol} dibatalkan`, 'info')
                      }}
                      className="inline-flex items-center gap-1 rounded border border-ink-700 px-2 py-0.5 text-ink-300 hover:border-bear hover:text-bear"
                    >
                      <X className="h-3 w-3" /> Batal
                    </button>
                  ) : (
                    <span className={o.status === 'filled' ? 'text-bull' : 'text-ink-400'}>{o.status === 'filled' ? 'Terisi' : 'Dibatalkan'}</span>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-ink-400">
                  {tab === 'open' ? 'Belum ada order terbuka.' : 'Belum ada riwayat order.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
