# Change Password Feature Documentation

## Overview

Fitur **Change Password** memungkinkan pengguna yang sudah login untuk mengubah password mereka dari dalam aplikasi. Fitur ini berbeda dengan **Reset Password** yang digunakan ketika pengguna lupa password.

## Perbedaan Change Password vs Reset Password

| Fitur | Change Password | Reset Password |
|-------|-----------------|----------------|
| **Akses** | Untuk pengguna yang sudah login | Untuk pengguna yang lupa password |
| **Lokasi** | Profile → Settings → Security & Password | Login screen → Forgot Password? |
| **Verifikasi** | Memerlukan password lama | Melalui email link |
| **Kondisi** | User harus authenticated | User tidak perlu login |

## User Flow

```
1. User membuka Profile Screen
   ↓
2. Tap menu "Security & Password"
   ↓
3. Settings Modal muncul
   ↓
4. Tap "Ubah Password" di bagian Security & Password
   ↓
5. Navigate ke Change Password Screen
   ↓
6. User mengisi:
   - Password lama (untuk verifikasi)
   - Password baru
   - Konfirmasi password baru
   ↓
7. Sistem memvalidasi:
   - Password lama benar
   - Password baru minimal 6 karakter
   - Password baru dan konfirmasi cocok
   - Password baru berbeda dari password lama
   ↓
8. Password berhasil diubah
   ↓
9. Navigate kembali ke Profile Screen
```

## File yang Dibuat/Dimodifikasi

### File Baru

1. **src/screens/ChangePasswordScreen.tsx**
   - Screen untuk mengubah password
   - Tiga input field (password lama, baru, konfirmasi)
   - Real-time validation indicators
   - Password visibility toggles

### File yang Dimodifikasi

1. **src/components/SettingsModal.tsx**
   - Menambahkan section "Security & Password"
   - Button "Ubah Password" dengan icon dan description
   - Handler untuk navigate ke ChangePasswordScreen

2. **src/screens/ProfileScreen.tsx**
   - Menambahkan prop `onNavigateToChangePassword` ke SettingsModal
   - Handler untuk navigasi ke ChangePassword screen

3. **src/navigation/RootNavigation.tsx**
   - Menambahkan ChangePassword screen ke authenticated stack

4. **src/types/navigation.d.ts**
   - Menambahkan `ChangePassword: undefined` ke route types

## Implementasi Teknis

### Validasi Password

```typescript
// 1. Semua field harus diisi
if (!currentPassword || !newPassword || !confirmPassword) {
  return "Password Diperlukan";
}

// 2. Password baru minimal 6 karakter
if (newPassword.length < 6) {
  return "Password Terlalu Pendek";
}

// 3. Password baru dan konfirmasi harus cocok
if (newPassword !== confirmPassword) {
  return "Password Tidak Cocok";
}

// 4. Password baru harus berbeda dari password lama
if (currentPassword === newPassword) {
  return "Password Sama";
}
```

### Verifikasi Password Lama

Sistem menggunakan Supabase `signInWithPassword()` untuk memverifikasi password lama:

```typescript
// Get current user email
const { data: userData } = await supabase.auth.getUser();
const userEmail = userData?.user?.email;

// Verify old password
const { error } = await supabase.auth.signInWithPassword({
  email: userEmail,
  password: currentPassword,
});

if (error) {
  throw new Error("Password lama tidak valid");
}
```

### Update Password

Jika verifikasi berhasil, password diupdate menggunakan:

```typescript
const { error } = await supabase.auth.updateUser({
  password: newPassword,
});
```

## UI Components

### Change Password Screen

**Layout:**
- Header dengan back button
- Judul "Ubah Password Anda"
- Subtitle dengan instruksi
- 3 Input fields dengan eye toggle
- Visual indicators untuk requirements
- Primary button "Ubah Password"

**Password Requirements Indicators:**
- ✅ Minimal 6 karakter (hijau jika terpenuhi)
- ✅ Password dan konfirmasi cocok (hijau jika terpenuhi)
- ℹ️ Info: Gunakan kombinasi huruf dan angka

### Settings Modal Enhancement

**Tambahan:**
- Section header "Security & Password"
- Card dengan:
  - Icon lock dalam circle background
  - Judul "Ubah Password"
  - Subtitle "Update password akun Anda"
  - Chevron icon untuk indicate navigasi

## Security Features

1. **Password Lama Verification**: Harus memasukkan password lama yang benar
2. **Minimum Length**: Password baru minimal 6 karakter
3. **Confirmation Match**: Password dan konfirmasi harus sama
4. **Different from Old**: Password baru harus berbeda dari password lama
5. **Secure Input**: Semua password fields menggunakan `secureTextEntry`
6. **Session Update**: Supabase otomatis update session setelah password berubah

