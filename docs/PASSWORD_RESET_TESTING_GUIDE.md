# Testing Guide: Forgot Password & Reset Password

## Pre-requisites

Before testing, ensure:

1. ✅ Supabase redirect URL is configured: `cashflowly://reset-password`
2. ✅ Email provider is enabled in Supabase
3. ✅ App is rebuilt after the changes
4. ✅ You have a test account with a valid email

## Test Case 1: Forgot Password - Happy Path

### Steps:
1. Launch the app
2. Navigate to the Login screen (if not already there)
3. Click **"Forgot Password?"** text
4. Verify you're on the Forgot Password screen
5. Enter a valid registered email address
6. Click **"Kirim Link Reset"** button
7. Wait for confirmation alert
8. Check email inbox

### Expected Results:
- ✅ Navigation from Login → Forgot Password screen works
- ✅ Email input field accepts text
- ✅ Button shows loading state while processing
- ✅ Success alert appears: "Email Terkirim! 📧"
- ✅ Returns to Login screen after clicking OK
- ✅ Email is received in inbox (check spam folder too)

### Possible Issues:
- ❌ "Invalid redirect URL" → Configure Supabase redirect URL
- ❌ Email not received → Check Supabase email logs

---

## Test Case 2: Forgot Password - Invalid Email

### Steps:
1. Navigate to Forgot Password screen
2. Leave email field empty
3. Click **"Kirim Link Reset"** button
4. Try again with invalid email format

### Expected Results:
- ✅ Alert shows: "Email Diperlukan"
- ✅ Supabase may reject invalid email formats

---

## Test Case 3: Reset Password from Email - Happy Path

### Steps:
1. Complete Test Case 1 (send reset email)
2. Open email client
3. Find the password reset email from Supabase
4. Click the reset link in the email
5. App should open automatically to Reset Password screen
6. Enter new password (min 6 characters) in first field
7. Enter same password in confirmation field
8. Click **"Reset Password"** button
9. Click OK on success alert

### Expected Results:
- ✅ Email contains reset link
- ✅ Clicking link opens the app (deep linking works)
- ✅ App navigates to Reset Password screen
- ✅ Both password fields work
- ✅ Eye icons toggle password visibility
- ✅ Button shows loading state
- ✅ Success alert appears: "Password Berhasil Direset! 🎉"
- ✅ Navigation to Login screen after clicking OK
- ✅ Can login with new password

### Possible Issues:
- ❌ Deep link doesn't open app → Rebuild app, verify scheme in app.json
- ❌ "Invalid session" → Reset link may be expired, request new one

---

## Test Case 4: Reset Password - Validation Tests

### Test 4A: Password Too Short
**Steps:**
1. On Reset Password screen
2. Enter password with less than 6 characters
3. Enter matching confirmation
4. Click Reset Password

**Expected:** Alert shows "Password Terlalu Pendek"

---

### Test 4B: Passwords Don't Match
**Steps:**
1. On Reset Password screen
2. Enter valid password in first field
3. Enter different password in second field
4. Click Reset Password

**Expected:** Alert shows "Password Tidak Cocok"

---

### Test 4C: Empty Fields
**Steps:**
1. On Reset Password screen
2. Leave one or both fields empty
3. Click Reset Password

**Expected:** Alert shows "Password Diperlukan"

---

## Test Case 5: Navigation Flow

### Steps:
1. Login screen → Click "Forgot Password?"
2. Forgot Password screen → Click Back button
3. Login screen → Click "Forgot Password?" again
4. Forgot Password screen → Click "Kembali ke Login"

### Expected Results:
- ✅ All navigation works smoothly
- ✅ Back button returns to previous screen
- ✅ "Kembali ke Login" navigates to Login screen

---

## Test Case 6: UI/UX Testing

### Things to verify:
- ✅ All text is in Indonesian
- ✅ Dark theme is consistent across screens
- ✅ Input fields have proper borders and styling
- ✅ Buttons have correct colors (primary green/teal)
- ✅ Loading states show spinner on buttons
- ✅ Text is readable and properly sized
- ✅ Spacing and padding look correct
- ✅ Eye icons work for password visibility
- ✅ Password requirements are displayed on Reset screen

