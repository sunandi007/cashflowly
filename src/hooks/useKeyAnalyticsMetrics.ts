// src/hooks/useKeyAnalyticsMetrics.ts

import { useQueries } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { calculatePercentageChange } from "@/utils/finance"; // Akan kita buat di langkah 3
import React from "react";
import { getDateRangeAnalitic } from "@/utils/getDateRangeAnalitic";

type Period = "weekly" | "monthly" | "yearly";

interface MetricData {
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
}

interface KeyMetrics extends MetricData {
    // Metrik yang membandingkan periode saat ini dengan periode sebelumnya
    percentChange: number | string; // Perubahan Net Income dalam %
}

/**
 * Fungsi Helper untuk mengambil data ringkasan untuk periode tertentu.
 */
const fetchSummaryMetrics = async (userId: string, period: Period, type: 'current' | 'previous'): Promise<MetricData> => {
    // Diasumsikan getDateRange dapat menghasilkan rentang untuk periode saat ini DAN sebelumnya
    const { start, end } = getDateRangeAnalitic(period, type); 

    const { data: rawData, error } = await supabase
        .from("transactions")
        .select(`amount, type, transfer_id`)
        .eq("user_id", userId)
        .is("transfer_id", null) // Abaikan mirror Transfer
        .gte("date", start)
        .lte("date", end);

    if (error) throw error;
    
    const transactions = (rawData || []) as any[];
    
    // Hitung total Income dan Expense
    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of transactions) {
        const amount = Number(tx.amount) || 0;
        
        if (tx.type === "income") {
            totalIncome += amount;
        } else if (tx.type === "expense") {
            totalExpense += amount;
        }
    }
    
    return {
        totalIncome,
        totalExpense,
        netIncome: totalIncome - totalExpense,
    };
};

/**
 * Hook Kunci: Mengambil dan membandingkan metrik Net Income saat ini vs sebelumnya.
 * Menggunakan useQueries untuk fetch paralel (current dan previous).
 */
export function useKeyAnalyticsMetrics(userId?: string, period: Period = "weekly"): {
    data: KeyMetrics | undefined;
    isLoading: boolean;
} {
    // 1. Ambil data periode saat ini
    // 2. Ambil data periode sebelumnya
    const results = useQueries({
        queries: [
            {
                queryKey: ["keyMetrics", userId, period, 'current'],
                queryFn: () => fetchSummaryMetrics(userId!, period, 'current'),
                enabled: !!userId,
            },
            {
                queryKey: ["keyMetrics", userId, period, 'previous'],
                queryFn: () => fetchSummaryMetrics(userId!, period, 'previous'),
                enabled: !!userId,
            },
        ],
    });

    const isLoading = results.some(result => result.isLoading);

    const keyMetrics: KeyMetrics | undefined = React.useMemo(() => {
        const currentData = results[0]?.data;
        const previousData = results[1]?.data;
        
        if (!currentData) return undefined;

        // Hitung persentase perubahan Net Income
        const percentChange = calculatePercentageChange(
            currentData.netIncome,
            previousData?.netIncome || 0 // Jika tidak ada data sebelumnya, asumsikan 0
        );

        return {
            ...currentData,
            percentChange,
        };
    }, [results]);
    
    return { data: keyMetrics, isLoading };
}