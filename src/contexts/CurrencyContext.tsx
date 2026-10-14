import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

export const CURRENCIES = {
    IDR: { code: 'IDR', symbol: 'Rp', locale: 'id-ID' },
    USD: { code: 'USD', symbol: '$', locale: 'en-US' },
    EUR: { code: 'EUR', symbol: '€', locale: 'de-DE' },
    SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
};

export type CurrencyCode = keyof typeof CURRENCIES;

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (code: CurrencyCode) => void;
    formatMoney: (amount: number) => string;
    symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const { session } = useAuth();
    const user = session?.user;
    const [currency, setCurrencyState] = useState<CurrencyCode>('IDR');

    // 1. Load Currency
    useEffect(() => {
        const loadCurrency = async () => {
            // A. Local Cache
            const saved = await AsyncStorage.getItem('app_currency');
            if (saved && CURRENCIES[saved as CurrencyCode]) {
                setCurrencyState(saved as CurrencyCode);
            }

            // B. Database Sync
            // NOTE (Tech Debt): CurrencyContext membaca kolom `currency` dari tabel `profiles`,
            // sementara useProfile.ts menggunakan kolom `currency_code`. Kedua kolom ini
            // ada di DB (hasil migrasi yang tidak selesai). Jangan ubah ini tanpa koordinasi
            // karena kedua sistem berjalan independen dan sudah sesuai kebutuhan bisnis.
            // Ref: Audit Bug A4 — 2026-10-14
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('currency')
                    .eq('id', user.id)
                    .single();

                if (data?.currency && CURRENCIES[data.currency as CurrencyCode]) {
                    setCurrencyState(data.currency as CurrencyCode);
                    await AsyncStorage.setItem('app_currency', data.currency);
                }
            }
        };
        loadCurrency();
    }, [user]);

    // 2. Set Currency
    const setCurrency = async (code: CurrencyCode) => {
        setCurrencyState(code);
        await AsyncStorage.setItem('app_currency', code);

        if (user) {
            await supabase
                .from('profiles')
                .update({ currency: code })
                .eq('id', user.id);
        }
    };

    const formatMoney = (amount: number) => {
        const config = CURRENCIES[currency];
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatMoney, symbol: CURRENCIES[currency].symbol }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
    return context;
};