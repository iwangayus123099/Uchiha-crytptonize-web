/**
 * Session state for the demo: simulated live prices and the demo account.
 * Lives in memory only — Milestone 2/3 in PLAN.md replace it with a real price
 * feed and per-user records in Netlify Database.
 */
import { Store, useSelector } from '@tanstack/react-store'
import { useEffect } from 'react'
import {
  assets,
  initialBalances,
  initialOrders,
  initialTransactions,
  FIXTURE_NOW,
  type Order,
  type OrderSide,
  type OrderType,
  type Transaction,
} from '@/data/fixtures'

/* ---------------------------- market ---------------------------- */

export type Quote = { price: number; change24h: number; dir: 'up' | 'down' | null; tick: number }

export const marketStore = new Store<Record<string, Quote>>(
  Object.fromEntries(assets.map((a) => [a.symbol, { price: a.price, change24h: a.change24h, dir: null, tick: 0 }])),
)

let feedStarted = false

/** Starts the simulated price feed once, in the browser only. */
export function useMarketFeed() {
  useEffect(() => {
    if (feedStarted) return
    feedStarted = true
    const id = window.setInterval(() => {
      marketStore.setState((prev) => {
        const next: Record<string, Quote> = {}
        for (const a of assets) {
          const q = prev[a.symbol]
          const vol = a.category === 'Stablecoin' ? 0.00005 : a.category === 'Meme' ? 0.003 : 0.0012
          const move = (Math.random() - 0.5) * 2 * vol
          const price = q.price * (1 + move)
          next[a.symbol] = {
            price,
            change24h: q.change24h + move * 100,
            dir: move === 0 ? q.dir : move > 0 ? 'up' : 'down',
            tick: q.tick + 1,
          }
        }
        return next
      })
      matchLimitOrders()
    }, 1500)
    return () => {
      window.clearInterval(id)
      feedStarted = false
    }
  }, [])
}

export function useQuote(symbol: string) {
  return useSelector(marketStore, (s) => s[symbol])
}

export function useQuotes() {
  return useSelector(marketStore)
}

/* ---------------------------- account ---------------------------- */

type Account = {
  balances: Record<string, number>
  orders: Order[]
  transactions: Transaction[]
}

export const accountStore = new Store<Account>({
  balances: { ...initialBalances },
  orders: initialOrders,
  transactions: initialTransactions,
})

export function useAccount<T>(selector: (a: Account) => T) {
  return useSelector(accountStore, selector)
}

let orderSeq = 1043

type PlaceOrderInput = { symbol: string; side: OrderSide; type: OrderType; price: number; amount: number }

/** Validates funds, reserves them, and fills market orders immediately. */
export function placeOrder(input: PlaceOrderInput): { ok: true; order: Order } | { ok: false; error: string } {
  const { symbol, side, type, amount } = input
  const price = type === 'market' ? marketStore.state[symbol].price : input.price
  if (!(amount > 0)) return { ok: false, error: 'Jumlah harus lebih dari 0.' }
  if (!(price > 0)) return { ok: false, error: 'Harga tidak valid.' }

  const { balances } = accountStore.state
  const cost = price * amount
  if (side === 'buy' && (balances.USDT ?? 0) < cost) return { ok: false, error: 'Saldo USDT tidak mencukupi.' }
  if (side === 'sell' && (balances[symbol] ?? 0) < amount) return { ok: false, error: `Saldo ${symbol} tidak mencukupi.` }

  const order: Order = {
    id: `ord-${orderSeq++}`,
    symbol,
    side,
    type,
    price,
    amount,
    filled: type === 'market' ? amount : 0,
    status: type === 'market' ? 'filled' : 'open',
    createdAt: Date.now(),
  }

  accountStore.setState((prev) => {
    const b = { ...prev.balances }
    // Reserve funds on placement; filled orders credit the other side.
    if (side === 'buy') b.USDT = (b.USDT ?? 0) - cost
    else b[symbol] = (b[symbol] ?? 0) - amount
    if (order.status === 'filled') credit(b, order)
    return {
      ...prev,
      balances: b,
      orders: [order, ...prev.orders],
      transactions: order.status === 'filled' ? [toTx(order), ...prev.transactions] : prev.transactions,
    }
  })
  return { ok: true, order }
}

export function cancelOrder(id: string) {
  accountStore.setState((prev) => {
    const order = prev.orders.find((o) => o.id === id)
    if (!order || order.status !== 'open') return prev
    const b = { ...prev.balances }
    const remaining = order.amount - order.filled
    if (order.side === 'buy') b.USDT = (b.USDT ?? 0) + remaining * order.price
    else b[order.symbol] = (b[order.symbol] ?? 0) + remaining
    return { ...prev, balances: b, orders: prev.orders.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)) }
  })
}

export function simulateDeposit(symbol: string, amount: number) {
  accountStore.setState((prev) => ({
    ...prev,
    balances: { ...prev.balances, [symbol]: (prev.balances[symbol] ?? 0) + amount },
    transactions: [
      {
        id: `tx-${Math.floor(Math.random() * 90000) + 10000}`,
        kind: 'deposit',
        symbol,
        amount,
        valueUsdt: amount * (symbol === 'USDT' ? 1 : marketStore.state[symbol]?.price ?? 0),
        status: 'Selesai',
        createdAt: Date.now(),
      },
      ...prev.transactions,
    ],
  }))
}

function credit(b: Record<string, number>, o: Order) {
  if (o.side === 'buy') b[o.symbol] = (b[o.symbol] ?? 0) + o.amount
  else b.USDT = (b.USDT ?? 0) + o.amount * o.price
}

function toTx(o: Order): Transaction {
  return {
    id: `tx-${o.id.slice(4)}`,
    kind: o.side,
    symbol: o.symbol,
    amount: o.amount,
    valueUsdt: o.amount * o.price,
    status: 'Selesai',
    createdAt: Math.max(Date.now(), FIXTURE_NOW),
  }
}

/** Fills open limit orders whose price has been crossed by the simulated feed. */
function matchLimitOrders() {
  const quotes = marketStore.state
  const filled: Order[] = []
  accountStore.setState((prev) => {
    let changed = false
    const b = { ...prev.balances }
    const orders = prev.orders.map((o) => {
      if (o.status !== 'open') return o
      const p = quotes[o.symbol]?.price
      const hit = o.side === 'buy' ? p <= o.price : p >= o.price
      if (!hit) return o
      changed = true
      const done = { ...o, filled: o.amount, status: 'filled' as const }
      credit(b, { ...done, amount: o.amount - o.filled })
      filled.push(done)
      return done
    })
    if (!changed) return prev
    return { balances: b, orders, transactions: [...filled.map(toTx), ...prev.transactions] }
  })
  for (const o of filled) toast(`Order ${o.side === 'buy' ? 'beli' : 'jual'} ${o.symbol} terisi penuh`, 'success')
}

/* ---------------------------- toasts ---------------------------- */

export type Toast = { id: number; message: string; tone: 'success' | 'error' | 'info' }
export const toastStore = new Store<Toast[]>([])
let toastSeq = 0

export function toast(message: string, tone: Toast['tone'] = 'info') {
  const id = ++toastSeq
  toastStore.setState((t) => [...t, { id, message, tone }])
  window.setTimeout(() => toastStore.setState((t) => t.filter((x) => x.id !== id)), 3800)
}
