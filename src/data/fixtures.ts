/**
 * Stubbed market, wallet and order data for Cryptonize.
 *
 * Everything in this file is sample data. A later milestone replaces it with a
 * real price feed (exchange API / websocket) and per-user records stored in
 * Netlify Database. Keep the exported shapes stable so screens don't change.
 */

export type Asset = {
  symbol: string
  name: string
  price: number // in USDT
  change24h: number // percent
  high24h: number
  low24h: number
  volume24h: number // in USDT
  marketCap: number // in USDT
  category: 'Layer 1' | 'Layer 2' | 'DeFi' | 'Meme' | 'Stablecoin' | 'AI'
  color: string
}

export type Candle = {
  t: number
  o: number
  h: number
  l: number
  c: number
  v: number
}

export type BookLevel = { price: number; amount: number; total: number }

export type Trade = {
  id: string
  price: number
  amount: number
  side: 'buy' | 'sell'
  time: number
}

export type OrderSide = 'buy' | 'sell'
export type OrderType = 'limit' | 'market'

export type Order = {
  id: string
  symbol: string
  side: OrderSide
  type: OrderType
  price: number
  amount: number
  filled: number
  status: 'open' | 'filled' | 'cancelled'
  createdAt: number
}

export type Transaction = {
  id: string
  kind: 'deposit' | 'withdraw' | 'buy' | 'sell'
  symbol: string
  amount: number
  valueUsdt: number
  status: 'Selesai' | 'Diproses'
  createdAt: number
}

/** Fixed reference time so SSR and client render the same stubbed history. */
export const FIXTURE_NOW = Date.UTC(2026, 9, 21, 2, 0, 0)

export const USDT_TO_IDR = 16_350

export const assets: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 98_420.5, change24h: 2.84, high24h: 99_310, low24h: 95_480, volume24h: 32_810_000_000, marketCap: 1_942_000_000_000, category: 'Layer 1', color: '#f7931a' },
  { symbol: 'ETH', name: 'Ethereum', price: 3_812.42, change24h: 1.36, high24h: 3_874.1, low24h: 3_701.9, volume24h: 17_240_000_000, marketCap: 458_600_000_000, category: 'Layer 1', color: '#8a92b2' },
  { symbol: 'SOL', name: 'Solana', price: 214.86, change24h: 5.92, high24h: 218.4, low24h: 201.2, volume24h: 4_920_000_000, marketCap: 101_300_000_000, category: 'Layer 1', color: '#14f195' },
  { symbol: 'BNB', name: 'BNB', price: 684.3, change24h: -0.74, high24h: 693.5, low24h: 676.1, volume24h: 1_820_000_000, marketCap: 99_800_000_000, category: 'Layer 1', color: '#f3ba2f' },
  { symbol: 'XRP', name: 'XRP', price: 2.418, change24h: -2.15, high24h: 2.497, low24h: 2.381, volume24h: 3_610_000_000, marketCap: 138_900_000_000, category: 'Layer 1', color: '#23292f' },
  { symbol: 'ADA', name: 'Cardano', price: 0.9821, change24h: 3.48, high24h: 0.9977, low24h: 0.9402, volume24h: 912_000_000, marketCap: 34_700_000_000, category: 'Layer 1', color: '#0033ad' },
  { symbol: 'AVAX', name: 'Avalanche', price: 42.17, change24h: -1.22, high24h: 43.6, low24h: 41.5, volume24h: 688_000_000, marketCap: 17_200_000_000, category: 'Layer 1', color: '#e84142' },
  { symbol: 'ARB', name: 'Arbitrum', price: 1.184, change24h: 7.41, high24h: 1.21, low24h: 1.093, volume24h: 524_000_000, marketCap: 5_100_000_000, category: 'Layer 2', color: '#28a0f0' },
  { symbol: 'OP', name: 'Optimism', price: 2.731, change24h: 4.06, high24h: 2.79, low24h: 2.6, volume24h: 318_000_000, marketCap: 3_700_000_000, category: 'Layer 2', color: '#ff0420' },
  { symbol: 'LINK', name: 'Chainlink', price: 24.63, change24h: 0.88, high24h: 25.1, low24h: 24.02, volume24h: 742_000_000, marketCap: 15_400_000_000, category: 'DeFi', color: '#2a5ada' },
  { symbol: 'UNI', name: 'Uniswap', price: 13.94, change24h: -3.37, high24h: 14.6, low24h: 13.71, volume24h: 296_000_000, marketCap: 8_400_000_000, category: 'DeFi', color: '#ff007a' },
  { symbol: 'AAVE', name: 'Aave', price: 312.5, change24h: 2.11, high24h: 318.9, low24h: 302.4, volume24h: 401_000_000, marketCap: 4_700_000_000, category: 'DeFi', color: '#b6509e' },
  { symbol: 'FET', name: 'Fetch.ai', price: 1.692, change24h: 9.84, high24h: 1.72, low24h: 1.52, volume24h: 612_000_000, marketCap: 4_300_000_000, category: 'AI', color: '#1d2b53' },
  { symbol: 'RNDR', name: 'Render', price: 8.415, change24h: 6.27, high24h: 8.6, low24h: 7.86, volume24h: 389_000_000, marketCap: 4_400_000_000, category: 'AI', color: '#cf1011' },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.3872, change24h: -4.61, high24h: 0.411, low24h: 0.381, volume24h: 2_940_000_000, marketCap: 57_000_000_000, category: 'Meme', color: '#c2a633' },
  { symbol: 'PEPE', name: 'Pepe', price: 0.00002184, change24h: 12.6, high24h: 0.0000224, low24h: 0.0000192, volume24h: 1_870_000_000, marketCap: 9_200_000_000, category: 'Meme', color: '#479f53' },
  { symbol: 'USDC', name: 'USD Coin', price: 1.0001, change24h: 0.01, high24h: 1.0004, low24h: 0.9997, volume24h: 6_210_000_000, marketCap: 44_100_000_000, category: 'Stablecoin', color: '#2775ca' },
]

