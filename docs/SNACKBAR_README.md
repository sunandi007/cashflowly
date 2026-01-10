# Snackbar System - Global Context

Sistem Snackbar global untuk notifikasi non-blocking di aplikasi CashFlowly.

## 🎯 Features

- ✅ **4 Snackbar Types**: success, error, warning, info
- ✅ **Auto-dismiss**: Configurable duration (default 4s)
- ✅ **Manual dismiss**: Close button with custom action
- ✅ **Queue system**: Multiple snackbars handled gracefully
- ✅ **Smooth animations**: Spring animations with react-native-reanimated
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Global context**: Use anywhere in the app

---

## 🚀 Quick Start

### Basic Usage

```tsx
import { useSnackbar } from '@/hooks/useSnackbar';

function MyComponent() {
  const snackbar = useSnackbar();

  const handleSuccess = () => {
    snackbar.success('Transfer successful', 'Money sent to Savings');
  };

  const handleError = () => {
    snackbar.error('Transaction failed', 'Please check your balance');
  };

  const handleWarning = () => {
    snackbar.warning('Connectivity unstable', 'Data may not be synced');
  };

  const handleInfo = () => {
    snackbar.info('Statement available');
  };

  return (
    <View>
      <Button onPress={handleSuccess}>Success</Button>
      <Button onPress={handleError}>Error</Button>
      <Button onPress={handleWarning}>Warning</Button>
      <Button onPress={handleInfo}>Info</Button>
    </View>
  );
}
```

---

## 📚 API Reference

### `useSnackbar()`

Returns an object with these methods:

#### `show(title, message?, options?)`
Show a snackbar with custom options.

**Parameters:**
- `title` (string): Main title text
- `message` (string, optional): Subtitle/description text
- `options` (object, optional):
  - `type`: 'success' | 'error' | 'warning' | 'info' (default: 'info')
  - `duration`: number in ms (default: 4000, set 0 for no auto-dismiss)
  - `actionText`: Custom action button text (default: 'Tutup')
  - `onActionPress`: Callback when action button is pressed

```tsx
snackbar.show('Custom snackbar', 'With custom options', {
  type: 'success',
  duration: 5000,
  actionText: 'Undo',
  onActionPress: () => handleUndo()
});
```

#### `success(title, message?, options?)`
Show a success snackbar (green).

```tsx
snackbar.success('Transfer successful', 'Money sent to Savings');
```

#### `error(title, message?, options?)`
Show an error snackbar (red).

```tsx
snackbar.error('Transaction failed', 'Please check your balance');
```

#### `warning(title, message?, options?)`
Show a warning snackbar (yellow).

```tsx
snackbar.warning('Connectivity unstable', 'Data may not be synced');
```

#### `info(title, message?, options?)`
Show an info snackbar (blue).

```tsx
snackbar.info('Statement available');
```

#### `hide()`
Manually hide the current snackbar.

```tsx
snackbar.hide();
```

---

## 🎨 Snackbar Types

### Success
- **Color**: Green (`colors.accentGreen`)
- **Icon**: Checkmark circle
- **Usage**: Successful operations, confirmations

```tsx
snackbar.success('Data saved', 'Your changes have been saved');
```

### Error
- **Color**: Red (`colors.rose`)
- **Icon**: Close circle
- **Usage**: Failures, validation errors

```tsx
snackbar.error('Upload failed', 'Please try again');
```

### Warning
- **Color**: Yellow (`#FBBF24`)
- **Icon**: Warning triangle
- **Usage**: Important notices, cautions

```tsx
snackbar.warning('Low storage', 'Only 10MB remaining');
```

### Info
- **Color**: Blue (`#60A5FA`)
- **Icon**: Information circle
- **Usage**: General information, tips

```tsx
snackbar.info('New feature available', 'Check out our latest update');
```

---

## 💡 Common Patterns

### With Action Button

```tsx
snackbar.warning('File deleted', 'The file has been moved to trash', {
  actionText: 'Undo',
  onActionPress: () => restoreFile(),
  duration: 5000
});
```

### No Auto-dismiss

```tsx
snackbar.info('Processing...', 'Please wait while we sync your data', {
  duration: 0, // Won't auto-dismiss
  actionText: 'Cancel',
  onActionPress: () => cancelProcess()
});
```

### Short Duration

```tsx
snackbar.success('Copied!', undefined, {
  duration: 2000
});
```

### Using Helpers

```tsx
import { useSnackbar, SnackbarHelpers } from '@/hooks/useSnackbar';

const snackbar = useSnackbar();

// Show saved message
SnackbarHelpers.saved(snackbar, 'Profile');

// Show network error
SnackbarHelpers.networkError(snackbar);

// Show unsaved changes warning
SnackbarHelpers.unsavedChanges(snackbar, () => discardChanges());

// Show syncing message
SnackbarHelpers.syncing(snackbar);
```

---

## 🔧 Real-World Examples

### Example 1: Transfer Success

