import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useCategoryMutations } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/constant/theme";
import Header from "./Header";

export default function AddCategoryModal({ visible, onClose }: any) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [icon, setIcon] = useState("💡");
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { addCategory } = useCategoryMutations(userId);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Nama kategori tidak boleh kosong");
      return;
    }

    try {
      await addCategory.mutateAsync({ name, type, icon });
      setName("");
      setIcon("💡");
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
            <Header title="Tambah Kategori"/>

          {/* Nama kategori */}
          <TextInput
            placeholder="Nama kategori"
            placeholderTextColor={colors.neutral400}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          {/* Pilih tipe */}
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "expense" && styles.typeActiveExpense,
              ]}
              onPress={() => setType("expense")}
            >
              <Text
                style={[
                  styles.typeText,
                  type === "expense" && styles.activeExpenseText,
                ]}
              >
                Pengeluaran
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "income" && styles.typeActiveIncome,
              ]}
              onPress={() => setType("income")}
            >
              <Text
                style={[
                  styles.typeText,
                  type === "income" && styles.activeIncomeText,
                ]}
              >
                Pemasukan
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tombol simpan */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Simpan</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: colors.neutral900,
    borderRadius: 16,
    padding: 20,
    width: "85%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    color: colors.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },
  typeActiveExpense: { backgroundColor: "#ffebee" },
  typeActiveIncome: { backgroundColor: "#e8f5e9" },
  typeText: { color: "#333" },
  activeExpenseText: { color: "#e53935", fontWeight: "bold" },
  activeIncomeText: { color: "#43a047", fontWeight: "bold" },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancel: { alignItems: "center", marginTop: 10 },
  cancelText: { color: "#888" },
});