export const categories = ['Semua', 'Layer 1', 'Layer 2', 'DeFi', 'AI', 'Meme', 'Stablecoin'] as const

export function getAsset(symbol: string): Asset | undefined {
  return assets.find((a) => a.symbol === symbol.toUpperCase())
}

/* ------------------------------------------------------------------ */
/* Deterministic generators — same output on server and client         */
/* ------------------------------------------------------------------ */

function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const timeframes = [
  { id: '15m', label: '15m', ms: 15 * 60_000 },
  { id: '1h', label: '1J', ms: 60 * 60_000 },
  { id: '4h', label: '4J', ms: 4 * 60 * 60_000 },
  { id: '1d', label: '1H', ms: 24 * 60 * 60_000 },
] as const
export type TimeframeId = (typeof timeframes)[number]['id']

/** Random-walk candles that end exactly at the asset's current price. */
export function generateCandles(asset: Asset, tf: TimeframeId, count = 90): Candle[] {
  const frame = timeframes.find((t) => t.id === tf) ?? timeframes[1]
  const rand = seeded(hash(asset.symbol + tf))
  const vol = { '15m': 0.004, '1h': 0.008, '4h': 0.016, '1d': 0.032 }[tf]
  const closes: number[] = [asset.price]
  for (let i = 1; i < count; i++) {
    const drift = (asset.change24h / 100) * (frame.ms / 86_400_000) * 0.6
    const step = (rand() - 0.5) * 2 * vol + drift
    closes.unshift(closes[0] / (1 + step))
  }
  return closes.map((c, i) => {
    const o = i === 0 ? c * (1 + (rand() - 0.5) * vol) : closes[i - 1]
    const h = Math.max(o, c) * (1 + rand() * vol * 0.7)
    const l = Math.min(o, c) * (1 - rand() * vol * 0.7)
    const v = (asset.volume24h / (86_400_000 / frame.ms)) * (0.4 + rand() * 1.2)
    return { t: FIXTURE_NOW - (count - 1 - i) * frame.ms, o, h, l, c, v }
  })
}

/** 24 points of hourly closes for small sparkline charts. */
export function sparkline(asset: Asset, points = 24): number[] {
  return generateCandles(asset, '1h', points).map((c) => c.c)
}

export function generateOrderBook(price: number, seedKey: string, depth = 14) {
  const rand = seeded(hash(seedKey + Math.round(price * 1000)))
  const tick = tickSize(price)
  const asks: BookLevel[] = []
  const bids: BookLevel[] = []
  let askTotal = 0
  let bidTotal = 0
  for (let i = 0; i < depth; i++) {
    const askAmt = baseAmount(price) * (0.2 + rand() * 2.4)
    const bidAmt = baseAmount(price) * (0.2 + rand() * 2.4)
    askTotal += askAmt
    bidTotal += bidAmt
    asks.push({ price: price + tick * (i + 1) * (1 + rand() * 0.6), amount: askAmt, total: askTotal })
    bids.push({ price: price - tick * (i + 1) * (1 + rand() * 0.6), amount: bidAmt, total: bidTotal })
  }
  return { asks, bids }
}

