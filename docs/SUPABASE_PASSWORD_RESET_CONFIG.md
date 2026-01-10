# Supabase Configuration for Password Reset

## Required Supabase Dashboard Configuration

To enable the forgot password and reset password functionality, you need to configure the following in your Supabase dashboard:

### 1. Email Auth Settings

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Enable **Email** provider if not already enabled
3. Disable **Confirm email** if you want users to be able to reset password without email confirmation

### 2. Email Templates

Supabase provides default email templates. You can customize them:

1. Go to **Authentication** → **Email Templates**
2. Find **Reset Password** template
3. Customize the template if needed (optional)
4. Make sure the magic link URL uses the redirect URL

### 3. Redirect URLs

**IMPORTANT:** Add the following redirect URLs to your Supabase project:

1. Go to **Authentication** → **URL Configuration**
2. In **Redirect URLs**, add:
   ```
   cashflowly://reset-password
   ```

This allows Supabase to redirect users back to your app after they click the reset link.

### 4. Site URL (Optional)

Set your site URL if you haven't already:
- For development: `http://localhost:8081` or your Expo dev URL
- For production: Your actual app URL

## Testing in Development

### Using Supabase Email Logs

During development, you can view sent emails:

1. Go to **Authentication** → **Logs**
2. Look for email events
3. Copy the reset URL from the logs
4. Paste it in your browser or app

### Testing with Real Email

1. Make sure you have a valid email provider configured
2. Use a real email address during testing
3. Check your inbox for the reset email

## Environment Variables

Make sure your `.env.development` and `.env.production` files have:

```env
EXPO_PUBLIC_SUPABASE_URL=https://ehlascpnadaraaltoopa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Verification Checklist

- [ ] Email provider is enabled in Supabase
- [ ] Reset password email template is configured
- [ ] Redirect URL `cashflowly://reset-password` is added to allowed URLs
- [ ] Environment variables are set correctly
- [ ] App scheme `cashflowly` is configured in `app.json`
- [ ] Deep linking configuration is added to `App.tsx`

## Common Issues

### Issue: "Invalid redirect URL"
**Solution:** Make sure `cashflowly://reset-password` is added to the Redirect URLs in Supabase dashboard.

### Issue: Email not received
**Solution:** 
- Check Supabase email logs
- Verify email provider is configured
- Check spam folder
- Ensure email is confirmed in Supabase if "Confirm email" is enabled

### Issue: Deep link doesn't open app
**Solution:**
- Rebuild the app after changing `app.json`
- On Android, make sure intent filters are correct
- Test with `npx uri-scheme open cashflowly://reset-password --android` (Android)
- Test with `npx uri-scheme open cashflowly://reset-password --ios` (iOS)

### Issue: Password update fails
**Solution:**
- Check if user session is valid (tokens from email link)
- Verify password meets minimum requirements (6 characters)
- Check Supabase Auth logs for error details

## Production Deployment

Before deploying to production:

1. **Configure production redirect URLs** in Supabase
2. **Set up custom SMTP** (optional) for better email deliverability
3. **Test the entire flow** with real email addresses
4. **Configure custom domain** (optional) for professional emails
5. **Review email templates** and customize branding
6. **Set rate limits** (optional) to prevent abuse

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Auth](https://supabase.com/docs/guides/auth/auth-email)
- [React Native Deep Linking](https://reactnative.dev/docs/linking)
- [Expo Linking](https://docs.expo.dev/guides/linking/)
