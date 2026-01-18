import Button from "@/components/Button";
import Header from "@/components/Header";
import HomeCard from "@/components/HomeCard";
import IconComponent from "@/components/Icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import TransactionList from "@/components/TransactionList";
import UpcomingBillItem from "@/components/UpcomingBillItem";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY, radius } from "@/constant/theme";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { useUpcomingBills } from "@/hooks/useUpcomingBills";
import { useCurrency } from "@/contexts/CurrencyContext";
import { scale, verticalScale } from "@/utils/styling";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

// Quick Action Button Data
const QUICK_ACTIONS = [
  { id: "send", icon: "paper-plane", label: "Send", color: colors.primary },
  { id: "topup", icon: "card", label: "Top Up", color: colors.primary },
  { id: "request", icon: "wallet", label: "Request", color: colors.primary },
  { id: "more", icon: "grid", label: "More", color: "#F59E0B" },
];

// Get greeting key based on time
const getGreetingKey = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "dashboard.greeting.morning";
  if (hour < 17) return "dashboard.greeting.afternoon";
  return "dashboard.greeting.evening";
};

export default function DashboardScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { profile, userEmail } = useProfile();
  const { t } = useLanguage();

  const navigation = useNavigation<any>();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const { data: allTransactions = [], isLoading } = useTransactions(userId);
  const { data: upcomingBills = [], isLoading: billsLoading } = useUpcomingBills();
  const { formatMoney } = useCurrency();
  const { mode: themeMode, setMode: setThemeMode, isDark } = useTheme();

  // Theme toggle handler - Toggle between dark and light only
  const handleToggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const handleCloseModal = () => {
    setEditItem(null);
  };

  const handleCloseSearchModal = () => {
    setEditItem(null);
    setShowSearchModal(false);
  };

  const handleAddPress = () => {
    setEditItem(null);
    navigation.navigate("TransactionScreen", { initialData: null });
  };

  const handleEditPress = (item: any) => {
    const payloadForModal = item.is_transfer
      ? { ...item, idToUpdate: item.id.replace(/^transfer-/, "") }
      : { ...item, idToUpdate: item.id };

    setEditItem(payloadForModal);
    const itemData = payloadForModal;
    setEditItem(payloadForModal);
    navigation.navigate("TransactionScreen", {
      initialData: itemData,
    } as never);
  };

  const handleQuickAction = (actionId: string) => {
    // Handle quick actions - can be expanded later
    if (actionId === "more") {
      navigation.navigate("SearchScreen" as never);
    }
  };

  const handleBillPayPress = (item: any) => {
    // Navigate to Bills screen for payment
    navigation.navigate("BillsScreen" as never);
  };

  const handleBillDeletePress = (item: any) => {
    // Navigate to Bills screen for deletion
    navigation.navigate("BillsScreen" as never);
  };

  const handleBillEditPress = (item: any) => {
    // Navigate to edit transaction
    navigation.navigate("TransactionScreen", {
      initialData: item,
    } as never);
  };

  const handleBillDetailPress = (item: any) => {
    // Navigate to Bills screen for details
    navigation.navigate("BillsScreen" as never);
  };

  // Get first name from full name
  const firstName = profile?.full_name?.split(" ")[0] ||
    userEmail?.split("@")[0] ||
    "User";

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header Section */}
        {/* Header Section */}
        <Header
          style={styles.header}
          leftComponent={
            <View style={styles.headerLeft}>
              {/* Avatar with online indicator */}
              <View style={styles.avatarContainer}>
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
                <View style={styles.onlineIndicator} />
              </View>

              {/* Greeting */}
              <View style={styles.greetingContainer}>
                <Typo size={14} color={colors.neutral400}>
                  {t(getGreetingKey())},
                </Typo>
                <Typo size={18} fontWeight="600" color={colors.white}>
                  {firstName} 👋
                </Typo>
              </View>
            </View>
          }
          rightComponent={
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={handleToggleTheme}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={scale(24)}
                color={colors.white}
              />
            </TouchableOpacity>
          }
        />

        {/* Balance Card */}
        <View style={styles.cardSection}>
          <HomeCard />
        </View>

        {/* Quick Actions */}
        {/* <View style={styles.quickActionsContainer}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionItem}
              onPress={() => handleQuickAction(action.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.quickActionIcon,
                action.id === "more" && styles.quickActionIconAlt
              ]}>
                <Ionicons
                  name={action.icon as any}
                  size={scale(22)}
                  color={action.id === "more" ? action.color : colors.primary}
                />
              </View>
              <Typo size={12} color={colors.neutral400} style={styles.quickActionLabel}>
                {action.label}
              </Typo>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* Recent Transactions */}
        <FlatList
          data={allTransactions.slice(0, 5)}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Typo size={18} fontWeight="600" color={colors.white}>
                {t('dashboard.recentTransactions')}
              </Typo>
              <TouchableOpacity
                onPress={() => navigation.navigate("SearchScreen" as never)}
              >
                <Typo size={14} fontWeight="500" color={colors.primary}>
                  {t('dashboard.viewAll')}
                </Typo>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item, index }) => (
            <TransactionList
              data={[item]}
              loading={isLoading}
              emptyListMessage={t('dashboard.noTransactions')}
              title={t('dashboard.recentTransactions')}
              onEditPress={handleEditPress}
              openSearch={() => setShowSearchModal(true)}
              isLableSearch={index === 0}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons
                  name="receipt-outline"
                  size={scale(40)}
                  color={colors.neutral600}
                />
              </View>
              <Typo size={15} color={colors.neutral400}>
                {t('dashboard.noTransactions')}
              </Typo>
              <Typo size={13} color={colors.neutral500} style={styles.emptySubtext}>
                {t('dashboard.tapToAdd')}
              </Typo>
            </View>
          }
          ListFooterComponent={
            upcomingBills.length > 0 ? (
              <View style={styles.upcomingBillsSection}>
                <View style={styles.sectionHeader}>
                  <Typo size={18} fontWeight="600" color={colors.white}>
                    {t('dashboard.upcomingBills')}
                  </Typo>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("BillsScreen" as never)}
                  >
                    <Typo size={14} fontWeight="500" color={colors.primary}>
                      {t('dashboard.viewAll')}
                    </Typo>
                  </TouchableOpacity>
                </View>

                {upcomingBills.slice(0, 3).map((bill: any, index: number) => (
                  <UpcomingBillItem
                    key={bill.id}
                    item={bill}
                    onPayPress={handleBillPayPress}
                    onDeletePress={handleBillDeletePress}
                    onEditPress={handleBillEditPress}
                    onDetailPress={handleBillDetailPress}
                    isProcessing={false}
                    formatCurrency={formatMoney}
                  />
                ))}
              </View>
            ) : null
          }
          contentContainerStyle={styles.scrollViewStyle}
        />

        {/* FAB */}
        {/* <TouchableOpacity
          style={styles.fab}
          onPress={handleAddPress}
          activeOpacity={0.8}
        >
          <Ionicons
            name="add"
            size={scale(28)}
            color={colors.neutral900}
          />
        </TouchableOpacity> */}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },

  // Header
  // Header
  header: {
    marginTop: verticalScale(8),
    marginBottom: spacingY._20,
    paddingHorizontal: 0, // Header has internal padding
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: colors.neutral700,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: scale(2),
    left: scale(2),
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.neutral900,
  },
  greetingContainer: {
    gap: verticalScale(2),
  },
  notificationButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: colors.neutral800,
    alignItems: "center",
    justifyContent: "center",
  },

  // Card Section
  cardSection: {
    marginBottom: spacingY._25,
  },

  // Upcoming Bills Section
  upcomingBillsSection: {
    marginBottom: spacingY._25,
    marginTop: spacingY._20,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacingY._25,
    paddingHorizontal: spacingX._10,
  },
  quickActionItem: {
    alignItems: "center",
    gap: verticalScale(8),
  },
  quickActionIcon: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(16),
    backgroundColor: colors.neutral800,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionIconAlt: {
    backgroundColor: colors.neutral800,
  },
  quickActionLabel: {
    textAlign: "center",
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._15,
  },

  // Transaction List
  scrollViewStyle: {
    paddingBottom: verticalScale(100),
  },

  // Empty State
  emptyList: {
    alignItems: "center",
    paddingVertical: verticalScale(40),
    gap: verticalScale(8),
  },
  emptyIconWrapper: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: colors.neutral800,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(8),
  },
  emptySubtext: {
    marginTop: verticalScale(4),
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(20),
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
