# Forgot Password & Reset Password Implementation

## Overview

This implementation provides a complete forgot password and reset password flow using Supabase Auth.

## Features

1. **Forgot Password Screen** - Users can request a password reset email
2. **Reset Password Screen** - Users can set a new password after clicking the reset link
3. **Deep Linking** - Automatic navigation to reset password screen from email link
4. **Email Integration** - Uses Supabase's built-in email service

## User Flow

### Forgot Password Flow

1. User clicks "Forgot Password?" on the login screen
2. User is navigated to the Forgot Password screen
3. User enters their email address
4. User clicks "Kirim Link Reset" button
5. System sends reset email via Supabase
6. User receives confirmation alert
7. User is navigated back to login screen

### Reset Password Flow

1. User receives password reset email from Supabase
2. User clicks the reset link in the email
3. App opens via deep link to Reset Password screen
4. User enters new password and confirmation
5. System validates:
   - Both fields are filled
   - Password is at least 6 characters
   - Password and confirmation match
6. User clicks "Reset Password" button
7. System updates the password via Supabase
8. User receives success alert
9. User is navigated to login screen

## Files Modified/Created

### New Files

1. **src/screens/ForgotPasswordScreen.tsx**
   - Screen for entering email to receive reset link
   - Validates email input
   - Shows success/error alerts

2. **src/screens/ResetPasswordScreen.tsx**
   - Screen for setting new password
   - Password visibility toggle
   - Password validation
   - Confirmation matching

### Modified Files

1. **src/hooks/useAuth.ts**
   - Added `forgotPassword(email: string)` method
   - Added `resetPassword(newPassword: string)` method
   - Both methods return `{ success: boolean, error?: string }`

2. **src/screens/AuthScreen.tsx**
   - Made "Forgot Password?" text clickable
   - Navigates to ForgotPassword screen

3. **src/navigation/RootNavigation.tsx**
   - Added ForgotPassword screen to stack
   - Added ResetPassword screen to stack

4. **src/types/navigation.d.ts**
   - Added ForgotPassword route type
   - Added ResetPassword route type

5. **App.tsx**
   - Added deep linking configuration
   - Configured URL schemes for password reset

## Configuration

### Supabase Setup

The implementation uses Supabase's email service. Make sure your Supabase project has:

1. **Email Templates** configured (Supabase handles this automatically)
2. **Email Provider** set up in Supabase dashboard
3. **Redirect URL** configured to use `cashflowly://reset-password`

### Deep Linking

The app is configured to handle these URL schemes:
- `cashflowly://reset-password` - App scheme
- `https://ehlascpnadaraaltoopa.supabase.co` - Supabase callback URL

### Email Configuration

When a user requests a password reset, Supabase will send an email with a link like:
```
cashflowly://reset-password?access_token=...&refresh_token=...
```

The app will automatically:
1. Open via deep link
2. Navigate to ResetPassword screen
3. Supabase SDK will authenticate the user using the tokens
4. User can set new password

## Usage

### Request Password Reset

```typescript
const { forgotPassword, loading } = useAuth();

const handleForgotPassword = async () => {
  const result = await forgotPassword(email);
  if (result.success) {
    // Email sent successfully
  }
};
```

### Reset Password

```typescript
const { resetPassword, loading } = useAuth();

const handleResetPassword = async () => {
  const result = await resetPassword(newPassword);
  if (result.success) {
    // Password updated successfully
  }
};
```

## Security Features

1. **Email Verification** - Reset link is sent to the user's registered email
2. **Token-Based** - Uses secure tokens in the reset URL
3. **Session Management** - Supabase handles session creation after reset
4. **Password Requirements** - Minimum 6 characters enforced
5. **Password Confirmation** - Must match to proceed

## UI/UX Features

1. **Loading States** - Buttons show loading indicator during API calls
2. **Password Visibility Toggle** - Eye icon to show/hide passwords
3. **Validation Messages** - Clear error messages for invalid inputs
4. **Success Confirmations** - Alerts confirm successful actions
5. **Navigation Flow** - Seamless navigation between screens
6. **Dark Mode** - Consistent with app's dark theme

## Testing

### Test Forgot Password Flow

1. Go to Login screen
2. Click "Forgot Password?"
3. Enter a registered email address
4. Click "Kirim Link Reset"
5. Check email inbox (or Supabase logs in development)
6. Verify success alert appears

### Test Reset Password Flow

1. Receive reset email from Supabase
2. Click the reset link in the email
3. App should open to Reset Password screen
4. Try entering:
   - Password less than 6 characters (should fail)
   - Non-matching passwords (should fail)
   - Valid matching passwords (should succeed)
5. Verify you can login with new password

## Troubleshooting

### Email Not Received

1. Check Supabase email logs in dashboard
2. Check spam folder
3. Verify email provider is configured in Supabase
4. Check Supabase email templates are enabled

### Deep Link Not Working

1. Verify `scheme` is set to "cashflowly" in `app.json`
2. Rebuild the app after changing deep link config
3. Check the redirect URL in `useAuth.ts` matches the scheme
4. On Android, verify intent filters are correct in `app.json`

### Password Reset Fails

1. Check if user is authenticated (tokens in URL)
2. Verify Supabase connection is working
3. Check password meets minimum requirements
4. Check console for error messages

## Future Enhancements

Potential improvements:
1. Add password strength indicator
2. Add "resend email" functionality
3. Add rate limiting for reset requests
4. Add custom email templates
5. Add password requirements display
6. Add biometric authentication option after reset
