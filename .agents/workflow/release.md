---
trigger: always_on
---

# Workflow: Release to Play Store

Gunakan workflow ini sebelum melakukan build produksi dan submission ke Google Play Console.

## Pre-Release Checklist

### 1. Kode & Konfigurasi
- [ ] Versi di `app.json` dan `package.json` sudah sinkron
- [ ] `eas.json` production profile menggunakan `"buildType": "app-bundle"`
- [ ] Tidak ada credential hardcoded di `eas.json` (gunakan EAS Secrets atau `.env.production`)
- [ ] File `.env.production` tersedia secara lokal dan TIDAK dikomit ke git

### 2. Kualitas Kode
- [ ] Tidak ada `console.log` yang mencetak data sensitif user (email, saldo, dsb)
- [ ] Semua string UI menggunakan `useTranslation()` — tidak ada hardcoded teks
- [ ] Tidak ada penggunaan `any` dalam codebase

### 3. Supabase & Backend
- [ ] RLS sudah aktif untuk semua tabel yang menyimpan data finansial
- [ ] Policy SELECT menggunakan `auth.uid() = user_id`
- [ ] Policy INSERT memastikan `user_id` cocok dengan `auth.uid()`

### 4. Build & Test
- [ ] Lakukan local export/bundle: `$env:NODE_ENV="production"; npx expo export --platform android`
- [ ] Tidak ada build error di output Metro bundler
- [ ] Test manual di physical device (bukan emulator) untuk fitur notifikasi

## Langkah Build & Submit

1. **Pastikan EAS Secrets sudah dikonfigurasi** di dashboard expo.dev/projects
   - Tambahkan `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` sebagai EAS Secret

2. **Jalankan build produksi:**
   ```bash
   npm run build:android
   # atau langsung:
   eas build --platform android --profile production --non-interactive --wait
   ```

3. **Download `.aab`** dari dashboard EAS setelah build selesai

4. **Upload ke Google Play Console:**
   - Masuk ke Play Console → Pilih app → Production → Create new release
   - Upload file `.aab`
   - Isi release notes (in English & Indonesian)
   - Submit for review

## Post-Release
- Monitor crash rate di Google Play Console (Android Vitals)
- Monitor error rate di Supabase Dashboard
