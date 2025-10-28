import { colors, spacingX, spacingY } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import Typo from "./Typo";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
// Import hook untuk mengambil data dompet
import { useWallets } from "@/hooks/useWallets"; 

const HomeCard = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  // 1. Ambil data WALLET untuk Total Balance
  // Catatan: Asumsikan useWallets mengambil semua dompet pengguna.
  const {  wallets } = useWallets();

  // 2. Ambil data TRANSAKSI untuk Summary Income/Expense (periode saat ini)
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useTransactions(userId /*, period*/);

  // HITUNG TOTAL BALANCE dari SEMUA DOMPET
  const totalBalance = useMemo(() => {
    if (wallets.length === 0) return 0;
    // Menjumlahkan kolom 'balance' dari semua dompet
    return wallets.reduce((sum, wallet) => sum + (Number(wallet.balance) || 0), 0);
  }, [wallets]);

  // HITUNG INCOME & EXPENSE untuk RINGKASAN PERIODE
  const { income, expense } = useMemo(() => {
    if (!transactions.length) return { income: 0, expense: 0 };

    // Gunakan transfer_id untuk MENGABAIKAN transaksi hasil transfer
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
      // Anda bisa mengganti ini dengan placeholder atau Skeleton UI
      return (
          <View style={[styles.bgImage, styles.loadingPlaceholder]}>
              <Typo color={colors.neutral800}>Loading data...</Typo>
          </View>
      );
  }

  // Fungsi utilitas untuk memformat mata uang
  const formatCurrency = (amount: number) => {
    return Number(amount).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).replace("Rp", "Rp "); // Menambahkan spasi setelah Rp
  };

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
            {formatCurrency(totalBalance)} {/* Menggunakan totalBalance */}
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
                {formatCurrency(income)} {/* Menggunakan income yang dihitung */}
              </Typo>
            </View>
          </View>

          {/* expense */}
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
                {formatCurrency(expense)} {/* Menggunakan expense yang dihitung */}
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
  loadingPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.neutral100, // Tambahkan latar belakang agar terlihat
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