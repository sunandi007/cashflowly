# Custom Alert Migration Guide

This guide shows you how to migrate from React Native's `Alert.alert()` to the custom `CustomAlert` component using the global Context approach.

## ✅ Setup Complete

The following has been set up for you:

1. ✅ `AlertContext.tsx` - Global context provider
2. ✅ `useAlert.ts` - Custom hook for easy access
3. ✅ `App.tsx` - Wrapped with `AlertProvider`

## 📖 Usage Examples

### Basic Usage

Instead of:
```tsx
import { Alert } from 'react-native';

Alert.alert('Success', 'Transaction saved successfully!');
```

Use:
```tsx
import { useAlert } from '@/hooks/useAlert';

function MyComponent() {
  const alert = useAlert();
  
  const handleSave = () => {
    // Your save logic
    alert('Success', 'Transaction saved successfully!');
  };
  
  return <Button onPress={handleSave} title="Save" />;
}
```

### Alert with Type

```tsx
const alert = useAlert();

// Success alert
alert('Success', 'Transaction saved!', undefined, { type: 'success' });

// Error alert
alert('Error', 'Something went wrong', undefined, { type: 'error' });

// Warning alert
alert('Warning', 'This action cannot be undone', undefined, { type: 'warning' });

// Info alert
alert('Info', 'Please check your email', undefined, { type: 'info' });
```

### Alert with Custom Buttons (React Native Style)

Instead of:
```tsx
Alert.alert(
  'Delete Transaction',
  'Are you sure you want to delete this transaction?',
  [
    {
      text: 'Cancel',
      style: 'cancel',
    },
    {
      text: 'Delete',
      onPress: () => deleteTransaction(),
      style: 'destructive',
    },
  ]
);
```

Use:
```tsx
const alert = useAlert();

alert(
  'Delete Transaction',
  'Are you sure you want to delete this transaction?',
  [
    {
      text: 'Cancel',
      style: 'cancel',
    },
    {
      text: 'Delete',
      onPress: () => deleteTransaction(),
    },
  ],
  { type: 'error' } // Optional: specify alert type
);
```

### Alert with Callbacks

```tsx
const alert = useAlert();

alert(
  'Confirm Action',
  'Do you want to proceed?',
  undefined,
  {
    type: 'warning',
    confirmText: 'Yes, Proceed',
    cancelText: 'No, Cancel',
    onConfirm: () => {
      console.log('User confirmed');
      proceedWithAction();
    },
    onCancel: () => {
      console.log('User cancelled');
    },
  }
);
```

### Single Button Alert

```tsx
const alert = useAlert();

// Simple single button
alert('Notice', 'Your session will expire soon');

// Single button with custom text and callback
alert(
  'Session Expired',
  'Please log in again',
  undefined,
  {
    type: 'warning',
    confirmText: 'Log In',
    onConfirm: () => navigateToLogin(),
  }
);
```

## 🔄 Migration Checklist

Use this checklist to migrate your existing code:

### Step 1: Find all Alert.alert() calls
Search your codebase for `Alert.alert` and note each location.

### Step 2: Add useAlert hook
In each component using Alert.alert:
```tsx
import { useAlert } from '@/hooks/useAlert';

function MyComponent() {
  const alert = useAlert();
  // ...
}
```

### Step 3: Replace Alert.alert with alert
Replace each `Alert.alert(...)` with `alert(...)`

### Step 4: Add type option
Add the appropriate type option based on the context:
- `{ type: 'success' }` - for success messages
- `{ type: 'error' }` - for errors
- `{ type: 'warning' }` - for confirmations/warnings
- `{ type: 'info' }` - for informational messages

### Step 5: Test
Test each replaced alert to ensure it works as expected.

## 🎨 Alert Types

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `success` | ✓ Checkmark | Green | Successful operations |
| `error` | ⚠ Alert | Red | Errors, failures, deletions |
| `warning` | ⚠ Warning | Amber | Confirmations, important notices |
| `info` | ℹ Information | Blue | General information, tips |

