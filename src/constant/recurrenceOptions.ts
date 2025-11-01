export const RECURRENCE_OPTIONS = [
    { label: 'Tidak Berulang', value: 'none', rule: 'none' },
    { label: 'Harian', value: 'daily', rule: '1_day' },
    { label: 'Mingguan', value: 'weekly', rule: '1_week' },
    { label: 'Bulanan', value: 'monthly', rule: '1_month' },
    { label: 'Tahunan', value: 'yearly', rule: '1_year' },
    { label: 'Setiap 2 Minggu', value: 'biweekly', rule: '2_weeks' },
    { label: 'Setiap 2 Bulan', value: 'bimonthly', rule: '2_months' },
    { label: 'Setiap 3 Bulan', value: 'quarterly', rule: '3_months' },
    { label: 'Setiap 6 Bulan', value: 'semiyearly', rule: '6_months' },
];

export const END_CONDITION_OPTIONS = [
    { label: 'Tidak Pernah', value: 'never' },
    { label: 'Sampai Tanggal', value: 'until_date' },
    { label: 'Setelah Tanggal', value: 'after_date' },
];