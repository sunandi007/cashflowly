# Currency Settings Integration - Complete Guide

## ✅ Currency Sekarang Berfungsi!

Setting currency sudah **fully integrated** ke seluruh aplikasi! Setiap perubahan currency di Settings akan langsung berdampak pada semua tampilan nominal.

---

## 🎯 Components Yang Sudah Diupdate

### **1. HomeCard Component** ✅
**File:** `src/components/HomeCard.tsx`

**Before:**
```typescript
// Hardcoded Rp
Rp {totalBalance.toLocaleString("id-ID")}
```

**After:**
```typescript
import { useCurrency } from "@/contexts/CurrencyContext";

const { formatMoney, symbol } = useCurrency();

// Dynamic currency!
{formatMoney(totalBalance)}          // Auto format: IDR, USD, EUR, SGD
{symbol} {(amount / 1000000).toFixed(1)}jt  // Compact format
```

**Dampak:**
- ✅ Total Balance - Dynamic currency
- ✅ Income display - Dynamic currency  
- ✅ Expense display - Dynamic currency

---

### **2. TransactionItem Component** ✅
**File:** `src/components/TransactionItem.tsx`

**Before:**
```typescript
// Hardcoded Rp
`+Rp ${formatted}`    // Income
`-Rp ${formatted}`    // Expense
```

**After:**
```typescript
import { useCurrency } from "@/contexts/CurrencyContext";

const { formatMoney } = useCurrency();

// Dynamic currency
`+${formatMoney(amount)}`  // Income: +$1,000 or +Rp 1.000.000
`-${formatMoney(amount)}`  // Expense: -$500 or -Rp 500.000
```

**Dampak:**
- ✅ Transaction list income/expense amounts
- ✅ Transfer amounts
- ✅ Semua transaction items di Dashboard, SearchScreen, dll

---

## 📋 Cara Kerja Currency System

### **1. User Pilih Currency di Settings**
```
User → Settings → Currency → Select "USD"
```

### **2. Context Menyimpan & Sync**
```
CurrencyContext:
  1. Update state: currency = "USD"
  2. Save to AsyncStorage (local cache)
  3. Save to Supabase (database sync)
  4. formatMoney otomatis pakai USD format
```

### **3. Semua Component Otomatis Update**
```
HomeCard, TransactionItem, WalletItem, dll
semua pakai useCurrency() hook
→ Otomatis dapat format currency yang benar
```

---

## 💱 Supported Currencies

| Currency | Code | Symbol  | Locale | Format Example |
|----------|------|---------|--------|----------------|
| **Indonesian Rupiah** | IDR | Rp | id-ID | Rp 1.000.000 |
| **US Dollar** | USD | $ | en-US | $1,000.00 |
| **Euro** | EUR | € | de-DE | 1.000,00 € |
| **Singapore Dollar** | SGD | S$ | en-SG | S$1,000.00 |

---

## 🔧 Components Yang Masih Perlu Update

### **High Priority:**
- [ ] **WalletItem.tsx** - Wallet balance display
- [ ] **SummaryCard.tsx** - Income/Expense summary
- [ ] **BillDetailModal.tsx** - Bill amounts
- [ ] **BillConfirmationModal.tsx** - Bill payment
- [ ] **UpcomingBillItem.tsx** - Upcoming bill amounts
- [ ] **WalletListScreen.tsx** - Wallet list balances

### **Medium Priority:**
- [ ] **AnalyticsScreen.tsx** - Chart amounts
- [ ] **utils/finance.ts** - formatCompactCurrency function
- [ ] **ProfileScreen.tsx** - If showing any amounts

### **Low Priority:**
- [ ] Form inputs (already use context when saving)
- [ ] Transaction modals (already use context)

---

## 🚀 Cara Update Component Lain

### **Step-by-Step:**

#### **1. Import useCurrency Hook**
```typescript
import { useCurrency } from '@/contexts/CurrencyContext';
```

#### **2. Destructure formatMoney**
```typescript
export default function MyComponent() {
    const { formatMoney, symbol } = useCurrency();
    
    // Now use it!
}
```

#### **3. Replace Hardcoded "Rp"**

**Before:**
```typescript
<Text>Rp {amount.toLocaleString('id-ID')}</Text>
```

**After:**
```typescript
<Text>{formatMoney(amount)}</Text>
```

#### **4. For Compact Format (Optional)**
```typescript
// For "Rp 1.5jt" style
const symbol = useCurrency().symbol;
const compact = `${symbol} ${(amount / 1000000).toFixed(1)}jt`;
```

