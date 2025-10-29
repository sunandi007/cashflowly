import React from "react";
import { View, StyleSheet } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Typo from "@/components/Typo";
import { colors } from "@/constant/theme";
// import { CategoryData } from '@/hooks/usePieChartAnalytics'; // Import tipe data baru

type CategoryPieChartProps = {
  data: any[];
  loading: boolean;
};

export default function CategoryPieChart({
  data,
  loading,
}: CategoryPieChartProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <Typo color={colors.neutral400}>Loading expense distribution...</Typo>
      </View>
    );
  }

  // Gunakan data dummy jika tidak ada data dari hook
  const chartData =
    data.length > 0
      ? data
      : [
          { name: "Food", value: 350000, color: "#FF5733" },
          { name: "Shopping", value: 200000, color: "#FBBF24" },
          { name: "Transport", value: 150000, color: "#177AD5" },
          { name: "Other", value: 50000, color: "#E91E63" },
        ];

  // Hitung total pengeluaran untuk label tengah Donut Chart
  const totalExpense = chartData.reduce((sum, item) => sum + item.value, 0);
  const formattedTotal =
    totalExpense > 0
      ? new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
          totalExpense / 1000
        ) + "K"
      : "Rp 0";

  // Format data untuk PieChart (menambahkan text dan persentase)
  const formattedPieData = chartData.map((item) => ({
    value: item.value,
    color: item.color,
    text: `${((item.value / totalExpense) * 100).toFixed(0)}%`, // Persentase di label pie
    label: item.name,
  }));

  return (
    <View style={styles.chartContainer}>
      <Typo
        size={18}
        fontWeight="700"
        color={colors.white}
        style={styles.title}
      >
        Expense Distribution
      </Typo>

      <View style={styles.chartAndLegend}>
        {/* Pie Chart / Donut Chart */}

        {/* Pie Chart / Donut Chart */}
        <PieChart
          data={formattedPieData}
          donut
          showGradient={false}
          sectionAutoFocus
          radius={75}
          innerRadius={45} // Membuatnya Donut Chart
          centerLabelComponent={() => (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Typo color={colors.neutral400} size={10}>
                Total
              </Typo>
              <Typo color={colors.neutral400} fontWeight="700" size={14}>
                {formattedTotal}
              </Typo>
            </View>
          )}
        />

        {/* Legend */}
        <View style={styles.legendContainer}>
          {chartData.map((item) => (
            <View key={item.name} style={styles.legendItem}>
              {/* Kolom 1: Warna dan Nama Kategori */}
              <View style={styles.categoryInfo}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <Typo color={colors.neutral300} size={12}>
                  {item.name}
                </Typo>
              </View>

              {/* Kolom 2: Persentase (Rata Kanan) */}
              <Typo color={colors.white} size={12} fontWeight="600">
                {`${((item.value / totalExpense) * 100).toFixed(0)}%`}
              </Typo>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.neutral900,
    borderRadius: 16,
  },
  chartContainer: {
    padding: 16,
    backgroundColor: colors.neutral900,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
  },
  title: {
    marginBottom: 20,
    alignSelf: "flex-start",
  },

  chartAndLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  legendContainer: {
    flex: 1,
    marginLeft: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginRight: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
});