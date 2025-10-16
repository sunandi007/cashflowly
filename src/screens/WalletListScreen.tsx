import { useState } from "react";
import { View, TouchableOpacity, FlatList } from "react-native";
import Typo from "@/components/Typo";
import IconComponent from "@/components/Icons";
import { useWallets } from "@/hooks/useWallets";
import { colors } from "@/constant/theme";
import ScreenWrapper from "@/components/ScreenWrapper";
import WalletAddModal from "@/components/WalletModal";

export default function WalletScreen() {
  const { wallets, totalBalance, addWallet, updateWallet, deleteWallet } =
    useWallets();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);

  return (
    <ScreenWrapper>
      <View style={{ padding: 20 }}>
        <Typo size={32} color={colors.neutral100} fontWeight="bold">
          Rp {totalBalance.toLocaleString("id-ID")}
        </Typo>
        <Typo color={colors.neutral400}>Total Balance</Typo>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 30,
          }}
        >
          <Typo size={20} color={colors.neutral100} fontWeight="700">
            My Wallets
          </Typo>
          <TouchableOpacity
            onPress={() => {
              setSelectedWallet(null);
              setShowAdd(true);
            }}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 10,
            }}
          >
            <IconComponent
              item={{ icon: "add-outline" } as any}
              color="#fff"
              size={22}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={wallets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedWallet(item as any);
                setShowAdd(true);
              }}
            >
              <View
                style={{
                  backgroundColor: colors.neutral800,
                  borderRadius: 16,
                  padding: 15,
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <IconComponent
                  item={{ icon: item.icon || "wallet-outline" } as any}
                  size={28}
                  color={colors.primary}
                />
                <View>
                  <Typo color={colors.neutral100} fontWeight="600">
                    {item.name}
                  </Typo>
                  <Typo color={colors.neutral400}>
                    Rp {item.balance.toLocaleString("id-ID")}
                  </Typo>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
        
        <WalletAddModal
          visible={showAdd}
          onClose={() => setShowAdd(false)}
          onSave={(payload) => addWallet.mutate(payload)} // Create
          onUpdate={(payload) => updateWallet.mutate(payload)} // Edit
          onDelete={(id) => deleteWallet.mutate(id)} // Optional
          initialData={selectedWallet} // isi jika mode edit
        />
      </View>
    </ScreenWrapper>
  );
}
