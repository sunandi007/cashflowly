import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { TransactionType } from '../types/model';
import { supabase } from './supabaseClient';

export interface CsvExportOptions {
    startDate?: Date;
    endDate?: Date;
    transactions: TransactionType[];
}

export interface CsvImportResult {
    success: boolean;
    data?: any[];
    rows?: any[];
    fileName?: string;
    error?: string;
}

class CsvService {
    // --- HELPER 1: Ubah DD/MM/YYYY jadi YYYY-MM-DD ---
    private normalizeDate(dateStr: any): string {
        if (!dateStr) return '';
        const str = String(dateStr).trim();

        // Jika format sudah YYYY-MM-DD (misal: 2025-12-25), kembalikan langsung
        if (str.match(/^\d{4}-\d{2}-\d{2}$/)) return str;

        // Jika format DD/MM/YYYY (misal: 25/12/2025)
        if (str.includes('/')) {
            const parts = str.split('/');
            if (parts.length === 3) {
                // Asumsi: parts[0]=DD, parts[1]=MM, parts[2]=YYYY
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        return str;
    }

    /**
     * HELPER 2: Normalisasi Angka (Versi Paling Aman)
     * - Membersihkan "Rp", "IDR", Spasi.
     * - Otomatis mendeteksi format US (10,000.00) vs Indo (10.000,00).
     */
    private normalizeAmount(amount: any): number {
        if (typeof amount === 'number') return amount;
        if (!amount) return 0;

        let str = String(amount);

        // 1. PEMBERSIHAN AWAL (Sesuai request Anda)
        // Hapus "Rp", "IDR", dan Spasi. 
        // TAPI JANGAN HAPUS TITIK/KOMA DULU.
        str = str.replace(/[RpIDR\s]/gi, '');

        // 2. DETEKSI FORMAT & BERSIHKAN TANDA BACA
        // Cek mana yang posisi index-nya paling belakang (itu adalah desimal)
        const lastComma = str.lastIndexOf(',');
        const lastDot = str.lastIndexOf('.');

        if (lastDot > lastComma) {
            // FORMAT US: "14,776,000.00" (Titik ada di belakang)
            // Hapus koma (pemisah ribuan), biarkan titik (desimal)
            str = str.replace(/,/g, '');
        } else if (lastComma > lastDot) {
            // FORMAT INDO: "14.776.000,00" (Koma ada di belakang)
            // Hapus titik (pemisah ribuan), ganti koma jadi titik (desimal)
            str = str.replace(/\./g, '').replace(',', '.');
        } else {
            // TIDAK ADA CAMPURAN (Misal: "10000" atau "10.000" atau "10,000")
            // Jika ada koma, biasanya itu desimal di excel indo (atau ribuan US).
            // Demi keamanan data user Indo, kita anggap koma sendirian adalah desimal.
            // "10,5" -> "10.5"
            str = str.replace(',', '.');

            // Bagaimana jika "10.000"? (Tanpa koma)
            // Di JS parseFloat("10.000") = 10. 
            // Jadi kita harus hapus titik ribuan jika formatnya murni angka & titik
            // Tapi hati-hati, "10.5" (US decimal) juga pakai titik.
            // Biasanya aman membiarkan parseFloat menangani "10.5", 
            // tapi untuk "10.000" kita perlu hapus titiknya.
            // Logic aman: Jika titik lebih dari satu (10.000.000), pasti ribuan -> Hapus.
            if ((str.match(/\./g) || []).length > 1) {
                str = str.replace(/\./g, '');
            }
        }

        const parsed = parseFloat(str);
        return isNaN(parsed) ? 0 : parsed;
    }
    /**
     * Export transactions to CSV file
     */
    async exportTransactionsToCsv(options: CsvExportOptions): Promise<void> {
        try {
            const { transactions, startDate, endDate } = options;

            // Filter transactions by date range if provided
            let filteredTransactions = transactions;
            if (startDate || endDate) {
                filteredTransactions = transactions.filter((transaction) => {
                    const transactionDate = new Date(transaction.createdAt || transaction.date);
                    if (startDate && transactionDate < startDate) return false;
                    if (endDate && transactionDate > endDate) return false;
                    return true;
                });
            }

            // Prepare data for CSV
            const csvData = filteredTransactions.map((transaction) => ({
                Date: new Date(transaction.date).toISOString().split('T')[0],
                Description: transaction.note || '',
                Category: transaction.category?.name || transaction.categories?.name || '',
                Type: transaction.type,
                Amount: transaction.amount,
                Wallet: transaction.wallet?.name || '',
            }));

            // Convert to CSV using PapaParse
            const csv = Papa.unparse(csvData, {
                delimiter: ";",
            });

            // Generate filename with current date
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `cashflowly_export_${dateStr}.csv`;

            // Use documentDirectory correctly with namespace import
            const fileUri = `${FileSystem.documentDirectory}${filename}`;

            // Write CSV to file
            await FileSystem.writeAsStringAsync(fileUri, csv, {
                encoding: 'utf8',
            });

            // Share the file
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    dialogTitle: 'Export Transactions',
                    UTI: 'public.comma-separated-values-text',
                });
            } else {
                throw new Error('Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Error exporting CSV:', error);
            throw error;
        }
    }

