import { useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
  ScrollView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Typo from "@/components/Typo";
import { Ionicons } from "@expo/vector-icons";
import { useWallets } from "@/hooks/useWallets";
import { colors, spacingX, spacingY, radius } from "@/constant/theme";
import ScreenWrapper from "@/components/ScreenWrapper";
import WalletAddModal from "@/components/WalletModal";
import { scale, verticalScale } from "@/utils/styling";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/navigation";

// Wallet type colors mapping
const WALLET_GRADIENTS: Record<string, string[]> = {
  checking: ["#1E3A5F", "#2E5A8F", "#1E3A5F"],
  bank: ["#1E3A5F", "#2E5A8F", "#1E3A5F"],
  investment: ["#4A1E6F", "#7B3FA0", "#4A1E6F"],
  crypto: ["#4A1E6F", "#7B3FA0", "#4A1E6F"],
  savings: ["#1E5F3A", "#3A8F5A", "#1E5F3A"],
  cash: ["#3A3A3A", "#5A5A5A", "#3A3A3A"],
  default: ["#2A4A6A", "#3A5A7A", "#2A4A6A"],
};

// Wallet type icons mapping
const WALLET_ICONS: Record<string, string> = {
  checking: "business",
  bank: "business",
  investment: "logo-bitcoin",
  crypto: "logo-bitcoin",
  savings: "wallet",
  cash: "cash",
  default: "wallet",
};

// Get wallet type from name
const getWalletType = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("bank") || lowerName.includes("checking")) return "bank";
  if (lowerName.includes("crypto") || lowerName.includes("bitcoin") || lowerName.includes("investment")) return "investment";
  if (lowerName.includes("savings") || lowerName.includes("tabungan")) return "savings";
  if (lowerName.includes("cash") || lowerName.includes("stash") || lowerName.includes("petty")) return "cash";
  return "default";
};

// Get wallet type label
const getWalletLabel = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("bank") || lowerName.includes("checking")) return "CHECKING";
  if (lowerName.includes("crypto") || lowerName.includes("bitcoin") || lowerName.includes("investment")) return "INVESTMENT";
  if (lowerName.includes("savings") || lowerName.includes("tabungan")) return "SAVINGS";
  if (lowerName.includes("cash") || lowerName.includes("stash") || lowerName.includes("petty")) return "PETTY CASH";
  return "WALLET";
};

export default function WalletScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { wallets, totalBalance, addWallet, updateWallet, deleteWallet } =
    useWallets();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);

  // Calculate mock growth percentage (you can replace with real calculation)
  const growthPercentage = useMemo(() => {
    return "+2.4%";
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderWalletCard = ({ item, index }: { item: any; index: number }) => {
    const walletType = getWalletType(item.name);
    const gradient = WALLET_GRADIENTS[walletType] || WALLET_GRADIENTS.default;
    const iconName = WALLET_ICONS[walletType] || WALLET_ICONS.default;
    const typeLabel = getWalletLabel(item.name);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate("WalletDetail", { wallet: item });
        }}
        style={styles.cardWrapper}
      >
        <LinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.walletCard}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTypeLabel}>{typeLabel}</Text>
              <Text style={styles.cardName}>{item.name}</Text>
            </View>
            <View style={styles.cardIcon}>
              <Ionicons
                name={iconName as any}
                size={scale(22)}
                color="rgba(255,255,255,0.8)"
              />
            </View>
          </View>

          {/* Card Balance */}
          <View style={styles.cardBalanceSection}>
            <Text style={styles.cardBalance}>
              {formatCurrency(item.balance)}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={scale(24)} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Wallets</Text>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="add-circle-outline"
            onPress={() => {
              setSelectedWallet(null);
              setShowAdd(true);
            }}
            size={scale(28)} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Total Net Worth Section */}
        <View style={styles.netWorthSection}>
          <Text style={styles.netWorthLabel}>Total Net Worth</Text>
          <Text style={styles.netWorthAmount}>
            {formatCurrency(totalBalance)}
          </Text>
          <View style={styles.growthBadge}>
            <Ionicons name="trending-up" size={scale(14)} color={colors.primary} />
            <Text style={styles.growthText}>{growthPercentage} this month</Text>
          </View>
        </View>

        {/* Wallet Cards */}
        <View style={styles.cardsContainer}>
          {wallets.map((item, index) => (
            <View key={item.id}>
              {renderWalletCard({ item, index })}
            </View>
          ))}
        </View>
      </ScrollView>

      <WalletAddModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={(payload) => addWallet.mutate(payload)}
        onUpdate={(payload) => updateWallet.mutate(payload)}
        onDelete={(id) => deleteWallet.mutate(id)}
        initialData={selectedWallet}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  headerButton: {
    width: scale(40),
    height: scale(40),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: "700",
    color: colors.white,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: spacingX._20,
    paddingBottom: verticalScale(40),
  },

  // Net Worth Section
  netWorthSection: {
    alignItems: "center",
    marginBottom: verticalScale(30),
  },
  netWorthLabel: {
    fontSize: scale(14),
    color: colors.neutral400,
    marginBottom: verticalScale(8),
  },
  netWorthAmount: {
    fontSize: scale(36),
    fontWeight: "700",
    color: colors.white,
    marginBottom: verticalScale(12),
  },
  growthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: `${colors.primary}20`,
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(14),
    borderRadius: scale(20),
  },
  growthText: {
    fontSize: scale(13),
    fontWeight: "600",
    color: colors.primary,
  },

  // Cards Container
  cardsContainer: {
    gap: verticalScale(16),
    marginBottom: verticalScale(24),
  },

  // Wallet Card
  cardWrapper: {
    borderRadius: scale(20),
    overflow: "hidden",
  },
  walletCard: {
    padding: scale(20),
    minHeight: verticalScale(160),
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTypeLabel: {
    fontSize: scale(11),
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1,
    marginBottom: verticalScale(4),
  },
  cardName: {
    fontSize: scale(18),
    fontWeight: "700",
    color: colors.white,
  },
  cardIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBalanceSection: {
    marginTop: verticalScale(20),
  },
  cardBalance: {
    fontSize: scale(28),
    fontWeight: "700",
    color: colors.white,
    marginBottom: verticalScale(4),
  },
  cardAccountNumber: {
    fontSize: scale(13),
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1,
  },

  // Add Button
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(18),
    borderRadius: scale(16),
    marginBottom: verticalScale(24),
  },
  addButtonText: {
    fontSize: scale(16),
    fontWeight: "700",
    color: colors.neutral900,
  },

  // Connect Link
  connectLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(10),
    paddingVertical: verticalScale(12),
  },
  connectIconWrapper: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    borderWidth: 1.5,
    borderColor: colors.neutral600,
    alignItems: "center",
    justifyContent: "center",
  },
  connectText: {
    fontSize: scale(14),
    color: colors.neutral400,
  },
});
