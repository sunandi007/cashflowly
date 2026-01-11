// src/components/WalletItem.tsx
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Typo from "./Typo";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import IconComponent from "./Icons";
import { verticalScale } from "@/utils/styling";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function WalletItem({ wallet }: any) {
  const { formatMoney } = useCurrency();

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <IconComponent
          item={"wallet-outline" as any}
          size={verticalScale(26)}
          color={colors.white}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Typo size={16} fontWeight="600" color={colors.neutral100}>
          {wallet.name}
        </Typo>
        <Typo size={14} color={colors.neutral400}>
          {formatMoney(wallet.balance)}
        </Typo>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral800,
    paddingVertical: spacingY._15,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    marginBottom: spacingY._10,
  },
  iconContainer: {
    width: verticalScale(44),
    height: verticalScale(44),
    borderRadius: radius._15,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacingX._15,
  },
});
