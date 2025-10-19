import React from "react";
import { View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Typo from "@/components/Typo";
import { colors } from "@/constant/theme";
import { getTitle } from "@/constant/ChartsDummy";
import { formatRupiahLabel } from "@/utils/finance";

type FilterType = "daily" | "weekly" | "monthly" | "yearly";

type AnalyticsChartsProps = {
  data: {
    byDate: {
      label: string;
      income: number;
      expense: number;
    }[];
  };
  loading?: boolean;
  filter?: string;
};

export default function AnalyticsCharts({
  data,
  loading,
  filter,
}: AnalyticsChartsProps) {
  // ... (Logika Loading)
  if (loading) {
    return (
      <View
        style={{ height: 250, justifyContent: "center", alignItems: "center" }}
      >
        <Typo color={colors.neutral400}>Loading chart...</Typo>
      </View>
    );
  }

  const currentFilter = (filter as FilterType) || "weekly";
  const chartData = data?.byDate?.length
    ? data.byDate
    : [];

  // --- IMPLEMENTASI GROUPED BAR DENGAN TEKNIK SPACING ---
  const barWidth = 15;
  const groupSpacing = 2; // Jarak antara Income dan Expense (gunakan 'spacing' pada Income bar)

  // Array data tunggal untuk BarChart
  const formattedData = chartData.flatMap((d, index) => {
    // Bar 1: INCOME (memiliki label dan spacing untuk memisahkan grup)
    const incomeBar = {
      value: d.income,
      label: d.label, // Label diatur di bar pertama dalam grup
      frontColor: colors.primary, // Warna Income 🟢
      // Tambahkan jarak setelah bar Income
      spacing: groupSpacing,
      labelTextStyle: { color: colors.neutral400, fontSize: 10 },
    };

    // Bar 2: EXPENSE (tidak memiliki label atau spacing)
    const expenseBar = {
      value: d.expense,
      frontColor: colors.rose, // Warna Expense 🔴
      // Tidak ada label dan spacing di sini
    };

    return [incomeBar, expenseBar];
  });
  // --- AKHIR IMPLEMENTASI TEKNIK SPACING ---

  // 3. Tentukan nilai tertinggi untuk Y-Axis
  const allValues = chartData.flatMap((d) => [d.income, d.expense]);
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 100000;
  const stepValue = Math.ceil(maxValue / 5 / 10000) * 10000;
  const noOfSections = Math.ceil(maxValue / stepValue);

  const yAxisValues: string[] = Array.from(
    { length: noOfSections + 1 },
    (_, i) => {
      const value = i * stepValue;
      return formatRupiahLabel(value);
    }
  );

  return (
    <View
      style={{
        marginTop: 20,
        backgroundColor: colors.neutral900,
        borderRadius: 16,
        padding: 16,
      }}
    >
      <Typo size={18} fontWeight="700" color={colors.white}>
        {getTitle(currentFilter)}
      </Typo>

      <BarChart
        data={formattedData} // Data sekarang array tunggal
        barWidth={barWidth}
        barBorderRadius={4}
        hideRules
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisTextStyle={{ color: colors.neutral400, fontSize: 10 }}
        yAxisLabelPrefix="Rp"
        noOfSections={noOfSections || 5}
        stepValue={stepValue || 20000}
        maxValue={maxValue * 1.1}
        // yAxisTextStyle sudah diterapkan secara global
        // xAxisLabelTextStyle dipindahkan ke data item (labelTextStyle)

        height={170}
        isAnimated
      />

      {/* Legend Sederhana */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 15,
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.primary,
              marginRight: 5,
            }}
          />
          <Typo color={colors.neutral300} size={12}>
            Income
          </Typo>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.rose,
              marginRight: 5,
            }}
          />
          <Typo color={colors.neutral300} size={12}>
            Expense
          </Typo>
        </View>
      </View>
    </View>
  );
}
