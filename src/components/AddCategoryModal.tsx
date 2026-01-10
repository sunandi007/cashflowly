import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useCategoryMutations } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { useSnackbar } from "@/hooks/useSnackbar";
import { colors, spacingX, radius } from "@/constant/theme";
import Typo from "./Typo";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/constant/categoryOptions";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale } from "@/utils/styling";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Number of columns for icon grid
const ICON_COLUMNS = 4;
const ICON_ITEM_SIZE = (screenWidth - spacingX._20 * 2 - 12 * (ICON_COLUMNS - 1)) / ICON_COLUMNS;

// Color circle size
const COLOR_CIRCLE_SIZE = scale(52);

export default function AddCategoryModal({
  visible,
  onClose,
  initialData,
}: any) {
  const isEditing = !!initialData;
  const title = isEditing ? "Edit Category" : "New Category";

  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<"expense" | "income">(
    initialData?.type || "expense"
  );
  const [icon, setIcon] = useState(initialData?.icon || CATEGORY_ICONS[0].value);
  const [bgColor, setBgColor] = useState(initialData?.bgColor || CATEGORY_COLORS[0]);

  const { session } = useAuth();
  const userId = session?.user?.id;
  const { updateCategory, isUpdating, addCategory, isCreating } =
    useCategoryMutations(userId);
  const snackbar = useSnackbar();

  const handleSave = async () => {
    const isEditing = !!initialData;

    if (!name.trim()) {
      snackbar.error("Nama wajib diisi", "Nama kategori tidak boleh kosong");
      return;
    }
    if (!icon || !bgColor) {
      snackbar.error("Ikon dan warna wajib dipilih", "Lengkapi data kategori");
      return;
    }

    const payload = { name, type, icon, bgColor };

    try {
      if (isEditing && initialData) {
        await updateCategory({
          id: initialData.id,
          updates: payload,
        });
        snackbar.success("Kategori diperbarui", "Perubahan berhasil disimpan");
      } else {
        await addCategory(payload);
        snackbar.success("Kategori ditambahkan", "Kategori baru berhasil dibuat");
      }

      setName("");
      setIcon(CATEGORY_ICONS[0].value);
      setBgColor(CATEGORY_COLORS[0]);
      onClose();
    } catch (err: any) {
      snackbar.error("Gagal menyimpan", err.message);
    }
  };

  const handleClose = () => {
    setName("");
    setIcon(CATEGORY_ICONS[0].value);
    setBgColor(CATEGORY_COLORS[0]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={scale(24)} color={colors.white} />
          </TouchableOpacity>
          <Typo size={18} fontWeight="700" color={colors.white}>
            {title}
          </Typo>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Preview Section */}
          <View style={styles.previewSection}>
            <View style={[styles.previewCircle, { backgroundColor: bgColor }]}>
              <Ionicons
                name={icon as any}
                size={scale(48)}
                color={colors.neutral900}
              />
              {/* Edit badge */}
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={scale(12)} color={colors.white} />
              </View>
            </View>
            <Typo
              size={14}
              color={colors.neutral400}
              style={styles.previewLabel}
            >
              Preview
            </Typo>
          </View>

          {/* Category Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Category Name"
              placeholderTextColor={colors.neutral500}
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          {/* Type Selector (only when adding new) */}
          {!isEditing && (
            <View style={styles.typeSection}>
              <Typo size={15} fontWeight="600" color={colors.white} style={styles.sectionLabel}>
                Category Type
              </Typo>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === "expense" && styles.typeActiveExpense,
                  ]}
                  onPress={() => setType("expense")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="arrow-down-circle"
                    size={scale(18)}
                    color={type === "expense" ? colors.rose : colors.neutral400}
                  />
                  <Typo
                    size={14}
                    fontWeight={type === "expense" ? "700" : "500"}
                    color={type === "expense" ? colors.rose : colors.neutral400}
                  >
                    Expense
                  </Typo>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === "income" && styles.typeActiveIncome,
                  ]}
                  onPress={() => setType("income")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="arrow-up-circle"
                    size={scale(18)}
                    color={type === "income" ? colors.primary : colors.neutral400}
                  />
                  <Typo
                    size={14}
                    fontWeight={type === "income" ? "700" : "500"}
                    color={type === "income" ? colors.primary : colors.neutral400}
                  >
                    Income
                  </Typo>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Icon Selection */}
          <View style={styles.sectionContainer}>
            <Typo size={15} fontWeight="600" color={colors.white} style={styles.sectionLabel}>
              Select Icon
            </Typo>
            <View style={styles.iconGrid}>
              {CATEGORY_ICONS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.iconItem,
                    icon === item.value && styles.iconItemActive,
                  ]}
                  onPress={() => setIcon(item.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.value as any}
                    size={scale(24)}
                    color={icon === item.value ? bgColor : colors.neutral300}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.sectionContainer}>
            <Typo size={15} fontWeight="600" color={colors.white} style={styles.sectionLabel}>
              Select Color
            </Typo>
            <View style={styles.colorRow}>
              {CATEGORY_COLORS.map((colorValue) => (
                <TouchableOpacity
                  key={colorValue}
                  style={[
                    styles.colorItem,
                    { backgroundColor: colorValue },
                    bgColor === colorValue && styles.colorItemActive,
                  ]}
                  onPress={() => setBgColor(colorValue)}
                  activeOpacity={0.7}
                >
                  {bgColor === colorValue && (
                    <Ionicons
                      name="checkmark"
                      size={scale(22)}
                      color={colors.neutral900}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isCreating || isUpdating}
          >
            <Typo size={16} fontWeight="700" color={colors.neutral900}>
              {isCreating || isUpdating ? "Saving..." : "Save Category"}
            </Typo>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._15,
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(15),
  },
  closeButton: {
    width: scale(40),
    height: scale(40),
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacingX._20,
    paddingBottom: verticalScale(40),
  },

  // Preview Section
  previewSection: {
    alignItems: "center",
    marginTop: verticalScale(10),
    marginBottom: verticalScale(30),
  },
  previewCircle: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  editBadge: {
    position: "absolute",
    bottom: scale(5),
    right: scale(5),
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: colors.neutral700,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.neutral900,
  },
  previewLabel: {
    marginTop: verticalScale(10),
  },

  // Input
  inputContainer: {
    marginBottom: verticalScale(24),
  },
  input: {
    backgroundColor: colors.neutral800,
    color: colors.white,
    borderRadius: radius._15,
    paddingHorizontal: spacingX._20,
    paddingVertical: verticalScale(16),
    fontSize: scale(16),
    borderWidth: 1,
    borderColor: colors.neutral700,
  },

  // Type Section
  typeSection: {
    marginBottom: verticalScale(24),
  },
  typeRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    paddingVertical: verticalScale(14),
    borderRadius: radius._12,
    backgroundColor: colors.neutral800,
    borderWidth: 1.5,
    borderColor: colors.neutral700,
  },
  typeActiveExpense: {
    backgroundColor: `${colors.rose}15`,
    borderColor: colors.rose,
  },
  typeActiveIncome: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },

  // Section Container
  sectionContainer: {
    marginBottom: verticalScale(24),
  },
  sectionLabel: {
    marginBottom: verticalScale(14),
  },

  // Icon Grid
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(12),
  },
  iconItem: {
    width: ICON_ITEM_SIZE,
    height: ICON_ITEM_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius._15,
    backgroundColor: colors.neutral800,
    borderWidth: 1.5,
    borderColor: colors.neutral700,
  },
  iconItemActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },

  // Color Row
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(12),
  },
  colorItem: {
    width: COLOR_CIRCLE_SIZE,
    height: COLOR_CIRCLE_SIZE,
    borderRadius: COLOR_CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorItemActive: {
    borderColor: colors.white,
  },

  // Save Button
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(18),
    borderRadius: radius._15,
    alignItems: "center",
    marginTop: verticalScale(12),
  },
});
