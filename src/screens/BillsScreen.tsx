// src/screens/BillsScreen.tsx

import React, { useState, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Text,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY, radius } from "@/constant/theme";
import { useUpcomingBills } from "@/hooks/useUpcomingBills";
import UpcomingBillItem from "@/components/UpcomingBillItem";
import { useBillPayment } from "@/hooks/useBillPayment";
import { useWallets } from "@/hooks/useWallets";
import BillConfirmationModal from "@/components/BillConfirmationModal";
import { useTransactionMutations } from "@/hooks/useTransactionMutations";
import BillDetailModal from "@/components/BillDetailModal";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale } from "@/utils/styling";
import ScreenWrapper from "@/components/ScreenWrapper";

const FILTER_OPTIONS = [
  { label: 'All Bills', value: 'all' },
  { label: 'Due Soon', value: 'due_soon' },
  { label: 'High Amount', value: 'high_amount' },
];

export default function BillsScreen() {
  const navigation = useNavigation<any>();
  const { data: bills = [], isLoading } = useUpcomingBills();

  const { deleteTransaction } = useTransactionMutations();
  const { processManualBillPayment, isProcessing } = useBillPayment();
  const { wallets } = useWallets();

  const [billToPay, setBillToPay] = useState<any>(null);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // --- Logic Utility ---
  const mainWallet =
    wallets.find((w) => w.name === "Main Wallet") || wallets[0];
  const mainWalletId = mainWallet?.id;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  // Calculate total due this month
  const totalDueThisMonth = useMemo(() => {
    return bills.reduce((sum: number, bill: any) => sum + (Number(bill.amount) || 0), 0);
  }, [bills]);

  // Count bills due in next 7 days
  const billsDueIn7Days = useMemo(() => {
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    return bills.filter((bill: any) => {
      const dueDate = new Date(bill.date);
      return dueDate >= today && dueDate <= next7Days;
    }).length;
  }, [bills]);

  // Filter bills based on active filter
  const filteredBills = useMemo(() => {
    switch (activeFilter) {
      case 'due_soon':
        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);
        return bills.filter((bill: any) => {
          const dueDate = new Date(bill.date);
          return dueDate >= today && dueDate <= next7Days;
        });
      case 'high_amount':
        return [...bills].sort((a: any, b: any) => b.amount - a.amount);
      default:
        return bills;
    }
  }, [bills, activeFilter]);

  // --- Handlers ---
  const handleDetailPress = (item: any) => {
    setSelectedBill(item);
  };

  const handleConfirmPayment = async (updatedAmount: number) => {
    if (!billToPay || !mainWalletId) {
      Alert.alert("Error", "Data pembayaran atau Wallet Utama tidak tersedia.");
      return;
    }
    const payload = {
      billId: billToPay.id,
      amount: updatedAmount,
      type: billToPay.type,
      categoryId: billToPay.category_id,
      recurrenceRule: billToPay.recurrence_rule,
      currentDueDate: billToPay.date,
      walletId: mainWalletId,
    };

    try {
      await processManualBillPayment(payload);
      Alert.alert(
        "Success",
        `Bill ${billToPay.categories?.name || "payment"} has been processed!`
      );
      setBillToPay(null);
    } catch (error: any) {
      Alert.alert(
        "Failed",
        error.message || "An unexpected error occurred."
      );
      setBillToPay(null);
    }
  };

  const handleInitialPayClick = (item: any) => {
    if (!mainWalletId) {
      Alert.alert("Error", "Please create a Main Wallet first.");
      return;
    }
    setBillToPay(item);
  };

  const handleEditPress = (item: any) => {
    navigation.navigate("TransactionScreen", {
      initialData: item,
    } as never);
  };

  const handleDeletePress = (item: any) => {
    Alert.alert(
      "Stop Recurring Bill",
      `Are you sure you want to stop "${item.categories?.name || item.note}" recurring bill?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction.mutateAsync(item.id);
              Alert.alert("Success", "Recurring bill has been stopped.");
            } catch (error: any) {
              Alert.alert("Failed", "Failed to stop recurring bill.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <UpcomingBillItem
      item={item}
      onPayPress={handleInitialPayClick}
      onDeletePress={handleDeletePress}
      onEditPress={handleEditPress}
      isProcessing={isProcessing}
      formatCurrency={formatCurrency}
      onDetailPress={handleDetailPress}
    />
  );

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.headerTitle}>Recurring Bills</Text>
        </View>
        <TouchableOpacity style={styles.filterIconButton}>
          <Ionicons name="options-outline" size={scale(22)} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Total Due Card */}
      <View style={styles.totalDueCard}>
        <Text style={styles.totalDueLabel}>TOTAL DUE THIS MONTH</Text>
        <Text style={styles.totalDueAmount}>{formatCurrency(totalDueThisMonth)}</Text>
        <Text style={styles.totalDueSubtitle}>
          You have {billsDueIn7Days} bills due in the next 7 days.
        </Text>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterRowContent}
      >
        {FILTER_OPTIONS.map((opt) => {
          const isActive = activeFilter === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Upcoming Section Label */}
      <Text style={styles.sectionLabel}>UPCOMING</Text>

      {/* Bills List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="reload-outline" size={scale(32)} color={colors.neutral500} />
          <Text style={styles.loadingText}>Loading bills...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBills}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={scale(48)} color={colors.neutral600} />
              </View>
              <Text style={styles.emptyTitle}>No recurring bills</Text>
              <Text style={styles.emptySubtitle}>
                Add your first recurring bill to get started
              </Text>
            </View>
          )}
        />
      )}

      {/* Modal Konfirmasi Pembayaran */}
      <BillConfirmationModal
        bill={billToPay}
        visible={!!billToPay}
        onClose={() => setBillToPay(null)}
        onConfirm={handleConfirmPayment}
        isProcessing={isProcessing}
      />

      {/* Modal Detail Tagihan */}
      <BillDetailModal
        bill={selectedBill}
        visible={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        onEdit={() => handleEditPress(selectedBill)}
        onDelete={() => handleDeletePress(selectedBill)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacingX._20,
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  welcomeText: {
    fontSize: scale(14),
    color: colors.neutral400,
    marginBottom: verticalScale(4),
  },
  headerTitle: {
    fontSize: scale(26),
    fontWeight: "700",
    color: colors.white,
  },
  filterIconButton: {
    width: scale(40),
    height: scale(40),
    alignItems: "center",
    justifyContent: "center",
  },

  // Total Due Card
  totalDueCard: {
    marginHorizontal: spacingX._20,
    backgroundColor: colors.neutral800,
    borderRadius: scale(20),
    padding: scale(24),
    alignItems: "center",
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  totalDueLabel: {
    fontSize: scale(12),
    fontWeight: "600",
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: verticalScale(8),
  },
  totalDueAmount: {
    fontSize: scale(36),
    fontWeight: "700",
    color: colors.white,
    marginBottom: verticalScale(8),
  },
  totalDueSubtitle: {
    fontSize: scale(13),
    color: colors.neutral400,
    textAlign: "center",
  },

  // Filter Chips
  filterRow: {
    marginBottom: verticalScale(20),
    maxHeight: verticalScale(50),
  },
  filterRowContent: {
    paddingHorizontal: spacingX._20,
    gap: scale(10),
  },
  filterChip: {
    backgroundColor: colors.neutral800,
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: scale(24),
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: scale(14),
    fontWeight: "500",
    color: colors.neutral300,
  },
  filterChipTextActive: {
    color: colors.neutral900,
    fontWeight: "600",
  },

  // Section Label
  sectionLabel: {
    fontSize: scale(12),
    fontWeight: "600",
    color: colors.neutral400,
    letterSpacing: 1,
    marginHorizontal: spacingX._20,
    marginBottom: verticalScale(16),
  },

  // List Content
  listContent: {
    paddingHorizontal: spacingX._20,
    paddingBottom: verticalScale(100),
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(12),
  },
  loadingText: {
    fontSize: scale(14),
    color: colors.neutral400,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: verticalScale(60),
  },
  emptyIcon: {
    width: scale(96),
    height: scale(96),
    borderRadius: scale(48),
    backgroundColor: colors.neutral800,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(16),
  },
  emptyTitle: {
    fontSize: scale(16),
    fontWeight: "600",
    color: colors.neutral300,
    marginBottom: verticalScale(4),
  },
  emptySubtitle: {
    fontSize: scale(14),
    color: colors.neutral500,
  },
});
