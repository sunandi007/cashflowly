// src/components/UpcomingBillsList.tsx

import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Typo from "./Typo";
import { useUpcomingBills } from "@/hooks/useUpcomingBills";
import { useBillPayment } from "@/hooks/useBillPayment";
import { colors, spacingX } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";
import { toTitleCase } from "@/utils/text";
import { useWallets } from "@/hooks/useWallets";
import BillConfirmationModal from "./BillConfirmationModal";

export default function UpcomingBillsList() {
  const { data: bills = [], isLoading } = useUpcomingBills();
  const { processManualBillPayment, isProcessing } = useBillPayment();
  const { wallets } = useWallets();

  const [billToPay, setBillToPay] = useState<any>(null);

  if (isLoading) {
    return (
      <Typo color={colors.neutral400} style={styles.center}>
        Memuat tagihan...
      </Typo>
    );
  }

  if (bills.length === 0) {
    return (
      <Typo color={colors.neutral400} style={styles.center}>
        Tidak ada tagihan berulang yang akan datang.
      </Typo>
    );
  }

  const mainWallet =
    wallets.find((w) => w.name === "Main Wallet") || wallets[0];
  const mainWalletId = mainWallet?.id;

  if (!mainWalletId) {
    return (
      <Typo color={colors.rose} style={styles.center}>
        Error: Wallet Utama tidak ditemukan.
      </Typo>
    );
  }

  // Asumsi: formatCurrency sudah didefinisikan secara global
  const formatCurrency = (amount: number) => {
    return Number(amount).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
  };

  const handleConfirmPayment = async (updatedAmount: number) => {
    if (!billToPay) return;

    // Persiapan Payload
    const payload = {
        billId: billToPay.id,
        amount: updatedAmount, // ✅ MENGGUNAKAN JUMLAH YANG DIEDIT
        type: billToPay.type, 
        categoryId: billToPay.category_id,
        recurrenceRule: billToPay.recurrence_rule,
        currentDueDate: billToPay.date,
        walletId: mainWalletId, 
    };

    try {
        await processManualBillPayment(payload);
        Alert.alert("Sukses", `Tagihan ${billToPay.categories?.name || 'Anda'} telah dibayar dan dijadwalkan ulang!`);
        setBillToPay(null); // Tutup modal setelah sukses
    } catch (error: any) {
        Alert.alert("Gagal Memproses", error.message || "Terjadi kesalahan tak terduga.");
        setBillToPay(null); // Tutup modal meskipun gagal
    }
  };

  const handlePay = async (item: any) => {
    setBillToPay(item);
  };

  const renderItem = ({ item }: any) => {
    const categoryName = item.categories?.name || "N/A";
    const iconName = item.categories?.icon || "alert-circle-outline";
    const dateDisplay = new Date(item.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

    const isExpense = item.type === "expense";

    return (
      <View style={styles.billItem}>
        <View style={styles.info}>
          {/* Ikon Kategori */}
          <Ionicons
            name={iconName}
            size={24}
            color={isExpense ? colors.rose : colors.primary}
          />

          {/* Nama dan Tanggal */}
          <View style={{ marginLeft: 10 }}>
            <Typo color={colors.white} fontWeight="600">
              {categoryName}
            </Typo>
            <Typo color={colors.neutral400} size={12}>
              Jatuh Tempo: {dateDisplay}
            </Typo>
          </View>
        </View>

        {/* Jumlah */}
        <Typo color={isExpense ? colors.rose : colors.primary} fontWeight="700">
          {formatCurrency(item.amount)}
        </Typo>

        {/* Tombol Bayar Sekarang (Simulasi aksi manual) */}
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => handlePay(item)}
          disabled={isProcessing}
        >
          <Typo color={colors.black} size={12} fontWeight="bold">
            Bayar
          </Typo>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      <Typo
        size={18}
        fontWeight="700"
        color={colors.white}
        style={{ marginBottom: 10 }}
      >
        Tagihan Mendatang
      </Typo>
      <FlatList
        data={bills.slice(0, 5)} // Tampilkan 5 tagihan teratas
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
      <BillConfirmationModal
            bill={billToPay}
            visible={!!billToPay}
            onClose={() => setBillToPay(null)}
            onConfirm={handleConfirmPayment}
            isProcessing={isProcessing}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: "center",
    marginVertical: 20,
  },
  billItem: {
    backgroundColor: colors.neutral800,
    borderRadius: 10,
    padding: 15,
    // marginRight: 10,
    // width: 300,
    width: "100%",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
});
