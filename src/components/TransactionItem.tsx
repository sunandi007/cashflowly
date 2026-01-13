import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, spacingX, spacingY, radius } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";
import Typo from "@/components/Typo";
import type { TransactionItemProps } from "@/types/model";
import { toTitleCase } from "@/utils/text";
import IconComponent from "./Icons";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Format date to display like "Today, 09:41 AM" or "Oct 24, 08:15 AM"
const formatTransactionDate = (dateValue: any, t: (key: string) => string): string => {
  try {
    let date: Date;

    if (dateValue && typeof dateValue.toDate === "function") {
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === "string" || typeof dateValue === "number") {
      date = new Date(dateValue);
    } else {
      return "";
    }

    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = date.toLocaleTimeString("id-ID", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });

    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return `${t('common.today')}, ${timeStr}`;
    }

    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `${t('common.yesterday')}, ${timeStr}`;
    }

    // Otherwise show date
    const dateStr = date.toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return "";
  }
};

// Format currency for display with currency context
const formatAmount = (amount: number, type: string, formatMoney: (amt: number) => string): string => {
  const formatted = formatMoney(Math.abs(amount));

  if (type === "income") {
    return `+${formatted}`;
  }
  return `-${formatted}`;
};

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
  const { formatMoney } = useCurrency();
  const { t } = useLanguage();
  const isTransfer = item?.is_transfer === true;
  const isMergedTransfer = item?.type === "transfer";

  // 🔁 CASE: GABUNGAN TRANSFER (dari hasil mergeTransfers)
  if (isMergedTransfer) {
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 80).springify().damping(35)}
      >
        <TouchableOpacity
          style={styles.row}
          onPress={() => onEditPress?.(item)}
          activeOpacity={0.7}
        >
          {/* 🔄 Icon Transfer */}
          <View style={[styles.icon, { backgroundColor: colors.neutral700 }]}>
            <IconComponent
              item={{ icon: "swap-horizontal-outline" } as any}
              size={verticalScale(22)}
              color={colors.primary}
            />
          </View>

          {/* Deskripsi */}
          <View style={styles.categoryDes}>
            <Typo
              size={16}
              fontWeight="600"
              color={colors.white}
              textProps={{ numberOfLines: 1 }}
            >
              {t('transaction.transfer')}
            </Typo>
            <Typo
              size={13}
              color={colors.neutral400}
              textProps={{ numberOfLines: 1 }}
            >
              {item.from_wallet || "Wallet"} → {item.to_wallet || "Wallet"}
            </Typo>
          </View>

          {/* Jumlah */}
          <View style={styles.amountContainer}>
            <Typo size={16} fontWeight="600" color={colors.neutral300}>
              {formatMoney(Number(item?.amount))}
            </Typo>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // 💰 CASE NORMAL TRANSACTION
  const amountColor = item?.type === "income" ? colors.primary : colors.rose;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 90).springify().damping(40)}
    >
      <TouchableOpacity
        style={styles.row}
        onPress={() => onEditPress?.(item)}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View
          style={[
            styles.icon,
            { backgroundColor: item?.categories?.bgColor + '80' || colors.neutral700 },
          ]}
        >
          <IconComponent
            item={item?.categories as any}
            size={verticalScale(22)}
            color={colors.white}
          />
        </View>

        {/* Deskripsi */}
        <View style={styles.categoryDes}>
          <Typo
            size={16}
            fontWeight="600"
            color={colors.white}
            textProps={{ numberOfLines: 1 }}
          >
            {item?.note || toTitleCase(item?.categories?.name as any) || t('transaction.defaultLabel')}
          </Typo>
          <Typo
            size={13}
            color={colors.neutral400}
            textProps={{ numberOfLines: 1 }}
          >
            {formatTransactionDate(item?.date, t)}
          </Typo>
        </View>

        {/* Jumlah */}
        <View style={styles.amountContainer}>
          <Typo
            size={16}
            fontWeight="600"
            color={amountColor}
          >
            {formatAmount(Number(item?.amount) || 0, item?.type || "expense", formatMoney)}
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
    alignItems: "center",
    paddingVertical: verticalScale(14),
    gap: spacingX._15,
  },
  icon: {
    width: scale(48),
    height: scale(48),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: scale(24),
  },
  categoryDes: {
    flex: 1,
    gap: verticalScale(3),
  },
  amountContainer: {
    alignItems: "flex-end",
  },
});
