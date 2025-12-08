// src/screens/BillsScreen.tsx

import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Typo from "@/components/Typo";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { colors, spacingX } from "@/constant/theme";
import { useUpcomingBills } from "@/hooks/useUpcomingBills";
import UpcomingBillItem from "@/components/UpcomingBillItem";
import { useBillPayment } from "@/hooks/useBillPayment";
import { useWallets } from "@/hooks/useWallets";
import BillConfirmationModal from "@/components/BillConfirmationModal";
import { useTransactionMutations } from "@/hooks/useTransactionMutations";
import BillDetailModal from "@/components/BillDetailModal";

export default function BillsScreen() {
  const navigation = useNavigation<any>();
  const { data: bills = [], isLoading } = useUpcomingBills();

  const { deleteTransaction } = useTransactionMutations();
  const { processManualBillPayment, isProcessing } = useBillPayment();
  const { wallets } = useWallets();

  const [billToPay, setBillToPay] = useState<any>(null);
  const [selectedBill, setSelectedBill] = useState<any>(null);

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
        "Sukses",
        `Tagihan ${
          billToPay.categories?.name || "Anda"
        } telah dibayar dan dijadwalkan ulang!`
      );
      setBillToPay(null);
    } catch (error: any) {
      Alert.alert(
        "Gagal Memproses",
        error.message || "Terjadi kesalahan tak terduga."
      );
      setBillToPay(null);
    }
  };

  const handleInitialPayClick = (item: any) => {
    if (!mainWalletId) {
      Alert.alert("Error", "Harap buat Wallet Utama terlebih dahulu.");
      return;
    }
    setBillToPay(item); // Membuka modal konfirmasi
  };

  const handleEditPress = (item: any) => {
    navigation.navigate("TransactionScreen", {
      initialData: item,
    } as never);
  };

  const handleDeletePress = (item: any) => {
    Alert.alert(
      "Hentikan Siklus Tagihan",
      `Yakin ingin menghentikan tagihan berulang "${
        item.categories?.name || item.note
      }"? Ini akan menghapus template tagihan.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hentikan",
          style: "destructive",
          onPress: async () => {
            try {
              // Panggil mutasi delete dari hook useTransactionMutations
              await deleteTransaction.mutateAsync(item.id);
              Alert.alert("Sukses", "Siklus tagihan telah dihentikan.");
              // (Query invalidation ['upcomingBills'] sudah ditangani di dalam hook)
            } catch (error: any) {
              Alert.alert("Gagal", "Gagal menghentikan siklus tagihan.");
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
    <View style={styles.container}>
      <Header
        title="Daftar Tagihan Berulang"
        leftIcon={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackButton />
          </TouchableOpacity>
        }
      />
      {isLoading ? (
        <Typo style={styles.centerText} color={colors.neutral400}>
          Memuat daftar tagihan...
        </Typo>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <Typo style={styles.centerText} color={colors.neutral400}>
              Belum ada tagihan berulang yang aktif.
            </Typo>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  listContent: {
    paddingHorizontal: spacingX._20,
    paddingBottom: 40,
  },
  centerText: {
    textAlign: "center",
    marginTop: 30,
  },
});
