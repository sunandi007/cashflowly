# Play Store Release Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all code review issues before deploying CashFlowly to the Google Play Store, including config changes, environment variable updates, version sync, and removing console logs.

**Architecture:** We will adjust existing configuration files (`eas.json`, `app.json`, `babel.config.js`) to adhere to production delivery requirements. 

**Tech Stack:** Expo, EAS Build, Babel, React Native

---

## File Structure

- **Modify:** `eas.json`
  - Remove debug/developer settings from the `production` profile, including keys that belong in `.env.production`.
  - Fix Android `buildType` to `.aab` for the Play Store.

- **Modify:** `app.json`
  - Sync version property to match `package.json`.

- **Create:** `babel.config.js`
  - Ensure the standard `expo` preset is loaded.
  - Implement `babel-plugin-transform-remove-console` strictly for production to stop leaking debug strings.

---

### Task 1: Fix Android Play Store Package Format

**Files:**
- Modify: `eas.json`

- [ ] **Step 1: Write the failing test**

We verify the configuration manually since there is no test runner for standard JSON files.
```powershell
Select-String -Pattern '"buildType": "apk"' eas.json
```

- [ ] **Step 2: Run test to verify it fails (finds apk)**

Run: `Select-String -Pattern '"buildType": "apk"' eas.json`
Expected: Output showing the line matched.

- [ ] **Step 3: Write minimal implementation**

Update `eas.json` by replacing `"apk"` with `"app-bundle"` inside the production profile.

```json
// eas.json snippet
      "android": {
        "buildType": "app-bundle"
      }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `Select-String -Pattern '"buildType": "apk"' eas.json`
Expected: Empty output (nothing matched).

- [ ] **Step 5: Commit**

```bash
git add eas.json
git commit -m "fix(build): update android build type to app-bundle for play store"
```

---

### Task 2: Synchronize Application Version

**Files:**
- Modify: `app.json`

- [ ] **Step 1: Write the failing test**

```powershell
Select-String -Pattern '"version": "1.0.0"' app.json
```

- [ ] **Step 2: Run test to verify it fails (finds wrong version)**

Run: `Select-String -Pattern '"version": "1.0.0"' app.json`
Expected: Output showing the line matched.

- [ ] **Step 3: Write minimal implementation**

Update `app.json` by updating `"version": "1.0.0"` to `"version": "1.0.2"`.

```json
// app.json snippet
    "version": "1.0.2",
```

- [ ] **Step 4: Run test to verify it passes**

Run: `Select-String -Pattern '"version": "1.0.0"' app.json`
Expected: Empty output (nothing matched).

- [ ] **Step 5: Commit**

```bash
git add app.json
git commit -m "chore(config): sync app.json version with package.json"
```

---

### Task 3: Secure Secrets from EAS Config

**Files:**
- Modify: `eas.json`

- [ ] **Step 1: Write the failing test**

```powershell
Select-String -Pattern 'EXPO_PUBLIC_SUPABASE_ANON_KEY' eas.json
```

- [ ] **Step 2: Run test to verify it fails (finds secret)**

Run: `Select-String -Pattern 'EXPO_PUBLIC_SUPABASE_ANON_KEY' eas.json`
Expected: Output showing the line matched.

- [ ] **Step 3: Write minimal implementation**

Remove the embedded `env` object from `eas.json` production. 

```json
// Remove these lines from eas.json production profile:
// "env": {
//    "EXPO_PUBLIC_SUPABASE_URL": "...",
//    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "..."
// },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `Select-String -Pattern 'EXPO_PUBLIC_SUPABASE_ANON_KEY' eas.json`
Expected: Empty output (nothing matched).

- [ ] **Step 5: Commit**

```bash
git add eas.json
git commit -m "refactor(config): remove hardcoded supabase env from eas config"
```

---

### Task 4: Remove Console Logs in Production

**Files:**
- Create: `babel.config.js`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

Check if the babel plugin is installed.
```powershell
Select-String -Pattern 'babel-plugin-transform-remove-console' package.json
```

- [ ] **Step 2: Run test to verify it fails**

Run: `Select-String -Pattern 'babel-plugin-transform-remove-console' package.json`
Expected: Empty output (indicating it is not installed).

- [ ] **Step 3: Write minimal implementation**

Install the package as a development dependency.
```powershell
npm install babel-plugin-transform-remove-console --save-dev
```

Create `babel.config.js` with the correct logic for Expo:
```javascript
module.exports = function(api) {
  api.cache(true);
  
  const plugins = [];
  if (process.env.NODE_ENV === 'production') {
    plugins.push('transform-remove-console');
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins: plugins
  };
};
```

- [ ] **Step 4: Run test to verify it passes**

Check for the existence of the installed package.
Run: `Select-String -Pattern 'babel-plugin-transform-remove-console' package.json`
Expected: Output showing the dependency line matched.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json babel.config.js
git commit -m "build(babel): strip console logs in production builds"
```
