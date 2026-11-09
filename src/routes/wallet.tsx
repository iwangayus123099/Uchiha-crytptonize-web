import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { Chart as ChartJS, ArcElement, CategoryScale, Filler, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import { ArrowDownToLine, ArrowUpFromLine, Eye, EyeOff, ShieldCheck, X } from 'lucide-react'
import { demoUser, getAsset, portfolioHistory, type Transaction } from '@/data/fixtures'
import { accountStore, marketStore, simulateDeposit, toast, useAccount, useQuotes } from '@/lib/store'
import { fmtAmount, fmtDateTime, fmtIdr, fmtPct, fmtPrice, fmtUsd } from '@/lib/format'
import { CoinIcon } from '@/components/CoinIcon'

ChartJS.register(ArcElement, CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip)

export const Route = createFileRoute('/wallet')({
  head: () => ({ meta: [{ title: 'Dompet · Cryptonize' }] }),
  component: WalletPage,
})

const kindLabel: Record<Transaction['kind'], string> = { deposit: 'Deposit', withdraw: 'Penarikan', buy: 'Beli', sell: 'Jual' }

function WalletPage() {
  const balances = useAccount((a) => a.balances)
  const txs = useAccount((a) => a.transactions)
  const quotes = useQuotes()
  const [hidden, setHidden] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dialog, setDialog] = useState<{ mode: 'deposit' | 'withdraw'; symbol: string } | null>(null)
  const [txFilter, setTxFilter] = useState<'all' | Transaction['kind']>('all')
  useEffect(() => setMounted(true), [])

  const holdings = Object.entries(balances)
    .filter(([, amt]) => amt > 0)
    .map(([symbol, amount]) => {
      const price = symbol === 'USDT' ? 1 : (quotes[symbol]?.price ?? 0)
      const change = symbol === 'USDT' ? 0 : (quotes[symbol]?.change24h ?? 0)
      return { symbol, name: symbol === 'USDT' ? 'Tether' : (getAsset(symbol)?.name ?? symbol), amount, price, change, value: amount * price }
    })
    .sort((a, b) => b.value - a.value)
  const total = holdings.reduce((s, h) => s + h.value, 0)
  const pnl = holdings.reduce((s, h) => s + h.value - h.value / (1 + h.change / 100), 0)
  const pnlPct = (pnl / (total - pnl)) * 100
  const history = useMemo(() => portfolioHistory(42_000), [])
  const scale = total / history[history.length - 1].v
  const mask = (s: string) => (hidden ? '••••••' : s)

  const palette = holdings.map((h) => (h.symbol === 'USDT' ? '#26a17b' : (getAsset(h.symbol)?.color ?? '#6b7890')))

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dompet</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink-400">
            {demoUser.name} · <ShieldCheck className="h-4 w-4 text-bull" /> KYC {demoUser.kyc}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDialog({ mode: 'deposit', symbol: 'USDT' })} className="inline-flex items-center gap-2 rounded-lg bg-volt px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-volt-dim">
            <ArrowDownToLine className="h-4 w-4" /> Deposit
          </button>
          <button onClick={() => setDialog({ mode: 'withdraw', symbol: 'USDT' })} className="inline-flex items-center gap-2 rounded-lg border border-ink-600 px-4 py-2 text-sm font-medium hover:border-ink-400">
            <ArrowUpFromLine className="h-4 w-4" /> Tarik
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <section className="panel p-5">
          <div className="flex items-center gap-2 text-sm text-ink-400">
            Estimasi total saldo
            <button onClick={() => setHidden((h) => !h)} aria-label={hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'} className="hover:text-ink-100">
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="num mt-2 text-4xl font-semibold tracking-tight">{mask(fmtUsd(total))}</div>
          <div className="mt-1 flex flex-wrap gap-x-4 text-sm">
            <span className="num text-ink-400">≈ {mask(fmtIdr(total))}</span>
            <span className={`num ${pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
              PnL hari ini {mask(`${pnl >= 0 ? '+' : '-'}${fmtUsd(Math.abs(pnl))}`)} ({fmtPct(pnlPct)})
            </span>
          </div>
          <div className="mt-5 h-52">
            {mounted && (
              <Line
                data={{
                  labels: history.map((p) => new Date(p.t).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })),
                  datasets: [
                    {
                      data: history.map((p) => p.v * scale),
                      borderColor: '#c6f432',
                      borderWidth: 2,
                      pointRadius: 0,
                      tension: 0.35,
                      fill: true,
                      backgroundColor: (ctx) => {
                        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height)
                        g.addColorStop(0, 'rgba(198,244,50,0.25)')
                        g.addColorStop(1, 'rgba(198,244,50,0)')
                        return g
                      },
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  interaction: { intersect: false, mode: 'index' },
                  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => (hidden ? '••••' : fmtUsd(c.parsed.y ?? 0)) } } },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#6b7890', maxTicksLimit: 6 } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7890', display: !hidden, callback: (v) => `$${(Number(v) / 1000).toFixed(0)}k` } },
                  },
                }}
              />
            )}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-sm text-ink-400">Alokasi aset</h2>
          <div className="mt-4 flex items-center gap-6">
            <div className="relative h-40 w-40 shrink-0">
              {mounted && (
                <Doughnut
                  data={{ labels: holdings.map((h) => h.symbol), datasets: [{ data: holdings.map((h) => h.value), backgroundColor: palette, borderWidth: 0 }] }}
                  options={{ cutout: '72%', plugins: { legend: { display: false }, tooltip: { enabled: !hidden } } }}
                />
              )}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-ink-400">Aset</span>
                <span className="num text-xl font-semibold">{holdings.length}</span>
              </div>
            </div>
            <ul className="flex-1 space-y-1.5 text-sm">
              {holdings.slice(0, 6).map((h, i) => (
                <li key={h.symbol} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: palette[i] }} />{h.symbol}</span>
                  <span className="num text-ink-300">{((h.value / total) * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="panel scroll-thin mt-3 overflow-x-auto">
        <div className="border-b border-ink-700/70 px-5 py-3 text-sm font-semibold">Aset saya</div>
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-xs text-ink-400">
            <tr>
              <th className="px-5 py-2.5 font-normal">Aset</th>
              <th className="px-5 py-2.5 text-right font-normal">Jumlah</th>
              <th className="px-5 py-2.5 text-right font-normal">Harga</th>
              <th className="px-5 py-2.5 text-right font-normal">24j</th>
              <th className="px-5 py-2.5 text-right font-normal">Nilai</th>
              <th className="px-5 py-2.5 text-right font-normal">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.symbol} className="border-t border-ink-700/40 hover:bg-ink-850">
                <td className="px-5 py-3">
                  <span className="flex items-center gap-3">
                    <CoinIcon symbol={h.symbol} />
                    <span><span className="block font-semibold">{h.symbol}</span><span className="text-xs text-ink-400">{h.name}</span></span>
                  </span>
                </td>
                <td className="num px-5 py-3 text-right">{mask(fmtAmount(h.amount))}</td>
                <td className="num px-5 py-3 text-right text-ink-300">${fmtPrice(h.price)}</td>
                <td className={`num px-5 py-3 text-right ${h.change >= 0 ? 'text-bull' : 'text-bear'}`}>{fmtPct(h.change)}</td>
                <td className="num px-5 py-3 text-right font-medium">{mask(fmtUsd(h.value))}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3 text-xs">
                    <button onClick={() => setDialog({ mode: 'deposit', symbol: h.symbol })} className="text-volt hover:underline">Deposit</button>
                    <button onClick={() => setDialog({ mode: 'withdraw', symbol: h.symbol })} className="text-ink-300 hover:text-ink-100">Tarik</button>
                    {h.symbol !== 'USDT' && <Link to="/trade" search={{ pair: h.symbol }} className="text-ink-300 hover:text-ink-100">Trade</Link>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel scroll-thin mt-3 overflow-x-auto">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-700/70 px-5 py-3">
          <span className="mr-auto text-sm font-semibold">Riwayat transaksi</span>
          {(['all', 'deposit', 'withdraw', 'buy', 'sell'] as const).map((k) => (
            <button key={k} onClick={() => setTxFilter(k)} className={`rounded-full px-3 py-1 text-xs ${txFilter === k ? 'bg-ink-700 text-ink-100' : 'text-ink-400 hover:text-ink-100'}`}>
              {k === 'all' ? 'Semua' : kindLabel[k]}
            </button>
          ))}
        </div>
        <table className="w-full min-w-[680px] text-sm">
          <tbody>
            {txs
              .filter((t) => txFilter === 'all' || t.kind === txFilter)
              .map((t) => (
                <tr key={t.id} className="border-t border-ink-700/40 first:border-0">
                  <td className="num px-5 py-3 text-xs text-ink-400">{fmtDateTime(t.createdAt)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${t.kind === 'deposit' || t.kind === 'buy' ? 'bg-bull/10 text-bull' : 'bg-bear/10 text-bear'}`}>{kindLabel[t.kind]}</span>
                  </td>
                  <td className="px-5 py-3"><span className="flex items-center gap-2"><CoinIcon symbol={t.symbol} size={20} />{t.symbol}</span></td>
                  <td className="num px-5 py-3 text-right">{mask(fmtAmount(t.amount))}</td>
                  <td className="num px-5 py-3 text-right text-ink-300">{mask(fmtUsd(t.valueUsdt))}</td>
                  <td className={`px-5 py-3 text-right text-xs ${t.status === 'Selesai' ? 'text-bull' : 'text-volt'}`}>{t.status}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {dialog && <TransferDialog {...dialog} onClose={() => setDialog(null)} />}
    </main>
  )
}

