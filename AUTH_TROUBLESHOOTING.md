# Authentication Troubleshooting Guide

## "Authorization page could not be loaded" Error

This error occurs when `chrome.identity.launchWebAuthFlow()` cannot load the authorization URL. Here are the most common causes and solutions:

### 1. Invalid or Unreachable OAuth Endpoint

**Problem**: The TSID authorization URL doesn't exist or is not accessible.

**Check the logs:**
```
🔗 [AuthService] Authorization URL: https://id.teamsystem.com/auth/login?...
❌ [AuthService] Login error: Authorization page could not be loaded
```

**Solutions:**

a. **Verify the URL is correct:**
   - Open `src/services/authService.ts`
   - Check that `TSID_AUTH_URL` points to a valid TSID endpoint
   - Try opening the URL in a regular browser tab to verify it loads

b. **Test the endpoint manually:**
   ```bash
   curl -I https://id.teamsystem.com/auth/login
   ```
   Should return 200 OK or a redirect, not 404/500

c. **Update to correct endpoint:**
   ```typescript
   // Replace with your actual TSID endpoint
   private readonly TSID_AUTH_URL = 'https://your-actual-tsid-url.com/oauth/authorize';
   ```

### 2. Network/CORS Issues

**Problem**: Extension cannot reach the OAuth server due to network restrictions or CORS policies.

**Check the logs:**
```
🚀 [AuthService] Launching web auth flow...
❌ [AuthService] Login error: net::ERR_NAME_NOT_RESOLVED
```

**Solutions:**

a. **Check network connectivity:**
   - Verify you can reach the TSID server
   - Check if you're behind a VPN/firewall

b. **Verify DNS resolution:**
   ```bash
   nslookup id.teamsystem.com
   ```

c. **Add host permissions to manifest.json:**
   ```json
   {
     "host_permissions": [
       "https://id.teamsystem.com/*",
       "https://your-tsid-domain.com/*"
     ]
   }
   ```

### 3. OAuth Client Not Registered

**Problem**: The client_id is not registered with TSID or redirect URI doesn't match.

**Check the logs:**
```
📋 [AuthService] OAuth Parameters: {
  client_id: 'navify-extension',
  redirect_uri: 'chrome-extension://abcdefg...',
  ...
}
❌ Error: invalid_client or unauthorized_client
```

**Solutions:**

a. **Register your extension as an OAuth client:**
   - Contact TSID administrator
   - Provide your extension ID
   - Request registration of redirect URI

b. **Get your extension ID:**
   ```
   1. Go to chrome://extensions/
   2. Enable Developer Mode
   3. Find "TeamSystem Navify"
   4. Copy the ID (e.g., "abcdefghijklmnopqrstuvwxyz")
   ```

c. **Register redirect URI:**
   ```
   chrome-extension://YOUR_EXTENSION_ID/
   ```
   Note: Must end with `/`

d. **Update CLIENT_ID in authService.ts:**
   ```typescript
   private readonly CLIENT_ID = 'your-actual-client-id';
   ```

### 4. Incorrect OAuth Flow Configuration

**Problem**: Wrong OAuth flow type or missing required parameters.

**Check the logs:**
```
📋 [AuthService] OAuth Parameters: {
  response_type: 'token',  // Implicit flow
  scope: 'openid profile email'
}
```

**Solutions:**

a. **If TSID requires Authorization Code flow instead of Implicit:**
   ```typescript
   // In authService.ts, change response_type
   authUrl.searchParams.set('response_type', 'code'); // Not 'token'
   ```
   Note: This requires additional backend support

b. **Check required scopes:**
   ```typescript
   // Ensure scopes match what TSID expects
   authUrl.searchParams.set('scope', 'openid profile email');
   ```

c. **Add additional required parameters:**
   ```typescript
   // Some OAuth servers require these
   authUrl.searchParams.set('state', generateRandomState());
   authUrl.searchParams.set('nonce', generateRandomNonce());
   ```

### 5. Missing Manifest Permissions

**Problem**: Extension doesn't have required permissions.

**Check manifest.json:**
```json
{
  "permissions": [
    "identity",  // REQUIRED for OAuth
    "storage"
  ]
}
```

**Solution:**
- Ensure `"identity"` permission is present
- Reload extension after adding permissions

### 6. Development vs Production Environment

**Problem**: Using wrong environment URLs.

**Solutions:**

a. **For Development/Testing:**
   ```typescript
   // Use development TSID endpoint
   private readonly TSID_AUTH_URL = 'https://id-dev.teamsystem.com/auth/login';
   ```

b. **For Production:**
   ```typescript
   // Use production TSID endpoint
   private readonly TSID_AUTH_URL = 'https://id.teamsystem.com/auth/login';
   ```

---

## How to Debug

### Step 1: Open Browser Console

1. Open extension popup
2. Right-click anywhere → "Inspect"
3. Go to Console tab
4. Clear console
5. Click "Sign In with TS ID"
6. Watch for log messages

