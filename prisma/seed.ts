import { PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

// ===== CONFIG =====
const MONTHS_OF_DATA = 6; // Generate 6 months of sample data (Oct 2025 - Mar 2026)

// Helper to get a random number between min and max
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to pick a random item from array
function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}

// Helper to create a random date within a given month/year
function randomDateInMonth(year: number, month: number): Date {
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = rand(1, daysInMonth);
  return new Date(year, month - 1, day);
}

// ===== TRANSACTION TEMPLATES =====
// Realistic Indonesian transaction patterns

const EXPENSE_TEMPLATES: Record<string, { notes: string[]; minAmount: number; maxAmount: number; frequency: number }> = {
  Makanan: {
    notes: [
      "Makan siang di warteg",
      "Kopi di Starbucks",
      "Grab Food - Ayam Geprek",
      "Belanja sayur di pasar",
      "McDonalds bareng temen",
      "Makan malam di restoran",
      "Nasi goreng pinggir jalan",
      "Kopi susu kekinian",
      "Beli snack di Indomaret",
      "Makan siang di kantin",
      "GoFood - Bakso",
      "Beli buah di supermarket",
      "Makan padang",
      "Es teh + gorengan",
      "Pizza bareng keluarga",
    ],
    minAmount: 15000,
    maxAmount: 250000,
    frequency: 25, // ~25 transactions per month
  },
  Transportasi: {
    notes: [
      "Grab ke kantor",
      "Isi bensin motor",
      "Gojek pulang kerja",
      "Parkir mall",
      "Tol Cikampek",
      "Isi bensin mobil",
      "KRL Bogor - Jakarta",
      "MRT ke Sudirman",
      "Grab Car ke meeting",
      "Parkir kantor bulanan",
    ],
    minAmount: 10000,
    maxAmount: 350000,
    frequency: 10,
  },
  Belanja: {
    notes: [
      "Beli kaos di Uniqlo",
      "Skincare bulanan",
      "Sepatu Nike",
      "Belanja Tokopedia",
      "Beli charger HP",
      "Belanja Shopee Sale",
      "Case iPhone baru",
      "Beli buku di Gramedia",
      "Belanja peralatan dapur",
      "Beli hadiah ultah teman",
    ],
    minAmount: 50000,
    maxAmount: 800000,
    frequency: 5,
  },
  Tagihan: {
    notes: [
      "Listrik bulanan",
      "Internet Indihome",
      "Pulsa Telkomsel",
      "BPJS Kesehatan",
      "Iuran RT",
      "Air PDAM",
      "Netflix subscription",
      "Spotify Premium",
      "Cicilan HP",
      "Asuransi kendaraan",
    ],
    minAmount: 50000,
    maxAmount: 500000,
    frequency: 6,
  },
  Hiburan: {
    notes: [
      "Nonton bioskop XXI",
      "Karaoke bareng temen",
      "Main bowling",
      "Tiket konser",
      "Game Steam Sale",
      "Nonton Netflix",
      "Badminton sewa lapangan",
      "Berenang weekend",
    ],
    minAmount: 30000,
    maxAmount: 400000,
    frequency: 3,
  },
  Lainnya: {
    notes: [
      "Donasi masjid",
      "Sumbangan panti asuhan",
      "Obat di apotek",
      "Potong rambut",
      "Laundry",
      "Cuci mobil",
      "Service motor",
      "Fotokopi dokumen",
    ],
    minAmount: 15000,
    maxAmount: 300000,
    frequency: 3,
  },
};

const INCOME_TEMPLATES: Record<string, { notes: string[]; minAmount: number; maxAmount: number; frequency: number }> = {
  Gaji: {
    notes: [
      "Gaji bulanan",
      "Gaji pokok bulanan",
    ],
    minAmount: 8000000,
    maxAmount: 12000000,
    frequency: 1,
  },
  Bonus: {
    notes: [
      "Bonus project",
      "THR",
      "Bonus akhir tahun",
      "Komisi penjualan",
      "Reward performance",
      "Uang lembur",
    ],
    minAmount: 500000,
    maxAmount: 5000000,
    frequency: 0.3, // Not every month
  },
  Investasi: {
    notes: [
      "Dividen saham",
      "Profit reksadana",
      "Bunga deposito",
      "Return P2P lending",
      "Hasil jual crypto",
    ],
    minAmount: 100000,
    maxAmount: 2000000,
    frequency: 0.5,
  },
};

// Budget templates per category (monthly budget amounts)
const BUDGET_TEMPLATES: Record<string, number> = {
  Makanan: 3000000,
  Transportasi: 1500000,
  Belanja: 1000000,
  Tagihan: 1500000,
  Hiburan: 500000,
  Lainnya: 500000,
};

