import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Typo from "@/components/Typo";
import { colors, spacingY } from "@/constant/theme";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import { filters, FilterType } from "@/constant/ChartsDummy";
import FilterButton from "@/components/FilterButton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import CategoryPieChart from "@/components/CategoryPieChart";
import { usePieChartAnalytics } from "@/hooks/usePieChartAnalytics";
import { useKeyAnalyticsMetrics } from "@/hooks/useKeyAnalyticsMetrics";

export default function DashboardAnalytics() {
  const [currentFilter, setCurrentFilter] = useState<FilterType>("weekly");
  const [loading] = useState(false);

  const { session } = useAuth();
  const userId = session?.user?.id;
  const { data: analyticsData = [], isLoading } = useAnalytics(
    userId,
    currentFilter
  );

  const { data: keyMetrics, isLoading: isLoadingMetrics } =
    useKeyAnalyticsMetrics(userId, currentFilter);

  // Ambil data untuk netIncome
  const netIncome = keyMetrics?.netIncome || 0;
  const percentChange = keyMetrics?.percentChange || 0;

  const isLoadingCombined = isLoading || isLoadingMetrics; // Gabungkan loading state

  // --- METRIK PERBANDINGAN DINAMIS ---
  const comparisonValue = keyMetrics?.percentChange || 0;
  let comparisonText = "";
  let comparisonColor = colors.neutral400; // Warna default // KASUS 1: Nilai adalah String ('Growth')

  if (typeof comparisonValue === "string") {
    comparisonText = `↑ Pertumbuhan Kuat dari periode lalu`;
    comparisonColor = colors.primary;
  }
  // KASUS 2: Nilai adalah Number (Persentase Normal)
  else {
    // Di sini kita sudah yakin comparisonValue adalah number
    const absValue = Math.abs(comparisonValue);
    const direction = comparisonValue >= 0 ? "↑" : "↓";
    comparisonText = `${direction} ${absValue}% dari periode lalu`;
    comparisonColor = comparisonValue >= 0 ? colors.primary : colors.rose;
  }
  // Siapkan data untuk komponen chart
  const formattedData = {
    byDate: analyticsData,
  };

  const { data: pieChartData, isLoading: isPieLoading } = usePieChartAnalytics(
    userId,
    "monthly"
  );

  // Asumsi: Anda memiliki fungsi utilitas formatRupiah untuk tampilan yang rapi
  // Jika belum ada, kita definisikan yang sederhana:
  const formatRupiah = (number: number, isNegative: boolean = false) => {
    const formatted = new Intl.NumberFormat("id-ID").format(Math.abs(number));
    const sign = isNegative ? "– Rp " : "Rp "; // Menggunakan simbol minus yang benar
    return sign + formatted;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard Analytics"
        style={{ marginVertical: spacingY._10 }}
      ></Header>

      {/* 1. Bar Filter */}
      <View style={styles.filterBar}>
        {filters.map((filter) => (
          <FilterButton
            key={filter}
            label={filter.charAt(0).toUpperCase() + filter.slice(1)}
            isActive={currentFilter === filter}
            onPress={() => setCurrentFilter(filter)}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 2. Komponen Chart menggunakan data dari hook */}
        {/* CATATAN: Props data={formattedData} diganti menjadi data={chartData} */}
        <AnalyticsCharts
          data={formattedData}
          loading={isLoading}
          filter={currentFilter}
        />

        {/* 4. METRIK KUNCI (Dinamis) */}

        <View style={styles.keyMetrics}>
          {" "}
          <Typo size={16} fontWeight="600" color={colors.neutral400}>
            Net Income Periode Ini ({currentFilter.toUpperCase()}):{" "}
          </Typo>
          {/* Nilai Net Income */}{" "}
          <Typo size={24} fontWeight="800" color={comparisonColor}>
            {" "}
            {isLoadingCombined
              ? "..."
              : formatRupiah(netIncome, netIncome < 0)}{" "}
          </Typo>
          {/* Teks Perbandingan */}{" "}
          <Typo size={12} color={comparisonColor}>
            {isLoadingCombined ? "..." : comparisonText}{" "}
          </Typo>
          {/* Tambahan: Tampilkan Total Income dan Total Expense Absolut */}
          <View style={{ marginTop: 15, flexDirection: "row", gap: 20 }}>
            <Typo size={14} color={colors.primary}>
              Income: {formatRupiah(keyMetrics?.totalIncome || 0)}
            </Typo>
            <Typo size={14} color={colors.rose}>
              Expense: {formatRupiah(keyMetrics?.totalExpense || 0)}
            </Typo>
          </View>{" "}
        </View>

        {/* 3. Placeholder untuk Chart Kategori (Tanpa Perubahan) */}
        <CategoryPieChart
          data={pieChartData || []} // Menggunakan data dari Pie Chart Hook
          loading={isPieLoading} // Gunakan loading dari Pie Chart
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900, // Latar belakang gelap
  },
  filterBar: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  scrollContent: {
    paddingBottom: 50, // Ruang bawah agar tidak terpotong
    paddingHorizontal: 10,
  },
  sectionPlaceholder: {
    marginTop: 30,
    padding: 16,
    backgroundColor: colors.neutral800,
    borderRadius: 16,
    alignItems: "center",
  },
  keyMetrics: {
    marginTop: 30,
    padding: 16,
    alignItems: "center",
  },
});