### Step 2: Look for Key Log Messages

#### **Successful Flow:**
```
🔐 [LoginPage] User clicked Sign In button
🚀 [LoginPage] Calling authService.login()...
🔐 [AuthService] Starting login flow...
📍 [AuthService] Redirect URI: chrome-extension://...
🔗 [AuthService] Authorization URL: https://...
📋 [AuthService] OAuth Parameters: { ... }
🚀 [AuthService] Launching web auth flow...
✅ [AuthService] Received response URL: chrome-extension://...#access_token=...
🔍 [AuthService] Parsing token from response...
✅ [AuthService] Token parsed successfully
👤 [AuthService] Fetching user profile...
✅ [AuthService] User profile retrieved
💾 [AuthService] Storing auth data...
✅ [AuthService] Auth data stored successfully
```

#### **Failed Flow - Look for:**
```
❌ [AuthService] Login error: Authorization page could not be loaded
📋 [AuthService] Error details: { ... }
```

### Step 3: Check Background Service Worker

1. Go to `chrome://extensions/`
2. Find "TeamSystem Navify"
3. Click "service worker" link
4. Check for errors

### Step 4: Verify Storage

In the console, run:
```javascript
chrome.storage.local.get(null, (data) => console.log('Storage:', data));
```

Should show:
```javascript
{
  authToken: "...",
  tokenExpiry: 1234567890,
  user: { id: "...", email: "...", name: "..." }
}
```

---

## Common Log Patterns and What They Mean

### Pattern 1: URL Not Loading
```
🔗 [AuthService] Authorization URL: https://id.teamsystem.com/auth/login
🚀 [AuthService] Launching web auth flow...
❌ [AuthService] Login error: Authorization page could not be loaded
```
**Cause**: URL is invalid or unreachable  
**Fix**: Verify TSID_AUTH_URL is correct

### Pattern 2: Invalid Client
```
✅ [AuthService] Received response URL: ...error=invalid_client
```
**Cause**: client_id not registered  
**Fix**: Register OAuth client with TSID

### Pattern 3: Access Denied
```
✅ [AuthService] Received response URL: ...error=access_denied
```
**Cause**: User denied permission or lacks access  
**Fix**: Check user permissions in TSID

### Pattern 4: No Token in Response
```
✅ [AuthService] Received response URL: chrome-extension://...
❌ [AuthService] No access_token found in response
```
**Cause**: OAuth flow returned without token  
**Fix**: Check response_type and OAuth configuration

### Pattern 5: User Profile Failed
```
✅ [AuthService] Token parsed successfully
👤 [AuthService] Fetching user profile from: https://...
❌ [AuthService] Failed to fetch user profile: 401
```
**Cause**: Invalid token or wrong userinfo endpoint  
**Fix**: Verify TSID_USER_URL and token validity

---

## Quick Fixes

### Fix 1: Bypass Auth for Testing

Temporarily disable auth check in `src/App.tsx`:

```typescript
// Comment out these lines (163-165):
// if (!isAuthenticated) {
//   return <LoginPage appName="TeamSystem Navify" />;
// }
```

### Fix 2: Set Fake Auth Token

In console:
```javascript
chrome.storage.local.set({
  authToken: 'test-token',
  tokenExpiry: Date.now() + 3600000,
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  }
}, () => {
  console.log('Fake auth set');
  window.location.reload();
});
```

### Fix 3: Clear All Auth Data

In console:
```javascript
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
  window.location.reload();
});
```

---

## Still Having Issues?

### Collect Debug Information

Run this in console and share output:

```javascript
console.log('=== DEBUG INFO ===');
console.log('Extension ID:', chrome.runtime.id);
console.log('Redirect URI:', chrome.identity.getRedirectURL());

chrome.storage.local.get(null, (data) => {
  console.log('Storage:', {
    has_token: !!data.authToken,
    has_user: !!data.user,
    user: data.user
  });
});

// Test network connectivity
fetch('https://id.teamsystem.com/auth/login', { mode: 'no-cors' })
  .then(() => console.log('Network: Reachable'))
  .catch(e => console.log('Network Error:', e));
```

### Contact TSID Support

Provide:
1. Extension ID
2. Redirect URI
3. Client ID being used
4. Full console logs (with errors)
5. Network tab showing failed requests

---

## Configuration Checklist

Before deploying, verify:

- [ ] TSID_AUTH_URL is correct and reachable
- [ ] TSID_TOKEN_URL is correct (if using code flow)
- [ ] TSID_USER_URL is correct and reachable
- [ ] CLIENT_ID is registered with TSID
- [ ] Redirect URI is registered: `chrome-extension://YOUR_ID/`
- [ ] Required scopes are enabled in TSID
- [ ] `identity` permission is in manifest.json
- [ ] Extension can reach TSID servers (no firewall blocks)
- [ ] OAuth flow type matches TSID requirements

---

**Last Updated**: November 19, 2024

