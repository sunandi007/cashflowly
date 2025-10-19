import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, spacingY } from "@/constant/theme";
import Typo from "./Typo";
import { SummaryCardProps } from "@/types/model";

export default function SummaryCard({ income, expense, balance }: SummaryCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Typo color={colors.neutral400} size={14}>
          Income
        </Typo>
        <Typo color={colors.primary} size={20} fontWeight="700">
          Rp {income.toLocaleString("id-ID")}
        </Typo>
      </View>

      <View style={styles.card}>
        <Typo color={colors.neutral400} size={14}>
          Expense
        </Typo>
        <Typo color={colors.rose} size={20} fontWeight="700">
          Rp {expense.toLocaleString("id-ID")}
        </Typo>
      </View>

      <View style={styles.card}>
        <Typo color={colors.neutral400} size={14}>
          Balance
        </Typo>
        <Typo color={colors.primary} size={20} fontWeight="700">
          Rp {balance.toLocaleString("id-ID")}
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