export function generateTrades(asset: Asset, count = 24): Trade[] {
  const rand = seeded(hash(asset.symbol + 'trades'))
  const tick = tickSize(asset.price)
  return Array.from({ length: count }, (_, i) => ({
    id: `${asset.symbol}-t${i}`,
    price: asset.price + (rand() - 0.5) * tick * 12,
    amount: baseAmount(asset.price) * (0.05 + rand() * 1.5),
    side: (rand() > 0.48 ? 'buy' : 'sell') as Trade['side'],
    time: FIXTURE_NOW - i * (4_000 + Math.floor(rand() * 9_000)),
  }))
}

export function tickSize(price: number) {
  if (price >= 10_000) return 0.5
  if (price >= 1_000) return 0.05
  if (price >= 100) return 0.01
  if (price >= 1) return 0.001
  if (price >= 0.01) return 0.00001
  return 0.00000001
}

function baseAmount(price: number) {
  // ~ $15k notional per level
  return 15_000 / price
}

/* ------------------------------------------------------------------ */
/* Demo account                                                        */
/* ------------------------------------------------------------------ */

export const demoUser = {
  name: 'Raka Pratama',
  email: 'raka@cryptonize.id',
  tier: 'VIP 1',
  kyc: 'Terverifikasi',
}

/** Starting balances for the demo account (asset amount, not value). */
export const initialBalances: Record<string, number> = {
  USDT: 12_480.35,
  BTC: 0.1842,
  ETH: 2.315,
  SOL: 38.6,
  ARB: 1_250,
  LINK: 64.2,
  FET: 2_100,
  DOGE: 8_400,
}

export const initialOrders: Order[] = [
  { id: 'ord-1042', symbol: 'BTC', side: 'buy', type: 'limit', price: 96_200, amount: 0.025, filled: 0, status: 'open', createdAt: FIXTURE_NOW - 3_600_000 * 2 },
  { id: 'ord-1039', symbol: 'ETH', side: 'sell', type: 'limit', price: 3_980, amount: 0.8, filled: 0.15, status: 'open', createdAt: FIXTURE_NOW - 3_600_000 * 7 },
  { id: 'ord-1031', symbol: 'SOL', side: 'buy', type: 'market', price: 201.4, amount: 12, filled: 12, status: 'filled', createdAt: FIXTURE_NOW - 3_600_000 * 26 },
  { id: 'ord-1027', symbol: 'ARB', side: 'buy', type: 'limit', price: 1.02, amount: 1_250, filled: 1_250, status: 'filled', createdAt: FIXTURE_NOW - 3_600_000 * 51 },
  { id: 'ord-1019', symbol: 'DOGE', side: 'sell', type: 'limit', price: 0.45, amount: 3_000, filled: 0, status: 'cancelled', createdAt: FIXTURE_NOW - 3_600_000 * 80 },
]

export const initialTransactions: Transaction[] = [
  { id: 'tx-9921', kind: 'deposit', symbol: 'USDT', amount: 5_000, valueUsdt: 5_000, status: 'Selesai', createdAt: FIXTURE_NOW - 3_600_000 * 5 },
  { id: 'tx-9917', kind: 'buy', symbol: 'SOL', amount: 12, valueUsdt: 2_416.8, status: 'Selesai', createdAt: FIXTURE_NOW - 3_600_000 * 26 },
  { id: 'tx-9904', kind: 'withdraw', symbol: 'ETH', amount: 0.5, valueUsdt: 1_874.2, status: 'Diproses', createdAt: FIXTURE_NOW - 3_600_000 * 30 },
  { id: 'tx-9890', kind: 'buy', symbol: 'ARB', amount: 1_250, valueUsdt: 1_275, status: 'Selesai', createdAt: FIXTURE_NOW - 3_600_000 * 51 },
  { id: 'tx-9871', kind: 'deposit', symbol: 'BTC', amount: 0.05, valueUsdt: 4_612.5, status: 'Selesai', createdAt: FIXTURE_NOW - 3_600_000 * 96 },
  { id: 'tx-9850', kind: 'sell', symbol: 'DOGE', amount: 4_000, valueUsdt: 1_412, status: 'Selesai', createdAt: FIXTURE_NOW - 3_600_000 * 140 },
]

/** 30 days of total portfolio value (USDT) for the wallet chart. */
export function portfolioHistory(endValue: number, days = 30): { t: number; v: number }[] {
  const rand = seeded(hash('portfolio'))
  const vals = [endValue]
  for (let i = 1; i < days; i++) vals.unshift(vals[0] / (1 + (rand() - 0.42) * 0.045))
  return vals.map((v, i) => ({ t: FIXTURE_NOW - (days - 1 - i) * 86_400_000, v }))
}
