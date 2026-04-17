---
trigger: always_on
---

# Coding Standards

## TypeScript
- **No `any`:** Dilarang menggunakan `any`. Selalu definisikan interface/type di `src/types/` sebelum mengimplementasikan logic.
- **Props Typing:** Setiap komponen wajib memiliki tipe props yang eksplisit. Gunakan `interface ComponentNameProps { ... }`.
- **No Implicit Optional:** Jangan gunakan `field?` jika field selalu ada. Sisakan `?` hanya untuk field yang benar-benar opsional.

## State Management
- Gunakan **TanStack Query (React Query)** untuk semua *server state* (fetch/mutate data dari Supabase).
- Gunakan **Context API** hanya untuk state aplikasi yang benar-benar global: `AuthContext`, `ThemeContext`, `LanguageContext`, `NotificationContext`.
- Gunakan `useState` lokal untuk state komponen yang sederhana (form input, toggle, loading lokal).
- **Jangan** gunakan library state management eksternal (Redux, Zustand) — belum ada dan belum dibutuhkan.

## Error Handling
- Semua fungsi async di services/hooks WAJIB menggunakan `try/catch` atau destructuring `{ data, error }`.
- Error yang ditampilkan ke user WAJIB menggunakan pesan anonim (bukan error mentah dari database).
- Error logging ke `console.error` diperbolehkan hanya selama development. Di produksi, semua `console.*` akan di-strip otomatis oleh Babel.

## Styling
- Gunakan `StyleSheet.create()` bawaan React Native — tidak menggunakan Tailwind.
- Pastikan setiap screen dibungkus `SafeAreaView` atau `ScreenWrapper` yang sudah tersedia di `src/components/ScreenWrapper.tsx`.
- Warnai selalu dari theme context, jangan hardcode hex color.

## Localization (i18n) — WAJIB
- **Setiap string yang tampil ke user** WAJIB menggunakan `useTranslation()` dari `react-i18next`.
- **Dilarang** hardcode string UI dalam bahasa apapun di dalam JSX.
- Key i18n harus ditambahkan ke **kedua** file: `src/i18n/locales/en.json` dan `src/i18n/locales/id.json`.
- Format key: `snake_case` yang deskriptif. Contoh: `common.save`, `transaction.add_income`.

## Komponen & Penamaan
- Gunakan **Functional Components** dengan **Arrow Functions**.
- Nama file komponen: `PascalCase.tsx`
- Nama file hook: `camelCase.ts` (prefix `use`)
- Nama file service: `PascalCaseService.ts`

## Date Handling
- Gunakan library `date-fns` yang sudah ada di dependensi.
- Jangan gunakan `new Date().toLocaleDateString()` langsung — format melalui `date-fns`.