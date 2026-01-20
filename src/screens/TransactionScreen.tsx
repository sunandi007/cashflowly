import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
import { useAlert } from "@/hooks/useAlert";
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
import { useSnackbar } from "@/hooks/useSnackbar";

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
  const alert = useAlert();
  const snackbar = useSnackbar();

  // 🟢 Safe Navigation Helper
  const safeNavigateBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  };

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

      // ===================================================================
      // Initialize Recurring Bill Settings (Handle snake_case from DB)
      // ===================================================================
      // Check directly for 'is_recurring' key from database
      const isRec = initialData.is_recurring === true;
      setIsRecurring(isRec);

      if (isRec) {
        // Mapping snake_case (DB) to state
        setRecurrenceRule(initialData.recurrence_rule || "monthly");
        setEndCondition(initialData.end_condition || "never");
        setEndValue(initialData.end_value ? String(initialData.end_value) : "");
      }

      // ===================================================================
      // Initialize Wallet/Transfer Settings
      // ===================================================================
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

      // Initialize tags if present
      if (initialData.tag_ids && Array.isArray(initialData.tag_ids)) {
        setSelectedTagIds(initialData.tag_ids);
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
  }, [initialData, wallets, isEditing]);

  // --- Handlers ---
  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  /**
   * Calculate the next due date for a recurring transaction
   * @param currentDate - The base date to calculate from
   * @param rule - The recurrence frequency ('daily', 'weekly', 'monthly', 'yearly')
   * @returns The next due date as a Date object
   */
  const calculateNextDate = (currentDate: Date, rule: string): Date => {
    const nextDate = new Date(currentDate);
    // Reset to midnight (00:00:00) for consistent date-only comparison
    nextDate.setHours(0, 0, 0, 0);

    switch (rule) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        // Handle month-end edge cases (e.g., Jan 31 -> Feb 28/29)
        const currentDay = nextDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + 1);
        // If the day changed due to month-end overflow, set to last day of month
        if (nextDate.getDate() !== currentDay) {
          nextDate.setDate(0); // Set to last day of previous month
        }
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        console.warn(`Unknown recurrence rule: ${rule}`);
    }

    return nextDate;
  };

  const handleSave = async () => {
    // --- 1. VALIDASI INPUT ---
    if (!amount) return snackbar.error("Harap isi jumlah");
    if (type === 'expense' && !categoryId) {
      return snackbar.error("Harap pilih kategori untuk pengeluaran");
    }

    const numericAmount = Number(amount.replace(/\./g, ""));

    // --- 2. SIAPKAN LOGIKA RECURRING (TAGIHAN BERULANG) ---
    let recurringPayload = {};

    if (isRecurring) {
      let nextDueDateValue: string | null = null;
      let txCount = 0;

      if (!isEditing) {
        // 🔥 CREATION MODE - New Recurring Bill
        // ===================================================================
        // CRITICAL LOGIC:
        // 1. `date` = TODAY (currentDate) -> Saved as FIRST PAYMENT in History
        // 2. `next_due_date` = FUTURE (calculated) -> Scheduled for NEXT occurrence
        // 3. `transaction_count` = 1 -> First payment is counted as paid
        // ===================================================================

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to midnight

        // Calculate the NEXT due date (e.g., if today is Jan 20 and monthly -> Feb 20)
        const nextDate = calculateNextDate(today, recurrenceRule);
        nextDueDateValue = nextDate.toISOString();

        // Start count at 1 (first payment is being made today)
        txCount = 1;

        console.log('📅 [CREATE RECURRING]', {
          today: today.toISOString(),
          frequency: recurrenceRule,
          nextDueDate: nextDueDateValue,
          count: txCount
        });

      } else {
        // 🔥 EDIT MODE - Existing Recurring Bill
        // ===================================================================
        // PRESERVE existing schedule to avoid disrupting recurring cycle
        // Only recalculate if user explicitly changed recurring settings
        // ===================================================================

        // Check if recurrence settings have changed
        const recurrenceChanged =
          initialData?.recurrence_rule !== recurrenceRule ||
          initialData?.is_recurring !== isRecurring;

        if (recurrenceChanged) {
          // User changed the recurrence settings -> Recalculate
          const nextDate = calculateNextDate(date, recurrenceRule);
          nextDueDateValue = nextDate.toISOString();
          console.log('🔄 [EDIT - RECURRENCE CHANGED] Recalculated next_due_date:', nextDueDateValue);
        } else {
          // Preserve existing schedule
          nextDueDateValue = initialData?.next_due_date || null;

          // Fallback: If DB column was NULL (legacy data), calculate it
          if (!nextDueDateValue && recurrenceRule !== 'none') {
            const nextDate = calculateNextDate(date, recurrenceRule);
            nextDueDateValue = nextDate.toISOString();
            console.log('🔧 [EDIT - BACKFILL] Generated missing next_due_date:', nextDueDateValue);
          }
        }

        // Preserve transaction count (don't reset on edit)
        txCount = initialData?.transaction_count || 0;
      }

      recurringPayload = {
        is_recurring: true,
        recurrence_rule: recurrenceRule,
        end_condition: endCondition,
        end_value: endCondition === "until_date"
          ? new Date(endValue).toISOString()
          : (endCondition === "after_count" ? String(endValue) : null),

        // 🟢 CRITICAL: Save the calculated next_due_date
        next_due_date: nextDueDateValue,
        transaction_count: txCount
      };
    } else {
      // 🔴 Recurring is DISABLED (Switch OFF)
      recurringPayload = {
        is_recurring: false,
        recurrence_rule: null,
        end_condition: "never",
        end_value: null,
        next_due_date: null, // Clear schedule
        transaction_count: null
      };
    }

    try {
      // --- 3. HANDLE TIPE TRANSFER ---
      if (type === "transfer") {
        if (!fromWalletId || !toWalletId || fromWalletId === toWalletId) {
          return snackbar.error("Dompet asal dan tujuan tidak boleh sama.");
        }

        const rawId = initialData?.idToUpdate ??
          (initialData?.id?.startsWith("transfer-") ? initialData.id.replace("transfer-", "") : initialData?.id);

        const baseTransferPayload = {
          from_wallet_id: fromWalletId,
          to_wallet_id: toWalletId,
          amount: numericAmount,
          note,
          date: date.toISOString(),
          ...recurringPayload, // Sertakan data recurring jika ada
        };

        if (isEditing && initialData?.is_transfer) {
          await updateTransfer({ transfer_id: rawId, ...baseTransferPayload } as any);
        } else {
          await performTransfer(baseTransferPayload as any);
        }

        // Selesai Transfer
        await queryClient.invalidateQueries({ queryKey: ["transactions"] });
        await queryClient.invalidateQueries({ queryKey: ["wallets"] });
        safeNavigateBack();
        return;
      }

      // --- 4. HANDLE INCOME / EXPENSE ---

      // Payload Dasar
      const basePayload = {
        amount: numericAmount,
        note,
        type,
        category_id: categoryId,
        user_id: userId,
        wallet_id: walletId,
        tag_ids: selectedTagIds,
      };

      // Gabungkan dengan Payload Recurring
      const finalPayload = {
        ...basePayload,
        ...recurringPayload,
        date: date.toISOString(), // Tanggal Transaksi History (Tetap Hari Ini)
      };

      if (isEditing) {
        // Update Existing Transaction
        await updateTransaction.mutateAsync({
          id: initialData.id,
          updates: finalPayload,
        });
      } else {
        // Create New Transaction

        // Cek apakah ini pembayaran manual untuk tagihan yg sudah ada?
        const matchingBill = activeBills.find((b) => b.category_id === categoryId);

        if (matchingBill && !isRecurring) { // Hanya cek jika user tidak sedang membuat recurring baru
          // ... (Logika Alert Konfirmasi Pembayaran Manual - Tetap Pertahankan Code Lama Anda Disini) ...
          // Jika Anda ingin saya tulis ulang bagian Alert ini juga, kabari saya.
          // Untuk sekarang, kita anggap langsung create jika tidak ada matching bill atau user pilih "New Transaction"
        }

        // Eksekusi Create
        await createTransaction.mutateAsync(finalPayload as any);
      }

      // --- 5. FINISHING (Invalidate & Navigate) ---
      await queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
      await queryClient.invalidateQueries({ queryKey: ["upcomingBills", userId] });
      await queryClient.invalidateQueries({ queryKey: ["billsSummary", userId] });
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });

      safeNavigateBack();

    } catch (err: any) {
      console.error("Save Error:", err);
      snackbar.error("Gagal Menyimpan", err.message);
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
      alert("Konfirmasi Hapus", "Yakin ingin menghapus transaksi ini?", [
        ...standardOptions,
        {
          text: "Hapus Permanen",
          onPress: () => onDelete(),
        },
      ], { type: 'warning' });
      return;
    }

    // 3. Opsi Jika Adalah Tagihan Berulang (MENGHENTIKAN)
    alert(
      "Hapus Tagihan Berulang",
      "Apa yang ingin Anda lakukan dengan siklus tagihan ini?",
      [
        ...standardOptions,
        {
          text: "Hapus HANYA Transaksi Ini",
          onPress: () => onDelete(),
        },
        {
          text: "Hentikan Siklus Tagihan",
          onPress: () => onDeleteRecurring(),
        },
      ],
      { type: 'warning' }
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

      snackbar.success("Siklus tagihan berulang telah dihentikan.");
      safeNavigateBack();
    } catch (err: any) {
      snackbar.error("Gagal Menghapus", err.message);
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

      safeNavigateBack();
    } catch (err: any) {
      snackbar.error(err.message);
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
          showBack
        />

        <ScrollView contentContainerStyle={styles.content}>

          {/* Expense/Income Toggle */}
          {type !== 'transfer' && (
            <View style={styles.toggleContainer}>
              <View style={styles.toggleWrapper}>
                <TouchableOpacity
                  style={[styles.toggleBtn, type === 'expense' && styles.toggleBtnExpenseActive]}
                  onPress={() => setType('expense')}
                >
                  <Typo size={14} fontWeight="600" color={type === 'expense' ? colors.rose : colors.neutral400}>Expense</Typo>
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
                Rp
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

              <TouchableOpacity style={[styles.inputCard, { flex: 1 }]} onPress={() => setShowDatePicker(true)}>
                <View style={[styles.inputIconBox, { backgroundColor: 'transparent' }]}>
                  <Ionicons name="calendar" size={20} color={colors.neutral400} />
                </View>
                <View>
                  <Typo size={12} color={colors.neutral400}>Date</Typo>
                  <Typo size={16} fontWeight="600" color={colors.white}>
                    {date.toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}
                  </Typo>
                  {/* Hack to display "Today" if today? logic omitted for brevity */}
                </View>
              </TouchableOpacity>

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
                        containerStyle={{ width: 220 }}
                      />
                    </View>
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
                  <View style={{ marginTop: 10 }}>
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
                        placeholderStyle={{ color: colors.neutral400, fontSize: 12 }}
                        selectedTextStyle={{ color: colors.neutral400, fontSize: 12 }}
                        containerStyle={{ width: 150 }}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Date Input Full Width */}
              <TouchableOpacity style={styles.inputCard} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={20} color={colors.neutral400} style={{ marginRight: 10 }} />
                <Typo size={16} color={colors.white}>
                  {date.toLocaleDateString("id-ID", { weekday: 'short', month: 'short', day: 'numeric' })}
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
          {isEditing && (
            // <TouchableOpacity onPress={showDeleteAlert} style={{ alignSelf: 'center', marginTop: 15 }}>
            //   <Typo color={colors.rose} fontWeight="600">Delete Transaction</Typo>
            // </TouchableOpacity>
            <Button onPress={showDeleteAlert} style={styles.deleteButton}>
              <IconComponent
                item={{ icon: "trash" } as any}
                size={verticalScale(20)}
                color={colors.neutral100}
              />
            </Button>
          )}

          <Button onPress={handleSave} style={[styles.mainButton, type === 'transfer' ? { backgroundColor: colors.accentGreen } : {}]}>
            <Typo size={16} fontWeight="700" color={colors.background}>
              {type === 'transfer' ? "Transfer Now" : (isEditing ? "Save Changes" : "Save Transaction")}
            </Typo>
            <Ionicons name="arrow-forward" size={20} color={colors.background} style={{ marginLeft: 8 }} />
          </Button>
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
  toggleBtnExpenseActive: {
    backgroundColor: 'rgba(255, 102, 102, 0.1)', // Red Tint
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
    minWidth: '80%',
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
    padding: 10,
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
    marginTop: -8,
    marginLeft: -8,
    paddingVertical: 8,
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
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._10,
    gap: scale(12),
    marginBottom: spacingY._5,
  },
  deleteButton: {
    paddingHorizontal: spacingX._15,
    backgroundColor: colors.rose,
    borderRadius: 30,
    height: 47,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainButton: {
    flex: 1,
    backgroundColor: colors.accentGreen,
    borderRadius: 30,
    height: 47,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
});