```tsx
const handleTransfer = async () => {
  try {
    await performTransfer({ amount, from, to });
    snackbar.success('Transfer successful', 'Money sent to Savings', {
      actionText: 'View',
      onActionPress: () => navigation.navigate('TransactionHistory')
    });
  } catch (err) {
    snackbar.error('Transfer failed', err.message);
  }
};
```

### Example 2: File Upload

```tsx
const handleUpload = async (file: File) => {
  try {
    const url = await uploadFile(file);
    snackbar.success('Upload complete', 'File uploaded successfully');
  } catch (err) {
    snackbar.error('Upload failed', 'Please check your connection', {
      actionText: 'Retry',
      onActionPress: () => handleUpload(file)
    });
  }
};
```

### Example 3: Offline Mode

```tsx
useEffect(() => {
  if (!isOnline) {
    snackbar.warning('Connectivity unstable', 'Data may not be synced', {
      duration: 0, // Keep showing until dismissed
      actionText: 'Retry',
      onActionPress: () => checkConnection()
    });
  } else {
    snackbar.hide(); // Hide when back online
  }
}, [isOnline]);
```

### Example 4: Form Validation

```tsx
const handleSubmit = () => {
  if (!email) {
    snackbar.error('Email required', 'Please enter your email address');
    return;
  }
  
  if (!isValidEmail(email)) {
    snackbar.warning('Invalid email', 'Please check your email format');
    return;
  }
  
  // Submit...
  snackbar.success('Form submitted', 'We will get back to you soon');
};
```

---

## 🎭 Queue System

Multiple snackbars are automatically queued and shown sequentially:

```tsx
// These will be shown one after another
snackbar.info('Processing payment...');
snackbar.success('Payment received');
snackbar.info('Sending confirmation email...');
snackbar.success('Email sent!');
```

---

## 🆚 Snackbar vs Alert

### Use **Snackbar** when:
- ✅ Non-critical notifications
- ✅ Success/info messages
- ✅ Undo actions
- ✅ Quick feedback
- ✅ Non-blocking UX

### Use **Alert** when:
- ⚠️ Critical decisions (delete, logout)
- ⚠️ Required user input
- ⚠️ Blocking confirmations
- ⚠️ Multiple choice options
- ⚠️ Important warnings

---

## 🎨 Customization

### Custom Duration

```tsx
// Quick notification (2 seconds)
snackbar.success('Copied!', undefined, { duration: 2000 });

// Long notification (10 seconds)
snackbar.info('Important update', 'Read carefully', { duration: 10000 });

// No auto-dismiss
snackbar.warning('Action required', 'Please complete setup', { duration: 0 });
```

### Custom Action Button

```tsx
snackbar.error('Connection lost', 'Unable to reach server', {
  actionText: 'Retry',
  onActionPress: () => retryConnection()
});
```

---

## 📱 Position

Snackbars appear at the **bottom** of the screen by default (20px from bottom).

To change position, modify `Snackbar.tsx`:

```tsx
// Top position
container: {
  position: 'absolute',
  top: verticalScale(60), // Change from 'bottom' to 'top'
  left: scale(16),
  right: scale(16),
}
```

---

## 🐛 Troubleshooting

### Snackbar not showing

**Solution**: Make sure `SnackbarProvider` is in `App.tsx`:
```tsx
<SnackbarProvider>
  {/* Your app */}
</SnackbarProvider>
```

### TypeScript errors

**Solution**: Import the hook properly:
```tsx
import { useSnackbar } from '@/hooks/useSnackbar';
```

### Animation issues

**Solution**: Make sure `react-native-reanimated` is properly configured in `babel.config.js`:
```javascript
plugins: ['react-native-reanimated/plugin']
```

---

## 📊 Comparison with Alert System

| Feature | Snackbar | Alert |
|---------|----------|-------|
| **Position** | Bottom | Center (Modal) |
| **Blocking** | No | Yes |
| **Auto-dismiss** | Yes (default 4s) | No |
| **Use case** | Quick feedback | Critical decisions |
| **Buttons** | 1 action button | Multiple buttons |
| **Queue** | Automatic | Automatic |

---

## ✅ Best Practices

1. **Keep titles short** - 1-3 words
2. **Use appropriate types** - Match severity with type
3. **Add actions when relevant** - Provide undo/retry options
4. **Don't overuse** - Too many snackbars = bad UX
5. **Set appropriate durations** - 2-4s for info, 4-6s for errors
6. **Use helpers** - Consistent messaging across app

---

## 🎉 Summary

Snackbar system is now **fully integrated** and ready to use!

**Created files:**
- ✅ `src/components/Snackbar.tsx`
- ✅ `src/contexts/SnackbarContext.tsx`
- ✅ `src/hooks/useSnackbar.ts`
- ✅ Updated `App.tsx`

**Features:**
- ✅ 4 snackbar types with beautiful UI
- ✅ Auto-dismiss with custom duration
- ✅ Queue system for multiple snackbars
- ✅ Smooth spring animations
- ✅ Custom action buttons
- ✅ Helper functions for common patterns

**Start using:**
```tsx
const snackbar = useSnackbar();
snackbar.success('It works!', 'Snackbar system is ready');
```

🚀 **Happy coding!**
