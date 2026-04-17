---
trigger: always_on
---

# Workflow: Feature Development

Gunakan workflow ini setiap kali membuat atau mengembangkan fitur baru di CashFlowly.

## Langkah-Langkah

1. **Analysis:** 
   - Baca file di `src/services/` dan `src/types/` untuk memahami skema data yang ada.
   - Identifikasi apakah fitur baru membutuhkan tabel/kolom baru atau bisa memakai yang sudah ada.

2. **Type Creation:** 
   - Buat atau update interface di `src/types/` untuk mendefinisikan struktur data fitur baru.
   - Jangan mulai coding sebelum tipe sudah terdefinisi.

3. **Service Layer:** 
   - Buat fungsi query/mutasi di `src/services/` menggunakan `supabase` dari `src/services/supabaseClient.ts`.
   - Selalu pilih kolom spesifik, hindari `.select('*')`.

4. **Hook Layer:**
   - Buat custom hook di `src/hooks/` yang membungkus fungsi service dengan `useQuery` atau `useMutation` dari TanStack Query.
   - Hook bertanggung jawab atas loading state, error state, dan invalidation cache.

5. **UI Layer:**
   - Buat atau update Screen di `src/screens/`.
   - Komponen reusable dipecah ke `src/components/`.
   - Semua string UI WAJIB menggunakan `useTranslation()` — tidak boleh hardcode teks.

6. **Navigation:**
   - Daftarkan screen baru di `src/navigation/`.
   - Pastikan tipe navigasi diupdate di `src/types/navigation.d.ts`.

7. **Localization:**
   - Tambahkan key string baru ke **kedua** file locale: `src/i18n/locales/en.json` dan `src/i18n/locales/id.json`.

8. **Validation & Self-Review:**
   - Pastikan tidak ada `any` yang terselip.
   - Pastikan setiap string UI sudah terlokalisasi.
   - Cek tidak ada `console.log` yang mencetak data sensitif user.

9. **Commit:**
   - Gunakan conventional commit format: `type(scope): deskripsi`
   - Types: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`
   - Contoh: `feat(transactions): add recurring transaction support`