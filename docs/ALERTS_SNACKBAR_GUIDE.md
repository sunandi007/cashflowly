# 🔔 Alert & Snackbar System - Complete Guide

**Project:** CashFlowly  
**Last Updated:** 2026-01-13  

---

## 📋 Overview

CashFlowly uses two notification systems:
1. **CustomAlert** - For confirmations and important dialogs
2. **Snackbar** - For quick temporary messages (toast-style)

---

## 🎯 When to Use What

### Use CustomAlert For:
- ✅ Confirmations ("Are you sure you want to delete?")
- ✅ Important decisions (Yes/No/Cancel)
- ✅ Errors that need acknowledgment
- ✅ Multi-button dialogs

### Use Snackbar For:
- ✅ Success messages ("Transaction saved!")
- ✅ Quick errors ("Invalid amount")
- ✅ Info messages ("Loading data...")
- ✅ Non-blocking notifications

---

## 🔔 CustomAlert

### Quick Reference

```typescript
import { useAlert } from '@/hooks/useAlert';

const alert = useAlert();

// Simple alert
alert('Title', 'Message');

// With buttons
alert('Delete Item', 'Are you sure?', [
  { text: 'Cancel', style: 'cancel' },
  { text: 'Delete', onPress: () => handleDelete() }
]);

// With type
alert('Success', 'Item saved!', undefined, { type: 'success' });
// Types: success, error, warning, info
```

### Architecture

**Components:**
- `src/components/CustomAlert.tsx` - Alert UI
- `src/contexts/AlertContext.tsx` - State management
- `src/hooks/useAlert.ts` - Easy access hook

**Features:**
- ✅ Custom styling (dark theme)
- ✅ Multiple buttons
- ✅ Type indicators (success/error/warning/info)
- ✅ Icon support
- ✅ Backdrop dismiss

---

## 📬 Snackbar

### Quick Reference

```typescript
import { useSnackbar } from '@/hooks/useSnackbar';

const snack = useSnackbar();

// Success
snack.success('Transaction saved!');

// Error
snack.error('Failed to save');

// Info
snack.info('Loading data...');

// Custom
snack.show('Custom message', 'info', 3000);
```

### Architecture

**Components:**
- `src/components/Snackbar.tsx` - Snackbar UI
- `src/contexts/SnackbarContext.tsx` - Queue management
- `src/hooks/useSnackbar.ts` - Easy access hook

**Features:**
- ✅ Queue system (multiple messages)
- ✅ Auto-dismiss (configurable duration)
- ✅ Swipe to dismiss
- ✅ Icon based on type
- ✅ Smooth animations

---

## 📚 Examples

### CustomAlert Examples

**Simple Confirmation:**
```typescript
const handleDelete = () => {
  alert(
    'Confirm Delete',
    'Are you sure you want to delete this item?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => deleteItem() }
    ],
    { type: 'warning' }
  );
};
```

**Success Message:**
```typescript
alert(
  'Success! 🎉',
  'Your changes have been saved.',
  undefined,
  { type: 'success' }
);
```

**Error with Action:**
```typescript
alert(
  'Error',
  'Failed to connect to server',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Retry', onPress: () => retry() }
  ],
  { type: 'error' }
);
```

### Snackbar Examples

**Success:**
```typescript
// After saving
snack.success('Transaction saved successfully!');
```

**Error:**
```typescript
// Validation error
snack.error('Please enter an amount');
```

**With Custom Duration:**
```typescript
// Show for 5 seconds
snack.show('Processing payment...', 'info', 5000);
```

---

## 🎨 Styling

### Alert Types & Colors

```typescript
success → Green (#4ADE80)
error   → Red (#F87171)
warning → Yellow (#FACC15)
info    → Blue (#60A5FA)
```

### Snackbar Position

Default: Bottom of screen (above tab bar)
- Margin bottom: 80px (above navigation)
- Animated slide up
- Auto-stacks if multiple

---

## 🔧 Configuration

### Alert Context Provider

```typescript
// In App.tsx
import { AlertProvider } from '@/contexts/AlertContext';

<AlertProvider>
  <YourApp />
</AlertProvider>
```

### Snackbar Context Provider

```typescript
// In App.tsx
import { SnackbarProvider } from '@/contexts/SnackbarContext';

<SnackbarProvider>
  <YourApp />
</SnackbarProvider>
```

---

## 💡 Best Practices

### DO ✅

1. **Use appropriate system:**
   - Confirmations → Alert
   - Quick feedback → Snackbar

2. **Keep messages short:**
   ```typescript
   snack.success('Saved!');              // ✅
   snack.success('Your transaction...');  // ❌ Too long
   ```

3. **Use types correctly:**
   ```typescript
   alert('Error', msg, btns, { type: 'error' });  // ✅
   ```

4. **Handle errors gracefully:**
   ```typescript
   try {
     await save();
     snack.success('Saved!');
   } catch (err) {
     snack.error(err.message);
   }
   ```

### DON'T ❌

1. Don't show multiple alerts at once
2. Don't use snackbar for confirmations
3. Don't use very long messages in snackbar
4. Don't forget to handle errors

---

## 🧪 Testing

### Manual Testing

1. Test all alert types (success/error/warning/info)
2. Test multi-button alerts
3. Test snackbar queue (show multiple quickly)
4. Test swipe to dismiss
5. Test backdrop tap to close

---

## 📝 Migration Guide

### From Alert to CustomAlert

**Old:**
```typescript
import { Alert } from 'react-native';
Alert.alert('Title', 'Message');
```

**New:**
```typescript
import { useAlert } from '@/hooks/useAlert';
const alert = useAlert();
alert('Title', 'Message');
```

### From Alert to Snackbar

**For quick messages, use snackbar instead:**

```typescript
// Old
Alert.alert('Success', 'Saved!');

// New
snack.success('Saved!');
```

---

## 📊 Component APIs

### useAlert()

```typescript
type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type AlertOptions = {
  type?: 'success' | 'error' | 'warning' | 'info';
  cancelable?: boolean;
};

alert(
  title: string,
  message: string,
  buttons?: AlertButton[],
  options?: AlertOptions
): void
```

### useSnackbar()

```typescript
{
  show: (message: string, type?: SnackType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}
```

---

## 🎯 Summary

**Alert System:**
- For important dialogs
- Blocks interaction
- Multiple buttons
- Custom types

**Snackbar System:**
- For quick feedback
- Non-blocking
- Auto-dismiss
- Queue support

Use both appropriately for best UX!

---

**Files:**
- `src/components/CustomAlert.tsx`
- `src/components/Snackbar.tsx`
- `src/contexts/AlertContext.tsx`
- `src/contexts/SnackbarContext.tsx`
- `src/hooks/useAlert.ts`
- `src/hooks/useSnackbar.ts`
