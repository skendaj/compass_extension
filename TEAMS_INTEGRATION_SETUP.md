# Microsoft Teams Integration Setup Guide

This guide will help you set up the Microsoft Teams integration to automatically retrieve and summarize chat conversations with experts.

## Overview

The Teams integration allows you to:
- ✅ Retrieve chat history with experts after contacting them
- ✅ Automatically summarize conversations
- ✅ Extract key topics, action items, and resolutions
- ✅ Save successful resolutions as knowledge entries
- ✅ Build your team's knowledge base automatically

---

## Prerequisites

- Microsoft 365 account with Teams access
- Azure AD tenant admin access (for app registration)
- Chrome extension installed and configured

---

## Step 1: Register App in Azure AD

### 1.1 Access Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your admin account
3. Navigate to **Azure Active Directory**
4. Click **App registrations** in the left menu
5. Click **+ New registration**

### 1.2 Register Your Application

Fill in the registration form:

- **Name**: `TeamSystem Navify Extension`
- **Supported account types**: 
  - Select "Accounts in this organizational directory only (Single tenant)"
- **Redirect URI**: 
  - Platform: `Web`
  - URI: `https://[your-extension-id].chromiumapp.org/`
  
  > **Note**: You can find your extension ID in `chrome://extensions/` when you load your extension

Click **Register**

### 1.3 Copy Application IDs

After registration, you'll see the **Overview** page. Copy these values:

- **Application (client) ID**: e.g., `12345678-1234-1234-1234-123456789abc`
- **Directory (tenant) ID**: e.g., `87654321-4321-4321-4321-cba987654321`

**Save these values** - you'll need them for configuration.

---

## Step 2: Configure API Permissions

### 2.1 Add Microsoft Graph Permissions

1. In your app registration, click **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**

### 2.2 Add Required Permissions

Search for and add these permissions:

| Permission | Type | Description |
|---|---|---|
| `Chat.Read` | Delegated | Read user chat messages |
| `Chat.ReadWrite` | Delegated | Read and write user chat messages |
| `ChatMessage.Read` | Delegated | Read user chat messages |
| `User.Read` | Delegated | Sign in and read user profile |

### 2.3 Grant Admin Consent

1. Click **Grant admin consent for [Your Organization]**
2. Click **Yes** to confirm
3. Verify all permissions show "Granted for [Your Organization]"

---

## Step 3: Configure Authentication

### 3.1 Set Redirect URIs

1. Click **Authentication** in the left menu
2. Under **Platform configurations**, click **Add a platform**
3. Select **Web**
4. Add redirect URI:
   ```
   https://[your-extension-id].chromiumapp.org/
   ```
5. Check these boxes:
   - ✅ **Access tokens** (used for implicit flows)
   - ✅ **ID tokens** (used for implicit flows)

### 3.2 Configure Implicit Grant

Under **Implicit grant and hybrid flows**:
- ✅ Check **Access tokens**
- ✅ Check **ID tokens**

Click **Save**

---

## Step 4: Update Extension Manifest

### 4.1 Add Permissions to manifest.json

Add these permissions to your `manifest.json`:

```json
{
  "permissions": [
    "identity",
    "storage",
    "https://graph.microsoft.com/*",
    "https://login.microsoftonline.com/*"
  ],
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID_HERE",
    "scopes": [
      "https://graph.microsoft.com/Chat.Read",
      "https://graph.microsoft.com/Chat.ReadWrite",
      "https://graph.microsoft.com/ChatMessage.Read",
      "https://graph.microsoft.com/User.Read"
    ]
  }
}
```

Replace `YOUR_CLIENT_ID_HERE` with your Application (client) ID from Step 1.3.

---

## Step 5: Configure Extension Settings

### 5.1 Open Extension Settings

1. Open the TeamSystem Navify extension
2. Click **Settings** tab
3. Scroll to **Microsoft Teams Integration**

### 5.2 Enter Configuration

Fill in these fields:

- **Client ID**: Your Application (client) ID
- **Tenant ID**: Your Directory (tenant) ID  
- **Redirect URI**: `https://[your-extension-id].chromiumapp.org/`

Click **Save Teams Configuration**

### 5.3 Test Connection

1. Click **Test Teams Connection**
2. You'll be redirected to Microsoft login
3. Sign in with your Microsoft 365 account
4. Grant the requested permissions
5. You should be redirected back with success message

---

## Step 6: Using the Integration

### 6.1 Contact an Expert

1. Search for help in the extension
2. View expert recommendations
3. Click **Teams Chat** to start a conversation
4. Discuss your problem with the expert

### 6.2 Retrieve Chat Summary

After your conversation:

1. Click **Get Chat Summary** button on the expert card
2. Wait for the summary to be generated
3. Review the summary:
   - **Messages exchanged**
   - **Key topics discussed**
   - **Action items identified**
   - **Resolution status**

### 6.3 Save as Knowledge Entry

If the conversation was helpful:

1. Review the chat summary
2. Click **Save as Knowledge Entry**
3. The conversation will be added to your knowledge base
4. Future users can find this solution

---

## How It Works

### Architecture

```
Extension → Microsoft Graph API → Teams Chats → Summary → Knowledge Base
```

### Process Flow

