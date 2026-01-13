import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import i18n, { LanguageCode, LANGUAGES } from '@/i18n';

// Re-export for convenience
export type { LanguageCode };
export { LANGUAGES };

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (code: LanguageCode) => void;
    languages: typeof LANGUAGES;
    t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const { session } = useAuth();
    const user = session?.user;
    const [language, setLanguageState] = useState<LanguageCode>('id');

    // ============================================
    // 1. LOAD LANGUAGE (Hybrid Sync)
    // ============================================
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                // A. Load dari AsyncStorage dulu (untuk response cepat)
                const savedLanguage = await AsyncStorage.getItem('app_language');
                if (savedLanguage && LANGUAGES[savedLanguage as LanguageCode]) {
                    const langCode = savedLanguage as LanguageCode;
                    setLanguageState(langCode);
                    i18n.changeLanguage(langCode); // Update i18next
                }

                // B. Jika user sudah login, sync dengan Database (source of truth)
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('language')
                        .eq('id', user.id)
                        .single();

                    if (!error && data?.language && LANGUAGES[data.language as LanguageCode]) {
                        const dbLang = data.language as LanguageCode;

                        // Update state dan i18next
                        setLanguageState(dbLang);
                        i18n.changeLanguage(dbLang);

                        // Sync dengan AsyncStorage
                        await AsyncStorage.setItem('app_language', dbLang);
                    }
                }
            } catch (error) {
                console.error('Error loading language:', error);
                // Fallback to default
                setLanguageState('id');
                i18n.changeLanguage('id');
            }
        };

        loadLanguage();
    }, [user]);

    // ============================================
    // 2. SET LANGUAGE (Optimistic Update)
    // ============================================
    const setLanguage = async (code: LanguageCode) => {
        try {
            // A. Optimistic Update (Update UI langsung)
            setLanguageState(code);
            await i18n.changeLanguage(code);

            // B. Simpan ke AsyncStorage
            await AsyncStorage.setItem('app_language', code);

            // C. Simpan ke Supabase (background process)
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ language: code })
                    .eq('id', user.id);

                if (error) {
                    console.error('Error saving language to database:', error);
                    // Note: Kita tidak rollback karena sudah simpan ke AsyncStorage
                    // User masih bisa menggunakan bahasa yang dipilih
                }
            }
        } catch (error) {
            console.error('Error setting language:', error);
            throw error;
        }
    };

    // ============================================
    // 3. TRANSLATION HELPER
    // ============================================
    const t = (key: string, options?: any): string => {
        return i18n.t(key, options) as string;
    };


    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                languages: LANGUAGES,
                t,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

// ============================================
// 4. CUSTOM HOOK
// ============================================
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
