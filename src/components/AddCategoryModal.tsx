import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions, // Import untuk mendapatkan tinggi layar
} from "react-native";
import { useCategoryMutations } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { colors, spacingX } from "@/constant/theme";
import Header from "./Header";
import Typo from "./Typo";
import BaseDropdown from "./Dropdown";
import { COLOR_OPTIONS, ICON_OPTIONS } from "@/constant/categoryOptions";
import IconSelector from "./IconSelector";
import ColorSelector from "./ColorSelector";
import { Ionicons } from "@expo/vector-icons";


const screenHeight = Dimensions.get("window").height;

export default function AddCategoryModal({
  visible,
  onClose,
  initialData,
}: any) {
  const isEditing = !!initialData;
  const title = isEditing ? "Edit Kategori" : "Tambah Kategori";

  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<"expense" | "income">(
    initialData?.type || "expense"
  );
  const [icon, setIcon] = useState(initialData?.icon || "💡");
  const [bgColor, setBgColor] = useState(initialData?.bgColor || "#FBBF24");
  const [isIconSelectorVisible, setIsIconSelectorVisible] = useState(false);
  const [isColorSelectorVisible, setIsColorSelectorVisible] = useState(false);

  const { session } = useAuth();
  const userId = session?.user?.id; // Asumsi: Nama hook di-rename dari useCategoryMutations ke useCategories
  const { updateCategory, isUpdating, addCategory, isCreating } =
    useCategoryMutations(userId);

  const handleSave = async () => {
    const isEditing = !!initialData;

    // 1. Validasi
    if (!name.trim()) {
      Alert.alert("Error", "Nama kategori tidak boleh kosong");
      return;
    }
    // Tambahkan validasi untuk ikon dan warna (penting untuk skema Anda)
    if (!icon || !bgColor) {
      Alert.alert("Error", "Ikon dan Warna harus dipilih.");
      return;
    }

    const payload = { name, type, icon, bgColor };

    try {
      if (isEditing && initialData) {
        // 🟢 MODE EDIT: Panggil updateCategory
        await updateCategory({
          id: initialData.id,
          updates: payload,
        });
        Alert.alert("Sukses", "Kategori berhasil diperbarui.");
      } else {
        // 🟡 MODE ADD: Panggil addCategory (atau createCategory)
        await addCategory(payload);
        Alert.alert("Sukses", "Kategori baru berhasil ditambahkan.");
      }

      // 2. Reset State dan Tutup Modal
      setName("");
      setIcon("💡");
      setBgColor("#FBBF24");
      onClose();
    } catch (err: any) {
      // Asumsi: Error handler sudah mendeteksi jika Anda menggunakan addCategory atau createCategory
      Alert.alert("Gagal Menyimpan", err.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.handleBar} />
          <Header
            title={title}
            rightIcon={
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: colors.neutral400, fontSize: 24}}>
                  ✕
                </Text>
              </TouchableOpacity>
            }
          />
          {!isEditing && (
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
          )}

          <TextInput
            placeholder="Nama kategori"
            placeholderTextColor={colors.neutral400}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          {/* 🟢 TOMBOL PEMILIH IKON (Mengganti Dropdown) */}
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setIsIconSelectorVisible(true)}
          >
            <Ionicons
              name={icon || "help-circle-outline"}
              size={24}
              color={colors.white}
            />
            <Typo color={colors.white} size={16}>
              Pilih Ikon
            </Typo>
          </TouchableOpacity>

          {/* 🟢 TOMBOL PEMILIH WARNA (Mengganti Dropdown) */}
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setIsColorSelectorVisible(true)}
          >
            <View style={[styles.colorSwatch, { backgroundColor: bgColor }]} />
            <Typo color={colors.white} size={16}>
              Pilih Warna
            </Typo>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Simpan</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
      <IconSelector
        visible={isIconSelectorVisible}
        onSelect={(selectedIcon) => {
          setIcon(selectedIcon);
          setIsIconSelectorVisible(false);
        }}
        onClose={() => setIsIconSelectorVisible(false)}
        currentIcon={icon}
      />
      <ColorSelector
        visible={isColorSelectorVisible}
        onSelect={(selectedColor) => {
          setBgColor(selectedColor);
          setIsColorSelectorVisible(false);
        }}
        onClose={() => setIsColorSelectorVisible(false)}
        currentColor={bgColor}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    backgroundColor: colors.neutral900,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    width: "100%",
    // maxHeight: screenHeight * 0.8, // Dihapus karena tidak ada Dimensi di import
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: colors.neutral700,
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 10,
  },

  // --- Perbaikan Input ---
  input: {
    borderWidth: 1,
    borderColor: colors.neutral700, // Warna border lebih gelap
    backgroundColor: colors.neutral800, // Background input
    color: colors.white,
    borderRadius: 10,
    padding: 15, // Padding lebih besar
    marginBottom: 16,
    fontSize: 16,
  },

  // --- Perbaikan Tab/Type Button ---
  typeRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 10, // Menambahkan gap antar tombol
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5, // Padding vertikal lebih besar
    borderRadius: 10,
    maxWidth: 150,
    backgroundColor: colors.neutral800, // Warna pasif: netral
    borderWidth: 2, // Tambahkan border
    borderColor: colors.neutral800, // Default border sama dengan background
  },

  // Warna AKTIF (Expense: Rose, Income: Primary/Green)
  typeActiveExpense: {
    backgroundColor: colors.rose + "30", // Background transparan
    borderColor: colors.rose,
  },
  typeActiveIncome: {
    backgroundColor: colors.primary + "30",
    borderColor: colors.primary,
  },

  // Warna Teks
  typeText: {
    color: colors.neutral400, // Warna teks pasif
    fontWeight: "500",
  },
  activeExpenseText: {
    color: colors.rose,
    fontWeight: "bold",
  },
  activeIncomeText: {
    color: colors.primary,
    fontWeight: "bold",
  },

  // --- Perbaikan Save/Cancel Button ---
  saveButton: {
    backgroundColor: colors.primary, // Warna Primary Anda (Hijau)
    padding: 14,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: colors.black,
    fontWeight: "bold",
    fontSize: 18,
  },
  cancel: {
    alignItems: "center",
    marginTop: 15,
  },
  cancelText: {
    color: colors.neutral400,
    fontWeight: "600",
  },

  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: colors.neutral700,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral600,
  },
});
