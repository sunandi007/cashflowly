# Custom Alert Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                          App.tsx                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              AlertProvider (Context)                  │  │
│  │  • Manages global alert state                         │  │
│  │  • Renders CustomAlert component                      │  │
│  │  • Provides showAlert() and hideAlert()              │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │         Rest of Your App                       │   │  │
│  │  │  ┌──────────────────────────────────────────┐  │   │  │
│  │  │  │        Any Screen/Component              │  │   │  │
│  │  │  │                                           │  │   │  │
│  │  │  │  const alert = useAlert();   ←────────────────────┐
│  │  │  │                                           │  │   │  │
│  │  │  │  alert('Title', 'Message');              │  │   │  │
│  │  │  │         ↓                                │  │   │  │
│  │  │  └──────────────────────────────────────────┘  │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  │                       ↓                                │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │        CustomAlert Component                   │   │  │
│  │  │  • Rendered at top level                       │   │  │
│  │  │  • Shows/hides based on context state          │   │  │
│  │  │  • Beautiful modal with animations             │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
Component calls alert()
         ↓
    useAlert hook
         ↓
  AlertContext.showAlert()
         ↓
  Updates context state
         ↓
CustomAlert re-renders with new props
         ↓
   Shows modal with animation
         ↓
  User interacts (clicks button)
         ↓
  Callback executed (onConfirm/onClose)
         ↓
  AlertContext.hideAlert()
         ↓
CustomAlert hides with animation
```

## 📦 Component Structure

### 1. AlertContext.tsx (Provider)
```tsx
export function AlertProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({...});
  
  const showAlert = (title, message, buttons, options) => {
    // Process parameters
    // Update state
    setVisible(true);
  };
  
  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert {...alertConfig} visible={visible} />
    </AlertContext.Provider>
  );
}
```

### 2. useAlert.ts (Hook)
```tsx
export function useAlert() {
  const context = useContext(AlertContext);
  
  const alert = (title, message, buttons, options) => {
    context.showAlert(title, message, buttons, options);
  };
  
  return alert;
}
```

### 3. CustomAlert.tsx (UI Component)
```tsx
export default function CustomAlert({
  visible,
  type,
  title,
  message,
  onConfirm,
  onClose,
  confirmText,
  cancelText
}) {
  // Renders modal with animations
  // Shows appropriate icon based on type
  // Handles button layout
}
```

## 🎯 Key Features

### 1. **Global State Management**
- Single source of truth for alert state
- No prop drilling required
- Works from any component in the tree

### 2. **API Compatibility**
Supports both React Native Alert.alert style:
```tsx
alert('Title', 'Message', [
  { text: 'Cancel', style: 'cancel' },
  { text: 'OK', onPress: () => {} }
]);
```

And custom options style:
```tsx
alert('Title', 'Message', undefined, {
  type: 'success',
  confirmText: 'Got it',
  onConfirm: () => {}
});
```

### 3. **Alert Queueing**
If an alert is shown while another is visible:
- New alert is queued
- Shows after current alert closes
- Smooth transitions between alerts

### 4. **Type Safety**
- Full TypeScript support
- Type-safe alert types
- Autocomplete for all options

## 🎨 Alert Types & Visual Mapping

```
┌────────────────────────────────────────────────────────┐
│ SUCCESS                  ✅                            │
│ • Green (#23C16B)                                      │
│ • Checkmark icon                                       │
│ • Use: Confirmations, successful operations            │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ ERROR                    ⚠️                            │
│ • Red (#FF4D4D)                                        │
│ • Alert/Warning icon                                   │
│ • Use: Errors, failures, deletions                     │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ WARNING                  ⚠️                            │
│ • Amber (#F59E0B)                                      │
│ • Warning icon                                         │
│ • Use: Confirmations, important decisions              │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ INFO                     ℹ️                             │
│ • Blue (#3B82F6)                                       │
│ • Information icon                                     │
│ • Use: General info, tips, announcements               │
└────────────────────────────────────────────────────────┘
```

## 🔧 Configuration Flow

### Button Processing Logic

```
Input: buttons array OR options object
         ↓
┌────────────────────┐
│ Has buttons array? │
└────────────────────┘
    Yes ↓        No ↓
         ↓           Use options
    Parse buttons     (confirmText, cancelText)
         ↓
  1 button?  2+ buttons?
     ↓           ↓
  Single OK   Cancel + Confirm
     ↓           ↓
  ┌────────────────────┐
  │ Create callbacks   │
  │ • onConfirm        │
  │ • onClose          │
  └────────────────────┘
         ↓
  Pass to CustomAlert
```

## 📱 Real-World Example Flow

```
User Flow: Deleting a Transaction
──────────────────────────────────

1. User taps "Delete" button
   ↓
2. Component calls:
   alert('Delete Transaction', 'Are you sure?', [...], { type: 'error' })
   ↓
3. AlertContext processes:
   • Sets type = 'error'
   • Sets title = 'Delete Transaction'
   • Sets message = 'Are you sure?'
   • Creates onConfirm callback
   • Creates onClose callback
   • Sets visible = true
   ↓
4. CustomAlert renders:
   • Shows red-themed modal
   • Alert icon in red circle
   • Two buttons: Cancel & Delete
   • Animates in with spring
   ↓
5. User clicks "Delete":
   • onConfirm() executes
   • Calls hideAlert()
   • Executes user's delete logic
   • Animates out
   ↓
6. Alert closes, UI returns to normal
```

## 🧩 Integration Points

### In Your Components:
```tsx
import { useAlert } from '@/hooks/useAlert';

function MyComponent() {
  const alert = useAlert();
  
  // Use anywhere in your component logic
  alert('Message', 'Description', undefined, { type: 'success' });
}
```

### In Your App:
```tsx
import { AlertProvider } from '@/contexts/AlertContext';

function App() {
  return (
    <AlertProvider>
      {/* Your app */}
    </AlertProvider>
  );
}
```

## 🎬 Animation Sequence

```
Show Alert:
──────────
1. visible set to true
2. showModal set to true (renders Modal)
3. opacityValue: 0 → 1 (200ms timing)
4. scaleValue: 0 → 1 (spring animation, damping: 12)
5. Alert appears with bounce effect

Hide Alert:
───────────
1. visible set to false
2. opacityValue: 1 → 0 (200ms timing)
3. scaleValue: 1 → 0 (200ms timing)
4. After animation completes:
   • showModal set to false
   • Modal component unmounts
   • Check for queued alerts
```

## 🎯 Migration Strategy

```
Old Code (React Native Alert):
──────────────────────────────
import { Alert } from 'react-native';

Alert.alert('Title', 'Message', [
  { text: 'Cancel', style: 'cancel' },
  { text: 'OK', onPress: () => {} }
]);

New Code (Custom Alert):
────────────────────────
import { useAlert } from '@/hooks/useAlert';

const alert = useAlert();

alert('Title', 'Message', [
  { text: 'Cancel', style: 'cancel' },
  { text: 'OK', onPress: () => {} }
], { type: 'info' });

Changes:
• Remove Alert import
• Add useAlert import
• Call hook in component
• Add type option (recommended)
```

---

This architecture provides:
✅ Clean separation of concerns
✅ Easy to use API
✅ Type-safe implementation
✅ Beautiful UX with animations
✅ Drop-in replacement for Alert.alert
