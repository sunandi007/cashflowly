# Snackbar Quick Reference

## 🚀 Import

```tsx
import { useSnackbar } from '@/hooks/useSnackbar';
```

## 💡 Basic Usage

```tsx
const snackbar = useSnackbar();

// Success
snackbar.success('Transfer successful', 'Money sent to Savings');

// Error
snackbar.error('Transaction failed', 'Please check your balance');

// Warning
snackbar.warning('Connectivity unstable', 'Data may not be synced');

// Info
snackbar.info('Statement available');
```

## 🎨 With Custom Options

```tsx
snackbar.success('Data saved', 'Changes applied successfully', {
  duration: 5000,
  actionText: 'View',
  onActionPress: () => navigate('Details')
});
```

## 🔧 Advanced Options

```tsx
snackbar.show('Custom title', 'Custom message', {
  type: 'success',      // 'success' | 'error' | 'warning' | 'info'
  duration: 4000,       // milliseconds (0 = no auto-dismiss)
  actionText: 'Action', // button text
  onActionPress: () => {} // button callback
});
```

## 🎯 Helper Functions

```tsx
import { SnackbarHelpers } from '@/hooks/useSnackbar';

// Saved message
SnackbarHelpers.saved(snackbar, 'Profile');

// Network error
SnackbarHelpers.networkError(snackbar);

// Syncing
SnackbarHelpers.syncing(snackbar);

// Unsaved changes
SnackbarHelpers.unsavedChanges(snackbar, () => discard());
```

## 🎭 Common Patterns

### Quick Notification (2 seconds)
```tsx
snackbar.success('Copied!', undefined, { duration: 2000 });
```

### No Auto-dismiss
```tsx
snackbar.info('Processing...', 'Please wait', { duration: 0 });
```

### With Action Button
```tsx
snackbar.error('Upload failed', 'Connection error', {
  actionText: 'Retry',
  onActionPress: () => retryUpload()
});
```

### Manual Hide
```tsx
snackbar.hide();
```

## 📊 Type Colors

| Type | Color | Icon |
|------|-------|------|
| `success` | Green | ✓ Checkmark |
| `error` | Red | ✕ Close |
| `warning` | Yellow | ⚠ Warning |
| `info` | Blue | ℹ Info |

## ⚡ When to Use

**Use Snackbar for:**
- ✅ Success confirmations
- ✅ Info messages
- ✅ Undo actions
- ✅ Quick feedback
- ✅ Non-blocking notifications

**Use Alert for:**
- ⚠️ Critical decisions
- ⚠️ Delete confirmations
- ⚠️ Multiple choices
- ⚠️ Required user input

## 🎯 Example in Hook

```tsx
const { uploadImage } = useUploadImage();
const snackbar = useSnackbar();

const handleUpload = async (uri: string) => {
  try {
    await uploadImage(uri, userId);
    snackbar.success('Upload complete', 'Image uploaded successfully');
  } catch (err: any) {
    snackbar.error('Upload failed', err.message, {
      actionText: 'Retry',
      onActionPress: () => handleUpload(uri)
    });
  }
};
```

## 📝 Cheatsheet

```tsx
// Import
import { useSnackbar } from '@/hooks/useSnackbar';

// Initialize
const snackbar = useSnackbar();

// Show snackbars
snackbar.success(title, message?, options?);
snackbar.error(title, message?, options?);
snackbar.warning(title, message?, options?);
snackbar.info(title, message?, options?);
snackbar.show(title, message?, options?);

// Hide
snackbar.hide();

// Options
{
  type: 'success' | 'error' | 'warning' | 'info',
  duration: number, // ms (0 = no auto-dismiss)
  actionText: string,
  onActionPress: () => void
}
```

🎉 **Done! Start using snackbars now!**
