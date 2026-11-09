export interface QuizItem {\n  question: string;\n  options: string[];\n  answerIndex: number;\n  explanation: string;\n  topic: string;\n}\n\n/** Bank soal dummy (ditambah bertahap, satu soal per commit). */\nexport const quizBank: QuizItem[] = [\n  {
    question: 'Apa itu blockchain?',
    options: [
      'Database terpusat milik satu perusahaan',
      'Buku besar terdistribusi berantai yang tersalin ke banyak node',
      'Kartu kredit berbasis internet',
      'Aplikasi pesan singkat',
    ],
    answerIndex: 1,
    explanation: 'Blockchain adalah buku besar digital terdesentralisasi: setiap blok terhubung ke blok sebelumnya dan disalin ke banyak node.',
    topic: 'Dasar Blockchain',
  },  {
    question: 'Apa fungsi utama private key dalam crypto?',
    options: ['Menandai postingan media sosial', 'Mengendalikan aset di wallet', 'Menambah kecepatan internet', 'Menampilkan harga coin'],
    answerIndex: 1,
    explanation: 'Private key adalah kunci rahasia pengendali aset; jika bocor, aset bisa dicuri.',
    topic: 'Keamanan',
  },
  {
    question: 'Apa itu seed phrase?',
    options: ['Kode diskon belanja', '12-24 kata untuk memulihkan akses wallet', 'Password website', 'Nomor rekening bank'],
    answerIndex: 1,
    explanation: 'Seed phrase adalah cadangan berupa frasa untuk memulihkan wallet; disimpan offline di tempat aman.',
    topic: 'Keamanan',
  },
];