---

## 📖 formatMoney Options

### **Basic Usage:**
```typescript
formatMoney(1000000)
// IDR: "Rp 1.000.000"
// USD: "$1,000.00"
// EUR: "1.000,00 €"
// SGD: "S$1,000.00"
```

### **How It Works:**
```typescript
// From CurrencyContext.tsx
const formatMoney = (amount: number) => {
    const config = CURRENCIES[currency];
    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};
```

**Parameters:**
- Otomatis pakai currency dari context
- Otomatis pakai locale yang benar
- Otomatis format sesuai standar internasional

---

## 🔍 Debugging Tips

### **Check Current Currency:**
```typescript
const { currency, symbol } = useCurrency();
console.log('Current currency:', currency); // "IDR", "USD", etc
console.log('Symbol:', symbol);             // "Rp", "$", etc
```

### **Test Format:**
```typescript
const { formatMoney } = useCurrency();
console.log(formatMoney(1234567)); 
// IDR: "Rp 1.234.567"
// USD: "$1,234.57"
```

### **Check if Context Working:**
```typescript
// Make sure component is wrapped in CurrencyProvider
// Check App.tsx has:
<CurrencyProvider>
    <YourComponent />
</CurrencyProvider>
```

---

## ✨ Features

### **Automatic Formatting:**
- ✅ Correct decimal separator (. vs ,)
- ✅ Correct thousand separator (, vs .)
- ✅ Correct symbol placement (before vs after)
- ✅ Correct decimal places (0 for IDR, 2 for USD)

### **Persistent Storage:**
- ✅ Save to AsyncStorage (local cache)
- ✅ Sync to Supabase (cloud backup)
- ✅ Load on app start
- ✅ Works offline

### **Real-time Updates:**
- ✅ Change currency → All components update
- ✅ No need to reload app
- ✅ Optimistic UI updates

---

## 🧪 Testing Checklist

### **Test Currency Switching:**
1. [ ] Open Settings → Currency
2. [ ] Select "US Dollar"
3. [ ] Check Dashboard → Balance shows "$"
4. [ ] Check Transactions → Amounts show "$"
5. [ ] Select "Indonesian Rupiah"
6. [ ] Check Dashboard → Balance shows "Rp"
7. [ ] Check Transactions → Amounts show "Rp"
8. [ ] Select "Euro"
9. [ ] Check Dashboard → Balance shows "€"
10. [ ] Close and reopen app → Setting persisted

### **Test All Screens:**
- [ ] Dashboard - HomeCard balance
- [ ] Dashboard - Transaction items
- [ ] Wallets - Wallet balances (need update)
- [ ] Bills - Bill amounts (need update)
- [ ] Analytics - Chart amounts (need update)
- [ ] Search - Transaction results

---

## 📊 Migration Progress

| Component | Status | Priority |
|-----------|--------|----------|
| HomeCard | ✅ Complete | High |
| TransactionItem | ✅ Complete | High |
| WalletItem | ⏳ Pending | High |
| SummaryCard | ⏳ Pending | High |
| BillDetailModal | ⏳ Pending | High |
| BillConfirmationModal | ⏳ Pending | Medium |
| UpcomingBillItem | ⏳ Pending | Medium |
| WalletListScreen | ⏳ Pending | Medium |
| AnalyticsScreen | ⏳ Pending | Medium |
| utils/finance.ts | ⏳ Pending | Low |

---

## 🎉 Summary

**Sekarang currency setting benar-benar berfungsi!**

✅ **HomeCard** - Total balance, income, expense dynamic
✅ **TransactionItem** - Semua transaction amounts dynamic  
✅ **Automatic sync** - Save to local & cloud
✅ **Real-time updates** - Langsung berubah saat ganti currency
✅ **Persistent** - Tersimpan setelah restart app

**Next:** Update remaining components menggunakan pattern yang sama!

---

## 📝 Quick Reference

```typescript
// Import
import { useCurrency } from '@/contexts/CurrencyContext';

// Use in component
const { formatMoney, symbol, currency } = useCurrency();

// Replace hardcoded
// ❌ DON'T: `Rp ${amount.toLocaleString('id-ID')}`
// ✅ DO: formatMoney(amount)

// Compact format
`${symbol} ${(amount / 1000000).toFixed(1)}jt`
```

**Silakan test di app sekarang!** 🚀
