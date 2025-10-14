import Button from "@/components/Button";
import HomeCard from "@/components/HomeCard";
import IconComponent from "@/components/Icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import TransactionList from "@/components/TransactionList";
import TransactionModal from "@/components/TransactionModal";
import TransactionSearchModal from "@/components/TransactionSearchModal";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constant/theme";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { verticalScale } from "@/utils/styling";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [showModal, setShowModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const { data: recentTransactions = [], isLoading } = useTransactions(userId);

  const handleCloseModal = () => {
    setEditItem(null);
    setShowModal(false);
  };

  const handleCloseSearchModal = () => {
    setEditItem(null);
    setShowSearchModal(false);
  };

  const handleAddPress = () => {
    setEditItem(null); // mode tambah
    setShowModal(true);
  };

  const handleEditPress = (item: any) => {
    setEditItem(item); // mode edit
    setShowModal(true);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ gap: 4 }}>
            <Typo size={16} color={colors.neutral400}>
              Hello,
            </Typo>
            <Typo size={20} fontWeight={"500"} color={colors.neutral300}>
              Yudoyono
            </Typo>
          </View>
        </View>

        <View style={{ marginBottom: spacingY._20 }}>
          <HomeCard />
        </View>

        <FlatList
          data={recentTransactions}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <Typo size={20} fontWeight={"500"} color={colors.neutral300}>
                Recent Transaction
              </Typo>
              <TouchableOpacity onPress={() => setShowSearchModal?.(true)}>
                <Typo size={20} fontWeight={"400"} color={colors.neutral400}>
                  <IconComponent
                    item={{ icon: "search" } as any}
                    size={verticalScale(20)}
                    color={colors.neutral400}
                  />{" "}
                  Cari
                </Typo>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item, index }) => (
            <TransactionList
              data={[item]}
              loading={false}
              emptyListMessage="Belum ada Transaksi"
              title="Transaksi Terkini"
              onEditPress={handleEditPress}
              openSearch={() => setShowSearchModal(true)}
              isLableSearch={index === 0}
            />
          )}
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

      <TransactionModal
        visible={showModal}
        onClose={handleCloseModal}
        initialData={editItem}
      />

      <TransactionSearchModal
        visible={showSearchModal}
        onClose={handleCloseSearchModal}
      />
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
  }
});
