# Quick Reference: Password Management Features

## 🔐 Two Password Features Available

CashFlowly sekarang memiliki **dua fitur** untuk password management:

### 1. **Forgot Password** (Lupa Password)
- **Untuk siapa:** User yang **LUPA** password
- **Akses dari:** Login Screen → "Forgot Password?"
- **Cara kerja:** Email link reset password
- **Status user:** Tidak perlu login

### 2. **Change Password** (Ubah Password)  
- **Untuk siapa:** User yang **SUDAH LOGIN**
- **Akses dari:** Profile → Security & Password → Ubah Password
- **Cara kerja:** Verifikasi password lama → Set password baru
- **Status user:** Harus sudah login

---

## 🗺️ Navigation Maps

### Forgot Password Flow
```
Login Screen
    ↓ Click "Forgot Password?"
Forgot Password Screen
    ↓ Enter email → Send
Email Sent ✅
    ↓ User clicks link in email
Reset Password Screen
    ↓ Enter new password (2x)
Password Reset ✅
    ↓
Login with new password
```

### Change Password Flow
```
Profile Screen (Bottom Tab)
    ↓ Scroll down
Tap "Security & Password"
    ↓
Settings Modal Opens
    ↓ Under "Security & Password" section
Tap "Ubah Password"
    ↓
Change Password Screen
    ↓ Fill 3 fields:
      • Password Lama
      • Password Baru
      • Konfirmasi Password Baru
    ↓ Tap "Ubah Password"
Password Changed ✅
    ↓
Back to Profile
```

---

## 📱 Screens Overview

| Screen | Purpose | Required Input | Authentication |
|--------|---------|----------------|----------------|
| **ForgotPasswordScreen** | Request reset link | Email only | No |
| **ResetPasswordScreen** | Set new password (from email) | New password (2x) | Via email token |
| **ChangePasswordScreen** | Update password (logged in) | Old + New password (2x) | Must be logged in |

---

## 🎨 UI Components

### Forgot Password Screen
- Back button
- Title: "Lupa Password? / Jangan Khawatir"
- Subtitle: Instructions
- **1 Input:** Email
- Button: "Kirim Link Reset"
- Footer: "Kembali ke Login" link

### Reset Password Screen  
- Back button
- Title: "Reset Password / Anda"
- Subtitle: Instructions
- **2 Inputs:** New password + Confirm
- Eye toggles
- Requirements bullets
- Button: "Reset Password"

### Change Password Screen
- Back button
- Title: "Ubah Password / Anda"
- Subtitle: Instructions
- **3 Inputs:** Old + New + Confirm
- Eye toggles on all fields
- Real-time requirement indicators
- Requirements card with checkmarks
- Button: "Ubah Password"

### Settings Modal (Enhanced)
- Currency selector
- **NEW:** Security & Password section
  - Icon: Lock in circle
  - Text: "Ubah Password"
  - Subtitle: "Update password akun Anda"
  - Chevron: Navigation indicator
- Save button

---

## ✅ Validation Rules

All password features share these rules:

| Rule | Description | Error Message |
|------|-------------|---------------|
| **Not Empty** | All fields must be filled | "Password Diperlukan" |
| **Min Length** | Password ≥ 6 characters | "Password Terlalu Pendek" |
| **Match** | New password = Confirm | "Password Tidak Cocok" |
| **Different** | New ≠ Old (Change only) | "Password Sama" |
| **Valid Old** | Old password correct (Change only) | "Password lama tidak valid" |

---

## 🔧 Implementation Files

### Screens
- `src/screens/ForgotPasswordScreen.tsx` - Request reset email
- `src/screens/ResetPasswordScreen.tsx` - Reset via email link
- `src/screens/ChangePasswordScreen.tsx` - Change when logged in

### Components
- `src/components/SettingsModal.tsx` - Enhanced with Change Password option

### Hooks
- `src/hooks/useAuth.ts` - Contains all auth methods:
  - `forgotPassword(email)` - Send reset email
  - `resetPassword(newPassword)` - Update password via reset flow
  - (Change Password uses direct Supabase calls for old password verification)

### Navigation
- `src/navigation/RootNavigation.tsx` - All routes configured
- `src/types/navigation.d.ts` - Type definitions

### Config
- `App.tsx` - Deep linking configured for reset password

---

## 🧪 Quick Test Commands

### Test Forgot Password
```bash
# 1. Run app
# 2. Go to Login
# 3. Tap "Forgot Password?"
# 4. Enter: test@example.com
# 5. Check email
```

### Test Change Password
```bash
# 1. Login to app
# 2. Go to Profile tab
# 3. Tap "Security & Password"
# 4. Tap "Ubah Password"
# 5. Fill:
#    Old: currentPassword
#    New: newPassword123
#    Confirm: newPassword123
# 6. Tap "Ubah Password"
# 7. Logout and login with new password
```

---

## 📖 Documentation Files

| File | Content |
|------|---------|
| `PASSWORD_RESET_SUMMARY.md` | Forgot & Reset Password implementation |
| `FORGOT_PASSWORD_IMPLEMENTATION.md` | Technical implementation details |
| `SUPABASE_PASSWORD_RESET_CONFIG.md` | Supabase setup guide |
| `PASSWORD_RESET_TESTING_GUIDE.md` | Comprehensive testing guide |
| `CHANGE_PASSWORD_FEATURE.md` | Change Password feature docs |
| `CHANGE_PASSWORD_SUMMARY.md` | Change Password implementation summary |

---

## 🎯 When to Use Which?

### Use **Forgot Password** when:
- ❌ User doesn't remember their password
- ❌ User is locked out
- ❌ User is not logged in
- ✅ User has access to their email

### Use **Change Password** when:
- ✅ User IS logged in
- ✅ User remembers current password
- ✅ User wants to update password for security
- ✅ User wants to change password periodically

---

## 🚀 All Features Status

| Feature | Status | Screens | Navigation | Documentation |
|---------|--------|---------|------------|---------------|
| **Forgot Password** | ✅ Complete | 2 screens | ✅ Configured | ✅ Complete |
| **Reset Password** | ✅ Complete | (Email link) | ✅ Deep linking | ✅ Complete |
| **Change Password** | ✅ Complete | 1 screen | ✅ From Settings | ✅ Complete |

---

## 💡 Pro Tips

1. **Security Best Practice**: Always guide users to use Change Password for routine updates, not Forgot Password
2. **UX Consideration**: Change Password requires old password - this prevents unauthorized changes
3. **Email Setup**: Make sure Supabase email is configured before testing Forgot Password
4. **Deep Linking**: Rebuild app after changing deep link config in app.json
5. **Testing**: Test both flows end-to-end before production

---

**All password management features are now complete and production-ready! 🎉**
