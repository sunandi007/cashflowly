import { spacingX, spacingY, radius } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Typo from "./Typo";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { useWallets } from "@/hooks/useWallets";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const HomeCard = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { formatMoney } = useCurrency(); // Get formatMoney from context
  const { t } = useLanguage();
  const { colors, isDark } = useTheme(); // Get dynamic colors

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
        <Typo color={colors.neutral500}>{t('common.loading')}</Typo>
      </View>
    );
  }

  // Fungsi format compact dengan currency dynamic
  const formatCompact = (amount: number) => {
    const { symbol } = useCurrency();

    if (amount >= 1000000000) {
      return `${symbol} ${(amount / 1000000000).toFixed(1)}M`;
    }
    if (amount >= 1000000) {
      return `${symbol} ${(amount / 1000000).toFixed(1)}jt`;
    }
    if (amount >= 1000) {
      return `${symbol} ${(amount / 1000).toFixed(0)}rb`;
    }
    return formatMoney(amount);
  };

  // Dynamic gradient colors based on theme
  const gradientColors = isDark
    ? (['#1A3A2E', '#14261F', '#0C1A14'] as const)  // Dark: forest gradient
    : (['#3a5a77ff', '#3a5a77ff', '#29425aff', '#1b2e3fff'] as const);  // Light: solid dark card

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.card, { borderColor: `${colors.primary}40` }]}
    >
      {/* Top Section */}
      <View style={styles.topSection}>
        <View>
          <Typo size={14} color={colors.neutral400} style={styles.balanceLabel}>
            {t('dashboard.totalBalance')}
          </Typo>
          <Typo size={32} fontWeight="bold" color={colors.white}>
            {formatMoney(totalBalance)}
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
        <View style={[styles.pill, { backgroundColor: colors.neutral700 }]}>
          <View style={[styles.pillIcon, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons
              name="arrow-down"
              size={scale(16)}
              color={colors.primary}
            />
          </View>
          <View>
            <Typo size={12} color={colors.neutral400}>{t('dashboard.income')}</Typo>
            <Typo size={14} fontWeight="600" color={colors.primary}>
              +{formatCompact(income)}
            </Typo>
          </View>
        </View>

        {/* Expense Pill */}
        <View style={[styles.pill, { backgroundColor: colors.neutral700 }]}>
          <View style={[styles.pillIcon, { backgroundColor: `${colors.rose}20` }]}>
            <Ionicons
              name="arrow-up"
              size={scale(16)}
              color={colors.rose}
            />
          </View>
          <View>
            <Typo size={12} color={colors.neutral400}>{t('dashboard.expense')}</Typo>
            <Typo size={14} fontWeight="600" color={colors.rose}>
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
    // Shadow untuk depth
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
    paddingVertical: verticalScale(12),
    paddingHorizontal: spacingX._12,
    borderRadius: radius._30,
  },
  pillIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  expenseIcon: {
    // Will use inline style
  },
});