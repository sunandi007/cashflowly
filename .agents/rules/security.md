---
trigger: always_on
---

# Security Rules (CashFlowly)

## 🔑 Secrets & Keys
- **No .env in Git:** JANGAN PERNAH commit file `.env`. Pastikan selalu ada di `.gitignore`.
- **Anon Key Policy:** Supabase anon key boleh ada di kode client, tetapi fungsionalitasnya WAJIB dibatasi oleh RLS.
- **Service Role Key:** DILARANG KERAS memasukkan service_role key ke dalam kode React Native. Operasi admin hanya boleh lewat Supabase Edge Functions.
- **Credential Storage:** Gunakan `react-native-dotenv` untuk load environment variables. Jangan hardcode string sensitif.

## 🧪 Input Validation
- **Schema Validation:** Gunakan Zod untuk validasi input sebelum dikirim ke Supabase.
- **Location:** Definisikan skema validasi di `src/utils/validation.ts`.
- **File Sanitization:** Sebelum upload ke Supabase Storage via `expo-document-picker`, bersihkan nama file dari karakter spesial.

## 🔐 Authentication & Session
- **RLS Verification:** Verifikasi sesi selalu di sisi server melalui RLS. Pengecekan di UI hanya untuk UX/Redirect.
- **Auth Errors:** Jika terjadi error 401/403, Agent harus mengarahkan user kembali ke `LoginScreen` dan membersihkan cache TanStack Query.
- **Deep Linking:** Pastikan konfigurasi `expo-linking` tidak membocorkan session token di log sistem.

## 🛡️ Data Exposure & Logging
- **No PII in Logs:** Dilarang log data sensitif (email, saldo, nama user) ke `console.log`.
- **Query Optimization:** Gunakan select kolom spesifik di `src/services/`. Hindari `.select('*')` untuk efisiensi dan keamanan data.
- **User-Friendly Errors:** Tampilkan pesan error anonim ke user (misal: "Terjadi kesalahan sistem") daripada error mentah dari database.

## ✅ RLS Checklist (Review sebelum Push)
- [ ] Table `transactions` & `wallets` sudah Enable RLS.
- [ ] Policy SELECT menggunakan `auth.uid() = user_id`.
- [ ] Policy INSERT memastikan `user_id` yang dikirim cocok dengan `auth.uid()`.
- [ ] Tidak ada policy yang menggunakan `true` (public access) untuk data finansial.