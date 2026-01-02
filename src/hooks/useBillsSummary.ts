// src/hooks/useBillsSummary.ts

import {useQuery} from "@tanstack/react-query";
import {supabase} from "@/services/supabaseClient";
import {useAuth} from "./useAuth";

interface BillSummary {
    count: number;
    totalAmount: number;
    nextDueDate: string | null;
}

export function useBillsSummary() {
    const {session} = useAuth();
    const userId = session?.user?.id;

    return useQuery<BillSummary>({
        queryKey: ["billsSummary", userId],
        queryFn: async () => {
            if (!userId) return {count: 0, totalAmount: 0, nextDueDate: null};

            // Query untuk mendapatkan semua Tagihan Induk
            const {data: bills, error} = await supabase
                .from('transactions')
                .select(`amount, date, end_condition, end_value, transaction_count`)
                .eq('user_id', userId)
                .eq('is_recurring', true)
                .order('date', {ascending: true}); // Urutkan untuk mendapatkan tanggal terdekat

            if (error) throw error;

            if (!bills || bills.length === 0) {
                return {count: 0, totalAmount: 0, nextDueDate: null};
            }

            // 2. 🟢 FILTERING LOGIC (Sama seperti di useUpcomingBills)
            // Hanya hitung tagihan yang BELUM SELESAI
            const activeBills = bills.filter((bill) => {
                // Jika 'never' atau 'until_date', anggap aktif
                if (
                    bill.end_condition === "never" ||
                    bill.end_condition === "until_date"
                ) {
                    return true;
                }

                // Jika 'after_count', cek apakah kuota masih ada
                if (bill.end_condition === "after_count") {
                    const targetCount = Number(bill.end_value);
                    const currentCount = Number(bill.transaction_count) || 0;
                    // Masih aktif jika hitungan saat ini KURANG DARI target
                    return currentCount < targetCount;
                }

                return true;
            });

            // 3. Hitung Statistik dari Active Bills saja
            const count = activeBills.length;

            // Jika setelah difilter habis, kembalikan 0
            if (count === 0) {
                return {count: 0, totalAmount: 0, nextDueDate: null};
            }

            const totalAmount = activeBills.reduce(
                (sum, bill) => sum + (Number(bill.amount) || 0),
                0
            );
            return {
                count: count,
                totalAmount: totalAmount,
                nextDueDate: activeBills[0].date, // Tanggal jatuh tempo terdekat
            };
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
}