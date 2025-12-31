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
  ScrollView,
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
import TagSelector from "@/components/TagSelector";

const screenHeight = Dimensions.get("window").height;

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
  const [categoryIcon, setCategoryIcon] = useState<string>("grid-outline");
  const [walletId, setWalletId] = useState<string | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [fromWalletId, setFromWalletId] = useState<string | null>(null);
  const [toWalletId, setToWalletId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // 🟢 States Tagihan Berulang
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState("none");
  const [endCondition, setEndCondition] = useState("never");
  const [endValue, setEndValue] = useState("");
  const [showRecurrenceDatePicker, setShowRecurrenceDatePicker] =
    useState(false);

  // Handler untuk toggle tag
  const handleToggleTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      setSelectedTagIds(prev => prev.filter(tagId => tagId !== id));
    } else {
      setSelectedTagIds(prev => [...prev, id]);
    }
  };

  // --- Logic Utilities ---
  const dropdownCategoriesData = useMemo(() => {
    const filtered = categories.filter((c) => c.type === type);
    const mapped = filtered.map((cat) => ({
      label: toTitleCase(cat.name),
      value: cat.id,
      icon: cat.icon,
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
        tag_ids: selectedTagIds,
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
            `Anda memiliki tagihan "${matchingBill.categories?.name || "Unknown"
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

  // --- Render Components ----

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.screenContainer}
      >
        <Header
          title={type === 'transfer' ? "Transfer Funds" : (isEditing ? "Edit Transaction" : "New Transaction")}
          leftIcon={
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
          }
        />

        <ScrollView contentContainerStyle={styles.content}>

          {/* Expense/Income Toggle */}
          {type !== 'transfer' && (
            <View style={styles.toggleContainer}>
              <View style={styles.toggleWrapper}>
                <TouchableOpacity
                  style={[styles.toggleBtn, type === 'expense' && styles.toggleBtnActive]}
                  onPress={() => setType('expense')}
                >
                  <Typo size={14} fontWeight="600" color={type === 'expense' ? colors.accentGreen : colors.neutral400}>Expense</Typo>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, type === 'income' && styles.toggleBtnActive]}
                  onPress={() => setType('income')}
                >
                  <Typo size={14} fontWeight="600" color={type === 'income' ? colors.accentGreen : colors.neutral400}>Income</Typo>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setType('transfer')} style={styles.miniTransferBtn}>
                <Ionicons name="swap-horizontal" size={20} color={colors.neutral400} />
              </TouchableOpacity>
            </View>
          )}

          {/* Amount Input */}
          <View style={styles.amountSection}>
            {type === 'transfer' && (
              <Typo size={12} color={colors.neutral400} style={{ marginBottom: 8, letterSpacing: 1 }}>AMOUNT TO SEND</Typo>
            )}
            <View style={styles.amountRow}>
              <Typo size={24} fontWeight="600" color={colors.neutral500} style={{ marginRight: 8 }}>
                {type === 'transfer' ? "$" : "Rp"}
              </Typo>
              <Input
                placeholder="0"
                onChangeText={(text) => {
                  const numericValue = text.replace(/\D/g, "");
                  setAmount(
                    numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  );
                }}
                value={amount}
                keyboardType="numeric"
                containerStyle={styles.amountInputContainer}
                inputStyle={styles.amountInputText}
                placeholderTextColor={colors.neutral500}
              />
            </View>
          </View>

          {/* --- FORM INCOME / EXPENSE --- */}
          {type !== 'transfer' && (
            <View style={styles.formGroup}>
              {/* Category Selection */}
              <View style={styles.inputCard}>
                <View style={styles.inputIconBox}>
                  <Ionicons name={categoryIcon as any} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typo size={12} color={colors.neutral400}>Category</Typo>
                  <View style={styles.invisibleDropdownWrapper}>
                    <BaseDropdown
                      data={dropdownCategoriesData as any}
                      value={categoryId}
                      placeholder="Select Category"
                      onChange={(item: any) => {
                        if (item.value === "__add_new__") {
                          setShowAddCategoryModal(true);
                        } else {
                          setCategoryId(item.value as string);
                          setCategoryIcon(item.icon as string);
                        }
                      }}
                      style={styles.cleanDropdown}
                      placeholderStyle={{ color: colors.white, fontSize: 16, fontWeight: '600' }}
                      selectedTextStyle={{ color: colors.white, fontSize: 16, fontWeight: '600' }}
                    />
                  </View>
                </View>
              </View>

              {/* Wallet Selection */}
              <View style={styles.inputCard}>
                <View style={styles.inputIconBox}>
                  <Ionicons name="wallet-outline" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typo size={12} color={colors.neutral400}>Wallet</Typo>
                  <View style={styles.invisibleDropdownWrapper}>
                    <BaseDropdown
                      data={wallets.map((wallet) => ({
                        label: toTitleCase(wallet.name),
                        value: wallet.id,
                      }))}
                      value={walletId}
                      placeholder="Select Wallet"
                      onChange={(item) => setWalletId(item.value as any)}
                      style={styles.cleanDropdown}
                      placeholderStyle={{ color: colors.white, fontSize: 16, fontWeight: '600' }}
                      selectedTextStyle={{ color: colors.white, fontSize: 16, fontWeight: '600' }}
                    />
                  </View>
                </View>
              </View>

              {/* Date & Time (Split) */}
              <View style={styles.rowGap}>
                <TouchableOpacity style={[styles.inputCard, { flex: 1 }]} onPress={() => setShowDatePicker(true)}>
                  <View style={[styles.inputIconBox, { backgroundColor: 'transparent' }]}>
                    <Ionicons name="calendar" size={20} color={colors.neutral400} />
                  </View>
                  <View>
                    <Typo size={12} color={colors.neutral400}>Date</Typo>
                    <Typo size={16} fontWeight="600" color={colors.white}>
                      {date.toLocaleDateString("en-US", { day: '2-digit', month: 'short' })}
                    </Typo>
                    {/* Hack to display "Today" if today? logic omitted for brevity */}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.inputCard, { flex: 1 }]}>
                  <View style={[styles.inputIconBox, { backgroundColor: 'transparent' }]}>
                    <Ionicons name="time" size={20} color={colors.neutral400} />
                  </View>
                  <View>
                    <Typo size={12} color={colors.neutral400}>Time</Typo>
                    <Typo size={16} fontWeight="600" color={colors.white}>
                      {date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </Typo>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Note */}
              <View style={styles.inputCardPlain}>
                <Ionicons name="create-outline" size={20} color={colors.neutral400} style={{ marginRight: 10 }} />
                <Input
                  placeholder="Add a note..."
                  value={note}
                  onChangeText={setNote}
                  containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, flex: 1, height: '100%' }}
                  inputStyle={{ color: colors.white }}
                  placeholderTextColor={colors.neutral400}
                />
              </View>

              {/* Tags */}
              <View>
                <TagSelector
                  selectedTagIds={selectedTagIds}
                  onToggleTag={handleToggleTag}
                />
              </View>

              {/* Repeat Toggle */}
              <View style={styles.toggleRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.iconCircleSmall}>
                    <Ionicons name="repeat" size={16} color={colors.accentGreen} />
                  </View>
                  <Typo size={16} fontWeight="600" color={colors.white}>Repeat Transaction</Typo>
                </View>
                <TouchableOpacity onPress={() => setIsRecurring(!isRecurring)}>
                  <MaterialCommunityIcons
                    name={isRecurring ? "toggle-switch" : "toggle-switch-off-outline"}
                    size={40}
                    color={isRecurring ? colors.accentGreen : colors.neutral600}
                  />
                </TouchableOpacity>
              </View>

              {/* Recurring Options */}
              {isRecurring && (
                <View style={styles.recurringOptions}>
                  {/* Frequency */}
                  <View style={styles.inputCard}>
                    <View style={styles.inputIconBox}>
                      <MaterialCommunityIcons name="calendar-refresh" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Typo size={12} color={colors.neutral400}>Frequency</Typo>
                      <View style={styles.invisibleDropdownWrapper}>
                        <BaseDropdown
                          data={RECURRENCE_OPTIONS.filter((o) => o.value !== "none")}
                          value={recurrenceRule}
                          placeholder="Frequency"
                          onChange={(item) => setRecurrenceRule(item.value)}
                          style={styles.cleanDropdown}
                          placeholderStyle={{ color: colors.white, fontSize: 16, fontWeight: '600' }}
                          selectedTextStyle={{ color: colors.white, fontSize: 16, fontWeight: '600' }}
                        />
                      </View>
                    </View>
                  </View>

                  {/* End Condition */}
                  <View style={styles.inputCard}>
                    <View style={styles.inputIconBox}>
                      <MaterialCommunityIcons name="flag-checkered" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Typo size={12} color={colors.neutral400}>End Condition</Typo>
                      <View style={styles.invisibleDropdownWrapper}>
                        <BaseDropdown
                          data={END_CONDITION_OPTIONS}
                          value={endCondition}
                          placeholder="End Condition"
                          onChange={(item) => setEndCondition(item.value)}
                          style={styles.cleanDropdown}
                          placeholderStyle={{ color: colors.white, fontSize: 16, fontWeight: '600' }}
                          selectedTextStyle={{ color: colors.white, fontSize: 16, fontWeight: '600' }}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Dynamic End Value Inputs */}
                  {endCondition === "until_date" && (
                    <TouchableOpacity style={styles.inputCard} onPress={() => setShowRecurrenceDatePicker(true)}>
                      <View style={styles.inputIconBox}>
                        <Ionicons name="calendar" size={20} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Typo size={12} color={colors.neutral400}>End Date</Typo>
                        <Typo size={16} fontWeight="600" color={colors.white}>
                          {endValue ? new Date(endValue).toLocaleDateString() : "Select Date"}
                        </Typo>
                      </View>
                    </TouchableOpacity>
                  )}

                  {endCondition === "after_count" && (
                    <View style={styles.inputCard}>
                      <View style={styles.inputIconBox}>
                        <Ionicons name="repeat" size={20} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Typo size={12} color={colors.neutral400}>Occurrences</Typo>
                        <Input
                          placeholder="e.g. 10"
                          keyboardType="numeric"
                          value={endValue}
                          onChangeText={setEndValue}
                          containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, height: 30, paddingLeft: 0 }}
                          inputStyle={{ color: colors.white, fontSize: 16, fontWeight: '600', paddingLeft: 0, paddingVertical: 0 }} // Remove default padding
                          placeholderTextColor={colors.neutral500}
                        />
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* --- FORM TRANSFER --- */}
          {type === 'transfer' && (
            <View style={styles.formGroup}>
              {/* Wallets Transfer Row */}
              <View style={styles.transferRow}>
                {/* FROM */}
                <View style={[styles.transferCard, { flex: 1 }]}>
                  <View style={[styles.iconCircleSmall, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="wallet" size={16} color={colors.primaryLight} />
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <Typo size={12} color={colors.white} fontWeight="600">From</Typo>
                    <View style={styles.invisibleDropdownWrapper}>
                      <BaseDropdown
                        data={wallets.map((w) => ({
                          label: toTitleCase(w.name),
                          value: w.id,
                        }))}
                        value={fromWalletId}
                        placeholder="Select"
                        onChange={(item) => setFromWalletId(item.value as any)}
                        style={styles.cleanDropdown}
                        placeholderStyle={{ color: colors.neutral400, fontSize: 12 }}
                        selectedTextStyle={{ color: colors.neutral400, fontSize: 12 }}
                      />
                    </View>
                    <Typo size={12} color={colors.accentGreen}>****</Typo>
                  </View>
                </View>

                {/* Arrow */}
                <View style={styles.arrowCircle}>
                  <Ionicons name="arrow-forward" size={20} color={colors.accentGreen} />
                </View>

                {/* TO */}
                <View style={[styles.transferCard, { flex: 1 }]}>
                  <View style={[styles.iconCircleSmall, { backgroundColor: colors.rose + '20' }]}>
                    <Ionicons name="wallet" size={16} color={colors.roseLight} />
                  </View>
                  <View style={{ marginTop: 10, alignItems: 'flex-end' }}>
                    <Typo size={12} color={colors.white} fontWeight="600">To</Typo>
                    <View style={styles.invisibleDropdownWrapper}>
                      <BaseDropdown
                        data={wallets
                          .filter((w) => w.id !== fromWalletId)
                          .map((w) => ({
                            label: toTitleCase(w.name),
                            value: w.id,
                          }))}
                        value={toWalletId}
                        placeholder="Select"
                        onChange={(item) => setToWalletId(item.value as any)}
                        style={styles.cleanDropdown}
                        placeholderStyle={{ color: colors.neutral400, fontSize: 12, textAlign: 'right' }}
                        selectedTextStyle={{ color: colors.neutral400, fontSize: 12, textAlign: 'right' }}
                      />
                    </View>
                    <Typo size={12} color={colors.neutral500}>Target</Typo>
                  </View>
                </View>
              </View>

              {/* Date Input Full Width */}
              <TouchableOpacity style={styles.inputCard} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={20} color={colors.neutral400} style={{ marginRight: 10 }} />
                <Typo size={16} color={colors.white}>
                  {date.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                </Typo>
                <View style={{ flex: 1 }} />
                <Ionicons name="pencil" size={16} color={colors.neutral500} />
              </TouchableOpacity>

              {/* Note Input Full Width */}
              <View style={styles.inputCardPlain}>
                <Ionicons name="document-text-outline" size={20} color={colors.neutral400} style={{ marginRight: 10 }} />
                <Input
                  placeholder="Add a note (e.g. Rent)"
                  value={note}
                  onChangeText={setNote}
                  containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, flex: 1 }}
                  inputStyle={{ color: colors.white }}
                  placeholderTextColor={colors.neutral400}
                />
              </View>

              {/* Go back to Expense/Income Link */}
              <TouchableOpacity onPress={() => setType('expense')} style={{ alignSelf: 'center', marginTop: 10 }}>
                <Typo color={colors.neutral500} size={12}>Switch to Transaction Mode</Typo>
              </TouchableOpacity>

            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer Button Positioned at Bottom */}
        <View style={styles.footer}>
          <Button onPress={handleSave} style={[styles.mainButton, type === 'transfer' ? { backgroundColor: colors.accentGreen } : {}]}>
            <Typo size={16} fontWeight="700" color={colors.background}>
              {type === 'transfer' ? "Transfer Now" : (isEditing ? "Save Changes" : "Save Transaction")}
            </Typo>
            <Ionicons name="arrow-forward" size={20} color={colors.background} style={{ marginLeft: 8 }} />
          </Button>

          {isEditing && (
            <TouchableOpacity onPress={showDeleteAlert} style={{ alignSelf: 'center', marginTop: 15 }}>
              <Typo color={colors.rose} fontWeight="600">Delete Transaction</Typo>
            </TouchableOpacity>
          )}
        </View>

      </KeyboardAvoidingView>

      {showRecurrenceDatePicker && (
        <DateTimePicker
          value={new Date(Date.parse(endValue) ? endValue : new Date())}
          mode="date"
          onChange={(_e, date) => {
            setShowRecurrenceDatePicker(false);
            if (date) {
              if (endCondition === "until_date") setEndValue(date.toISOString());
            }
          }}
        />
      )}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={handleDateChange}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacingX._20,
    paddingTop: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30
  },
  toggleWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.neutral800,
    borderRadius: 30,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 24,
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(5, 199, 126, 0.1)', // Green Tint
  },
  miniTransferBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.neutral800,
    justifyContent: 'center', alignItems: 'center'
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  amountInputContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    width: 'auto',
    minWidth: 100,
    height: 60,
  },
  amountInputText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    height: 60,
    padding: 0
  },
  formGroup: {
    gap: 15
  },
  inputCard: {
    backgroundColor: colors.neutral800,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  inputCardPlain: {
    backgroundColor: colors.neutral800,
    paddingHorizontal: 16,
    paddingVertical: 4, // Input has own height
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(5, 199, 126, 0.1)',
    justifyContent: 'center', alignItems: 'center'
  },
  invisibleDropdownWrapper: {
    marginTop: -8, // Pull up to align with label
    marginLeft: -8, // Pull left
  },
  cleanDropdown: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 8,
    height: 30
  },
  rowGap: {
    flexDirection: 'row',
    gap: 12
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  iconCircleSmall: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(5, 199, 126, 0.1)',
    justifyContent: 'center', alignItems: 'center'
  },
  recurringOptions: {
    gap: 12,
    marginTop: 10
  },
  // Transfer Styles
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  transferCard: {
    backgroundColor: colors.neutral800,
    padding: 16,
    borderRadius: 24,
    height: 120,
    justifyContent: 'space-between'
  },
  arrowCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.neutral800,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.neutral700
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30, // Safe area
  },
  mainButton: {
    backgroundColor: colors.accentGreen,
    borderRadius: 30,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
