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
import Input from "./Input";
import TransactionList from "./TransactionList";
import { useTransactions } from "@/hooks/useTransactions";
import Header from "./Header";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";

const screenHeight = Dimensions.get("window").height;

export default function TransactionSearchModal({ visible, onClose }: any) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { data: categories = [] } = useCategories(userId);
  const { data: allTransactions = [], isLoading } = useTransactions(userId);

  const {
    filteredTransactions,
    search,
    setSearch,
    resetFilters,
    category,
    toggleCategory,
  } = useFilteredTransactions(allTransactions);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <Header
          title={"Search"}
          rightIcon={<TouchableOpacity
            onPress={() => {
              onClose();
            }}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>}
        />

        <View style={styles.quickFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !category && styles.activeCategoryChip, // "All"
              ]}
              onPress={() => toggleCategory(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  !category && styles.activeCategoryChipText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  category === cat.id && styles.activeCategoryChip,
                ]}
                onPress={() => toggleCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat.id && styles.activeCategoryChipText,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 15
          }}
        >
          <Typo size={20} fontWeight={"500"} color={colors.neutral300}>
            Recent Transaction
          </Typo>
        </View>

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.inputContainer}>
              <Input
                placeholder="Shoes..."
                value={search}
                placeholderTextColor={colors.neutral400}
                containerStyle={{ backgroundColor: colors.neutral800 }}
                onChangeText={(value) => setSearch(value)}
              />
            </View>
          }
          renderItem={({ item, index }) => (
            <TransactionList
              data={[item]}
              loading={isLoading}
              emptyListMessage="No Transaction added yet!"
              title="Recent Transaction"
              onEditPress={onClose}
              isLableSearch={false}
            />
          )}
          contentContainerStyle={styles.scrollViewStyle}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20,
    justifyContent: "flex-start",
    backgroundColor: colors.neutral900,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._5,
  },
  avatarContainer: {
    alignSelf: "center",
    position: "relative",
  },
  inputContainer: {
    gap: spacingY._10,
    marginTop: spacingY._10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacingY._10,
  },
  title: { fontSize: 25, fontWeight: "bold", color: colors.neutral100 },
  closeText: { fontSize: 20, color: "#888" },
  quickFilterContainer: {
    flexDirection: "row",
    marginTop: spacingY._10,
    marginBottom: spacingY._10,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.neutral600,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "transparent",
  },
  activeCategoryChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    color: colors.neutral300,
    fontSize: 14,
  },
  activeCategoryChipText: {
    color: colors.white,
    fontWeight: "600",
  },
  scrollViewStyle: {
    paddingBottom: verticalScale(100),
    marginTop: spacingY._10,
    gap: spacingY._10,
  },
});
