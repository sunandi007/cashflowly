// src/utils/dateUtils.ts (Buat file baru)

import { addDays, addMonths, addYears, parseISO } from 'date-fns';

// Map aturan pengulangan ke fungsi date-fns
const recurrenceMap = {
    'daily': (date: Date) => addDays(date, 1),
    'weekly': (date: Date) => addDays(date, 7),
    'monthly': (date: Date) => addMonths(date, 1),
    'yearly': (date: Date) => addYears(date, 1),
    '2_weeks': (date: Date) => addDays(date, 14),
    '2_months': (date: Date) => addMonths(date, 2),
    '3_months': (date: Date) => addMonths(date, 3),
    '6_months': (date: Date) => addMonths(date, 6),
    // Tambahkan rule lainnya
};

export function addRecurrenceToDate(currentDateISO: string, rule: string): Date {
    const currentDate = parseISO(currentDateISO);
    const handler = recurrenceMap[rule as keyof typeof recurrenceMap];

    if (handler) {
        return handler(currentDate);
    }
    // Jika aturan tidak ditemukan, kembalikan tanggal awal
    return currentDate; 
}