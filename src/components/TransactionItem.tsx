import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, spacingX, spacingY, radius } from "@/constant/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "@/components/Typo";
import type { TransactionItemProps } from "@/types/model";
import { formatDateToIndo, toTitleCase } from "@/utils/text";
import IconComponent from "./Icons";

/**
 * TransactionItem Component
 * -------------------------
 * Menampilkan income, expense, dan transfer (gabungan).
 */
const TransactionItem: React.FC<TransactionItemProps> = ({
  item,
  index,
  onEditPress,
}) => {
  const isTransfer = item?.is_transfer === true;
  const isMergedTransfer = item?.type === "transfer";

  // 🔁 CASE: GABUNGAN TRANSFER (dari hasil mergeTransfers)
  if (isMergedTransfer) {
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 80).springify().damping(35)}
      >
        <TouchableOpacity
          style={[styles.row, styles.transferRow]}
          onPress={() => onEditPress?.(item)}
          activeOpacity={0.8}
        >
          {/* 🔄 Icon Transfer */}
          <View style={[styles.icon, { backgroundColor: colors.neutral700 }]}>
            <IconComponent
              item={{ icon: "swap-horizontal-outline" } as any}
              size={verticalScale(20)}
              color={colors.primary}
            />
          </View>

          {/* Deskripsi */}
          <View style={styles.categoryDes}>
            <Typo
              size={17}
              fontWeight="600"
              color={colors.primary}
              textProps={{ numberOfLines: 1 }}
            >
              Transfer
            </Typo>
            <Typo size={12} color={colors.neutral400} textProps={{ numberOfLines: 1 }}>
              {item.from_wallet || "Wallet Asal"} → {item.to_wallet || "Wallet Tujuan"}
            </Typo>
          </View>

          {/* Jumlah + Tanggal */}
          <View style={styles.amountDate}>
            <Typo fontWeight="600" color={colors.neutral100}>
              Rp {Number(item?.amount).toLocaleString("id-ID")}
            </Typo>
            <Typo size={13} color={colors.neutral400}>
              {formatDateToIndo(item?.date as any)}
            </Typo>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // 💰 CASE NORMAL TRANSACTION
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 90).springify().damping(40)}
    >
      <TouchableOpacity
        style={styles.row}
        onPress={() => onEditPress?.(item)}
        activeOpacity={0.8}
      >
        {/* Icon */}
        <View
          style={[
            styles.icon,
            { backgroundColor: item?.categories?.bgColor || colors.neutral800 },
          ]}
        >
          <IconComponent
            item={item?.categories as any}
            size={verticalScale(20)}
            color={colors.neutral100}
          />
        </View>

        {/* Deskripsi */}
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
            {item?.note || ""}
            {item?.wallet?.name && (
              <>
                <Typo size={12} color={colors.neutral500}>
                  {" "}•{" "}
                </Typo>
                <Typo size={12} color={colors.neutral300}>
                  {item?.wallet?.name}
                </Typo>
              </>
            )}
          </Typo>
        </View>

        {/* Jumlah + Tanggal */}
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
    paddingVertical: spacingY._10,
    borderRadius: radius._17,
    paddingHorizontal: spacingY._10,
  },
  transferRow: {
    backgroundColor: colors.neutral900,
    borderWidth: 1,
    borderColor: colors.neutral700,
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
