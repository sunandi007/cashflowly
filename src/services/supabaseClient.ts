import { createClient } from "@supabase/supabase-js"
import 'react-native-url-polyfill'

const supabaseUrl = 'https://ehlascpnadaraaltoopa.supabase.co'
const supabaseAnonKey = 'sb_publishable_uBnQltKtVSCY1sRZrxZ3Og_rQlu1A2S'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
})
