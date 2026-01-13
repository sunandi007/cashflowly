import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import 'intl-pluralrules'; // Polyfill for pluralization support

// Import locale resources
import id from './locales/id.json';
import en from './locales/en.json';

// Language code type
export type LanguageCode = 'id' | 'en';

// Available languages configuration
export const LANGUAGES = {
    id: { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia' },
    en: { code: 'en', name: 'English', nativeName: 'English' },
} as const;

// i18next configuration
i18n
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        // Language resources
        resources: {
            id: { translation: id },
            en: { translation: en },
        },

        // Default language
        fallbackLng: 'id',
        lng: 'id', // Initial language (akan di-override oleh LanguageContext)

        // Namespace configuration
        ns: ['translation'],
        defaultNS: 'translation',

        // Interpolation options
        interpolation: {
            escapeValue: false, // React already escapes values
        },

        // React specific options
        react: {
            useSuspense: false, // Disable suspense untuk React Native
        },

        // Debug mode (set false di production)
        debug: false,

        // Cache configuration
        load: 'languageOnly', // Load 'en' instead of 'en-US'

        // Compatibility options
        compatibilityJSON: 'v4', // Use v4 format untuk compatibility dengan type definition
    });


export default i18n;
