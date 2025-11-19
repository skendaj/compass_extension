# TSID OAuth Configuration Required

## Current Problem

The extension is trying to use these placeholder URLs which don't exist:

```typescript
TSID_AUTH_URL = 'https://id.teamsystem.com/auth/login'
TSID_TOKEN_URL = 'https://id.teamsystem.com/token'
TSID_USER_URL = 'https://id.teamsystem.com/userinfo'
CLIENT_ID = 'navify-extension'
```

**Error:** `Authorization page could not be loaded`

## What You Need

Contact your TSID administrator or check the OneFront documentation to get:

### 1. OAuth Authorization URL
The endpoint where users log in with TSID credentials.

**Common patterns:**
- `https://auth.teamsystem.com/oauth/authorize`
- `https://login.teamsystem.com/oauth2/authorize`
- `https://sso.teamsystem.com/connect/authorize`
- `https://id-dev.teamsystem.com/oauth/authorize` (development)
- Or check your OneFront Proxy Service documentation

### 2. User Info Endpoint
The endpoint to get user profile data after authentication.

**Common patterns:**
- `https://auth.teamsystem.com/oauth/userinfo`
- `https://login.teamsystem.com/oauth2/userinfo`
- `https://sso.teamsystem.com/connect/userinfo`
- Or use OneFront's user info endpoint

### 3. Client ID
Your registered OAuth client ID for this extension.

**Steps to get it:**
1. Register your Chrome extension as an OAuth client
2. Provide redirect URI: `chrome-extension://YOUR_EXTENSION_ID/`
3. Request scopes: `openid`, `profile`, `email`
4. Receive your `client_id`

**To find your extension ID:**
```
1. Go to chrome://extensions/
2. Enable Developer Mode
3. Find "TeamSystem Navify"
4. Copy the ID (e.g., "abcdefghijklmnopqrstuvwxyz")
```

## How to Update

Once you have the real values, update `src/services/authService.ts`:

```typescript
class AuthService {
  // Replace these with your actual TSID endpoints:
  private readonly TSID_AUTH_URL = 'YOUR_ACTUAL_AUTH_URL';
  private readonly TSID_TOKEN_URL = 'YOUR_ACTUAL_TOKEN_URL'; // May not be needed for implicit flow
  private readonly TSID_USER_URL = 'YOUR_ACTUAL_USERINFO_URL';
  private readonly CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID';
```

Then rebuild:
```bash
npm run build
```

## OneFront Integration

Based on your OneFront documentation, you might be able to use:

### Option A: Use OneFront's Proxy Service
If you're using `@1f/react-sdk`:

```typescript
import { useProxy } from "@1f/react-sdk";

// In your component
const { createTargetUrl } = useProxy();
```

This might provide the TSID endpoints automatically.

### Option B: Use OneFront LoginPage Component
The docs show a `LoginPage` component from `@1f/react-sdk`:

```typescript
import { LoginPage } from "@1f/react-sdk";

<LoginPage
  appName="TeamSystem Navify"
  loginButtonLabel="Sign In"
  logo="path/to/logo.png"
  cookiePolicyUrl="cookie-policy-url"
  privacyPolicyUrl="privacy-policy-url"
/>
```

This component might handle OAuth automatically if properly configured.

## Questions to Ask Your TSID Admin

1. What is the TSID OAuth authorization endpoint?
2. What is the userinfo endpoint?
3. How do I register a Chrome extension as an OAuth client?
4. What client_id should I use?
5. Does TSID support the implicit OAuth flow (response_type=token)?
6. Are there OneFront SDK endpoints I should use instead?

## Temporary Workaround (Testing Only)

To test the extension without OAuth while you wait for credentials:

**In browser console:**
```javascript
chrome.storage.local.set({
  authToken: 'test-token',
  tokenExpiry: Date.now() + 3600000,
  user: { 
    id: '1', 
    email: 'your.email@teamsystem.com', 
    name: 'Your Name' 
  }
}, () => window.location.reload());
```

**Or comment out auth check in `src/App.tsx` (lines 163-165):**
```typescript
// if (!isAuthenticated) {
//   return <LoginPage appName="TeamSystem Navify" />;
// }
```

## Next Steps

1. ✅ Get TSID OAuth endpoints from administrator
2. ✅ Register extension as OAuth client
3. ✅ Update `src/services/authService.ts` with real values
4. ✅ Rebuild extension: `npm run build`
5. ✅ Reload extension in Chrome
6. ✅ Test login flow

---

**Current Status:** ⚠️ OAuth not configured - using placeholder URLs

**Last Updated:** November 19, 2024

