# Theme Migration Guide - Dynamic Theme Support

## ✅ Yang Sudah Diupdate

Berikut component yang sudah support dynamic theme:

1. ✅ **App.tsx** - Root background menggunakan theme
2. ✅ **ScreenWrapper.tsx** - Background dan StatusBar dynamic
3. ✅ **SettingsScreen.tsx** - Sudah menggunakan useTheme()

---

## 🔧 Cara Migrate Component Lain

### **Option 1: Untuk Functional Components** (RECOMMENDED)

Ganti static `colors` import dengan `useColors()` hook:

#### Before (Static):
```typescript
import { colors } from '@/constant/theme';

export default function MyScreen() {
    return (
        <View style={{ backgroundColor: colors.background }}>
            <Text style={{ color: colors.text }}>Hello</Text>
        </View>
    );
}
```

#### After (Dynamic):
```typescript
import { useColors } from '@/hooks/useColors';

export default function MyScreen() {
    const colors = useColors(); // 👈 Hook untuk dynamic colors
    
    return (
        <View style={{ backgroundColor: colors.background }}>
            <Text style={{ color: colors.text }}>Hello</Text>
        </View>
    );
}
```

### **Option 2: Untuk StyleSheet (Computed Styles)**

Jika menggunakan `StyleSheet.create()`, pindahkan ke dalam component:

#### Before (Static):
```typescript
import { colors } from '@/constant/theme';

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background, // ❌ Static
    }
});

export default function MyScreen() {
    return <View style={styles.container} />;
}
```

#### After (Dynamic):
```typescript
import { useColors } from '@/hooks/useColors';

export default function MyScreen() {
    const colors = useColors();
    
    // Computed styles inside component
    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.background, // ✅ Dynamic
        }
    });
    
    return <View style={styles.container} />;
}
```

**ATAU** gunakan inline styles untuk bagian yang perlu dynamic:

```typescript
import { useColors } from '@/hooks/useColors';

const staticStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        // Tidak ada colors di sini
    }
});

export default function MyScreen() {
    const colors = useColors();
    
    return (
        <View style={[
            staticStyles.container,
            { backgroundColor: colors.background } // Dynamic inline
        ]}>
            <Text style={{ color: colors.text }}>Hello</Text>
        </View>
    );
}
```

---

## 📋 Migration Checklist

Untuk setiap screen/component yang perlu theme support:

### 1. **Replace Import**
```diff
- import { colors } from '@/constant/theme';
+ import { useColors } from '@/hooks/useColors';
```

### 2. **Add Hook in Component**
```typescript
export default function MyComponent() {
    const colors = useColors(); // Add this
    // ... rest of component
}
```

### 3. **Update StyleSheet (if needed)**

- **Option A:** Move `StyleSheet.create()` inside component
- **Option B:** Use inline styles for dynamic parts
- **Option C:** Create computed styles function

### 4. **Test Both Themes**

Test component dengan kedua theme:
- Dark mode (default)
- Light mode
- System (auto)

---

## 🎨 Available Colors from Theme

Setiap theme menyediakan:

```typescript
{
    // Semantic
    background: string,    // Main background
    card: string,          // Card background
    input: string,         // Input background
    text: string,          // Primary text
    textLight: string,     // Secondary text
    border: string,        // Borders
    primary: string,       // Primary color (always green)
    
    // Neutral Scale (Legacy support)
    neutral900: string,
    neutral800: string,
    neutral700: string,
    neutral600: string,
    neutral500: string,
    neutral400: string,
    neutral300: string,
    neutral200: string,
    neutral100: string,
    neutral50: string,
    
    // Others
    white: string,
    black: string,
    rose: string,
    primaryLight: string,
    primaryDark: string,
    // ... etc
}
```

---

## 💡 Best Practices

### ✅ DO:
- Use `useColors()` in functional components
- Use semantic colors (`colors.background`, `colors.text`)
- Compute styles inside component when needed
- Test both light and dark themes

### ❌ DON'T:
- Don't import static `colors` from theme.ts
- Don't use hooks outside components
- Don't hardcode color values
- Don't assume always dark theme

---

## 🚀 Priority Components to Migrate

Urutan priority untuk migrate:

### High Priority (User-facing screens):
1. ✅ **ScreenWrapper** - Already done
2. ✅ **SettingsScreen** - Already done
3. [ ] **Dashboard** / HomeScreen
4. [ ] **TransactionScreen**
5. [ ] **AnalyticsScreen**
6. [ ] **ProfileScreen**
7. [ ] **BillsScreen**

### Medium Priority (Common components):
1. [ ] **HomeCard**
2. [ ] **TransactionItem**
3. [ ] **CategoryItem**
4. [ ] **Button**
5. [ ] **Input**
6. [ ] **Typo** (if has default colors)

### Low Priority (Modals & Less frequent):
1. [ ] **AddCategoryModal**
2. [ ] **BillDetailModal**
3. [ ] **ProfileUpdateModal**
4. [ ] Other modals

---

## 🔍 How to Find Components to Migrate

Search for static imports:

```bash
# Search for static color imports
grep -r "import.*colors.*from.*theme" src/

# Or using ripgrep
rg "import.*colors.*theme" src/
```

Components yang masih import static colors perlu di-migrate.

---

## 📖 Example: Full Component Migration

### Before:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacingX, spacingY } from '@/constant/theme';

export default function MyCard({ title, value }) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.neutral800,
        padding: spacingX._15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutral700,
    },
    title: {
        color: colors.neutral400,
        fontSize: 14,
    },
    value: {
        color: colors.white,
        fontSize: 20,
        fontWeight: '600',
    },
});
```

### After (Option 1 - Inline Styles):
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { spacingX, spacingY } from '@/constant/theme';

export default function MyCard({ title, value }) {
    const colors = useColors(); // 👈 Dynamic colors
    
    return (
        <View style={[styles.card, {
            backgroundColor: colors.card,
            borderColor: colors.border,
        }]}>
            <Text style={[styles.title, { color: colors.textLight }]}>
                {title}
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: spacingX._15,
        borderRadius: 12,
        borderWidth: 1,
    },
    title: {
        fontSize: 14,
    },
    value: {
        fontSize: 20,
        fontWeight: '600',
    },
});
```

### After (Option 2 - Computed Styles):
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { spacingX, spacingY } from '@/constant/theme';

export default function MyCard({ title, value }) {
    const colors = useColors();
    
    const styles = StyleSheet.create({
        card: {
            backgroundColor: colors.card,
            padding: spacingX._15,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        title: {
            color: colors.textLight,
            fontSize: 14,
        },
        value: {
            color: colors.text,
            fontSize: 20,
            fontWeight: '600',
        },
    });
    
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}
```

---

## 🎉 Summary

- ✅ **App.tsx** & **ScreenWrapper** sudah support dynamic theme
- 📝 Gunakan `useColors()` hook untuk component lain
- 🔄 Migrate gradually, test setiap perubahan
- 🎨 Support light & dark theme automatically

**Next step:** Migrate screen-screen utama satu per satu!
