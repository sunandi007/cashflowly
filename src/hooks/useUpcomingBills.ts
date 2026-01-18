// src/hooks/useUpcomingBills.ts

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "./useAuth";

// Tipe data untuk Tagihan Mendatang (Mirip dengan Category/Transaction)
interface RecurringBill {
  id: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  recurrence_rule: string;
  end_condition: string;
  category_id: string;
  transaction_count: number;
  categories: {
    name: string;
    icon: string;
    bgColor: string;
  };
}

/**
 * Hook untuk mengambil daftar Tagihan Berulang yang aktif.
 * Ini adalah TEMPLATE yang akan digunakan untuk pengingat.
 */
export function useUpcomingBills() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery<RecurringBill[]>({
    queryKey: ["upcomingBills", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select(
          `id, amount, type, date, note, is_recurring, recurrence_rule, end_condition, end_value, category_id, wallet_id, transaction_count, categories(name, icon, bgColor)`
        )
        .eq("user_id", userId)
        .eq("is_recurring", true)
        .order("date", { ascending: true });

      if (error) throw error;

      const allBills = data as any;

      // FILTERING LOGIC: Hanya kembalikan tagihan yang BELUM SELESAI
      return allBills.filter((bill: any) => {
        // 1. Jika 'never' atau 'until_date', selalu tampilkan (kecuali until_date sudah lewat, tapi kita asumsikan user ingin melihat tagihan tertunggak)
        if (bill.end_condition === 'never' || bill.end_condition === 'until_date') {
          return true;
        }

        // 2. Jika 'after_count', cek apakah masih ada sisa
        if (bill.end_condition === 'after_count') {
          const targetCount = Number(bill.end_value);
          const currentCount = Number(bill.transaction_count) || 0;

          // HANYA tampilkan jika currentCount MASIH KURANG DARI targetCount
          return currentCount < targetCount;
        }

        return true;
      });
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
