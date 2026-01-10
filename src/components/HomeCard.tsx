import { colors, spacingX, spacingY, radius } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Typo from "./Typo";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { useWallets } from "@/hooks/useWallets";

const HomeCard = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  // 1. Ambil data WALLET untuk Total Balance
  const { wallets } = useWallets();

  // 2. Ambil data TRANSAKSI untuk Summary Income/Expense (periode saat ini)
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useTransactions(userId);

  // HITUNG TOTAL BALANCE dari SEMUA DOMPET
  const totalBalance = useMemo(() => {
    if (wallets.length === 0) return 0;
    return wallets.reduce((sum, wallet) => sum + (Number(wallet.balance) || 0), 0);
  }, [wallets]);

  // HITUNG INCOME & EXPENSE untuk RINGKASAN PERIODE
  const { income, expense } = useMemo(() => {
    if (!transactions.length) return { income: 0, expense: 0 };

    const normalTx = transactions.filter(
      (t: any) => !t.transfer_id && t.type !== 'transfer'
    );

    const incomeAmount = normalTx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const expenseAmount = normalTx
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return { income: incomeAmount, expense: expenseAmount };
  }, [transactions]);

  const isLoading = isLoadingTransactions;

  if (isLoading) {
    return (
      <View style={[styles.card, styles.loadingPlaceholder]}>
        <Typo color={colors.neutral500}>Loading data...</Typo>
      </View>
    );
  }

  // Fungsi utilitas untuk memformat mata uang
  const formatCurrency = (amount: number, showSign = false) => {
    const formatted = Number(Math.abs(amount)).toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (showSign && amount > 0) {
      return `+Rp ${formatted}`;
    }
    if (showSign && amount < 0) {
      return `-Rp ${formatted}`;
    }
    return `Rp ${formatted}`;
  };

  const formatCompact = (amount: number) => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}M`;
    }
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}jt`;
    }
    if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}rb`;
    }
    return `Rp ${amount.toFixed(0)}`;
  };

  return (
    <LinearGradient
      colors={[
        '#1A3A2E',  // Dark forest green (top)
        '#14261F',  // Medium dark (middle)
        '#0C1A14',  // Darkest (bottom)
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Top Section */}
      <View style={styles.topSection}>
        <View>
          <Typo size={14} color={colors.neutral400} style={styles.balanceLabel}>
            Total Balance
          </Typo>
          <Typo size={32} fontWeight="bold" color={colors.white}>
            Rp {totalBalance.toLocaleString("id-ID", { minimumFractionDigits: 0 })}
          </Typo>
        </View>

        {/* Menu dots */}
        {/* <TouchableOpacity style={styles.menuButton}>
          <Ionicons
            name="ellipsis-horizontal"
            size={scale(20)}
            color={colors.neutral400}
          />
        </TouchableOpacity> */}
      </View>

      {/* Income & Expense Pills */}
      <View style={styles.pillsContainer}>
        {/* Income Pill */}
        <View style={styles.pill}>
          <View style={styles.pillIcon}>
            <Ionicons
              name="arrow-down"
              size={scale(16)}
              color={colors.primary}
            />
          </View>
          <View>
            <Typo size={12} color={colors.neutral400}>Income</Typo>
            <Typo size={14} fontWeight="600" color={colors.primary}>
              +{formatCompact(income)}
            </Typo>
          </View>
        </View>

        {/* Expense Pill */}
        <View style={styles.pill}>
          <View style={[styles.pillIcon, styles.expenseIcon]}>
            <Ionicons
              name="arrow-up"
              size={scale(16)}
              color={colors.rose}
            />
          </View>
          <View>
            <Typo size={12} color={colors.neutral400}>Expense</Typo>
            <Typo size={14} fontWeight="600" color={colors.white}>
              -{formatCompact(expense)}
            </Typo>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default HomeCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: radius._20,
    padding: spacingX._20,
    paddingVertical: verticalScale(24),
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    // Shadow untuk depth
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    height: scale(160),
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(24),
  },
  balanceLabel: {
    marginBottom: verticalScale(4),
  },
  menuButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: colors.neutral700,
    alignItems: "center",
    justifyContent: "center",
  },
  pillsContainer: {
    flexDirection: "row",
    gap: scale(12),
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    backgroundColor: colors.neutral700,
    paddingVertical: verticalScale(12),
    paddingHorizontal: spacingX._12,
    borderRadius: radius._30,
  },
  pillIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: `${colors.primary}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  expenseIcon: {
    backgroundColor: `${colors.rose}20`,
  },
});