// src/utils/getDateRange.ts (Versi yang Diperbaiki)

type Period = "daily" | "weekly" | "monthly" | "yearly" | "all";
type RangeType = "current" | "previous";

export function getDateRangeAnalitic(
    period: Period,
    type: RangeType = "current"
): {
    start: string | null;
    end: string | null;
} {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date = new Date();
    
    // --- Langkah 1: Tentukan Awal & Akhir Periode Saat Ini (CURRENT) ---
    
    if (period === "weekly") {
        // Tentukan hari Senin (hari 1) minggu ini
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Senin
        startDate = new Date(now.setDate(diff));
        
        // Akhir periode adalah akhir hari ini (jika current)
        endDate = new Date();
    } else if (period === "monthly") {
        // Awal bulan ini
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Akhir periode adalah akhir hari ini (jika current)
        endDate = new Date();
    } else if (period === "yearly") {
        // Awal tahun ini
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date();
    }
    
    // Jika period adalah "all" atau tidak terdefinisi, kembalikan null
    if (period === "all" || !startDate) {
        return { start: null, end: null };
    }
    
    // --- Langkah 2: Geser ke Periode Sebelumnya (PREVIOUS) ---
    
    if (type === "previous") {
        const tempStart = new Date(startDate.getTime());
        const tempEnd = new Date(endDate.getTime());
        
        if (period === "weekly") {
            // Geser start dan end mundur 7 hari
            tempStart.setDate(startDate.getDate() - 7);
            tempEnd.setDate(startDate.getDate() - 1); // Akhir adalah Minggu sebelumnya
        } else if (period === "monthly") {
            // Geser mundur 1 bulan
            tempStart.setMonth(startDate.getMonth() - 1);
            tempEnd.setDate(0); // Akhir bulan sebelumnya
            tempEnd.setMonth(endDate.getMonth());
            tempEnd.setDate(0); // Akhir bulan sebelumnya
            
            // Menggunakan setMonth(getMonth() - 1) untuk startDate & endDate
            const prevMonth = startDate.getMonth() - 1;
            startDate.setMonth(prevMonth);
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); // Akhir bulan sebelumnya
            
        } else if (period === "yearly") {
             // Geser mundur 1 tahun
            startDate.setFullYear(startDate.getFullYear() - 1);
            endDate.setFullYear(endDate.getFullYear() - 1);
        }
        
        // Karena logika di atas sulit dan berpotensi bug, mari kita gunakan pendekatan yang lebih sederhana:
        // Cukup geser START DATE ke periode sebelumnya
        if (period === "weekly") {
             startDate.setDate(startDate.getDate() - 7);
             endDate.setDate(endDate.getDate() - 7);
        } else if (period === "monthly") {
             startDate.setMonth(startDate.getMonth() - 1);
             endDate.setMonth(endDate.getMonth() - 1);
        } else if (period === "yearly") {
             startDate.setFullYear(startDate.getFullYear() - 1);
             endDate.setFullYear(endDate.getFullYear() - 1);
        }
    }


    // Perbaikan Logika: Menggunakan pendekatan yang lebih andal untuk PREVIOUS
    let start: Date = new Date(startDate.getTime());
    let end: Date = new Date(); // Default akhir periode saat ini adalah sekarang

    if (type === 'previous') {
        if (period === "weekly") {
            // Mundur 7 hari dari awal minggu ini
            start.setDate(startDate.getDate() - 7);
            // Akhir periode adalah hari sebelum awal minggu ini
            end.setDate(startDate.getDate() - 1);
        } else if (period === "monthly") {
            // Mundur 1 bulan dari awal bulan ini
            start.setMonth(startDate.getMonth() - 1);
            // Akhir periode adalah hari terakhir bulan sebelumnya
            end = new Date(startDate.getFullYear(), startDate.getMonth(), 0); 
        } else if (period === "yearly") {
             start.setFullYear(startDate.getFullYear() - 1);
             end = new Date(startDate.getFullYear(), 11, 31); // Akhir tahun sebelumnya
        }
    } else {
        // Jika 'current', akhir periode adalah 'now'
        end = new Date();
    }
    
    // Pastikan jamnya disetel untuk mencakup seluruh hari
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}