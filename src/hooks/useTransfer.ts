import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Alert } from "react-native";

/**
 * Hook untuk melakukan transfer antar wallet.
 * Menggunakan RPC perform_wallet_transfer di Supabase.
 */
export function useTransfer() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user?.id;

  const performTransfer = useMutation({
    mutationFn: async ({
      from_wallet_id,
      to_wallet_id,
      amount,
      note,
    }: {
      from_wallet_id: string;
      to_wallet_id: string;
      amount: number;
      note?: string;
    }) => {
      if (!userId) throw new Error("User not authenticated");
      if (from_wallet_id === to_wallet_id)
        throw new Error("Tidak dapat transfer ke wallet yang sama");
      if (amount <= 0) throw new Error("Nominal transfer tidak valid");

      // Cek saldo wallet asal
      const { data: fromWallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("id", from_wallet_id)
        .single();

      if (walletError) throw new Error(walletError.message);
      if (!fromWallet || fromWallet.balance < amount)
        throw new Error("Saldo tidak mencukupi untuk transfer");

      const now = new Date().toISOString();

      // Jalankan RPC Postgres perform_wallet_transfer
      const { error: txError } = await supabase.rpc("perform_wallet_transfer", {
        p_from_wallet: from_wallet_id,
        p_to_wallet: to_wallet_id,
        p_amount: amount,
        p_user_id: userId,
        p_note: note || "",
        p_date: now,
      });

      if (txError) throw new Error(txError.message);

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets", userId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", userId] });

      Alert.alert("✅ Transfer Berhasil", "Dana berhasil ditransfer antar wallet!");
    },
    onError: (err: any) => {
      Alert.alert("❌ Gagal Transfer", err.message);
    },
  });

  return {
    performTransfer: performTransfer.mutateAsync,
    isTransferring: performTransfer.isPending,
  };
}
