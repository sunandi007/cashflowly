// src/utils/getDateRange.ts
export function getDateRange(period: "week" | "month" | "all") {
  const now = new Date();
  let startDate: Date | null = null;

  if (period === "week") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // monday
    startDate = new Date(now.setDate(diff));
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return {
    start: startDate ? startDate.toISOString() : null,
    end: new Date().toISOString(),
  };
}
