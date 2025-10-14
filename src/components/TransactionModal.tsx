// src/components/TransactionModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { useTransactionMutations } from "@/hooks/useTransactionMutations";
import { useAuth } from "@/hooks/useAuth";
import { Dropdown } from "react-native-element-dropdown";
import { useCategories } from "@/hooks/useCategories";
import Typo from "./Typo";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";
import BaseDropdown from "./Dropdown";
import { toTitleCase } from "@/utils/text";
import Button from "./Button";
import IconComponent from "./Icons";
import BackButton from "./BackButton";
import Header from "./Header";
import Input from "./Input";
import DateTimePicker from "@react-native-community/datetimepicker";
// import { expenseCategories } from "@/constant/data";

// import CategorySelector from "@/components/CategorySelector";

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
  const { data: categories = [], isLoading, refetch } = useCategories(userId);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && initialData) {
      setAmount(String(initialData.amount));
      setNote(initialData.note || "");
      setType(initialData.type);
      setCategoryId(initialData.category_id);
      setDate(new Date(initialData.date)); // ambil dari DB
    } else {
      setAmount("");
      setNote("");
      setType("expense");
      setCategoryId(null);
      setDate(new Date());
    }
  }, [initialData]);

  const categoriesIncome = categories.filter(
    (cat) => cat.type === "income"
  ) as any;

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSave = async () => {
    if (!amount) {
      Alert.alert("Error", "Harap isi jumlah");
      return;
    }

    if (type === "expense" && !categoryId) {
      Alert.alert("Error", "Harap pilih kategori untuk pengeluaran");
      return;
    }

    const payload = {
      amount: Number(amount),
      note,
      type,
      category_id: categoryId,
      user_id: userId,
      date: date.toISOString(),
    };

    try {
      if (isEditing) {
        await updateTransaction.mutateAsync({
          id: initialData.id,
          updates: payload,
        });
      } else {
        await createTransaction.mutateAsync(payload);
      }
      setAmount("");
      setNote("");
      setType("expense");
      setCategoryId(null);
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
      const res = await deleteTransaction.mutateAsync(initialData.id);
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

            {/* ✅ ScrollView agar form bisa di-scroll */}
            <FlatList
              data={[{ key: "form" }]} // dummy item
              renderItem={() => (
                <>
                  {/* Tabs */}
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      disabled={isEditing}
                      style={[
                        styles.tab,
                        type === "expense" && styles.activeExpenseTab,
                      ]}
                      onPress={() => {
                        setType("expense");
                        setCategoryId(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          type === "expense" && styles.activeExpenseText,
                        ]}
                      >
                        Pengeluaran
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={isEditing}
                      style={[
                        styles.tab,
                        type === "income" && styles.activeIncomeTab,
                      ]}
                      onPress={() => {
                        setType("income");
                        setCategoryId(categoriesIncome[0]?.id);
                      }}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          type === "income" && styles.activeIncomeText,
                        ]}
                      >
                        Pemasukan
                      </Text>
                    </TouchableOpacity>
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

                    {/* Category */}
                    {type === "expense" && (
                      <View style={styles.inputContainer}>
                        <BaseDropdown
                          data={categories.map((cat) => ({
                            label: toTitleCase(cat.name),
                            value: cat.id,
                          }))}
                          value={categoryId}
                          placeholder="Select Category"
                          onChange={(item) => {
                            setCategoryId(item.value as any);
                          }}
                        />
                      </View>
                    )}
                    <Input
                      placeholder="Jumlah"
                      onChangeText={setAmount}
                      value={amount}
                    />
                    {/* <Input
                      placeholder="Catatan"
                      onChangeText={setNote}
                      value={note}
                    /> */}

                    {/* description */}
                    <View style={styles.inputContainer}>
                      <View style={styles.flexRow}>
                        <Typo color={colors.neutral200} size={16}>
                          Description
                        </Typo>
                        <Typo color={colors.neutral200} size={14}>
                          (optional)
                        </Typo>
                      </View>
                      <Input
                        // placeholder="0"
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

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
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
    maxHeight: screenHeight * 0.85, // ✅ lebih tinggi & scrollable
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
  activeIncomeText: { color: "#43a047", fontWeight: "bold" },
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
  dateInput: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
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
});
