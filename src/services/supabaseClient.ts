import { createClient } from "@supabase/supabase-js"
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill'

// const supabaseUrl = 'https://ehlascpnadaraaltoopa.supabase.co'
// const supabaseAnonKey = 'sb_publishable_uBnQltKtVSCY1sRZrxZ3Og_rQlu1A2S'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL/Key tidak ditemukan. Pastikan .env files sudah benar.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
})
