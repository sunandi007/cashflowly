// src/hooks/useBillPayment.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { addRecurrenceToDate } from "@/utils/dateUtils";
import { useAuth } from "./useAuth";

// Payload yang diperlukan untuk pembayaran tagihan manual
interface BillPaymentPayload {
    billId: string;
    amount: number;
    walletId: string;
    type: 'income' | 'expense';
    categoryId: string;
    recurrenceRule: string;
    currentDueDate: string; // Tanggal jatuh tempo saat ini
}

export function useBillPayment() {
      const { session } = useAuth();
      const userId = session?.user?.id;
    
    const queryClient = useQueryClient();

    const processManualBillPayment = useMutation({
        mutationFn: async (payload: BillPaymentPayload) => {
            
            // 1. CREATE Transaksi Anak (Realisasi Pembayaran)
            const transactionPayload = {
                user_id: userId,
                amount: payload.amount,
                type: payload.type,
                wallet_id: payload.walletId,
                category_id: payload.categoryId,
                date: new Date().toISOString(), // Dicatat hari ini
                // Pastikan kolom recurring TIDAK ADA atau NULL (is_recurring: false)
            };
            
            const { error: txError } = await supabase
                .from('transactions')
                .insert(transactionPayload);

            if (txError) throw txError;
            
            // 2. UPDATE Tagihan Induk (Template) ke Tanggal Jatuh Tempo Berikutnya
            
            // Hitung tanggal berikutnya menggunakan utilitas
            const nextDueDate = addRecurrenceToDate(payload.currentDueDate, payload.recurrenceRule);

            const { error: updateError } = await supabase
                .from('transactions')
                .update({ date: nextDueDate.toISOString() }) // Geser tanggal jatuh tempo
                .eq('id', payload.billId);

            if (updateError) throw updateError;
            
            return true;
        },
        onSuccess: () => {
            // Invalidate untuk refresh Daftar Tagihan Mendatang dan Dashboard
            queryClient.invalidateQueries({ queryKey: ["upcomingBills"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["wallets"] });
        },
    });

    return {
        processManualBillPayment: processManualBillPayment.mutateAsync,
        isProcessing: processManualBillPayment.isPending,
    };
}