## Error Handling

| Error | Message | Cause |
|-------|---------|-------|
| Empty Fields | "Password Diperlukan" | User tidak mengisi semua field |
| Short Password | "Password Terlalu Pendek" | Password < 6 karakter |
| Mismatch | "Password Tidak Cocok" | New password ≠ confirm password |
| Same Password | "Password Sama" | New password = old password |
| Wrong Old Password | "Password lama tidak valid" | Password lama salah |
| Update Failed | Error dari Supabase | Gagal update ke database |

## Testing Guide

### Test Case 1: Happy Path

```
1. Login ke aplikasi
2. Go to Profile screen
3. Tap "Security & Password"
4. Tap "Ubah Password"
5. Enter:
   - Current Password: [correct password]
   - New Password: "newpassword123"
   - Confirm Password: "newpassword123"
6. Tap "Ubah Password"
7. See success alert
8. Try login dengan password baru
```

**Expected:** ✅ Password berhasil diubah, bisa login dengan password baru

### Test Case 2: Wrong Old Password

```
1-4. Same as above
5. Enter:
   - Current Password: "wrongpassword"
   - New Password: "newpassword123"
   - Confirm Password: "newpassword123"
6. Tap "Ubah Password"
```

**Expected:** ❌ Alert "Password lama tidak valid"

### Test Case 3: New Password Too Short

```
1-4. Same as above
5. Enter:
   - Current Password: [correct password]
   - New Password: "123"
   - Confirm Password: "123"
6. Tap "Ubah Password"
```

**Expected:** ❌ Alert "Password Terlalu Pendek"

### Test Case 4: Passwords Don't Match

```
1-4. Same as above
5. Enter:
   - Current Password: [correct password]
   - New Password: "newpassword123"
   - Confirm Password: "differentpassword"
6. Tap "Ubah Password"
```

**Expected:** ❌ Alert "Password Tidak Cocok"

### Test Case 5: Same as Old Password

```
1-4. Same as above
5. Enter:
   - Current Password: "myoldpassword"
   - New Password: "myoldpassword"
   - Confirm Password: "myoldpassword"
6. Tap "Ubah Password"
```

**Expected:** ❌ Alert "Password Sama"

### Test Case 6: Visual Indicators

```
1-4. Same as above
5. Type in New Password field (watch indicators):
   - Type "123" → Red/gray indicators
   - Type "123456" → Green indicator for length
6. Type same in Confirm field:
   - Matches → Green indicator for match
```

**Expected:** ✅ Indicators berubah warna sesuai kondisi

## Styling

### Theme Colors
- Background: `colors.neutral900`
- Input Background: `colors.neutral800`
- Border: `colors.neutral700`
- Text: `colors.white`
- Label: `colors.neutral300`
- Requirements text: `colors.neutral400`
- Success icon: `colors.primary`
- Inactive icon: `colors.neutral500`

### Components Style
- Input height: `54px`
- Border radius: `17px`
- Button padding: `18px vertical`
- Icon size: `40x40px`
- Icon background: `colors.primary + '20'` (transparent)

## Best Practices

1. **Always verify old password** - Mencegah perubahan password tanpa autentikasi
2. **Show password requirements** - User tahu apa yang dibutuhkan
3. **Visual feedback** - Real-time indicators untuk requirement
4. **Clear error messages** - User tahu apa yang salah
5. **Success confirmation** - Alert yang jelas bahwa password sudah berubah

## Future Enhancements

Potensial improvements:

- [ ] Password strength meter (weak, medium, strong)
- [ ] Character types requirements (uppercase, numbers, symbols)
- [ ] Password history (prevent reuse of last N passwords)
- [ ] Biometric re-authentication before change
- [ ] Email notification when password changed
- [ ] Force logout from other devices after change
- [ ] Show last password change date
- [ ] Rate limiting for failed attempts

## Troubleshooting

### Issue: "Password lama tidak valid" tapi password benar

**Possible Causes:**
- Password salah ketik
- Caps Lock aktif
- Password sudah diubah sebelumnya

**Solution:**
- Coba logout dan login kembali
- Gunakan "Forgot Password" jika benar-benar lupa

### Issue: Update fails silently

**Possible Causes:**
- Network connection lost
- Supabase session expired
- Database error

**Solution:**
- Check console logs
- Verify network connection
- Check Supabase Auth logs

## Conclusion

Fitur Change Password memberikan cara yang aman dan user-friendly untuk users mengubah password mereka dari dalam aplikasi. Dengan validasi yang ketat dan UI yang intuitif, fitur ini meningkatkan security dan user experience dari CashFlowly app.
