// Definisikan tipe dasar data dan filter
export type FilterType ="weekly" | "monthly" | "yearly";
type ChartDataItem = {
  label: string;
  income: number;
  expense: number;
};
type ChartData = ChartDataItem[];

// --- Data Dummy Sesuai Filter ---

// Mingguan (Per Hari - 7 titik)
const weeklyData: ChartData = [
  { label: "Sen", income: 700000, expense: 300000 },
  { label: "Sel", income: 550000, expense: 450000 },
  { label: "Rab", income: 900000, expense: 200000 },
  { label: "Kam", income: 600000, expense: 550000 },
  { label: "Jum", income: 1200000, expense: 400000 },
  { label: "Sab", income: 300000, expense: 750000 },
  { label: "Min", income: 1000000, expense: 600000 },
];

// Bulanan (Per Minggu - 4 titik)
const monthlyData: ChartData = [
  { label: "Wk 1", income: 3500000, expense: 1200000 },
  { label: "Wk 2", income: 4200000, expense: 2500000 },
  { label: "Wk 3", income: 4800000, expense: 3000000 },
  { label: "Wk 4", income: 3000000, expense: 1500000 },
];

// Tahunan (Per Bulan - 5 titik contoh)
const yearlyData: ChartData = [
  { label: "Jan", income: 20000000, expense: 10000000 },
  { label: "Mar", income: 25000000, expense: 18000000 },
  { label: "Jun", income: 30000000, expense: 22000000 },
  { label: "Sep", income: 22000000, expense: 15000000 },
  { label: "Des", income: 35000000, expense: 28000000 },
];

// --- Fungsi Pembantu ---

export const getDummyData = (filter: FilterType): ChartData => {
  switch (filter) {
    case "monthly":
      return monthlyData;
    case "yearly":
      return yearlyData;
    case "weekly":
    default:
      return weeklyData;
  }
};

export const getTitle = (filter: FilterType): string => {
  switch (filter) {
    case "weekly":
      return "Weekly Overview (Per Hari)";
    case "monthly":
      return "Monthly Overview (Per Minggu)";
    case "yearly":
      return "Yearly Overview (Per Bulan)";
    default:
      return "Overview";
  }
};

export const filters: FilterType[] = ["weekly", "monthly", "yearly"];