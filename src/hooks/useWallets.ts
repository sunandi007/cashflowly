import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Alert } from "react-native";

export type WalletType = {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  icon?: string | null;
  created_at: string;
  updated_at?: string;
};

export function useWallets() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  /* ----------------------------- 🔹 FETCH WALLET ----------------------------- */
  const fetchWallets = async (): Promise<WalletType[]> => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  };

  const {
    data: wallets = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["wallets", userId],
    queryFn: fetchWallets,
    enabled: !!userId,
  });

  /* ----------------------------- 🔹 ADD WALLET ----------------------------- */
  const addWallet = useMutation({
    mutationFn: async (wallet: { name: string; icon?: string | null }) => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("wallets")
        .insert([
          {
            user_id: userId,
            name: wallet.name,
            icon: wallet.icon || "wallet-outline",
            balance: 0,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets", userId] });
      Alert.alert("✅ Success", "Wallet berhasil ditambahkan!");
    },
    onError: (err: any) => {
      Alert.alert("❌ Gagal menambah wallet", err.message);
    },
  });

  /* ----------------------------- 🔹 UPDATE WALLET ----------------------------- */
  const updateWallet = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<WalletType>;
    }) => {
      const { error } = await supabase
        .from("wallets")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets", userId] });
    },
  });

  /* ----------------------------- 🔹 DELETE WALLET ----------------------------- */
  const deleteWallet = useMutation({
    mutationFn: async (walletId: string) => {
      const { error } = await supabase
        .from("wallets")
        .delete()
        .eq("id", walletId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets", userId] });
      Alert.alert("🗑️ Wallet Dihapus", "Wallet telah berhasil dihapus.");
    },
  });

  /* ----------------------------- 🔹 TOTAL BALANCE ----------------------------- */
  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  return {
    wallets,
    isLoading,
    refetch,
    addWallet,
    updateWallet,
    deleteWallet,
    totalBalance,
  };
}