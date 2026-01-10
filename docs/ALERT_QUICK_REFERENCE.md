# useAlert() - Quick Reference

## 🚀 Quick Start

```tsx
import { useAlert } from '@/hooks/useAlert';

function MyComponent() {
  const alert = useAlert();
  
  // Simple
  alert('Title', 'Message');
  
  // With type
  alert('Success!', 'Saved', undefined, { type: 'success' });
  
  // With buttons
  alert('Delete?', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', onPress: () => handleDelete() }
  ], { type: 'error' });
}
```

## 📋 API Signature

```tsx
alert(
  title: string,
  message: string,
  buttons?: AlertButton[],
  options?: AlertOptions
)
```

## 🎨 Alert Types

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| `'success'` | 🟢 Green | ✓ | Successful operations |
| `'error'` | 🔴 Red | ⚠ | Errors, deletions |
| `'warning'` | 🟡 Amber | ⚠ | Confirmations |
| `'info'` | 🔵 Blue | ℹ | General info |

## 🔧 Options

```tsx
interface AlertOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;      // Default: 'OK'
  cancelText?: string;       // Default: 'Cancel'
  onConfirm?: () => void;
  onCancel?: () => void;
}
```

## 🎯 Button Format

```tsx
interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}
```

## 💡 Common Patterns

### Success Message
```tsx
alert('Success', 'Transaction saved!', undefined, { 
  type: 'success' 
});
```

### Error Message
```tsx
alert('Error', 'Failed to save', undefined, { 
  type: 'error' 
});
```

### Confirmation
```tsx
alert('Delete Item', 'Are you sure?', [
  { text: 'Cancel', style: 'cancel' },
  { text: 'Delete', onPress: () => deleteItem() }
], { type: 'warning' });
```

### With Callbacks
```tsx
alert('Save Changes', 'Save before leaving?', undefined, {
  type: 'warning',
  confirmText: 'Save',
  cancelText: 'Discard',
  onConfirm: () => save(),
  onCancel: () => discard()
});
```

### Simple Acknowledgment
```tsx
alert('Notice', 'Your session will expire soon');
```

## 🔄 Migration from Alert.alert

### Before:
```tsx
import { Alert } from 'react-native';

Alert.alert('Title', 'Message', [
  { text: 'Cancel', style: 'cancel' },
  { text: 'OK', onPress: () => {} }
]);
```

### After:
```tsx
import { useAlert } from '@/hooks/useAlert';

const alert = useAlert();

alert('Title', 'Message', [
  { text: 'Cancel', style: 'cancel' },
  { text: 'OK', onPress: () => {} }
], { type: 'info' });
```

## ⚠️ Common Mistakes

❌ **Don't do this:**
```tsx
// Calling at module level
const alert = useAlert();
alert('Test', 'This won\'t work');
```

✅ **Do this:**
```tsx
function MyComponent() {
  const alert = useAlert();
  
  const handleClick = () => {
    alert('Test', 'This works!');
  };
  
  return <Button onPress={handleClick} />;
}
```

## 📚 See Also

- **Full Guide:** `docs/ALERT_MIGRATION_GUIDE.md`
- **Architecture:** `docs/ALERT_ARCHITECTURE.md`
- **Examples:** `src/screens/AlertExamplesScreen.tsx`
- **Real Usage:** `src/screens/ProfileScreen.tsx`

## 🎓 Pro Tips

1. **Always specify type** for better UX
2. **Use descriptive button text**
3. **Keep messages concise** (1-2 sentences)
4. **Handle callbacks** for important actions

---

**Ready to use!** 🎉 Import `useAlert` and start showing beautiful alerts!
