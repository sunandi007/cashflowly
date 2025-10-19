import { colors, spacingX, spacingY } from "@/constant/theme";
import { WalletType } from "@/types/model";
import { scale, verticalScale } from "@/utils/styling";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import Typo from "./Typo";
import { useAuth } from "@/hooks/useAuth";
import { calculateSummary } from "@/utils/finance";
import { useTransactions } from "@/hooks/useTransactions";

const HomeCard = () => {
    const { session } = useAuth();
  const userId = session?.user?.id;

   const { data: transactions = [], isLoading } = useTransactions(
    userId /*, period*/
  );


    // ---- Summary aman (konversi angka) ----
  const { income, expense, balance } = useMemo(() => {
    if (!transactions.length) return { income: 0, expense: 0, balance: 0 };

    const normalTx = transactions.filter((t: any) => !t.is_transfer);
    const income = normalTx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const expense = normalTx
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const balance = income - expense;

    return { income, expense, balance };
  }, [transactions]);




  return (
    <ImageBackground
      source={require("../../assets/images/card.png")}
      resizeMode="stretch"
      style={styles.bgImage}
    >
      <View style={styles.container}>
        <View>
          <View style={styles.totalBalanceRow}>
            <Typo size={17} color={colors.neutral800} fontWeight={"500"}>
              Total Balance
            </Typo>
            <Ionicons
              name="ellipsis-horizontal"
              size={scale(20)}
              color={colors.neutral400}
            />
          </View>
          <Typo size={30} fontWeight={"bold"} color={colors.black}>
              Rp {Number(balance).toLocaleString("id-ID")}
          </Typo>
        </View>

        {/* total income and expense */}
        <View style={styles.stats}>
          {/* income */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Ionicons
                  name="arrow-down"
                  size={scale(20)}
                  color={colors.black}
                />
              </View>
              <Typo size={16} fontWeight={"500"} color={colors.neutral700}>
                Income
              </Typo>
            </View>
            <View style={{ alignSelf: "center" }}>
              <Typo size={17} fontWeight={"600"} color={colors.green}>
                Rp {Number(income).toLocaleString("id-ID")}
              </Typo>
            </View>
          </View>

          {/* expence */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Ionicons
                  name="arrow-up"
                  size={scale(20)}
                  color={colors.black}
                />
              </View>
              <Typo size={16} fontWeight={"500"} color={colors.neutral700}>
                Expense
              </Typo>
            </View>
            <View style={{ alignSelf: "center" }}>
              <Typo size={17} fontWeight={"600"} color={colors.rose}>
                Rp {Number(expense).toLocaleString("id-ID")}
              </Typo>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default HomeCard;

const styles = StyleSheet.create({
  bgImage: {
    height: scale(210),
    width: "100%",
  },
  container: {
    padding: spacingX._20,
    paddingHorizontal: scale(23),
    height: "87%",
    width: "100%",
    justifyContent: "space-between",
  },
  totalBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._5,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsIcon: {
    backgroundColor: colors.neutral350,
    padding: spacingY._5,
    borderRadius: 50,
  },
  incomeExpense: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingY._7,
  },
});
