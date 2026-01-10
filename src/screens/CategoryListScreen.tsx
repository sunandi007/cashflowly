// src/screens/CategoryListScreen.tsx

import React, { useState, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Typo from "@/components/Typo";
import { colors, spacingX, radius } from "@/constant/theme";
import { useAuth } from "@/hooks/useAuth";
import { useCategories, useCategoryMutations } from "@/hooks/useCategories";
import { Ionicons } from "@expo/vector-icons";
import CategoryModal from "@/components/AddCategoryModal";
import { toTitleCase } from "@/utils/text";
import { scale, verticalScale } from "@/utils/styling";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Category {
  id: string;
  name: string;
  icon: string;
  type: "income" | "expense" | "transfer";
  bgColor: string;
}

// Subcategory descriptions for display
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  housing: "Rent, Mortgages, Utilities",
  home: "Rent, Mortgages, Utilities",
  "food & drink": "Groceries, Dining out",
  food: "Groceries, Dining out",
  restaurant: "Groceries, Dining out",
  transportation: "Fuel, Public transit, Service",
  transport: "Fuel, Public transit, Service",
  car: "Fuel, Public transit, Service",
  entertainment: "Movies, Concerts, Games",
  shopping: "Clothes, Electronics",
  healthcare: "Doctor, Dentist, Pharmacy",
  health: "Doctor, Dentist, Pharmacy",
  education: "Tuition, Books, Courses",
  salary: "Monthly salary, Bonus",
  investment: "Stocks, Dividends",
  freelance: "Contract work, Side jobs",
};

const getCategoryDescription = (name: string): string => {
  const lowerName = name.toLowerCase();
  return CATEGORY_DESCRIPTIONS[lowerName] || toTitleCase(name);
};

export default function CategoryListScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { data: categories = [], isLoading } = useCategories(userId);
  const { deleteCategory } = useCategoryMutations(userId);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

  // Filter categories based on active tab
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => cat.type === activeTab) as Category[];
  }, [categories, activeTab]);

  // Keep grouped categories for backward compatibility with existing logic
  const groupedCategories = useMemo(() => {
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
      if (cat.type === "income") {
        groups.income.push(cat as any);
      } else if (cat.type === "expense") {
        groups.expense.push(cat as any);
      } else if (cat.type === "transfer") {
        groups.transfer.push(cat as any);
      }
    });

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
      <View style={styles.itemLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: item.bgColor + '80' }]}>
          <Ionicons
            name={item.icon as any}
            size={scale(22)}
            color={colors.white}
          />
        </View>
        <View style={styles.itemTextContainer}>
          <Typo color={colors.white} size={16} fontWeight="600">
            {toTitleCase(item.name)}
          </Typo>
          <Typo
            color={colors.neutral400}
            size={13}
            style={styles.itemDescription}
          >
            {getCategoryDescription(item.name)}
          </Typo>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setEditingCategory(item);
            setIsModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="pencil-outline"
            size={scale(20)}
            color={colors.neutral400}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="trash-outline"
            size={scale(20)}
            color={colors.neutral400}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container]}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={scale(24)} color={colors.white} />
        </TouchableOpacity>

        <Typo size={18} fontWeight="700" color={colors.white}>
          Manage Categories
        </Typo>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Typo size={16} fontWeight="600" color={colors.primary}>
            Done
          </Typo>
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "expense" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("expense")}
          activeOpacity={0.8}
        >
          <Typo
            size={14}
            fontWeight="600"
            color={activeTab === "expense" ? colors.neutral900 : colors.neutral400}
          >
            Expense
          </Typo>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "income" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("income")}
          activeOpacity={0.8}
        >
          <Typo
            size={14}
            fontWeight="600"
            color={activeTab === "income" ? colors.neutral900 : colors.neutral400}
          >
            Income
          </Typo>
        </TouchableOpacity>
      </View>

      {/* Category List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="reload-outline" size={scale(32)} color={colors.neutral500} />
          <Typo
            style={styles.loadingText}
            color={colors.neutral400}
            size={14}
          >
            Memuat kategori...
          </Typo>
        </View>
      ) : filteredCategories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="folder-open-outline" size={scale(48)} color={colors.neutral600} />
          </View>
          <Typo color={colors.neutral400} size={16} fontWeight="600" style={styles.emptyTitle}>
            Belum Ada Kategori
          </Typo>
          <Typo color={colors.neutral500} size={14} style={styles.emptySubtitle}>
            Tekan tombol + untuk menambahkan kategori baru
          </Typo>
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + verticalScale(20) }]}
        onPress={() => {
          setEditingCategory(null);
          setIsModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={scale(28)} color={colors.neutral900} />
      </TouchableOpacity>

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
    paddingTop: 10
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    paddingVertical: verticalScale(10),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    alignItems: "flex-start",
    justifyContent: "center",
  },

  // Tab Selector
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: spacingX._20,
    backgroundColor: colors.neutral800,
    borderRadius: radius._30,
    padding: scale(4),
    marginBottom: verticalScale(20),
  },
  tabButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: "center",
    borderRadius: radius._30,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },

  // List Content
  listContent: {
    paddingHorizontal: spacingX._20,
    paddingBottom: verticalScale(100),
  },

  // Item Container - Clean list style (no card)
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(10),
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacingX._15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemDescription: {
    marginTop: verticalScale(3),
  },

  // Actions - Simple icons without background
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(16),
  },
  actionButton: {
    padding: scale(8),
  },

  // FAB
  fab: {
    position: "absolute",
    right: spacingX._20,
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(12),
  },
  loadingText: {
    textAlign: "center",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacingX._30,
  },
  emptyIconWrapper: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: colors.neutral800,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(20),
  },
  emptyTitle: {
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
  },
});
