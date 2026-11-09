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
  },];
