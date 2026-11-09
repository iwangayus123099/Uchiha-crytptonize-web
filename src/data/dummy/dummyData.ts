/**
 * Dummy data untuk keperluan testing / development.
 * Data di sini statis dan tidak mengambil dari API manapun.
 */

export interface DummyCoin {
  id: string;
  name: string;
  ticker: string;
  priceUSD: number; // harga fiktif
  change24h: number; // persen
}

export interface DummyQuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

/** Harga koin fiktif */
export const dummyCoins: DummyCoin[] = [
  { id: 'testcoin', name: 'Test Coin', ticker: 'TST', priceUSD: 0.42, change24h: +3.7 },
  { id: 'mockbtc', name: 'Mock Bitcoin', ticker: 'MBTC', priceUSD: 64250, change24h: -1.2 },
  { id: 'fakeeth', name: 'Fake Ether', ticker: 'FETH', priceUSD: 3120.5, change24h: +0.8 },
  { id: 'dumdoge', name: 'Dummy Doge', ticker: 'DDGE', priceUSD: 0.081, change24h: +12.4 },
  { id: 'sampcoin', name: 'Sample Coin', ticker: 'SMPL', priceUSD: 1.0, change24h: 0.0 },
];

/** Soal kuis edukasi crypto (dummy) */
export const dummyQuiz: DummyQuizQuestion[] = [
  {
    question: 'Apa itu wallet hot?',
    options: [
      'Wallet yang disimpan di tempat sejuk',
      'Wallet yang terhubung ke internet',
      'Wallet khusus membeli Bitcoin',
      'Wallet hanya untuk token NFT',
    ],
    answerIndex: 1,
    explanation:
      'Hot wallet adalah dompet crypto yang terhubung ke internet, praktis tapi lebih rawan serangan.',
  },
  {
    question: 'DCA kepanjangan dari apa?',
    options: [
      'Dollar Cost Average',
      'Daily Crypto Analysis',
      'Digital Coin Asset',
      'Direct Cash Assignment',
    ],
    answerIndex: 0,
    explanation:
      'DCA atau Dollar Cost Average adalah strategi membeli aset dengan nominal tetap secara berkala.',
  },
  {
    question: 'Fungsi utama private key adalah?',
    options: [
      'Menandai post di media sosial',
      'Hashing algoritma blockchain',
      'Mengakses dan mengendalikan aset crypto di wallet',
      'Menampilkan harga coin secara realtime',
    ],
    answerIndex: 2,
    explanation:
      'Private key adalah kunci rahasia untuk mengendalikan aset. Jangan dibagikan ke siapapun.',
  },
];

/** Sparkline harga dummy (misal data chart 12 titik) */
export const dummySparkline: number[] = [
  100, 102, 99, 103, 108, 105, 101, 98, 104, 110, 115, 112,
];
