// src/screens/CategoryListScreen.tsx

import React, { useState, useMemo } from "react";import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Header from "@/components/Header";
import Typo from "@/components/Typo";
import { colors, spacingX } from "@/constant/theme";
import { useAuth } from "@/hooks/useAuth";
import { useCategories, useCategoryMutations } from "@/hooks/useCategories";
import { Ionicons } from "@expo/vector-icons";
import CategoryModal from "@/components/AddCategoryModal"; // <-- Akan kita buat
import { toTitleCase } from "@/utils/text";
import { scale } from "@/utils/styling";
import BackButton from "@/components/BackButton";
import { useNavigation } from "@react-navigation/native";

interface Category {
  id: string;
  name: string;
  icon: string;
  type: "income" | "expense" | "transfer";
  bgColor: string;
}

export default function CategoryListScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: categories = [], isLoading } = useCategories(userId);

  const groupedCategories = useMemo(() => {
    // 🟢 Perbaikan: Definisikan tipe array secara eksplisit
    const groups: {
        income: Category[];
        expense: Category[];
        transfer: Category[];
    } = {
        income: [],
        expense: [],
        transfer: [],
    };

    categories.forEach((cat) => {
        // Asumsi cat.type adalah 'income', 'expense', atau 'transfer'
        if (cat.type === "income") {
            groups.income.push(cat as any);
        } else if (cat.type === "expense") {
            groups.expense.push(cat as any);
        } else if (cat.type === "transfer") {
            groups.transfer.push(cat as any);
        }
    });

    // 🟢 Perbaikan: Tipe kembali harus sesuai dengan ekspektasi.
    return [
        { title: "Pemasukan (Income)", data: groups.income, type: "income" },
        { title: "Pengeluaran (Expense)", data: groups.expense, type: "expense" },
        ...(groups.transfer.length > 0
            ? [
                  {
                      title: "Transfer Sistem",
                      data: groups.transfer,
                      type: "transfer",
                  },
              ]
            : []),
    ];
}, [categories]);

  const renderGroupHeader = ({
    title,
    type,
  }: {
    title: string;
    type: string;
  }) => {
    const color =
      type === "income"
        ? colors.primary
        : type === "expense"
        ? colors.rose
        : colors.white;

    return (
      <View style={styles.groupHeader}>
        <Typo size={18} fontWeight="700" color={color}>
          {title}
        </Typo>
      </View>
    );
  };

  const flattenedList = groupedCategories.flatMap((group) => [
    { key: group.title, isHeader: true, title: group.title, type: group.type },
    ...group.data.map((item) => ({ ...item, key: item.id, isHeader: false })),
  ]);

  const navigation = useNavigation();
  const { deleteCategory } = useCategoryMutations(userId);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleDelete = (category: Category) => {
    Alert.alert(
      "Konfirmasi Hapus",
      `Yakin ingin menghapus kategori '${category.name}'? Ini mungkin memengaruhi transaksi yang sudah ada.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              Alert.alert("Sukses", "Kategori berhasil dihapus.");
            } catch (error: any) {
              Alert.alert(
                "Gagal",
                "Gagal menghapus kategori. Pastikan tidak ada transaksi yang terkait."
              );
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.itemContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
          <Ionicons
            name={item.icon as any}
            size={scale(20)}
            color={colors.white}
          />
        </View>
        <View>
          <Typo color={colors.white} size={16} fontWeight="600">
            {toTitleCase(item.name)}
          </Typo>
          <Typo color={colors.neutral400} size={12}>
            {item.type === "transfer" ? "Transfer" : toTitleCase(item.type)}
          </Typo>
        </View>
      </View>

      {/* Tombol Aksi (Edit & Delete) */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => {
            setEditingCategory(item);
            setIsModalVisible(true);
          }}
        >
          <Ionicons
            name="create-outline"
            size={scale(24)}
            color={colors.neutral400}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={{ marginLeft: 15 }}
        >
          <Ionicons name="trash-outline" size={scale(24)} color={colors.rose} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Manajemen Kategori"
        rightIcon={
          <TouchableOpacity
            onPress={() => {
              setEditingCategory(null);
              setIsModalVisible(true);
            }}
          >
            <Ionicons
              name="add-circle-outline"
              size={scale(30)}
              color={colors.primary}
              style={{ marginRight: -10 }}
            />
          </TouchableOpacity>
        }
        leftIcon={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackButton />
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <Typo
          style={{ textAlign: "center", marginTop: 30 }}
          color={colors.neutral400}
        >
          Memuat kategori...
        </Typo>
      ) : (
        <FlatList
          data={flattenedList as any}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            if (item.isHeader) {
              return renderGroupHeader(item);
            }
            return renderItem({ item: item as Category });
          }}
          contentContainerStyle={styles.listContent}
        />
      )}

      <CategoryModal
        key={
          isModalVisible ? "open-" + (editingCategory?.id || "new") : "closed"
        }
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        initialData={editingCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900,
    paddingHorizontal: spacingX._20,
  },
  listContent: {
    paddingVertical: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral700,
  },
  iconWrapper: {
    width: scale(40),
    height: scale(40),
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupHeader: {
    paddingVertical: 10,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral700,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 30,
  },
});
