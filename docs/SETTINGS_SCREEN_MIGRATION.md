# Settings Modal to Screen Migration

## Overview

Settings telah diubah dari **bottom sheet modal** menjadi **full screen** untuk memberikan UX yang lebih baik dan konsisten dengan design system modern.

## Changes Summary

### Before (Modal)
- Settings dibuka sebagai bottom sheet modal
- Hanya menampilkan Currency selector
- Security & Password section di dalam modal
- Navigasi ke Change Password dari modal

### After (Full Screen)
- Settings sebagai dedicated screen
- Layout yang lebih luas dan organized
- Sections terpisah dengan jelas (GENERAL, SECURITY, ACCOUNT)
- Direct navigation dari Profile screen
- Lebih mudah untuk menambahkan settings baru

## Screen Structure

### SettingsScreen Layout

```
┌─────────────────────────┐
│ [←]    Settings    [ ]  │ ← Header
├─────────────────────────┤
│                         │
│ GENERAL                 │ ← Section Header
│ ┌─────────────────────┐ │
│ │ 🌙 Theme    Dark  › │ │
│ │ 💵 Currency  IDR  › │ │
│ └─────────────────────┘ │
│                         │
│ SECURITY                │ ← Section Header
│ ┌─────────────────────┐ │
│ │ 🔒 Security & Pass ›│ │
│ │ 👆 Biometric [ON] │ │
│ └─────────────────────┘ │
│                         │
│ ACCOUNT                 │ ← Section Header
│ ┌─────────────────────┐ │
│ │ 🔔 Notifications  › │ │
│ │ 🛡️ Privacy Policy › │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

## Features

### Settings Sections

#### 1. GENERAL
- **Theme**: Dark/Light/Auto mode selector (Currently showing Dark)
- **Currency**: IDR/USD/EUR selector (Currently showing IDR - Rp)

#### 2. SECURITY
- **Security & Password**: Navigate to Change Password screen
- **Biometric Authentication**: Toggle switch for fingerprint/face unlock

#### 3. ACCOUNT
- **Notification Settings**: Configure app notifications
- **Privacy Policy**: View privacy policy and terms

## Implementation Details

### File Created
- **`src/screens/SettingsScreen.tsx`** (New full screen)

### File Modified
- **`src/screens/ProfileScreen.tsx`**:
  - Removed `SettingsModal` import
  - Removed `isSettingsModalVisible` state
  - Changed navigation from modal to screen
  - Removed SettingsModal component from render

- **`src/navigation/RootNavigation.tsx`**:
  - Added `SettingsScreen` import
  - Added Settings route to authenticated stack

- **`src/types/navigation.d.ts`**:
  - Added `Settings: undefined` route type

### File Kept (Optional)
- **`src/components/SettingsModal.tsx`**: Kept for reference, but no longer used

## Navigation Flow

### Old Flow
```
Profile → Tap "Security & Password" 
       → Settings Modal opens (bottom sheet)
       → Tap "Ubah Password"
       → Modal closes → Navigate to ChangePassword
```

### New Flow
```
Profile → Tap "Security & Password" 
       → Navigate to Settings Screen (full page)
       → Tap "Security & Password" item
       → Navigate to ChangePassword
```

## UI Components

### SettingItem Component
Reusable component for each setting row:

```typescript
<SettingItem
    icon="lock-closed"
    iconColor={colors.primary}
    iconBg={colors.primary}
    title="Security & Password"
    onPress={() => navigation.navigate('ChangePassword')}
/>
```

**Props:**
- `icon`: Ionicons name
- `iconColor`: Icon color (default: white)
- `iconBg`: Icon background color
- `title`: Main text
- `subtitle`: Optional description text
- `value`: Optional right value text
- `showChevron`: Show/hide chevron arrow (default: true)
- `onPress`: Handler function
- `rightComponent`: Custom right component (e.g., Switch)

### Section Layout
Each section has:
- **Section Header**: Label in uppercase with primary color
- **Section Content**: Rounded card with items
- **Items**: List of setting items with icons, text, and actions

## Design Tokens

### Colors
- Background: `colors.neutral900`
- Section card: `colors.neutral800`
- Icon background: `colors.primary + '30'` (transparent)
- Icon color: `colors.primary`
- Text: `colors.white`
- Subtitle: `colors.neutral400`
- Border: `colors.neutral700`
- Section header: `colors.primary`

### Spacing
- Container padding: `spacingX._20`
- Section margin: `spacingY._25`
- Item padding: `spacingY._15` / `spacingX._15`
- Icon size: `40x40px`
- Border radius: `radius._20`

## Benefits of Screen vs Modal

### Advantages of Full Screen

1. **More Space**: Dapat menampilkan lebih banyak settings
2. **Better Organization**: Sections yang lebih jelas
3. **Easy Navigation**: Standard navigation pattern
4. **Scalability**: Mudah menambahkan settings baru
5. **Consistent UX**: Seperti native Settings app
6. **Better Discoverability**: User lebih mudah explore settings

### When Modal is Better

Modals cocok untuk:
- Quick edits (e.g., edit profile)
- Simple forms dengan 1-2 fields
- Confirmation dialogs
- Temporary overlays

Full screens cocok untuk:
- **Settings pages** ✅
- Complex forms
- List views
- Content that needs full attention

## Migration Guide

If you need to add new settings:

1. **Add to appropriate section** in `SettingsScreen.tsx`:
```typescript
// In GENERAL, SECURITY, or ACCOUNT section
<SettingItem
    icon="your-icon"
    iconColor={colors.primary}
    iconBg={colors.primary}
    title="Your Setting"
    subtitle="Optional description"
    onPress={() => {
        // Your action
    }}
/>
```

2. **For toggle settings**:
```typescript
<View style={styles.settingItem}>
    <View style={styles.settingLeft}>
        {/* Icon and title */}
    </View>
    <View style={styles.settingRight}>
        <Switch
            value={yourState}
            onValueChange={setYourState}
            trackColor={{ false: colors.neutral700, true: colors.primary + '80' }}
            thumbColor={yourState ? colors.primary : colors.neutral400}
        />
    </View>
</View>
```

3. **For navigation settings**:
```typescript
<SettingItem
    icon="your-icon"
    title="Your Screen"
    onPress={() => navigation.navigate('YourScreen' as never)}
/>
```

## Testing Checklist

- [ ] Navigate from Profile → Settings
- [ ] Verify all sections visible (GENERAL, SECURITY, ACCOUNT)
- [ ] Tap "Security & Password" → Navigate to ChangePassword
- [ ] Toggle Biometric switch → State changes
- [ ] Verify icons and colors match design
- [ ] Check spacing and layout
- [ ] Test back button navigation
- [ ] Verify smooth transitions

## Future Enhancements

Potential new settings to add:

### GENERAL
- [ ] Language selector
- [ ] Date format (DD/MM/YYYY vs MM/DD/YYYY)
- [ ] First day of week (Sunday vs Monday)

### SECURITY
- [ ] Two-factor authentication
- [ ] Session management
- [ ] Login history

### ACCOUNT
- [ ] Export data
- [ ] Delete account
- [ ] Subscription management
- [ ] Connected accounts

### APPEARANCE
- [ ] App icon selector
- [ ] Accent color picker
- [ ] Font size

### NOTIFICATIONS
- [ ] Push notifications
- [ ] Email notifications
- [ ] Notification schedule

## Conclusion

Migration dari modal ke full screen untuk Settings memberikan foundation yang lebih baik untuk growth aplikasi. Dengan structure yang jelas dan scalable, akan mudah untuk menambahkan settings baru seiring berkembangnya fitur aplikasi.
