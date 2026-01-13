# 📚 CashFlowly - Documentation Index

**Project:** CashFlowly - Personal Finance Management App  
**Last Updated:** 2026-01-13  

---

## 📖 Available Documentation

### 🌍 Multi-Language System
**File:** `MULTILANGUAGE_GUIDE.md`

Complete guide for multi-language implementation:
- Current status (72% complete)
- Architecture & file structure
- Implementation guide with examples
- Translation keys reference
- Best practices
- Remaining work breakdown

**Quick Start:**
```typescript
import { useLanguage } from '@/contexts/LanguageContext';
const { t } = useLanguage();
<Text>{t('common.save')}</Text>
```

---

### 🔔 Alerts & Snackbar System
**File:** `ALERTS_SNACKBAR_GUIDE.md`

Complete guide for notification systems:
- CustomAlert for confirmations
- Snackbar for quick messages
- When to use what
- Code examples & APIs
- Best practices

**Quick Start:**
```typescript
// Alert
const alert = useAlert();
alert('Title', 'Message');

// Snackbar
const snack = useSnackbar();
snack.success('Saved!');
```

---

### 📊 Technical References

#### TransactionScreen Implementation Plan
**File:** `TRANSACTION_SCREEN_MULTILANGUAGE_PLAN.md`

Detailed breakdown for implementing multi-language in TransactionScreen (1006 lines, most complex screen).

#### Supabase RPC Functions
**File:** `SUPABASE_RPC_FUNCTIONS.md`

Database Remote Procedure Calls used in the app.

#### Translation Files Structure
**File:** `TRANSLATION_FILES_STRUCTURE.md`

Clean structure documentation for translation files:
- Correct file locations
- How to add new keys
- Best practices

---

## 🎯 Quick Links

### For Development

**Multi-Language:**
- Add translations: `src/i18n/locales/id.json` & `en.json`
- Use hook: `useLanguage()` from `@/contexts/LanguageContext`
- See examples in: `AuthScreen.tsx`, `Dashboard.tsx`

**Notifications:**
- Alerts: `useAlert()` from `@/hooks/useAlert`
- Snackbar: `useSnackbar()` from `@/hooks/useSnackbar`

**Styling:**
- Theme: `src/constant/theme.ts`
- Responsive: `src/utils/styling.ts`

---

## 📋 Project Status

### Completed Features ✅
- Multi-language infrastructure (Hybrid Sync)
- 12 screens translated (72%)
- CustomAlert & Snackbar systems
- Currency selection
- Password management (Change & Reset)
- Bill payments with recurrence
- Category & Tag management
- Analytics & Dashboard

### In Progress 🔄
- TransactionScreen translation (30% remaining)
- Component translations (13% complete)
- Additional modals & forms

### Planned 📅
- 100% multi-language coverage
- Additional language support
- Enhanced analytics
- Export/Import improvements

---

## 🗂️ File Organization

### Core Documentation (Keep These)
```
docs/
├── README.md                              # This file
├── MULTILANGUAGE_GUIDE.md                 # Multi-language complete guide
├── ALERTS_SNACKBAR_GUIDE.md              # Alert & Snackbar systems
├── TRANSACTION_SCREEN_MULTILANGUAGE_PLAN.md  # TransactionScreen plan
├── TRANSLATION_FILES_STRUCTURE.md         # Translation structure
└── SUPABASE_RPC_FUNCTIONS.md             # Database functions
```

### Deprecated (Can be deleted)
- Individual progress reports (consolidated into guides)
- Migration guides (completed)
- Session summaries (outdated)
- Redundant implementation docs

---

## 💡 Best Practices

### Code Style
- Use TypeScript for type safety
- Follow existing patterns in similar screens
- Use hooks for state management
- Keep components focused and reusable

### Multi-Language
- Always add keys to BOTH `id.json` and `en.json`
- Use semantic key names (`transaction.save` not `btn1`)
- Test language switching after changes
- Keep translations natural and concise

### Notifications
- Use `alert()` for confirmations
- Use `snack.success()` for quick feedback
- Don't show multiple alerts simultaneously
- Handle errors gracefully with messages

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Language switching works
- [ ] All screens show translated text
- [ ] Alerts and snackbars appear correctly
- [ ] Forms validate properly
- [ ] Navigation flows work
- [ ] Data persists correctly

### Focus Areas
- Multi-language in all new screens
- Alert/Snackbar in user actions
- Form validation messages
- Error handling

---

## 📞 Support

### Common Issues

**Language not changing?**
- Check if `useLanguage()` hook is imported
- Verify translation keys exist in both language files
- Ensure LanguageProvider wraps the app

**Alert not showing?**
- Check if AlertProvider wraps the app
- Verify `useAlert()` hook is used correctly
- Check console for errors

**Snackbar not appearing?**
- Check if SnackbarProvider wraps the app
- Verify `useSnackbar()` hook is imported
- Check message queue (multiple messages stack)

---

## 🎯 Quick Reference

### Most Used Imports

```typescript
// Multi-language
import { useLanguage } from '@/contexts/LanguageContext';

// Notifications
import { useAlert } from '@/hooks/useAlert';
import { useSnackbar } from '@/hooks/useSnackbar';

// Styling
import { colors, radius, spacingX, spacingY } from '@/constant/theme';
import { scale, verticalScale } from '@/utils/styling';

// Components
import ScreenWrapper from '@/components/ScreenWrapper';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Typo from '@/components/Typo';
```

---

## 📈 Progress Tracking

**Multi-Language:** 72% (12/17 screens + 2/15 components)  
**Alert System:** ✅ Complete  
**Snackbar System:** ✅ Complete  
**Currency Integration:** ✅ Complete  
**Password Management:** ✅ Complete  

**Next Priority:**
1. TransactionScreen translation (30 min)
2. Remaining components (1-2 hours)
3. Final screens (45 min)

**Estimated to 100%:** ~3 hours

---

## 🔄 Document Updates

**When to update:**
- After completing major features
- When adding new systems
- When deprecating old code
- After significant refactoring

**How to update:**
- Update status percentages
- Add new code examples
- Mark completed items
- Update timestamps

---

**Last Updated:** 2026-01-13  
**Docs Version:** 2.0 (Consolidated)  
**Project Version:** Development  
**Status:** Active Development
