# Alert to Snackbar Migration Guide

## 🎯 Panduan Memilih: Alert vs Snackbar

### ✅ **Gunakan SNACKBAR untuk:**

1. **Success Messages** (tidak perlu user action)
   - ✅ Data berhasil disimpan
   - ✅ Upload berhasil
   - ✅ Transfer berhasil
   - ✅ Sinkronisasi selesai

2. **Info Messages** (informasi ringan)
   - ✅ Statement tersedia
   - ✅ Data sedang diproses
   - ✅ Fitur baru tersedia

3. **Non-Critical Errors** (error yang tidak membutuhkan action)
   - ✅ Upload gagal (dengan retry button)
   - ✅ Koneksi bermasalah (dengan retry button)
   - ✅ Validasi form sederhana

### ⚠️ **Gunakan ALERT untuk:**

1. **Destructive Actions** (butuh konfirmasi)
   - ⚠️ Hapus data
   - ⚠️ Logout
   - ⚠️ Cancel subscription
   - ⚠️ Clear all data

2. **Critical Decisions** (pilihan penting)
   - ⚠️ Multiple choice questions
   - ⚠️ Bayar tagihan vs buat transaksi baru
   - ⚠️ Overwrite vs create new

3. **Blocking Errors** (error kritis)
   - ⚠️ Authentication failed
   - ⚠️ Payment failed (butuh user decision)

---

## 📋 File-by-File Analysis

### 1. ✅ **WalletModal.tsx** - SHOULD USE SNACKBAR

**Current (Alert):**
```tsx
// Success messages
alert("Berhasil 🎉", "Perubahan wallet berhasil disimpan.", undefined, { type: 'success' });
alert("Sukses 🎉", "Wallet baru berhasil ditambahkan.", undefined, { type: 'success' });

// Error messages
alert("Gagal 😞", err.message, undefined, { type: 'error' });
```

**Should be (Snackbar):**
```tsx
// Success messages - non-blocking, just feedback
snackbar.success("Berhasil disimpan", "Perubahan wallet berhasil disimpan");
snackbar.success("Wallet ditambahkan", "Wallet baru berhasil dibuat");

// Error messages - non-critical
snackbar.error("Gagal menyimpan", err.message);
```

**Keep Alert for:**
```tsx
// Delete confirmation - CRITICAL DECISION
alert("Hapus Wallet", "Yakin ingin menghapus wallet ini?", [
  { text: "Batal", style: "cancel" },
  { text: "Hapus", onPress: async () => { await onDelete(); } }
], { type: 'warning' });
```

---

### 2. ✅ **BillsScreen.tsx** - MIXED

**Use Snackbar:**
```tsx
// Success after payment - just feedback
snackbar.success("Pembayaran berhasil", `Bill ${billName} has been processed!`);

// Error messages - non-critical
snackbar.error("Error", "Data pembayaran tidak tersedia");
snackbar.error("Error", "Please create a Main Wallet first");
```

**Keep Alert:**
```tsx
// Delete confirmation - CRITICAL
alert("Stop Recurring Bill", message, [
  { text: "Cancel", style: "cancel" },
  { text: "Stop", onPress: async () => { /* delete */ } }
], { type: 'warning' });
```

---

### 3. ⚠️ **TransactionScreen.tsx** - MOSTLY KEEP ALERT

**Use Snackbar:**
```tsx
// Simple validation errors - quick feedback
if (!amount) {
  snackbar.error("Jumlah wajib diisi", "Harap masukkan jumlah transaksi");
  return;
}

if (!categoryId) {
  snackbar.error("Kategori wajib dipilih", "Pilih kategori untuk pengeluaran");
  return;
}

// Success messages
snackbar.success("Berhasil", "Siklus tagihan dihentikan");
```

**Keep Alert:**
```tsx
// Multiple choice - CRITICAL DECISION
alert(
  "Deteksi Tagihan Berulang",
  "Apakah ini pembayaran tagihan?",
  [
    { text: "Ya, Bayar", onPress: () => {} },
    { text: "Bukan", onPress: () => {} },
    { text: "Batal", style: "cancel" },
  ],
  { type: 'info' }
);

// Delete confirmations - CRITICAL
alert("Konfirmasi Hapus", "Yakin ingin menghapus?", [
  { text: "Batal", style: "cancel" },
  { text: "Hapus", onPress: () => onDelete() }
], { type: 'warning' });
```

---

### 4. ✅ **AuthScreen.tsx** - MIXED

**Use Snackbar:**
```tsx
// Success registration - non-blocking
snackbar.success("Registrasi berhasil", "Cek email untuk verifikasi");

// Login errors - quick feedback
snackbar.error("Login gagal", error.message);
```

