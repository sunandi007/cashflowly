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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wallets", userId] });
      await queryClient.invalidateQueries({
        queryKey: ["transactions", userId],
      });

      Alert.alert(
        "✅ Transfer Berhasil",
        "Dana berhasil ditransfer antar wallet!"
      );
    },
    onError: (err: any) => {
      Alert.alert("❌ Gagal Transfer", err.message);
    },
  });

  const updateTransfer = useMutation({
    mutationFn: async ({
      transfer_id,
      from_wallet_id,
      to_wallet_id,
      amount,
      note,
      date,
    }: {
      transfer_id: string; // ID transaksi (UUID asli dari tabel)
      from_wallet_id: string;
      to_wallet_id: string;
      amount: number;
      note?: string;
      date: string;
    }) => {
      if (!userId) throw new Error("User not authenticated");
      if (from_wallet_id === to_wallet_id)
        throw new Error("Wallet asal dan tujuan tidak boleh sama");
      if (amount <= 0) throw new Error("Nominal tidak valid");

      // Panggil RPC baru di Supabase
      const { error } = await supabase.rpc("update_wallet_transfer", {
        p_transfer_id: transfer_id,
        p_from_wallet: from_wallet_id,
        p_to_wallet: to_wallet_id,
        p_amount: amount,
        p_user_id: userId,
        p_note: note || "",
        p_date: date,
      });

      if (error) throw error;
      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
      await queryClient.refetchQueries({ queryKey: ["transactions"] });
      Alert.alert("✅ Transfer Diperbarui", "Transfer berhasil diperbarui!");
    },
    onError: (err: any) => {
      Alert.alert("❌ Gagal Update Transfer", err.message);
    },
  });

  const deleteTransfer = useMutation({
    mutationFn: async (transferId: string) => {
      if (!userId) throw new Error("User not authenticated");

      // Menghapus dari tabel 'transfers' akan memicu Trigger (sync_transfer_to_transactions)
      const { error } = await supabase
        .from("transfers")
        .delete()
        .eq("id", transferId);

      if (error) throw error;
      return true;
    },
    onSuccess: async () => {
      // Invalidate cache untuk memperbarui UI dan saldo dompet
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
      Alert.alert("✅ Transfer Dihapus", "Transfer berhasil dibatalkan!");
    },
    onError: (err: any) => {
      Alert.alert("❌ Gagal Hapus Transfer", err.message);
    },
  });

  return {
    performTransfer: performTransfer.mutateAsync,
    isTransferring: performTransfer.isPending,
    updateTransfer: updateTransfer.mutateAsync,
    isUpdatingTransfer: updateTransfer.isPending,
    deleteTransfer: deleteTransfer.mutateAsync,
    isDeletingTransfer: deleteTransfer.isPending,
  };
}