---

## Test Case 7: Deep Linking (Manual)

If email doesn't work, you can test deep linking manually:

### Android:
```bash
npx uri-scheme open "cashflowly://reset-password" --android
```

### iOS:
```bash
npx uri-scheme open "cashflowly://reset-password" --ios
```

### Expected:
- ✅ App opens to Reset Password screen

---

## Test Case 8: Edge Cases

### Test 8A: Unregistered Email
**Steps:**
1. Enter email that's not in the system
2. Request password reset

**Expected:** Supabase may send email anyway (for security - don't reveal if email exists)

---

### Test 8B: Multiple Reset Requests
**Steps:**
1. Request password reset
2. Immediately request another reset for same email

**Expected:** Both emails should be sent (Supabase handles rate limiting)

---

### Test 8C: Expired Reset Link
**Steps:**
1. Request password reset
2. Wait for link to expire (usually 1 hour)
3. Try to use the link

**Expected:** May show "Invalid session" or similar error

---

## Debugging Tips

### View Console Logs
Check for errors in the Expo dev tools or console:
- "Forgot Password Error" - Issue with sending email
- "Reset Password Error" - Issue with updating password

### Check Supabase Dashboard
1. **Auth Logs**: See all authentication events
2. **Email Logs**: View sent emails and their content
3. **Users**: Verify user exists and email is correct

### Deep Link Testing
If deep linking doesn't work:
1. Verify `scheme: "cashflowly"` in `app.json`
2. Rebuild the app: `npm run android` or `npm run ios`
3. Check intent filters in `app.json` (Android)
4. Test with `npx uri-scheme` commands above

### Email Not Received
1. Check spam/junk folder
2. Check Supabase email logs
3. Verify email provider is configured
4. Check that email address is valid in Supabase Users table

---

## Automated Testing (Future Enhancement)

Consider adding these automated tests:

```typescript
// Example test structure
describe('Forgot Password Flow', () => {
  it('should navigate to forgot password screen', () => {});
  it('should validate email input', () => {});
  it('should send reset email', () => {});
  it('should show success message', () => {});
});

describe('Reset Password Flow', () => {
  it('should validate password length', () => {});
  it('should validate password match', () => {});
  it('should update password', () => {});
  it('should navigate to login', () => {});
});
```

---

## Sign-off Checklist

Before marking this feature as complete:

- [ ] All happy path tests pass
- [ ] All validation tests pass
- [ ] Deep linking works on target devices
- [ ] Email delivery is working
- [ ] UI looks correct on different screen sizes
- [ ] No console errors or warnings
- [ ] Navigation flow is smooth
- [ ] Passwords can be successfully reset
- [ ] Can login with new password after reset
- [ ] Documentation is complete

---

## Test Results Template

Use this template to record your test results:

```
Date: _____________
Tester: _____________
Device: _____________
OS: _____________

Test Case 1 (Happy Path): ☐ PASS ☐ FAIL
Notes: _______________

Test Case 2 (Invalid Email): ☐ PASS ☐ FAIL
Notes: _______________

Test Case 3 (Reset from Email): ☐ PASS ☐ FAIL
Notes: _______________

Test Case 4 (Validation): ☐ PASS ☐ FAIL
Notes: _______________

Test Case 5 (Navigation): ☐ PASS ☐ FAIL
Notes: _______________

Test Case 6 (UI/UX): ☐ PASS ☐ FAIL
Notes: _______________

Overall Status: ☐ APPROVED ☐ NEEDS WORK
```

---

## Support

If you encounter issues during testing:

1. Check the troubleshooting section in `FORGOT_PASSWORD_IMPLEMENTATION.md`
2. Review Supabase configuration in `SUPABASE_PASSWORD_RESET_CONFIG.md`
3. Check console logs for specific error messages
4. Verify all configuration steps are completed