const depositMethods = ['Virtual Account BCA', 'QRIS', 'GoPay', 'Jaringan blockchain'] as const

function TransferDialog({ mode, symbol: initial, onClose }: { mode: 'deposit' | 'withdraw'; symbol: string; onClose: () => void }) {
  const balances = useAccount((a) => a.balances)
  const [symbol, setSymbol] = useState(initial)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<string>(depositMethods[0])
  const [address, setAddress] = useState('')
  const deposit = mode === 'deposit'
  const available = balances[symbol] ?? 0
  const amt = parseFloat(amount) || 0

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!(amt > 0)) return toast('Masukkan jumlah yang valid.', 'error')
    if (deposit) {
      simulateDeposit(symbol, amt)
      toast(`Deposit ${fmtAmount(amt)} ${symbol} via ${method} berhasil`, 'success')
    } else {
      if (amt > available) return toast(`Saldo ${symbol} tidak mencukupi.`, 'error')
      if (address.trim().length < 8) return toast('Alamat tujuan tidak valid.', 'error')
      const price = symbol === 'USDT' ? 1 : (marketStore.state[symbol]?.price ?? 0)
      accountStore.setState((prev) => ({
        ...prev,
        balances: { ...prev.balances, [symbol]: available - amt },
        transactions: [
          { id: `tx-w${Date.now()}`, kind: 'withdraw', symbol, amount: amt, valueUsdt: amt * price, status: 'Diproses', createdAt: Date.now() },
          ...prev.transactions,
        ],
      }))
      toast(`Penarikan ${fmtAmount(amt)} ${symbol} sedang diproses`, 'info')
    }
    onClose()
  }

  const symbols = ['USDT', ...Object.keys(balances).filter((s) => s !== 'USDT')]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="rise panel w-full max-w-md p-6 shadow-2xl" role="dialog" aria-modal="true" aria-label={deposit ? 'Deposit' : 'Tarik'}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{deposit ? 'Deposit aset' : 'Tarik aset'}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-ink-400 hover:text-ink-100"><X className="h-5 w-5" /></button>
        </div>

        <label className="mt-5 block text-xs text-ink-400">Aset</label>
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm outline-none focus:border-volt/60">
          {symbols.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {deposit ? (
          <>
            <label className="mt-4 block text-xs text-ink-400">Metode</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {depositMethods.map((m) => (
                <button type="button" key={m} onClick={() => setMethod(m)} className={`rounded-lg border px-3 py-2 text-left text-xs ${method === m ? 'border-volt bg-volt/10 text-ink-100' : 'border-ink-700 text-ink-300 hover:border-ink-600'}`}>
                  {m}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <label className="mt-4 block text-xs text-ink-400">Alamat tujuan</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x… atau bc1…" className="num mt-1 w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm outline-none focus:border-volt/60" />
          </>
        )}

        <div className="mt-4 flex justify-between text-xs text-ink-400">
          <label>Jumlah</label>
          {!deposit && <button type="button" onClick={() => setAmount(String(available))} className="num hover:text-volt">Maks: {fmtAmount(available)} {symbol}</button>}
        </div>
        <input inputMode="decimal" autoFocus value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="num mt-1 w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2.5 text-lg outline-none focus:border-volt/60" />

        <p className="mt-3 text-xs text-ink-400">
          {deposit ? 'Akun demo: dana langsung masuk ke saldo Anda.' : 'Biaya jaringan ditanggung Cryptonize untuk akun VIP. Penarikan diproses dalam 1–10 menit.'}
        </p>

        <button type="submit" className="mt-5 w-full rounded-lg bg-volt py-3 text-sm font-semibold text-ink-950 hover:bg-volt-dim">
          {deposit ? 'Konfirmasi deposit' : 'Konfirmasi penarikan'}
        </button>
      </form>
    </div>
  )
}
