import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, spacingY } from "@/constant/theme";
import Typo from "./Typo";
import { SummaryCardProps } from "@/types/model";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function SummaryCard({ income, expense, balance }: SummaryCardProps) {
  const { formatMoney } = useCurrency();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Typo color={colors.neutral400} size={14}>
          Income
        </Typo>
        <Typo color={colors.primary} size={20} fontWeight="700">
          {formatMoney(income)}
        </Typo>
      </View>

      <View style={styles.card}>
        <Typo color={colors.neutral400} size={14}>
          Expense
        </Typo>
        <Typo color={colors.rose} size={20} fontWeight="700">
          {formatMoney(expense)}
        </Typo>
      </View>

      <View style={styles.card}>
        <Typo color={colors.neutral400} size={14}>
          Balance
        </Typo>
        <Typo color={colors.primary} size={20} fontWeight="700">
          {formatMoney(balance)}
        </Typo>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacingY._20,
  },
  card: {
    flex: 1,
    backgroundColor: colors.neutral800,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
  },
});