**Keep Alert for critical auth errors if needed**

---

### 5. ✅ **CategoryListScreen.tsx** - MIXED

**Use Snackbar:**
```tsx
// Success messages
snackbar.success("Kategori dihapus", "Kategori berhasil dihapus");
```

**Keep Alert:**
```tsx
// Delete confirmation
alert("Konfirmasi Hapus", `Yakin ingin menghapus kategori '${name}'?`, [
  { text: "Batal", style: "cancel" },
  { text: "Hapus", onPress: () => deleteCategory() }
], { type: 'warning' });
```

---

### 6. ✅ **AddCategoryModal.tsx** - USE SNACKBAR

**Current (Alert):**
```tsx
// Validation errors
alert("Error", "Nama kategori tidak boleh kosong", undefined, { type: 'error' });

// Success messages
alert("Sukses", "Kategori berhasil diperbarui.", undefined, { type: 'success' });
```

**Should be (Snackbar):**
```tsx
// Validation - quick feedback
snackbar.error("Nama wajib diisi", "Nama kategori tidak boleh kosong");

// Success - non-blocking
snackbar.success("Kategori diperbarui", "Perubahan berhasil disimpan");
```

---

### 7. ✅ **ProfileScreen.tsx** - MIXED

**Use Snackbar:**
```tsx
// Info about logout if needed
snackbar.info("Logging out...");
```

**Keep Alert:**
```tsx
// Logout confirmation - CRITICAL
alert("Konfirmasi Logout", "Yakin ingin keluar?", [
  { text: "Batal", style: "cancel" },
  { text: "Logout", onPress: () => signOut() }
], { type: 'warning' });
```

---

## 🔄 Recommended Migrations

### Priority 1: Simple Success Messages

**Files to migrate:**
1. ✅ WalletModal.tsx - Success & error messages
2. ✅ AddCategoryModal.tsx - Validation & success
3. ✅ CategoryModal.tsx - Success messages
4. ✅ AuthScreen.tsx - Registration success

### Priority 2: Non-Critical Errors

**Files to migrate:**
1. ✅ BillsScreen.tsx - Error messages
2. ✅ TransactionScreen.tsx - Validation errors
3. ✅ BillConfirmationModal.tsx - Validation errors

### Priority 3: Info Messages

**Files to add:**
1. Upload progress notifications
2. Sync status
3. Background tasks

---

## 📊 Migration Summary

| File | Total Alerts | → Snackbar | Keep Alert | Reason |
|------|-------------|-----------|-----------|--------|
| WalletModal.tsx | 6 | 3 | 3 | Success → Snackbar, Delete → Alert |
| BillsScreen.tsx | 8 | 3 | 5 | Errors → Snackbar, Confirmations → Alert |
| TransactionScreen.tsx | 11 | 3 | 8 | Validation → Snackbar, Decisions → Alert |
| AddCategoryModal.tsx | 4 | 4 | 0 | All success/validation → Snackbar |
| CategoryModal.tsx | 3 | 2 | 1 | Success → Snackbar, Delete → Alert |
| AuthScreen.tsx | 2 | 2 | 0 | Success/errors → Snackbar |
| CategoryListScreen.tsx | 3 | 1 | 2 | Success → Snackbar, Delete → Alert |

**Total:** ~37 alerts → ~18 Snackbars, ~19 Alerts

---

## 🎯 Decision Flow

```
Is this alert blocking user action?
├─ NO → Use Snackbar
│  ├─ Success message → snackbar.success()
│  ├─ Info message → snackbar.info()
│  ├─ Non-critical error → snackbar.error()
│  └─ Warning (non-blocking) → snackbar.warning()
│
└─ YES → Use Alert
   ├─ Delete confirmation → alert() with buttons
   ├─ Logout confirmation → alert() with buttons
   ├─ Multiple choices → alert() with buttons
   └─ Critical error → alert()
```

---

## ✨ Benefits

**Using Snackbar:**
- ✅ Less intrusive UX
- ✅ Faster user flow
- ✅ Auto-dismiss (no need to click OK)
- ✅ Can queue multiple notifications
- ✅ Better for success/info messages

**Keeping Alert:**
- ✅ Forces user acknowledgment
- ✅ Perfect for critical decisions
- ✅ Multiple action buttons
- ✅ Blocks UI when needed

---

## 🚀 Next Steps

1. ✅ Review file-by-file analysis above
2. ✅ Decide which alerts to migrate
3. ✅ Start with Priority 1 (simple success messages)
4. ✅ Test each migration
5. ✅ Update gradually (not all at once)

---

**Ready to start migration?** Let me know which files you want to migrate first! 🎉
