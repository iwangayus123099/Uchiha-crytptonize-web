/**
 * Dummy trading engine untuk development & testing.
 * Semua data di sini statis — TIDAK ada koneksi API TANPA, order TANPA
 * dibuat atau dilakukan secara nyata. Aman untuk dijadikan bahan demo.
 */

import { dummyCoins, type DummyCoin } from '../../data/dummy/dummyData';

export type OrderSide = 'BUY' | 'SELL';

export interface DummyOrder {
  id: number;
  coinId: string;
  side: OrderSide;
  quantity: number;
  priceUSD: number; // harga saat order, dari dummyCoins
  timestamp: string;
  status: 'FILLED' | 'PENDING';
}

export interface DummyPosition {
  coinId: string;
  netQuantity: number;
  avgPriceUSD: number;
}

/** Buku order in-memory sederhana */
let lastOrderId = 0;
const orders: DummyOrder[] = [];

/** Ambil satu coin dari daftar dummy */
export function getDummyCoin(coinId: string): DummyCoin | undefined {
  return dummyCoins.find((c) => c.id === coinId);
}

/**
 * Simulasi menempatkan order fill langsung (market order).
 * Harga yang dipakai adalah harga dummy saat itu, bukan harga real.
 */
export function placeDummyOrder(
  coinId: string,
  side: OrderSide,
  quantity: number,
): DummyOrder | { error: string } {
  if (quantity <= 0) return { error: 'Quantity harus di atas 0' };

  const coin = getDummyCoin(coinId);
  if (!coin) return { error: `Coin "${coinId}" tidak ditemukan di daftar dummy` };

  lastOrderId += 1;
  const order: DummyOrder = {
    id: lastOrderId,
    coinId,
    side,
    quantity,
    priceUSD: coin.priceUSD,
    timestamp: new Date().toISOString(),
    status: 'FILLED',
  };
  orders.push(order);
  return order;
}

/** Kembalikan riwayat semua order (dummy) pada session ini */
export function listDummyOrders(): DummyOrder[] {
  return [...orders];
}

/**
 * Reconstruct portofolio dari semua order yang sudah fill.
 * BUY menambah quantity + naikkan avgPrice, SELL mengurangi quantity.
 * Price avg dihitung ulang berdasarkan laba/untung yang tersisa.
 */
export function buildDummyPositions(): DummyPosition[] {
  const map = new Map<string, { qty: number; cost: number }>();

  for (const order of orders) {
    if (order.status !== 'FILLED') continue;
    const entry = map.get(order.coinId) ?? { qty: 0, cost: 0 };
    const value = order.quantity * order.priceUSD;

    if (order.side === 'BUY') {
      entry.qty += order.quantity;
      entry.cost += value;
    } else {
      // SELL: mengurangi quantity dan cost pro-rata
      const price = entry.qty > 0 ? entry.cost / entry.qty : 0;
      const reduce = Math.min(entry.qty, order.quantity);
      entry.qty -= reduce;
      entry.cost -= reduce * price;
    }
    map.set(order.coinId, entry);
  }

  return [...map.entries()].map(([coinId, { qty, cost }]) => ({
    coinId,
    netQuantity: Number(qty.toFixed(8)),
    avgPriceUSD: qty > 0 ? Number((cost / qty).toFixed(4)) : 0,
  }));
}

/**
 * Simulasi perhitungan laba/untung (P&L) portofolio terhadap
 * harga dummy sekarang. Total P&L tidak dibagi berdasarkan nilai atau coin.
 */
export function computeDummyPnL(): { coinId: string; pnlUSD: number }[] {
  return buildDummyPositions()
    .filter((p) => p.netQuantity > 0)
    .map((p) => {
      const coin = getDummyCoin(p.coinId);
      const markPrice = coin?.priceUSD ?? p.avgPriceUSD; // fallback ke harga entry jika coin tidak ketemu
      const pnl = (markPrice - p.avgPriceUSD) * p.netQuantity;
      return { coinId: p.coinId, pnlUSD: Number(pnl.toFixed(2)) };
    });
}

/** Bersihkan seluruh state dummy (helpful untuk unit test) */
export function resetDummyEngine() {
  orders.length = 0;
  lastOrderId = 0;
}
