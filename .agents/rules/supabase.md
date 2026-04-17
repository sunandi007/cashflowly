---
trigger: always_on
---

# Supabase Rules

## Client Setup
- Single Supabase client instance at `src/services/supabaseClient.ts` — never instantiate elsewhere
- Use `@supabase/supabase-js` v2
- AsyncStorage adapter for session persistence on mobile
- URL polyfill (`react-native-url-polyfill`) WAJIB diimport sebelum createClient

```ts
// src/services/supabaseClient.ts — the only place this is defined
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-url-polyfill'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL/Key tidak ditemukan. Pastikan .env files sudah benar.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

## Database Queries
- Always destructure `{ data, error }` — never assume success
- Always check `if (error)` before using `data`
- Definisikan semua tipe secara manual di `src/types/` — tidak ada auto-generated types dari Supabase
- Never write raw SQL strings in app code — use the query builder
- Single-row queries use `.single()` dan handle `PGRST116` (not found) explicitly
- Hindari `.select('*')` — selalu pilih kolom yang dibutuhkan

```ts
// Correct pattern
const { data, error } = await supabase
  .from('transactions')
  .select('id, amount, type, description, date')
  .eq('user_id', userId)
  .order('date', { ascending: false })
if (error) throw error
return data
```

## Authentication
- Session managed via Supabase Auth — dikelola di `src/contexts/AuthContext` atau logic di `src/hooks/useAuth.ts`
- Listen to `onAuthStateChange` di root App.tsx atau AuthContext, update state pada setiap event
- On sign-out: call `supabase.auth.signOut()` dan clear semua TanStack Query cache via `queryClient.clear()`
- Never store JWT tokens manually — let the client handle it via AsyncStorage
- Protected routes check session dari `useAuth` hook, bukan raw Supabase calls

## Row Level Security (RLS)
- RLS must be enabled on every table — no exceptions
- Never disable RLS to "fix" a query issue — fix the policy instead
- Policies follow the pattern: `auth.uid() = user_id`
- Service role key NEVER goes in mobile app code — only in Edge Functions or server-side

## Storage
- Bucket names didefinisikan sebagai constants di `src/constant/`
- File paths always include user ID: `{userId}/{filename}`
- Generate signed URLs untuk private files, public URLs hanya untuk public buckets
- Always specify content type on upload
- Sanitasi nama file sebelum upload (hapus karakter spesial)

## Realtime
- Subscribe in `useEffect`, always return cleanup that calls `.unsubscribe()`
- Never subscribe at module level — only inside hooks or components
- Channel names follow convention: `table-{tableName}-{userId}`

## Edge Functions
- Called via `supabase.functions.invoke('function-name', { body: {...} })`
- Always type the response — create a corresponding type in `types/`
- Edge Functions handle sensitive operations: payment processing, admin actions, third-party API calls with secret keys

## Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` — public, aman di app
- Service role key NEVER di `.env` untuk mobile — server only
- Semua env vars divalidasi saat startup di `src/services/supabaseClient.ts` — throw early jika missing
- Untuk production build, gunakan EAS Secrets atau file `.env.production` yang tidak dikomit

## Type Management
- Tidak ada auto-generated types dari `supabase gen types` — semua tipe didefinisikan secara manual di `src/types/`
- Interface nama menggunakan `PascalCase` tanpa suffix `Type`/`Interface`. Contoh: `Transaction`, `Wallet`, `Profile`
- Gunakan `import type { ... }` untuk pure type imports