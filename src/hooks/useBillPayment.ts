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
    currentDueDate: string;
}

export function useBillPayment() {
    const { session } = useAuth();
    const userId = session?.user?.id;

    const queryClient = useQueryClient();

    const processManualBillPayment = useMutation({
        mutationFn: async (payload: BillPaymentPayload) => {

            // 1. CREATE Transaksi Anak (Realisasi Pembayaran - Masuk History)
            const transactionPayload = {
                user_id: userId,
                amount: payload.amount,
                type: payload.type,
                wallet_id: payload.walletId,
                category_id: payload.categoryId,
                date: new Date().toISOString(), // Dicatat hari ini
            };

            const { error: txError } = await supabase
                .from('transactions')
                .insert(transactionPayload);

            if (txError) throw txError;

            // 2. UPDATE Tagihan Induk (Geser Tanggal & Tambah Hitungan)

            // A. Ambil data count saat ini dulu dari DB
            const { data: currentBill, error: fetchError } = await supabase
                .from('transactions')
                .select('transaction_count')
                .eq('id', payload.billId)
                .single();

            if (fetchError) throw fetchError;

            // B. Hitung logika baru
            const currentCount = currentBill?.transaction_count || 0;
            const newCount = currentCount + 1; // 🟢 Tambah 1
            const nextDueDate = addRecurrenceToDate(payload.currentDueDate, payload.recurrenceRule);

            // C. Update ke Database (Tanggal DAN Count)
            const { error: updateError } = await supabase
                .from('transactions')
                .update({
                    date: nextDueDate.toISOString(),
                    transaction_count: newCount // 🟢 Simpan count baru
                })
                .eq('id', payload.billId);

            if (updateError) throw updateError;

            return true;
        },
        onSuccess: () => {
            // Invalidate semua query terkait
            queryClient.invalidateQueries({ queryKey: ["upcomingBills"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["wallets"] });
            queryClient.invalidateQueries({ queryKey: ["billsSummary"] });
        },
    });

    return {
        processManualBillPayment: processManualBillPayment.mutateAsync,
        isProcessing: processManualBillPayment.isPending,
    };
}