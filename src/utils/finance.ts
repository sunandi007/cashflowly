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

