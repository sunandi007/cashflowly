export function calculateSummary(transactions: any[]) {
  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") income += t.amount;
    else if (t.type === "expense") expense += t.amount;
  });

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export function groupByCategory(transactions: any[]) {
  const grouped: Record<string, number> = {};

  transactions.forEach((t) => {
    const key = t.categories?.name || "Lainnya";
    grouped[key] = (grouped[key] || 0) + t.amount;
  });

  return Object.entries(grouped).map(([k, v]) => ({ x: k, y: v }));
}

export function groupByMonth(transactions: any[]) {
  const grouped: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((t) => {
    const month = new Date(t.date).toLocaleString("id-ID", { month: "short" });
    if (!grouped[month]) grouped[month] = { income: 0, expense: 0 };

    const typeKey = t.type as "income" | "expense";
    grouped[month][typeKey] += t.amount;
  });

  return Object.entries(grouped).map(([month, { income, expense }]) => ({
    month,
    income,
    expense,
  }));
}

export const formatRupiahLabel = (value: number): string => {
  if (value >= 1000000) {
    // Tampilkan dalam Juta (Jt)
    const million = (value / 1000000).toFixed(1).replace(/\.0$/, ''); // Hapus .0 jika angkanya bulat
    return `Rp ${million} Jt`;
  }
  if (value >= 1000) {
    // Tampilkan dalam Ribu (K)
    const thousand = (value / 1000).toFixed(0);
    return `Rp ${thousand}K`;
  }
  return `Rp ${value}`;
};