## 💡 Best Practices

1. **Always specify a type** - This improves UX by providing visual context
   ```tsx
   // Good
   alert('Success', 'Saved!', undefined, { type: 'success' });
   
   // Less ideal (defaults to 'info')
   alert('Success', 'Saved!');
   ```

2. **Use descriptive button text**
   ```tsx
   // Good
   alert('Delete Account', 'This cannot be undone', undefined, {
     type: 'error',
     confirmText: 'Delete Account',
     cancelText: 'Keep Account',
   });
   
   // Less ideal
   alert('Delete Account', 'This cannot be undone');
   ```

3. **Handle callbacks for important actions**
   ```tsx
   alert('Logout', 'Are you sure?', undefined, {
     type: 'warning',
     onConfirm: () => handleLogout(),
     onCancel: () => trackCancellation(),
   });
   ```

4. **Keep messages concise**
   - Title: 1-4 words
   - Message: 1-2 sentences

## 🚨 Common Migration Issues

### Issue: "useAlert must be used within an AlertProvider"

**Solution:** Make sure `AlertProvider` is wrapping your app in `App.tsx`:
```tsx
<AlertProvider>
  {/* Your app components */}
</AlertProvider>
```

### Issue: Alert not showing

**Solution:** Check that you're calling the alert inside a component, not at the module level:
```tsx
// ❌ Wrong - called at module level
const alert = useAlert();
alert('Test', 'This won't work');

// ✅ Correct - called inside component
function MyComponent() {
  const alert = useAlert();
  
  const handleClick = () => {
    alert('Test', 'This works!');
  };
  
  return <Button onPress={handleClick} />;
}
```

### Issue: Buttons parameter not working as expected

**Solution:** Remember the button order:
- 2 buttons: `[cancelButton, confirmButton]`
- 1 button: `[okButton]`

Mark the cancel button with `style: 'cancel'`:
```tsx
alert('Title', 'Message', [
  { text: 'Cancel', style: 'cancel' }, // This becomes the cancel button
  { text: 'OK', onPress: handleConfirm }, // This becomes the confirm button
]);
```

## 📝 Quick Reference

```tsx
import { useAlert } from '@/hooks/useAlert';

function MyComponent() {
  const alert = useAlert();
  
  // Simple
  alert('Title', 'Message');
  
  // With type
  alert('Title', 'Message', undefined, { type: 'success' });
  
  // With buttons (React Native style)
  alert('Title', 'Message', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'OK', onPress: () => {} },
  ]);
  
  // With options
  alert('Title', 'Message', undefined, {
    type: 'warning',
    confirmText: 'Yes',
    cancelText: 'No',
    onConfirm: () => {},
    onCancel: () => {},
  });
  
  return <View>...</View>;
}
```

## 🔍 Find & Replace Pattern

Use this regex pattern to find Alert.alert calls in your codebase:

**Find:** `Alert\.alert\(`

Then manually replace each occurrence based on the patterns above.

## ✨ Advanced: Custom Alert Helper (Optional)

For even easier migration, you can create a drop-in replacement module:

```tsx
// src/utils/alert.ts
import { useAlert as useAlertHook } from '@/hooks/useAlert';

// This mimics React Native's Alert.alert API
export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
    options?: { type?: 'success' | 'error' | 'info' | 'warning' }
  ) => {
    // Note: This won't work as a direct drop-in replacement
    // since hooks must be called from components.
    // Use useAlert() hook instead in components.
  },
};
```

## 🎯 Next Steps

1. Start with high-priority screens (login, profile, transaction management)
2. Test thoroughly after each migration
3. Consider adding custom types for your specific use cases
4. Update your team's coding guidelines to use `useAlert()` instead of `Alert.alert()`

---

**Need help?** Check the examples in this guide or review the implementation in:
- `src/contexts/AlertContext.tsx`
- `src/hooks/useAlert.ts`
- `src/components/CustomAlert.tsx`
