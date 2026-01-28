import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/hooks/useAuth'; // Pastikan import auth
import { themes } from '@/constant/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    mode: ThemeMode;
    colors: typeof themes.light;
    setMode: (mode: ThemeMode) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useColorScheme();
    const { session } = useAuth();
    const user = session?.user;
    const [mode, setModeState] = useState<ThemeMode>('dark');

    // 1. Load dari Local Storage & Database saat mount/user berubah
    useEffect(() => {
        const loadTheme = async () => {
            // A. Load Cache Lokal dulu (Instan)
            const savedTheme = await AsyncStorage.getItem('app_theme');
            if (savedTheme) setModeState(savedTheme as ThemeMode);

            // B. Jika user login, ambil dari Database (Source of Truth)
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('theme')
                    .eq('id', user.id)
                    .single();

                if (data?.theme) {
                    setModeState(data.theme as ThemeMode);
                    // Update cache lokal biar sinkron
                    await AsyncStorage.setItem('app_theme', data.theme);
                }
            }
        };
        loadTheme();
    }, [user]);

    // 2. Fungsi Ganti Tema (Update UI -> Local -> DB)
    const setMode = async (newMode: ThemeMode) => {
        // Optimistic Update (Langsung ganti UI biar responsif)
        setModeState(newMode);

        // Simpan ke Local
        await AsyncStorage.setItem('app_theme', newMode);

        // Simpan ke Database (Background process)
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({ theme: newMode })
                .eq('id', user.id);

            if (error) console.error("Gagal save theme ke DB:", error);
        }
    };

    const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
    const activeColors = isDark ? themes.dark : themes.light;

    return (
        <ThemeContext.Provider value={{ mode, setMode, colors: activeColors, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};