# Supabase RPC Functions

Dokumentasi ini berisi SQL functions yang perlu dibuat di Supabase Dashboard untuk aplikasi CashFlowly.

## 1. check_email_exists

Function ini digunakan untuk mengecek apakah email sudah terdaftar di `auth.users` sebelum proses registrasi.

### Cara Membuat:

1. Buka **Supabase Dashboard** → Pilih project Anda
2. Klik **SQL Editor** dari sidebar kiri
3. Klik **New Query**
4. Copy paste SQL code di bawah ini:

```sql
CREATE OR REPLACE FUNCTION check_email_exists(check_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = check_email
  );
END;
$$;
```

5. Klik **Run** atau tekan `Ctrl/Cmd + Enter`
6. Verifikasi bahwa function berhasil dibuat dengan menjalankan test query:

```sql
-- Test query (ganti dengan email yang ada di database Anda)
SELECT check_email_exists('test@example.com');
```

### Penjelasan:

- **SECURITY DEFINER**: Function akan dijalankan dengan privilege pembuat function (superuser), sehingga bisa mengakses tabel `auth.users`
- **RETURNS boolean**: Mengembalikan `true` jika email sudah ada, `false` jika belum
- Function ini aman karena hanya mengembalikan boolean, tidak expose data user

### Penggunaan di Client:

```typescript
const { data, error } = await supabase.rpc('check_email_exists', { 
  check_email: 'user@example.com'
});

if (data === true) {
  console.log('Email sudah terdaftar');
} else {
  console.log('Email tersedia');
}
```

## Troubleshooting

### Error: "function check_email_exists does not exist"

**Solusi:**
- Pastikan Anda sudah menjalankan SQL query di atas
- Check di **Database** → **Functions** apakah function sudah terbuat
- Restart aplikasi Expo jika perlu

### Error: "permission denied for table users"

**Solusi:**
- Pastikan menggunakan `SECURITY DEFINER` dalam function definition
- Function harus dibuat oleh superuser (melalui SQL Editor di dashboard)

### Function tidak mengembalikan hasil yang benar

**Solusi:**
- Test function langsung di SQL Editor:
  ```sql
  SELECT check_email_exists('existing@email.com');
  ```
- Pastikan email yang di-check menggunakan lowercase (karena Supabase menyimpan email dalam lowercase)