1. **User contacts expert** via Teams
2. **Chat happens** in Microsoft Teams
3. **User clicks "Get Chat Summary"**
4. **Extension authenticates** with Microsoft Graph
5. **Retrieves chat messages** from Teams
6. **Analyzes conversation**:
   - Extracts key topics
   - Identifies action items
   - Detects resolution
   - Generates summary
7. **Displays summary** to user
8. **Optionally saves** as knowledge entry

### What Gets Analyzed

- ✅ **Message content** - What was discussed
- ✅ **Technical terms** - APIs, databases, errors, etc.
- ✅ **Action items** - TODOs, tasks, follow-ups
- ✅ **Questions asked** - What the user needed help with
- ✅ **Resolution indicators** - "solved", "fixed", "working now"
- ✅ **Code snippets** - Technical solutions shared
- ✅ **Links shared** - Documentation, resources

---

## Troubleshooting

### Authentication Failed

**Problem**: "Authentication failed. Please try again."

**Solutions**:
1. Verify Client ID and Tenant ID are correct
2. Check redirect URI matches extension ID
3. Ensure permissions are granted in Azure AD
4. Try clearing extension storage and re-authenticating
5. Check browser console for detailed errors

### No Chat Found

**Problem**: "No chat found with this user or no messages available"

**Possible Causes**:
1. You haven't chatted with this user yet
2. Chat history is too old (older than retention period)
3. User email doesn't match Teams account
4. Chat was deleted

**Solutions**:
1. Ensure you've had a Teams chat conversation
2. Verify the expert's email is correct
3. Check in Teams app that conversation exists

### Permission Denied

**Problem**: "Graph API request failed: 403 Forbidden"

**Solutions**:
1. Verify all permissions are granted in Azure AD
2. Check admin consent was provided
3. Ensure user has Teams access
4. Try re-authenticating

### Token Expired

**Problem**: "Authentication expired. Please re-authenticate."

**Solution**:
1. Click **Get Chat Summary** again
2. You'll be prompted to re-authenticate
3. Sign in again to get a new token

---

## API Limits and Quotas

### Microsoft Graph API Limits

| Operation | Limit |
|---|---|
| API calls per user | 2,000 per 10 minutes |
| Chat messages retrieved | Up to 50 per request |
| Token expiration | 1 hour (automatic refresh) |

### Best Practices

1. **Don't spam the button** - Wait for summary to load
2. **Retrieve summaries periodically** - Not after every message
3. **Cache summaries** - Don't re-fetch the same conversation
4. **Batch operations** - If getting multiple summaries

---

## Security Best Practices

### Token Management

- ✅ Tokens are stored securely in Chrome storage
- ✅ Tokens are NOT synced across devices
- ✅ Tokens expire after 1 hour
- ✅ Refresh tokens are not used (user must re-auth)

### Data Privacy

- ✅ Chat messages are processed locally
- ✅ No data is sent to external servers
- ✅ Summaries are stored locally only
- ✅ Users control what gets saved as knowledge

### Access Control

- ✅ Only users can access their own chats
- ✅ Permissions follow Teams access rules
- ✅ Admin consent required for organization
- ✅ Users can revoke access anytime

---

## FAQ

**Q: Can I retrieve chats from any Teams conversation?**  
A: Only one-on-one chats with experts you've contacted through the extension. Group chats are not supported yet.

**Q: How far back can I retrieve chat history?**  
A: The extension retrieves up to 50 recent messages. For older conversations, you may see partial history.

**Q: Will the expert know I'm retrieving our chat?**  
A: No, retrieving chat history is a read-only operation. The expert is not notified.

**Q: Can I edit the summary before saving?**  
A: Currently, summaries are auto-generated. Manual editing will be added in a future version.

**Q: What if the summary is inaccurate?**  
A: The AI-based extraction is not perfect. Review summaries before saving them as knowledge entries.

**Q: Can I delete saved chat summaries?**  
A: Yes, chat summaries saved as knowledge entries can be deleted from the knowledge base.

**Q: Does this work with external users?**  
A: Only for users within your organization. External Teams users are not supported.

**Q: Can admins access all chat summaries?**  
A: No, chat summaries are stored locally on each user's device. Admins cannot access them.

---

## Advanced Configuration

### Custom Summary Rules

You can customize how summaries are generated by modifying:

**Action Keywords** (in `teamsIntegration.ts`):
```typescript
const actionKeywords = [
  "todo", "task", "action item", 
  "need to", "should", "must"
];
```

**Technical Terms** (for topic extraction):
```typescript
const technicalTerms = [
  "api", "database", "server", 
  "deployment", "bug", "error"
];
```

### Integration with AI Services

For better summaries, you can integrate with AI services:

1. **OpenAI GPT** - For natural language summaries
2. **Azure Cognitive Services** - For sentiment analysis
3. **Custom ML models** - For domain-specific extraction

---

## Support Resources

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/api/overview)
- [Teams Chat API Reference](https://learn.microsoft.com/en-us/graph/api/resources/chat)
- [Azure AD App Registration Guide](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Chrome Extension Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)

---

## Changelog

### Version 1.0.0
- Initial Teams integration release
- Chat message retrieval
- Automatic summarization
- Knowledge entry creation

---

**Last Updated**: 2024  
**Version**: 1.0.0