    /**
     * Download CSV template for importing transactions
     */
    async downloadTemplate(): Promise<void> {
        try {
            const templateData = [
                {
                    Date: '2026-01-01',
                    Description: 'Sample Transaction',
                    Category: 'Food & Dining',
                    Type: 'expense',
                    Amount: 25.50,
                    Wallet: 'Cash',
                    Tags: 'lunch, personal',
                },
            ];

            const csv = Papa.unparse(templateData, {
                delimiter: ";",
            });
            const filename = 'cashflowly_import_template.csv';
            const fileUri = `${FileSystem.documentDirectory}${filename}`;

            await FileSystem.writeAsStringAsync(fileUri, csv, {
                encoding: 'utf8',
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    dialogTitle: 'CSV Import Template',
                    UTI: 'public.comma-separated-values-text',
                });
            } else {
                throw new Error('Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Error downloading template:', error);
            throw error;
        }
    }

    /**
     * Pick and parse CSV file for import
     */
    async pickAndParseCsv(): Promise<CsvImportResult> {
        try {
            // Pick document
            const result = await DocumentPicker.getDocumentAsync({
                // Izinkan semua file agar tidak ada yang grayed out di Android
                type: '*/*',
                copyToCacheDirectory: true,
            });

            // Tambahkan Validasi Manual setelah file dipilih
            if (result.assets && result.assets[0]) {
                const fileName = result.assets[0].name.toLowerCase();
                // Cek apakah akhiran filenya .csv
                if (!fileName.endsWith('.csv')) {
                    return {
                        success: false,
                        error: 'File harus berformat .csv (Pastikan bukan Google Sheet)'
                    };
                }
            }

            if (result.canceled) {
                return { success: false, error: 'File selection canceled' };
            }

            const fileUri = result.assets[0].uri;
            const fileName = result.assets[0].name;

            // Read file content
            const fileContent = await FileSystem.readAsStringAsync(fileUri, {
                encoding: 'utf8',
            });

            // Parse CSV
            const parseResult = Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                delimiter: "",
            });

            if (parseResult.errors.length > 0) {
                return {
                    success: false,
                    error: `CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}`,
                };
            }

