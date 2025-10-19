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
import {
  usePieChartAnalytics,
} from "@/hooks/usePieChartAnalytics";

export default function DashboardAnalytics() {
  const [currentFilter, setCurrentFilter] = useState<FilterType>("weekly");
  const [loading] = useState(false);

  const { session } = useAuth();
  const userId = session?.user?.id;
  const { data: analyticsData = [], isLoading } = useAnalytics(
    userId,
    currentFilter
  );

  const formattedData = {
    byDate: analyticsData,
  };

  const { data: pieChartData, isLoading: isPieLoading } = usePieChartAnalytics(
    userId,
    "month"
  );

  // Asumsi: Anda memiliki fungsi utilitas formatRupiah untuk tampilan yang rapi
  // Jika belum ada, kita definisikan yang sederhana:
  const formatRupiah = (number: number, isNegative: boolean = false) => {
    const formatted = new Intl.NumberFormat("id-ID").format(Math.abs(number));
    const sign = isNegative ? "– Rp " : "Rp "; // Menggunakan simbol minus yang benar
    return sign + formatted;
  };

  // --- LOGIKA PERHITUNGAN NET INCOME ---
  const { totalIncome, totalExpense, netIncome, netIncomeColor } =
    React.useMemo(() => {
      if (!formattedData.byDate.length) {
        return {
          totalIncome: 0,
          totalExpense: 0,
          netIncome: 0,
          netIncomeColor: colors.neutral400,
        };
      }

      const income = formattedData.byDate.reduce(
        (sum, item) => sum + item.income,
        0
      );
      const expense = formattedData.byDate.reduce(
        (sum, item) => sum + item.expense,
        0
      );
      const net = income - expense;

      return {
        totalIncome: income,
        totalExpense: expense,
        netIncome: net,
        netIncomeColor: net >= 0 ? colors.primary : colors.rose, // Hijau jika surplus, Merah jika defisit
      };
    }, [formattedData.byDate]);

  // --- METRIK PERBANDINGAN Sederhana (Diasumsikan perbandingan 12% dari periode lalu) ---
  // Di aplikasi nyata, ini memerlukan fetch data periode lalu.
  const comparisonText =
    netIncome >= 0 ? `(↑ 12% dari periode lalu)` : `(↓ 8% dari periode lalu)`;
  const comparisonColor = netIncome >= 0 ? colors.primary : colors.rose;

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
            label={filter.charAt(0).toUpperCase() + filter.slice(1)} // Daily, Weekly, Monthy...
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

        {/* 3. Placeholder untuk Chart Kategori (Tanpa Perubahan) */}
        {/* <CategoryPieChart
          data={pieChartData || []} // Menggunakan data dari Pie Chart Hook
          loading={isPieLoading} // Gunakan loading dari Pie Chart
        /> */}

        {/* 4. METRIK KUNCI (Dinamis) */}
        <View style={styles.keyMetrics}>
          <Typo size={16} fontWeight="600" color={colors.neutral400}>
            Net Income Periode Ini ({currentFilter.toUpperCase()}):
          </Typo>

          {/* Nilai Net Income */}
          <Typo size={24} fontWeight="800" color={netIncomeColor}>
            {isLoading ? "..." : formatRupiah(netIncome, netIncome < 0)}
          </Typo>

          {/* Teks Perbandingan */}
          <Typo size={12} color={comparisonColor}>
            {isLoading ? "..." : comparisonText}
          </Typo>
        </View>
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
