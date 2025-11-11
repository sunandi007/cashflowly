import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "./useAuth";

export function useTransactionMutations() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user?.id;

  // CREATE
  const createTransaction = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert(payload)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  // UPDATE
  const updateTransaction = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  // DELETE
  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["upcomingBills", userId] }),
        queryClient.invalidateQueries({ queryKey: ["billsSummary", userId] }),
        queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (err: any) => {
      throw new Error(err.message);
    },
  });

  return { createTransaction, updateTransaction, deleteTransaction };
}
