# Authentication Setup Guide

## Overview

The TeamSystem Navify extension now includes **TSID (TeamSystem ID)** authentication. Users must sign in with their TeamSystem credentials before accessing the knowledge base.

## Architecture

### Components

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - React context provider for authentication state
   - Manages user session and authentication status
   - Provides `login`, `logout`, and `isAuthenticated` state

2. **AuthService** (`src/services/authService.ts`)
   - Handles OAuth 2.0 flow with TSID
   - Manages token retrieval and validation
   - Stores auth tokens in Chrome storage

3. **LoginPage** (`src/components/LoginPage.tsx`)
   - Full-page login interface
   - Branded with Navify design system
   - Shows error messages and loading states

### Authentication Flow

```
┌─────────────┐
│   App.tsx   │
│   Checks    │
│    Auth     │
└──────┬──────┘
       │
       ├── Not Authenticated
       │   └── Show LoginPage
       │       └── Click "Sign In with TS ID"
       │           └── Launch TSID OAuth Flow
       │               └── chrome.identity.launchWebAuthFlow()
       │                   └── User logs in on TSID page
       │                       └── Redirect with token
       │                           └── Store token & user data
       │                               └── Reload app
       │
       └── Authenticated
           └── Show Main App
               └── Display user name
               └── Show logout button
```

## Configuration

### 1. Manifest Permissions

The extension requires these permissions in `manifest.json`:

```json
{
  "permissions": [
    "identity",
    "storage",
    "activeTab",
    "tabs"
  ],
  "oauth2": {
    "client_id": "navify-extension",
    "scopes": ["openid", "profile", "email"]
  }
}
```

### 2. TSID Endpoints

Update these URLs in `src/services/authService.ts` to match your TSID environment:

```typescript
private readonly TSID_AUTH_URL = 'https://id.teamsystem.com/auth/login';
private readonly TSID_TOKEN_URL = 'https://id.teamsystem.com/token';
private readonly TSID_USER_URL = 'https://id.teamsystem.com/userinfo';
private readonly CLIENT_ID = 'navify-extension'; // Your actual client ID
```

### 3. OAuth Client Registration

**You must register your extension as an OAuth client with TSID:**

1. Contact your TSID administrator
2. Provide the redirect URI: `chrome-extension://YOUR_EXTENSION_ID/`
3. Request scopes: `openid`, `profile`, `email`
4. Obtain your `client_id`
5. Update `CLIENT_ID` in `authService.ts`

## Usage

### For Users

1. Click the Navify extension icon
2. See the login page with TeamSystem branding
3. Click "Sign In with TS ID"
4. Browser opens TSID login page
5. Enter TeamSystem credentials
6. Grant permissions (first time only)
7. Automatically redirected back to extension
8. Start using the knowledge base

### Sign Out

- Click the "Sign Out" button in the header
- Clears stored tokens and user data
- Returns to login page

## Storage

Authentication data is stored in Chrome's local storage:

```javascript
{
  authToken: string,      // OAuth access token
  tokenExpiry: number,    // Timestamp when token expires
  user: {
    id: string,
    email: string,
    name: string
  }
}
```

## Token Management

- **Automatic Expiry Check**: Tokens are validated on every app load
- **Expired Tokens**: Automatically cleared, user is logged out
- **Token Refresh**: Currently not implemented (requires refresh token support)

## Security Considerations

1. **Tokens are stored locally**: Only accessible by the extension
2. **HTTPS Only**: OAuth flow requires secure connections
3. **Token Expiry**: Tokens expire after the period set by TSID
4. **No Password Storage**: Credentials are never stored by the extension

## Customization

### Change Login Page Branding

Edit `src/components/LoginPage.tsx`:

```tsx
<LoginPage 
  appName="Your App Name"
  loginButtonLabel="Custom Button Text"
/>
```

### Modify Login Styles

Edit `src/styles/login.css` to customize:
- Colors
- Layout (split screen vs. centered)
- Logo size
- Button styles

### Add Additional User Fields

1. Update `User` interface in `src/contexts/AuthContext.tsx`
2. Modify `getUserProfile()` in `src/services/authService.ts`
3. Update UI in `src/App.tsx` to display new fields

## Troubleshooting

### "Login failed" Error

**Causes:**
- Invalid TSID credentials
- Network connectivity issues
- OAuth client not registered
- Incorrect redirect URI

**Solution:**
- Verify TSID credentials
- Check browser console for errors
- Confirm client ID and redirect URI match registration

### Token Expired Too Quickly

**Cause:** TSID token expiry is set too short

**Solution:**
- Request longer-lived tokens from TSID admin
- Implement refresh token flow (future enhancement)

### User Profile Not Loading

**Cause:** TSID userinfo endpoint not responding

**Solution:**
- Check `TSID_USER_URL` is correct
- Verify access token has `profile` scope
- Check network tab for API errors

## Development vs. Production

### Development

For testing without TSID integration:

1. Comment out auth check in `App.tsx`:
   ```tsx
   // if (!isAuthenticated) {
   //   return <LoginPage appName="TeamSystem Navify" />;
   // }
   ```

2. Or manually set auth token:
   ```javascript
   chrome.storage.local.set({
     authToken: 'test-token',
     tokenExpiry: Date.now() + 3600000,
     user: { id: '1', email: 'test@example.com', name: 'Test User' }
   });
   ```

### Production

Always enable authentication in production environments.

## Future Enhancements

- [ ] Refresh token support for long-lived sessions
- [ ] Remember device option
- [ ] Multi-factor authentication (if supported by TSID)
- [ ] Session timeout warnings
- [ ] Background token refresh
- [ ] SSO integration with other TeamSystem apps

## API Reference

### AuthContext

```tsx
const { 
  isAuthenticated,  // boolean
  isLoading,        // boolean
  user,            // User | null
  login,           // (token: string, user: User) => void
  logout           // () => void
} = useAuth();
```

### AuthService

```typescript
// Login with TSID OAuth
await authService.login();

// Check authentication status
const isAuth = await authService.isAuthenticated();

// Get current token
const token = await authService.getToken();

// Logout
await authService.logout();
```

## Support

For issues related to:
- **TSID authentication**: Contact TSID support
- **Extension functionality**: Check browser console and extension logs
- **OAuth setup**: Refer to TSID OAuth documentation

---

**Last Updated**: November 19, 2024  
**Version**: 1.0.0

