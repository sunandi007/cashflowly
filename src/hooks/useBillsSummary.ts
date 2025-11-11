// src/hooks/useBillsSummary.ts

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "./useAuth";

interface BillSummary {
    count: number;
    totalAmount: number;
    nextDueDate: string | null;
}

export function useBillsSummary() {
    const { session } = useAuth();
    const userId = session?.user?.id;
    
    return useQuery<BillSummary>({
        queryKey: ["billsSummary", userId],
        queryFn: async () => {
            if (!userId) return { count: 0, totalAmount: 0, nextDueDate: null };
            
            // Query untuk mendapatkan semua Tagihan Induk
            const { data: bills, error } = await supabase
                .from('transactions')
                .select(`amount, date`)
                .eq('user_id', userId)
                .eq('is_recurring', true)
                .order('date', { ascending: true }); // Urutkan untuk mendapatkan tanggal terdekat
            
            if (error) throw error;
            
            if (!bills || bills.length === 0) {
                return { count: 0, totalAmount: 0, nextDueDate: null };
            }
            
            const totalAmount = bills.reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);
            
            return {
                count: bills.length,
                totalAmount: totalAmount,
                nextDueDate: bills[0].date, // Tanggal jatuh tempo terdekat
            };
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, 
    });
}