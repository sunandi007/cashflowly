// src/components/TransactionModal.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Modal,
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
import { useTransactionMutations } from "@/hooks/useTransactionMutations";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import Typo from "./Typo";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";
import BaseDropdown from "./Dropdown";
import { toTitleCase } from "@/utils/text";
import Button from "./Button";
import IconComponent from "./Icons";
import Header from "./Header";
import Input from "./Input";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useWallets } from "@/hooks/useWallets";
import AddCategoryModal from "@/components/AddCategoryModal";
import { useTransfer } from "@/hooks/useTransfer";
import {
  END_CONDITION_OPTIONS,
  RECURRENCE_OPTIONS,
} from "@/constant/recurrenceOptions";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const screenHeight = Dimensions.get("window").height;
export default function TransactionModal({
  visible,
  onClose,
  initialData,
}: any) {
  const isEditing = !!initialData;
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { createTransaction, updateTransaction, deleteTransaction } =
    useTransactionMutations();
  const { wallets } = useWallets();
  const { data: categories = [] } = useCategories(userId);

  const [type, setType] = useState<"expense" | "income" | "transfer">(
    "expense"
  );

  const {
    performTransfer,
    isTransferring,
    updateTransfer,
    isUpdatingTransfer,
    deleteTransfer,
  } = useTransfer();

  const dropdownCategoriesData = useMemo(() => {
    // Filter kategori berdasarkan tipe transaksi (income / expense)
    const filtered = categories.filter((c) => c.type === type);

    // Map hasilnya ke label/value
    const mapped = filtered.map((cat) => ({
      label: toTitleCase(cat.name),
      value: cat.id,
    }));

    // ✅ Tambahkan opsi "Tambah Kategori Baru" di akhir
    return [
      ...mapped,
      { label: "+ Tambah Kategori Baru", value: "__add_new__" },
    ];
  }, [categories, type]);

  const { refetch: refetchWallets } = useWallets();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [fromWalletId, setFromWalletId] = useState<string | null>(null);
  const [toWalletId, setToWalletId] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState("none"); // Frekuensi ('monthly', '2_weeks', etc.)
  const [endCondition, setEndCondition] = useState("never"); // Kondisi berhenti
  const [endValue, setEndValue] = useState(""); // Nilai untuk 'until_date' (date) atau 'after_count' (number)
  const [showRecurrenceDatePicker, setShowRecurrenceDatePicker] =
    useState(false);

  useEffect(() => {
    if (!visible) return;
    if (isEditing && initialData) {
      console.log("initial data :", initialData);

      setAmount(String(initialData.amount));
      setNote(initialData.note || "");
      setType(initialData.type);
      setCategoryId(initialData.category_id);
      setDate(new Date(initialData.date));
      setIsRecurring(initialData.is_recurring || false);
      setRecurrenceRule(initialData.recurrence_rule || "none");
      setEndCondition(initialData.end_condition || "never");
      setEndValue(initialData.end_value || "");
      if (initialData.is_transfer) {
        const fromWallet =
          wallets.find((w) => w.id === initialData.source_wallet_id) ||
          wallets.find((w) => w.name === initialData.from_wallet);

        const toWallet =
          wallets.find((w) => w.id === initialData.destination_wallet_id) ||
          wallets.find((w) => w.name === initialData.to_wallet);

        setFromWalletId(fromWallet?.id ?? null);
        setToWalletId(toWallet?.id ?? null);
      } else {
        const wallet = wallets.find(
          (w) => w.id === initialData.wallet_id || w.name === initialData.wallet
        );
        setWalletId(wallet?.id || null);
        setCategoryId(initialData.category_id);
      }
    } else {
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
  }, [initialData, visible]);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSave = async () => {
    if (!amount) return Alert.alert("Error", "Harap isi jumlah");

    // Validasi Tagihan Berulang
    if (isRecurring && recurrenceRule === "none") {
      return Alert.alert("Error", "Harap pilih frekuensi pengulangan.");
    }

    // 🟢 VALIDASI KRITIS
    if (isRecurring && endCondition === "after_count") {
      if (!endValue || Number(endValue) <= 0 || !/^\d+$/.test(endValue)) {
        return Alert.alert(
          "Error",
          "Jumlah hitungan harus berupa angka positif."
        );
      }
    }

    const numericAmount = Number(amount.replace(/\./g, ""));
    const UUID_RX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const recurrencePayload = isRecurring
      ? {
          is_recurring: true,
          recurrence_rule: recurrenceRule,
          date: date.toISOString(),
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
      // 🟢 Handle TRANSFER
      if (type === "transfer") {
        if (!fromWalletId || !toWalletId)
          return Alert.alert("Error", "Pilih wallet asal dan tujuan");
        if (fromWalletId === toWalletId)
          return Alert.alert(
            "Error",
            "Wallet asal dan tujuan tidak boleh sama"
          );

        // ambil UUID asli (bisa dari idToUpdate atau dari id tanpa prefix)
        const rawId =
          initialData?.idToUpdate ??
          (initialData?.id?.startsWith("transfer-")
            ? initialData.id.replace("transfer-", "")
            : initialData?.id);

        const isUUIDValid = UUID_RX.test(rawId || "");

        if (isEditing && initialData?.is_transfer && isUUIDValid) {
          // ✅ UPDATE TRANSFER
          await updateTransfer({
            transfer_id: initialData.id?.replace(/^transfer-/, ""),
            from_wallet_id: fromWalletId,
            to_wallet_id: toWalletId,
            amount: numericAmount,
            note,
            date: date.toISOString(),
          });
        } else {
          // ✅ CREATE TRANSFER
          await performTransfer({
            from_wallet_id: fromWalletId,
            to_wallet_id: toWalletId,
            amount: numericAmount,
            note,
          });
        }

        await refetchWallets();
        onClose();
        return;
      }

      // 🟡 Handle INCOME / EXPENSE
      if (type === "expense" && !categoryId)
        return Alert.alert("Error", "Harap pilih kategori untuk pengeluaran");

      const basePayload = {
        amount: numericAmount,
        note,
        type,
        category_id: categoryId,
        user_id: userId,
        date: date.toISOString(),
        wallet_id: walletId,
      };

      const finalPayload = { ...basePayload, ...recurrencePayload };

      if (isEditing) {
        await updateTransaction.mutateAsync({
          id: initialData.id,
          updates: finalPayload,
        });
      } else {
        await createTransaction.mutateAsync(finalPayload);
      }

      await refetchWallets();
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };
  const showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Cancel delete"),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => onDelete(),
        },
      ]
    );
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

      onClose();
    } catch (err: any) {
      Alert.alert("Error", err.message);
      return;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modal}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <Header
              style={{
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: spacingY._10,
              }}
              title={isEditing ? "Edit Transaksi" : "Tambah Transaksi"}
              rightIcon={
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    setAmount("");
                    setNote("");
                    setType("expense");
                    setCategoryId(null);
                  }}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              }
            />

            {/* Tab Form */}
            <FlatList
              data={[{ key: "form" }]} // dummy item
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
                    <View style={styles.dateInput}>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
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

                    {type === "transfer" ? (
                      <>
                        {/* Dari Wallet */}
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

                        {/* Ke Wallet */}
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
                            onChange={(item) =>
                              setToWalletId(item.value as any)
                            }
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        {/* Wallet tunggal untuk income/expense */}
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
                        {/* Category hanya untuk income/expense */}
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
                          {/* <AddCategoryModal
                            visible={showAddCategoryModal}
                            onClose={() => {
                              setShowAddCategoryModal(false);
                              setCategoryId(null);
                            }}
                          /> */}
                        </View>
                      </>
                    )}

                    <Input
                      placeholder="Jumlah"
                      onChangeText={(text) => {
                        const numericValue = text.replace(/\D/g, "");
                        const formatted = numericValue.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          "."
                        );
                        setAmount(formatted);
                      }}
                      value={amount}
                      keyboardType="numeric"
                    />

                    {/* description */}
                    <View style={styles.inputContainer}>
                      {/* <View style={styles.flexRow}>
                        <Typo color={colors.neutral200} size={16}>
                          Description
                        </Typo>
                        <Typo color={colors.neutral200} size={14}>
                          (optional)
                        </Typo>
                      </View> */}
                      <Input
                        placeholder="Description (optional)"
                        value={note}
                        multiline
                        containerStyle={{
                          height: verticalScale(100),
                          flexDirection: "row",
                          alignItems: "flex-start",
                          paddingBottom: 20,
                        }}
                        onChangeText={setNote}
                      />
                    </View>
                    <AddCategoryModal
                      visible={showAddCategoryModal}
                      onClose={() => {
                        setShowAddCategoryModal(false);
                        setCategoryId(null);
                      }}
                    />

                    {/* 🟢 TOMBOL TOGGLE RECURRING */}
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

                    {/* 🟢 2. INPUT KONTROL BERULANG (Jika recurring aktif) */}
                    {isRecurring && (
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

                        {/* ======================================================== */}
                        {/* 🟢 FIELD C: NILAI AKHIR (Kondisional) */}
                        {/* Tampilkan input HANYA JIKA endCondition BUKAN 'never' */}
                        {endCondition !== "never" && (
                          <View style={{ gap: 15, marginTop: 5 }}>
                            {/* OPSI 1: SAMPAI TANGGAL (until_date) */}
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

                            {/* OPSI 2: SETELAH JUMLAH (after_count) */}
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

                  <View style={styles.footer}>
                    {isEditing && (
                      <Button
                        onPress={() => {
                          showDeleteAlert();
                        }}
                        style={{
                          paddingHorizontal: spacingX._15,
                          backgroundColor: colors.rose,
                        }}
                      >
                        <IconComponent
                          item={{ icon: "trash" } as any}
                          size={verticalScale(20)}
                          color={colors.neutral100}
                        />
                      </Button>
                    )}
                    <Button onPress={handleSave} style={{ flex: 1 }}>
                      <Typo color={colors.black} fontWeight={"700"}>
                        {isEditing ? "Update" : "Submit"}
                      </Typo>
                    </Button>
                  </View>
                </>
              )}
              contentContainerStyle={{
                paddingBottom: 10,
                paddingHorizontal: 0,
              }}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            />
          </View>
        </KeyboardAvoidingView>
      </View>

      {showRecurrenceDatePicker && (
        <DateTimePicker
          // Jika until_date, pakai endValue. Jika start_date, pakai startDate.
          value={new Date(endValue)}
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
    </Modal>
  );
}

/* ===============================
 * Styles
 * =============================== */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modal: {
    maxHeight: screenHeight * 0.95, // ✅ lebih tinggi & scrollable
    backgroundColor: colors.neutral900,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  form: {
    gap: spacingY._20,
  },
  handleBar: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    alignSelf: "center",
    borderRadius: 2.5,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    marginBottom: spacingY._5,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  closeText: { fontSize: 20, color: "#888" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
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
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#777",
  },
  activeExpenseTab: { backgroundColor: "#ffebee" },
  activeExpenseText: { color: "#e53935", fontWeight: "bold" },
  activeIncomeTab: { backgroundColor: "#e8f5e9" },
  activeTransferTab: { backgroundColor: "#bdf1faff" },
  activeIncomeText: { color: "#43a047", fontWeight: "bold" },
  activeTransferText: { color: "#0f76fcff", fontWeight: "bold" },
  inputContainer: {
    gap: spacingY._10,
  },
  iosDropdown: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.neutral300,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
  },
  androidDropdown: {
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    color: colors.neutral300,
    fontSize: verticalScale(14),
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  // dateInput: {
  //   flexDirection: "row",
  //   height: verticalScale(54),
  //   alignItems: "center",
  //   borderWidth: 1,
  //   borderColor: colors.neutral300,
  //   borderRadius: radius._17,
  //   borderCurve: "continuous",
  //   paddingHorizontal: spacingX._15,
  // },
  iosDatePicker: {},
  datePickerButton: {
    backgroundColor: colors.neutral700,
    alignSelf: "flex-end",
    padding: spacingY._7,
    borderRadius: radius._10,
    marginRight: spacingX._7,
    paddingHorizontal: spacingX._15,
  },
  dropdownContainer: {
    height: verticalScale(54),
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    borderColor: colors.neutral400,
    borderWidth: 1.5,
    paddingHorizontal: spacingX._15,
    borderCurve: "continuous",
  },
  dropdownItemText: {
    color: colors.white,
  },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14),
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral900,
    borderRadius: radius._15,
    borderCurve: "continuous",
    paddingVertical: spacingY._7,
    top: 5,
    borderColor: colors.neutral500,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  dropdownPlaceholder: {
    color: colors.white,
  },
  dropdownItemContainer: {
    borderRadius: radius._15,
    marginHorizontal: spacingX._7,
  },
  dropdownIcon: {
    height: verticalScale(30),
    tintColor: colors.neutral300,
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
});
