import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors, spacingX, spacingY, radius } from "@/constant/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "@/components/Typo";
// import { incomeCategories, expenseCategories } from "@/constant/data";
import type { TransactionItemProps } from "@/types/model";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { formatDateToIndo, toTitleCase } from "@/utils/text";
import IconComponent from "./Icons";

/**
 * TransactionItem Component
 * -------------------------
 * Reusable list item for rendering a transaction row with animation, icon, and styling.
 */
const TransactionItem: React.FC<TransactionItemProps> = ({
  item,
  index,
  onEditPress,
}) => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  // normalize category
  const { data: categories = [], isLoading, refetch } = useCategories(userId);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 90)
        .springify()
        .damping(40)}
    >
      <TouchableOpacity style={styles.row} onPress={() => onEditPress?.(item)}>
        {/* Icon */}
        <View
          style={[
            styles.icon,
            {
              backgroundColor: item?.categories?.bgColor || colors.neutral800,
            },
          ]}
        >
          {IconComponent && (
            <IconComponent
              item={item.categories as any}
              size={verticalScale(20)}
              color={colors.neutral100}
            />
          )}
        </View>

        {/* Description */}
        <View style={styles.categoryDes}>
          <Typo size={17} fontWeight="500" color={colors.neutral400}>
            {toTitleCase(item?.categories?.name as any) || "Unknown"}
          </Typo>
          <Typo
            size={12}
            fontWeight="500"
            color={colors.neutral400}
            textProps={{ numberOfLines: 1 }}
          >
            {item?.note as any}
          </Typo>
        </View>

        {/* Amount + Date */}
        <View style={styles.amountDate}>
          <Typo
            fontWeight="500"
            color={item?.type === "income" ? colors.primary : colors.rose}
          >
            {item?.type === "income" ? "+ Rp " : "- Rp "}
            {Number(item?.amount).toLocaleString("id-ID")}
          </Typo>
          <Typo size={13} color={colors.neutral400}>
            {formatDateToIndo(item?.date as any)}
          </Typo>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default TransactionItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacingX._12,
    backgroundColor: colors.neutral800,
    padding: spacingY._10,
    borderRadius: radius._17,
    paddingHorizontal: spacingY._10,
  },
  icon: {
    height: verticalScale(44),
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._12,
    borderCurve: "continuous",
  },
  categoryDes: {
    flex: 1,
    gap: 2.5,
  },
  amountDate: {
    alignItems: "flex-end",
    gap: 3,
  },
});