async function main() {
  // 1. Find the first user in the database
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error("❌ Tidak ada user di database. Silakan register terlebih dahulu di app.");
    process.exit(1);
  }

  console.log(`👤 Menggunakan user: ${user.name} (${user.email})`);

  // 2. Fetch existing categories for this user
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
  });

  if (categories.length === 0) {
    console.error("❌ User belum punya kategori. Silakan login ke app dulu agar kategori default dibuat.");
    process.exit(1);
  }

  console.log(`📂 Ditemukan ${categories.length} kategori`);

  // Build category lookup by name
  const categoryMap = new Map(categories.map((c) => [c.name, c]));

  // 3. Clear existing sample data (transactions & budgets for this user)
  const deletedTx = await prisma.transaction.deleteMany({
    where: { userId: user.id },
  });
  const deletedBudgets = await prisma.budget.deleteMany({
    where: { userId: user.id },
  });
  console.log(`🗑️  Menghapus ${deletedTx.count} transaksi dan ${deletedBudgets.count} budget lama`);

  // 4. Generate transactions for the last 6 months
  const now = new Date(2026, 2, 1); // March 2026 as current month
  const transactions: {
    amount: number;
    type: TransactionType;
    date: Date;
    note: string;
    categoryId: string;
    userId: string;
  }[] = [];

  for (let i = MONTHS_OF_DATA - 1; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setMonth(targetDate.getMonth() - i);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1; // 1-indexed

    console.log(`\n📅 Generating data untuk ${month}/${year}...`);

    // Generate EXPENSE transactions
    for (const [catName, template] of Object.entries(EXPENSE_TEMPLATES)) {
      const category = categoryMap.get(catName);
      if (!category) continue;

      // Add some monthly variation to frequency (+/- 30%)
      const variation = 0.7 + Math.random() * 0.6;
      const count = Math.round(template.frequency * variation);

      for (let j = 0; j < count; j++) {
        // Add some realistic amount variation
        const amount = rand(template.minAmount, template.maxAmount);
        // Round to nearest 1000 for realism
        const roundedAmount = Math.round(amount / 1000) * 1000;

        transactions.push({
          amount: roundedAmount,
          type: TransactionType.EXPENSE,
          date: randomDateInMonth(year, month),
          note: pick(template.notes),
          categoryId: category.id,
          userId: user.id,
        });
      }
    }

    // Generate INCOME transactions
    for (const [catName, template] of Object.entries(INCOME_TEMPLATES)) {
      const category = categoryMap.get(catName);
      if (!category) continue;

      // For salary, always 1 per month. For others, use frequency as probability
      if (template.frequency >= 1) {
        for (let j = 0; j < template.frequency; j++) {
          const amount = rand(template.minAmount, template.maxAmount);
          const roundedAmount = Math.round(amount / 100000) * 100000; // Round to 100k for salary

          transactions.push({
            amount: roundedAmount,
            type: TransactionType.INCOME,
            date: new Date(year, month - 1, rand(25, 28)), // Salary comes on 25-28th
            note: pick(template.notes),
            categoryId: category.id,
            userId: user.id,
          });
        }
      } else {
        // Probabilistic - not every month
        if (Math.random() < template.frequency) {
          const amount = rand(template.minAmount, template.maxAmount);
          const roundedAmount = Math.round(amount / 10000) * 10000;

          transactions.push({
            amount: roundedAmount,
            type: TransactionType.INCOME,
            date: randomDateInMonth(year, month),
            note: pick(template.notes),
            categoryId: category.id,
            userId: user.id,
          });
        }
      }
    }
  }

  // 5. Insert all transactions
  const result = await prisma.transaction.createMany({
    data: transactions,
  });

  console.log(`\n✅ Berhasil membuat ${result.count} transaksi sample!`);

  // 6. Generate budgets for the last 6 months
  const budgets: {
    amount: number;
    month: number;
    year: number;
    categoryId: string;
    userId: string;
  }[] = [];

  for (let i = MONTHS_OF_DATA - 1; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setMonth(targetDate.getMonth() - i);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;

    for (const [catName, budgetAmount] of Object.entries(BUDGET_TEMPLATES)) {
      const category = categoryMap.get(catName);
      if (!category) continue;

      // Add slight monthly variation to budgets (+/- 10%)
      const variation = 0.9 + Math.random() * 0.2;
      const adjustedAmount = Math.round((budgetAmount * variation) / 100000) * 100000;

      budgets.push({
        amount: adjustedAmount,
        month,
        year,
        categoryId: category.id,
        userId: user.id,
      });
    }
  }

  const budgetResult = await prisma.budget.createMany({
    data: budgets,
  });

  console.log(`✅ Berhasil membuat ${budgetResult.count} budget sample!`);

  // 7. Print summary
  const totalIncome = transactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  console.log(`\n📊 Ringkasan Data Sample:`);
  console.log(`   Total Pemasukan: Rp ${totalIncome.toLocaleString("id-ID")}`);
  console.log(`   Total Pengeluaran: Rp ${totalExpense.toLocaleString("id-ID")}`);
  console.log(`   Saldo Bersih: Rp ${(totalIncome - totalExpense).toLocaleString("id-ID")}`);
  console.log(`   Periode: ${MONTHS_OF_DATA} bulan terakhir`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
