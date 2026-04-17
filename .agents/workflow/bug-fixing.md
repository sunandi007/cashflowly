---
trigger: always_on
---

# Workflow: Bug Fixing

Gunakan workflow ini ketika memperbaiki bug, baik dari laporan user, hasil code review, maupun crash report.

## Langkah-Langkah

1. **Reproduce**
   - Pastikan dapat mereproduksi bug secara lokal sebelum mulai memperbaiki.
   - Catat *exact steps* untuk mereproduksi.

2. **Isolate**
   - Identifikasi file mana yang menjadi sumber masalah:
     - Logic bug → periksa `src/hooks/` atau `src/services/`
     - UI bug → periksa `src/screens/` atau `src/components/`
     - Data bug → periksa query di services dan RLS di Supabase
     - Navigation bug → periksa `src/navigation/`

3. **Fix (Minimal Change Principle)**
   - Buat perubahan **sesedikit mungkin** untuk memperbaiki bug.
   - Jangan refactor sekaligus — fokus pada perbaikan bug dulu.
   - Jika perlu perubahan besar, buat tiket/plan terpisah.

4. **Verify**
   - Reproduksi ulang bug untuk memastikan sudah tidak terjadi.
   - Pastikan fitur terkait lainnya tidak ikut rusak (regression check).

5. **Localization Check**
   - Jika bug melibatkan string yang ditampilkan ke user, pastikan perbaikannya tetap menggunakan `useTranslation()`.

6. **Commit**
   - Format: `fix(scope): deskripsi singkat bug yang diperbaiki`
   - Contoh: `fix(recurring): prevent duplicate bill creation on same day`
   - Jika bug adalah security issue: gunakan `fix(security): ...`

## Checklist Sebelum Push

- [ ] Bug sudah tidak dapat direproduksi
- [ ] Tidak ada fitur lain yang rusak
- [ ] Tidak ada `any` baru yang ditambahkan
- [ ] Tidak ada string UI hardcoded yang ditambahkan
- [ ] Tidak ada data sensitif (email, saldo) yang di-log ke console
