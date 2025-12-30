import Button from "@/components/Button";
import HomeCard from "@/components/HomeCard";
import IconComponent from "@/components/Icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import TransactionList from "@/components/TransactionList";
import Typo from "@/components/Typo";
import UpcomingBillsSummaryCard from "@/components/UpcomingBillsSummaryCard";
import { colors, spacingX, spacingY } from "@/constant/theme";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { verticalScale } from "@/utils/styling";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

export default function DashboardScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { profile, userEmail } = useProfile();

  const navigation = useNavigation<any>();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const { data: allTransactions = [], isLoading } = useTransactions(userId);

  const handleCloseModal = () => {
    setEditItem(null);
  };

  const handleCloseSearchModal = () => {
    setEditItem(null);
    setShowSearchModal(false);
  };

  const handleAddPress = () => {
    setEditItem(null); // mode tambah
    navigation.navigate("TransactionScreen", { initialData: null });
  };

  const handleEditPress = (item: any) => {
    // Jika item transfer hasil merge, pastikan ada primaryTxId
    const payloadForModal = item.is_transfer
      ? { ...item, idToUpdate: item.id.replace(/^transfer-/, "") }
      : { ...item, idToUpdate: item.id };

    setEditItem(payloadForModal); // mode edit
    const itemData = payloadForModal;
    setEditItem(payloadForModal);
    navigation.navigate("TransactionScreen", {
      initialData: itemData,
    } as never);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={
                profile?.avatar_url
                  ? { uri: profile.avatar_url }
                  : require("../../assets/images/defaultAvatar.png")
              }
              style={styles.avatar}
              contentFit="cover"
              transition={100}
            />
            <View style={{ gap: 4 }}>
              <Typo size={16} color={colors.neutral400}>
                Hello,
              </Typo>
              <Typo size={20} fontWeight={"500"} color={colors.neutral300}>
                {profile?.full_name
                  ? profile?.full_name
                  : userEmail?.split("@")[0] || "User"}
              </Typo>
            </View>
          </View>
        </View>

        <View style={{ marginBottom: spacingY._20 }}>
          <HomeCard />
        </View>

        <UpcomingBillsSummaryCard />

        <FlatList
          data={allTransactions.slice(0, 5)}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <Typo size={20} fontWeight={"500"} color={colors.neutral300}>
                Recent Transaction
              </Typo>
              <TouchableOpacity onPress={() => navigation.navigate("SearchScreen" as never)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconComponent item={{ icon: "search" } as any} size={20} color={colors.primary} />
                  <Typo size={14} color={colors.primary}>Cari</Typo>
                </View>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item, index }) => (
            <TransactionList
              data={[item]}
              loading={isLoading}
              emptyListMessage="Belum ada Transaksi"
              title="Transaksi Terkini"
              onEditPress={handleEditPress}
              openSearch={() => setShowSearchModal(true)}
              isLableSearch={index === 0}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Typo size={16} color={colors.neutral400}>Belum ada transaksi.</Typo>
            </View>
          }
          contentContainerStyle={styles.scrollViewStyle}
        />

        <Button style={styles.floatingButton} onPress={handleAddPress}>
          <IconComponent
            item={{ icon: "add" } as any}
            size={verticalScale(40)}
            color={colors.black}
          />
        </Button>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: verticalScale(8),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
  },
  avatar: {
    width: verticalScale(48),
    height: verticalScale(48),
    borderRadius: 100,
    backgroundColor: colors.neutral700,
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 20,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
  scrollViewStyle: {
    paddingBottom: verticalScale(100),
    marginTop: spacingY._10,
    gap: spacingY._10,
  },
  emptyList: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  }
});