            return {
                success: true,
                data: parseResult.data,
                rows: parseResult.data,
                fileName: fileName,
            };
        } catch (error) {
            console.error('Error picking/parsing CSV:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    /**
     * Validate imported CSV data structure
     */
    validateCsvData(data: any[]): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        const requiredColumns = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Wallet'];

        if (!data || data.length === 0) {
            errors.push('CSV file is empty');
            return { valid: false, errors };
        }

        // Check for required columns
        const firstRow = data[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));

        if (missingColumns.length > 0) {
            errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        }

        // Validate each row
        data.forEach((row, index) => {
            const cleanDate = this.normalizeDate(row.Date);
            const cleanAmount = this.normalizeAmount(row.Amount);

            // Validate date format (Cek hasil bersihnya)
            if (!cleanDate || isNaN(Date.parse(cleanDate))) {
                errors.push(`Row ${index + 1}: Invalid date format "${row.Date}"`);
            }

            // Validate type
            if (row.Type && !['income', 'expense', 'transfer'].includes(row.Type.toLowerCase())) {
                errors.push(`Row ${index + 1}: Invalid transaction type`);
            }

            // Validate amount (Cek hasil bersihnya)
            if (cleanAmount <= 0) {
                errors.push(`Row ${index + 1}: Invalid amount "${row.Amount}"`);
            }
        });

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Export transactions data within a date range
     */
    async exportData(startDate: Date, endDate: Date): Promise<{ success: boolean; message: string }> {
        try {
            // Fetch transactions from Supabase for the user within date range
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select(`
                    id,
                    amount,
                    type,
                    note,
                    date,
                    description,
                    categories(name, icon, type),
                    wallet:wallets(name)
                `)
                .gte('date', startDate.toISOString())
                .lte('date', endDate.toISOString())
                .order('date', { ascending: false });

            if (error) throw error;

            if (!transactions || transactions.length === 0) {
                return {
                    success: false,
                    message: 'No transactions found in the selected date range',
                };
            }

            // Export using the existing method
            await this.exportTransactionsToCsv({
                transactions: transactions as any,
                startDate,
                endDate,
            });

            return {
                success: true,
                message: 'Data exported successfully',
            };
        } catch (error) {
            console.error('Error in exportData:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to export data',
            };
        }
    }

    /**
     * Process and import CSV data into the database
     */
    async processImport(
        rows: any[],
        userId: string
    ): Promise<{ successCount: number; errors: string[] }> {
        const errors: string[] = [];
        let successCount = 0;

        // Validate data first
        const validation = this.validateCsvData(rows);
        if (!validation.valid) {
            return {
                successCount: 0,
                errors: validation.errors,
            };
        }

        // Get user's categories and wallets for mapping
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name')
            .eq('user_id', userId);

        const { data: wallets } = await supabase
            .from('wallets')
            .select('id, name')
            .eq('user_id', userId);

        const categoryMap = new Map(categories?.map(c => [c.name.toLowerCase(), c.id]) || []);
        const walletMap = new Map(wallets?.map(w => [w.name.toLowerCase(), w.id]) || []);

        // Process each row
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            try {
                const finalDate = this.normalizeDate(row.Date);
                const finalAmount = this.normalizeAmount(row.Amount);
                const cleanCategory = row.Category?.toLowerCase().trim();
                const cleanWallet = row.Wallet?.toLowerCase().trim();
                // Map category and wallet
                const categoryId = categoryMap.get(cleanCategory);
                const walletId = walletMap.get(cleanWallet);

                if (!categoryId) {
                    errors.push(`Row ${i + 1}: Category "${row.Category}" not found`);
                    continue;
                }

                if (!walletId) {
                    errors.push(`Row ${i + 1}: Wallet "${row.Wallet}" not found`);
                    continue;
                }

                // Insert transaction
                const { error: insertError } = await supabase
                    .from('transactions')
                    .insert({
                        user_id: userId,
                        amount: finalAmount,
                        type: row.Type.toLowerCase(),
                        note: row.Description || '',
                        description: row.Description || '',
                        date: finalDate,
                        category_id: categoryId,
                        wallet_id: walletId,
                    });

                if (insertError) {
                    errors.push(`Row ${i + 1}: ${insertError.message}`);
                } else {
                    successCount++;
                }
            } catch (error) {
                errors.push(
                    `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }

        return {
            successCount,
            errors,
        };
    }
}

export default new CsvService();