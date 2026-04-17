---
trigger: always_on
---

# Project Structure Rules

Setiap kali membuat file baru, ikuti pemetaan folder berikut:

- **Components:** `src/components/` (Komponen UI yang reusable).
- **Constants:** `src/constant/` (API keys, strings statis, theme colors).
- **Global State:** `src/contexts/` (Gunakan React Context API untuk state yang dibagikan).
- **Logic/Data:** - `src/services/` (Logika mentah Supabase/API calls).
    - `src/hooks/` (Custom hooks untuk membungkus logic atau TanStack Query).
- **Navigation:** `src/navigation/` (Konfigurasi Stack/Tab navigation).
- **Screens:** `src/screens/` (Halaman utama aplikasi).
- **Translations:** `src/i18n/` (File JSON untuk i18next).
- **Definitions:** `src/types/` (Definisikan semua Interface/Type TypeScript secara manual di sini).
- **Helpers:** `src/utils/` (Fungsi bantuan seperti formatter mata uang atau tanggal).