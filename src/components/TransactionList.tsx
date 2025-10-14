import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import {
  TransactionItemProps,
  TransactionListType,
  TransactionType,
} from "@/types/model";
import { verticalScale } from "@/utils/styling";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Loading from "@/components/Loading";
import Typo from "./Typo";
import { FlatList } from "react-native";
import TransactionItem from "./TransactionItem";
import IconComponent from "./Icons";

const TransactionList = ({
  data,
  title,
  loading,
  emptyListMessage,
  onEditPress,
  openSearch,
  isLableSearch,
}: TransactionListType) => {
  function normalizeToDate(value: any): Date {
    try {
      if (value && typeof (value as any).toDate === "function") {
        return (value as any).toDate();
      }
      if (value instanceof Date) {
        return value;
      }
      if (typeof value === "string" || typeof value === "number") {
        const d = new Date(value as any);
        if (!isNaN(d.getTime())) return d;
      }
    } catch {}
    return new Date();
  }

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        <FlatList
          data={data}
          renderItem={({ item, index }) => (
            <TransactionItem
              item={item}
              index={index}
              onEditPress={onEditPress}
            />
          )}
        />
      </View>
      {!loading && data?.length === 0 && (
        <Typo
          size={15}
          style={{ textAlign: "center", marginTop: spacingY._15 }}
          color={colors.neutral400}
        >
          {emptyListMessage}
        </Typo>
      )}

      {loading && (
        <View style={{ top: verticalScale(100) }}>
          <Loading />
        </View>
      )}
    </View>
  );
};

export default TransactionList;

const styles = StyleSheet.create({
  container: {
    gap: spacingY._17,
  },
  list: {
    minHeight: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacingX._12,
    marginBottom: spacingY._12,
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
