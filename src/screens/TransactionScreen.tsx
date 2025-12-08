import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTransactionMutations } from "@/hooks/useTransactionMutations";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";
import BaseDropdown from "@/components/Dropdown";
import { toTitleCase } from "@/utils/text";
import Button from "@/components/Button";
import IconComponent from "@/components/Icons"; // Asumsi komponen ini diimpor
import Header from "@/components/Header";
import Input from "@/components/Input";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useWallets } from "@/hooks/useWallets";
import AddCategoryModal from "@/components/AddCategoryModal";
import { useTransfer } from "@/hooks/useTransfer";
import {
  END_CONDITION_OPTIONS,
  RECURRENCE_OPTIONS,
} from "@/constant/recurrenceOptions";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper"; // Untuk wrapper layar penuh
import { useQueryClient } from "@tanstack/react-query";
import { useUpcomingBills } from "@/hooks/useUpcomingBills";
import { useBillPayment } from "@/hooks/useBillPayment";

const screenHeight = Dimensions.get("window").height;

// --- DEFINISI KOMPONEN SCREEN BARU ---
export default function TransactionScreen() {
  // 🟢 Navigasi & Props
  const navigation = useNavigation();
  const route = useRoute();
  const initialData = (route.params as any)?.initialData;
  const isEditing = !!initialData;

  const queryClient = useQueryClient();

  // 🟢 Hooks
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { createTransaction, updateTransaction, deleteTransaction } =
    useTransactionMutations();
  const { wallets, refetch: refetchWallets } = useWallets();
  const { data: categories = [] } = useCategories(userId);
  const { performTransfer, updateTransfer, deleteTransfer } = useTransfer();
  const { data: activeBills = [] } = useUpcomingBills();
  const { processManualBillPayment } = useBillPayment();

  // 🟢 States
  const [type, setType] = useState<"expense" | "income" | "transfer">(
    "expense"
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [fromWalletId, setFromWalletId] = useState<string | null>(null);
  const [toWalletId, setToWalletId] = useState<string | null>(null);

  // 🟢 States Tagihan Berulang
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState("none");
  const [endCondition, setEndCondition] = useState("never");
  const [endValue, setEndValue] = useState("");
  const [showRecurrenceDatePicker, setShowRecurrenceDatePicker] =
    useState(false);

  // --- Logic Utilities ---
  const dropdownCategoriesData = useMemo(() => {
    const filtered = categories.filter((c) => c.type === type);
    const mapped = filtered.map((cat) => ({
      label: toTitleCase(cat.name),
      value: cat.id,
    }));
    return [
      ...mapped,
      { label: "+ Tambah Kategori Baru", value: "__add_new__" },
    ];
  }, [categories, type]);

  // --- Logic Inisialisasi Data ---
  useEffect(() => {
    // 🟢 GUARD CLAUSE: Tunggu data siap saat mode Edit
    if (isEditing && (!initialData || wallets.length === 0)) {
      return; // Jangan lakukan apa-apa jika data belum siap
    }
    // Logika reset/inisialisasi saat screen dibuka
    if (isEditing && initialData) {
      // MODE EDIT
      setAmount(String(initialData.amount));
      setNote(initialData.note || "");
      setType(initialData.type);
      setCategoryId(initialData.category_id);
      setDate(new Date(initialData.date));

      // Inisialisasi Tagihan Berulang
      setIsRecurring(initialData.is_recurring || false);
      setRecurrenceRule(initialData.recurrence_rule || "none");
      setEndCondition(initialData.end_condition || "never");
      setEndValue(initialData.end_value || "");

      // Inisialisasi Wallet/Transfer
      if (initialData.is_transfer) {
        // ... (Logic find wallets untuk Transfer dipertahankan) ...
        const fromWallet =
          wallets.find((w) => w.id === initialData.source_wallet_id) ||
          wallets.find((w) => w.name === initialData.from_wallet);
        const toWallet =
          wallets.find((w) => w.id === initialData.destination_wallet_id) ||
          wallets.find((w) => w.name === initialData.to_wallet);
        setFromWalletId(fromWallet?.id ?? null);
        setToWalletId(toWallet?.id ?? null);
      } else {
        const wallet = wallets.find((w) => w.id === initialData.wallet_id);
        setWalletId(wallet?.id || null);
        setCategoryId(initialData.category_id);
      }
    } else {
      // MODE CREATE (Reset Penuh)
      setAmount("");
      setNote("");
      setType("expense");
      setWalletId(null);
      setCategoryId(null);
      setDate(new Date());
      setFromWalletId(null);
      setToWalletId(null);
      setIsRecurring(false);
      setRecurrenceRule("none");
      setEndCondition("never");
      setEndValue("");
    }
  }, [initialData, wallets]);

  // --- Handlers ---
  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSave = async () => {
    const matchingBill = activeBills.find((b) => b.category_id === categoryId);

    if (!amount) return Alert.alert("Error", "Harap isi jumlah");
    const numericAmount = Number(amount.replace(/\./g, ""));
    const UUID_RX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    // 1. Definisikan Payload Recurring
    const recurrencePayload = isRecurring
      ? {
          is_recurring: true,
          recurrence_rule: recurrenceRule,
          date: date.toISOString(), // Tanggal Jatuh Tempo Awal
          end_condition: endCondition,
          end_value:
            endCondition === "until_date"
              ? new Date(endValue).toISOString()
              : endCondition === "after_count"
              ? String(endValue)
              : null,
          transaction_count: 0,
        }
      : {
          is_recurring: false,
          recurrence_rule: null,
          end_condition: "never",
          end_value: null,
          transaction_count: null,
        };

    try {
      // 🟢 Handle TRANSFER (Non-Recurring di Fase 1)
      if (type === "transfer") {
        if (!fromWalletId || !toWalletId || fromWalletId === toWalletId) {
          return Alert.alert("Error", "Validasi Transfer Gagal.");
        }
        const rawId =
          initialData?.idToUpdate ??
          (initialData?.id?.startsWith("transfer-")
            ? initialData.id.replace("transfer-", "")
            : initialData?.id);
        const isUUIDValid = UUID_RX.test(rawId || "");

        const baseTransferPayload = {
          from_wallet_id: fromWalletId,
          to_wallet_id: toWalletId,
          amount: numericAmount,
          note,
          date: date.toISOString(),
          ...recurrencePayload, // Kirim non-recurring payload untuk membersihkan kolom di BE
        };

        if (isEditing && initialData?.is_transfer && isUUIDValid) {
          await updateTransfer({
            transfer_id: rawId,
            ...baseTransferPayload,
          } as any);
        } else {
          await performTransfer(baseTransferPayload as any);
        }
        navigation.goBack();
        await refetchWallets();
        return;
      }

      // 🟡 Handle INCOME / EXPENSE
      if (type === "expense" && !categoryId) {
        return Alert.alert("Error", "Harap pilih kategori untuk pengeluaran");
      }

      // 2. Payload Transaksi Dasar
      const basePayload = {
        amount: numericAmount,
        note,
        type,
        category_id: categoryId,
        user_id: userId,
        wallet_id: walletId,
      };
      const finalPayload = {
        ...basePayload,
        ...recurrencePayload,
        date: date.toISOString(),
      }; // Gabungkan semua payload

      if (isEditing) {
        await updateTransaction.mutateAsync({
          id: initialData.id,
          updates: finalPayload,
        });
      } else {
        if (matchingBill) {
          Alert.alert(
            "Deteksi Tagihan Berulang",
            `Anda memiliki tagihan "${
              matchingBill.categories?.name || "Unknown"
            }" yang akan datang. Apakah transaksi ini adalah pembayaran untuk tagihan tersebut?`,
            [
              {
                text: "Ya, Bayar & Geser Tanggal",
                // 🟢 4. PERBAIKAN: Panggil processManualBillPayment
                onPress: async () => {
                  try {
                    await processManualBillPayment({
                      billId: matchingBill.id,
                      amount: numericAmount, // Jumlah baru dari input
                      type: matchingBill.type,
                      categoryId: matchingBill.category_id,
                      recurrenceRule: matchingBill.recurrence_rule,
                      currentDueDate: matchingBill.date,
                      walletId: walletId!,
                    });
                    await queryClient.invalidateQueries({
                      queryKey: ["transactions", userId],
                    });
                    await queryClient.invalidateQueries({
                      queryKey: ["upcomingBills", userId],
                    });
                    await queryClient.invalidateQueries({
                      queryKey: ["billsSummary", userId],
                    });
                    navigation.goBack();
                    await refetchWallets();
                  } catch (err: any) {
                    Alert.alert("Gagal Membayar Tagihan", err.message);
                  }
                },
              },
              {
                text: "Bukan, Ini Transaksi Baru",
                onPress: async () => {
                  // Pastikan ini async
                  await createTransaction.mutateAsync(finalPayload as any);
                  // Pindahkan invalidasi dan navigasi ke sini juga
                  await queryClient.invalidateQueries({
                    queryKey: ["transactions", userId],
                  });
                  await queryClient.invalidateQueries({
                    queryKey: ["upcomingBills", userId],
                  });
                  await queryClient.invalidateQueries({
                    queryKey: ["billsSummary", userId],
                  });
                  navigation.goBack();
                  await refetchWallets();
                },
              },
              { text: "Batal", style: "cancel" },
            ]
          );
          return; // Hentikan eksekusi
        }

        await createTransaction.mutateAsync(finalPayload as any);

        // 5. Pindahkan invalidasi dan navigasi ke DALAM blok try/catch
        await queryClient.invalidateQueries({
          queryKey: ["transactions", userId],
        });
        await queryClient.invalidateQueries({
          queryKey: ["upcomingBills", userId],
        });
        await queryClient.invalidateQueries({
          queryKey: ["billsSummary", userId],
        });
        navigation.goBack();
        await refetchWallets();
      }

      await queryClient.invalidateQueries({
        queryKey: ["transactions", userId],
      });
      await queryClient.invalidateQueries({ queryKey: ["bills", userId] });
      await queryClient.invalidateQueries({
        queryKey: ["upcomingBills", userId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["billsSummary", userId],
      });

      navigation.goBack();
      await refetchWallets();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const showDeleteAlert = () => {
    const isRecurringBill = initialData?.is_recurring;

    // 1. Opsi Delete Standar (Menggunakan tipe literal yang benar)
    const standardOptions = [
      {
        text: "Batal",
        style: "cancel" as const, // <-- KRITIS: Menggunakan 'as const'
      },
    ];

    // 2. Opsi Jika Bukan Tagihan Berulang
    if (!isRecurringBill) {
      Alert.alert("Konfirmasi Hapus", "Yakin ingin menghapus transaksi ini?", [
        ...standardOptions,
        {
          text: "Hapus Permanen",
          style: "destructive" as const, // <-- Menggunakan 'as const'
          onPress: () => onDelete(),
        },
      ]);
      return;
    }

    // 3. Opsi Jika Adalah Tagihan Berulang (MENGHENTIKAN)
    Alert.alert(
      "Hapus Tagihan Berulang",
      "Apa yang ingin Anda lakukan dengan siklus tagihan ini?",
      [
        ...standardOptions,
        {
          text: "Hapus HANYA Transaksi Ini",
          style: "default" as const, // <-- Menggunakan 'as const'
          onPress: () => onDelete(),
        },
        {
          text: "Hentikan Siklus Tagihan",
          style: "destructive" as const, // <-- Menggunakan 'as const'
          onPress: () => onDeleteRecurring(),
        },
      ]
    );
  };

  // --- Fungsi Baru: Menghapus Siklus Tagihan (Template Induk) ---
  const onDeleteRecurring = async () => {
    try {
      const idToDelete = initialData?.id; // ID Transaksi Induk (Template)
      if (!idToDelete) throw new Error("ID Tagihan tidak ditemukan.");

      // Asumsi: Karena ini adalah Tagihan Induk, kita langsung panggil deleteTransaction
      await deleteTransaction.mutateAsync(idToDelete);

      await queryClient.invalidateQueries({
        queryKey: ["transactions", userId],
      });
      await queryClient.invalidateQueries({ queryKey: ["bills", userId] });

      Alert.alert("Sukses", "Siklus tagihan berulang telah dihentikan.");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Gagal Menghapus", err.message);
    }
  };

  const onDelete = async () => {
    try {
      const isTransfer = initialData?.is_transfer; // Mendapatkan UUID asli (baik transfer ID atau transaction ID)
      const idToDelete = isTransfer
        ? initialData?.id?.replace(/^transfer-/, "")
        : initialData?.id;

      if (!idToDelete) {
        throw new Error("ID transaksi tidak valid.");
      }

      // ✅ JALUR KRITIS: Panggil mutasi yang benar berdasarkan jenis transaksi
      if (isTransfer) {
        // Hapus dari tabel 'transfers', memicu Trigger pembalikan saldo
        await deleteTransfer(idToDelete);
      } else {
        // Hapus dari tabel 'transactions', memicu Trigger rollback_wallet_balance
        await deleteTransaction.mutateAsync(idToDelete);
      }

      await queryClient.invalidateQueries({
        queryKey: ["transactions", userId],
      });
      await queryClient.invalidateQueries({ queryKey: ["bills", userId] });

      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", err.message);
      return;
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.screenContainer}
      >
        <View style={styles.content}>
          {/* Header */}
          <Header
            title={isEditing ? "Edit Transaksi" : "Tambah Transaksi"}
            leftIcon={
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={28} color={colors.white} />
              </TouchableOpacity>
            }
          />

          {/* Tab Form */}
          <FlatList
            data={[{ key: "form" }]}
            renderItem={() => (
              <>
                {/* Tabs */}
                <View style={styles.tabContainer}>
                  {["expense", "income", "transfer"].map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      disabled={isEditing}
                      style={[
                        styles.tab,
                        type === tab &&
                          (tab === "expense"
                            ? styles.activeExpenseTab
                            : tab === "income"
                            ? styles.activeIncomeTab
                            : styles.activeTransferTab),
                      ]}
                      onPress={() => {
                        setType(tab as any);
                        setCategoryId(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          type === tab &&
                            (tab === "expense"
                              ? styles.activeExpenseText
                              : tab === "income"
                              ? styles.activeIncomeText
                              : styles.activeTransferText),
                        ]}
                      >
                        {tab === "expense"
                          ? "Pengeluaran"
                          : tab === "income"
                          ? "Pemasukan"
                          : "Transfer"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Inputs */}
                <View style={styles.form}>
                  {/* Tanggal Transaksi */}
                  <View style={styles.dateInput}>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      style={styles.dateTouchable}
                    >
                      <IconComponent
                        item={{ icon: "calendar-outline" } as any}
                        size={verticalScale(20)}
                        color={colors.neutral300}
                      />
                      <Typo size={16} color={colors.neutral100}>
                        {date.toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Typo>
                    </TouchableOpacity>
                  </View>

                  {/* Wallet/Transfer Dropdowns */}
                  {type === "transfer" ? (
                    // ... (Transfer Dropdowns JSX) ...
                    <>
                      <View style={styles.inputContainer}>
                        <BaseDropdown
                          data={wallets.map((w) => ({
                            label: toTitleCase(w.name),
                            value: w.id,
                          }))}
                          value={fromWalletId}
                          placeholder="Dari Wallet"
                          onChange={(item) =>
                            setFromWalletId(item.value as any)
                          }
                        />
                      </View>
                      <View style={styles.inputContainer}>
                        <BaseDropdown
                          data={wallets
                            .filter((w) => w.id !== fromWalletId)
                            .map((w) => ({
                              label: toTitleCase(w.name),
                              value: w.id,
                            }))}
                          value={toWalletId}
                          placeholder="Ke Wallet"
                          onChange={(item) => setToWalletId(item.value as any)}
                        />
                      </View>
                    </>
                  ) : (
                    // ... (Income/Expense Dropdowns JSX) ...
                    <>
                      <View style={styles.inputContainer}>
                        <BaseDropdown
                          data={wallets.map((wallet) => ({
                            label: toTitleCase(wallet.name),
                            value: wallet.id,
                          }))}
                          value={walletId}
                          placeholder="Select Wallet"
                          onChange={(item) => {
                            setWalletId(item.value as any);
                          }}
                        />
                      </View>
                      <View style={styles.inputContainer}>
                        <BaseDropdown
                          data={dropdownCategoriesData as any}
                          value={categoryId}
                          placeholder="Select Category"
                          onChange={(item) => {
                            if (item.value === "__add_new__") {
                              setShowAddCategoryModal(true);
                            } else {
                              setCategoryId(item.value as string);
                            }
                          }}
                        />
                      </View>
                    </>
                  )}

                  {/* Jumlah & Deskripsi */}
                  <Input
                    placeholder="Jumlah"
                    onChangeText={(text) => {
                      const numericValue = text.replace(/\D/g, "");
                      setAmount(
                        numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                      );
                    }}
                    value={amount}
                    keyboardType="numeric"
                  />
                  <View style={styles.inputContainer}>
                    <Input
                      placeholder="Description (optional)"
                      value={note}
                      onChangeText={setNote}
                      multiline
                      containerStyle={styles.descriptionInput}
                    />
                  </View>

                  {/* 🟢 TOMBOL TOGGLE RECURRING */}
                  {type !== "transfer" && (
                    <View style={styles.recurringToggleRow}>
                      <Typo color={colors.white} size={16}>
                        Atur sebagai Tagihan Berulang
                      </Typo>
                      <TouchableOpacity
                        onPress={() => setIsRecurring(!isRecurring)}
                      >
                        <MaterialCommunityIcons
                          name={
                            isRecurring
                              ? "toggle-switch"
                              : "toggle-switch-off-outline"
                          }
                          size={48}
                          color={
                            isRecurring ? colors.primary : colors.neutral700
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* 🟢 INPUT KONTROL BERULANG (Jika recurring aktif) */}
                  {isRecurring && type !== "transfer" && (
                    <View style={styles.recurringGroup}>
                      {/* FIELD A: FREKUENSI ULANGI */}
                      <Typo
                        color={colors.neutral400}
                        size={14}
                        style={styles.sectionTitle}
                      >
                        Ulangi Setiap:
                      </Typo>
                      <BaseDropdown
                        data={RECURRENCE_OPTIONS.filter(
                          (o) => o.value !== "none"
                        )}
                        value={recurrenceRule}
                        placeholder="Pilih Frekuensi"
                        onChange={(item) => setRecurrenceRule(item.value)}
                      />

                      {/* FIELD B: KONDISI AKHIR (Dropdown) */}
                      <Typo
                        color={colors.neutral400}
                        size={14}
                        style={styles.sectionTitle}
                      >
                        Akhiri Pengulangan:
                      </Typo>
                      <BaseDropdown
                        data={END_CONDITION_OPTIONS}
                        value={endCondition}
                        placeholder="Kondisi Akhir"
                        onChange={(item) => setEndCondition(item.value)}
                      />

                      {/* FIELD C: NILAI AKHIR (Kondisional) */}
                      {endCondition !== "never" && (
                        <View style={{ gap: 15, marginTop: 5 }}>
                          {endCondition === "until_date" && (
                            <TouchableOpacity
                              style={styles.dateInput}
                              onPress={() => {
                                setShowRecurrenceDatePicker(true);
                                if (!endValue)
                                  setEndValue(new Date().toISOString());
                              }}
                            >
                              <Typo size={16} color={colors.white}>
                                Sampai Tanggal:{" "}
                                {new Date(
                                  endValue || new Date()
                                ).toLocaleDateString("id-ID")}
                              </Typo>
                            </TouchableOpacity>
                          )}
                          {endCondition === "after_count" && (
                            <Input
                              placeholder="Setelah Berapa Kali Transaksi?"
                              keyboardType="numeric"
                              value={endValue}
                              onChangeText={setEndValue}
                            />
                          )}
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Footer (Simpan/Hapus) */}
                <View style={styles.footer}>
                  {isEditing && (
                    <Button
                      onPress={() => showDeleteAlert()}
                      style={styles.deleteButton}
                    >
                      <IconComponent
                        item={{ icon: "trash" } as any}
                        size={verticalScale(20)}
                        color={colors.neutral100}
                      />
                    </Button>
                  )}
                  <Button onPress={handleSave} style={styles.submitButton}>
                    <Typo color={colors.black} fontWeight={"700"}>
                      {isEditing ? "Update" : "Submit"}
                    </Typo>
                  </Button>
                </View>
              </>
            )}
            contentContainerStyle={styles.flatListContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          />
        </View>
      </KeyboardAvoidingView>
      {/* Date Picker Modal */}
      {showRecurrenceDatePicker && (
        <DateTimePicker
          // Jika until_date, pakai endValue.
          value={new Date(Date.parse(endValue) ? endValue : new Date())}
          mode="date"
          display="default"
          onChange={(_e, date) => {
            setShowRecurrenceDatePicker(false);
            if (date) {
              if (endCondition === "until_date") {
                setEndValue(date.toISOString());
              }
            }
          }}
        />
      )}

      {showDatePicker && (
        <DateTimePicker
          value={date} // Menggunakan state 'date' Anda
          mode="date"
          display="default"
          onChange={handleDateChange} // Menggunakan handler 'handleDateChange'
        />
      )}
    </ScreenWrapper>
  );
}

/* ===============================
 * Styles
 * =============================== */
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: colors.neutral900,
    paddingHorizontal: spacingX._20,
  },
  form: {
    gap: spacingY._20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.neutral800,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeExpenseTab: { backgroundColor: "#ffebee" },
  activeExpenseText: { color: "#e53935", fontWeight: "bold" },
  activeIncomeTab: { backgroundColor: "#e8f5e9" },
  activeTransferTab: { backgroundColor: "#bdf1faff" },
  activeIncomeText: { color: "#43a047", fontWeight: "bold" },
  activeTransferText: { color: "#0f76fcff", fontWeight: "bold" },

  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: colors.neutral800,
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  recurringToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: colors.neutral800,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  recurringGroup: {
    paddingTop: 10,
    paddingBottom: 20,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: colors.neutral700,
    marginTop: 10,
  },
  sectionTitle: {
    marginBottom: 5,
    marginTop: 10,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: spacingY._15,
    gap: scale(12),
    borderTopWidth: 1,
    borderTopColor: colors.neutral700,
    backgroundColor: colors.neutral900,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary, // Ganti warna default
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButton: {
    paddingHorizontal: spacingX._15,
    backgroundColor: colors.rose,
    borderRadius: 10,
    justifyContent: "center",
  },
  descriptionInput: {
    height: verticalScale(100),
    flexDirection: "row",
    alignItems: "flex-start",
    paddingBottom: 20,
  },
  flatListContent: {
    paddingBottom: 20, // Tambahkan padding untuk footer
  },
  inputContainer: {
    gap: spacingY._10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#777",
  },
  dateTouchable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
