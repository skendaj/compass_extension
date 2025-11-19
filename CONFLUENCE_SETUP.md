# Confluence Integration Setup Guide

This guide will help you configure the Confluence integration in the TeamSystem Navify Chrome extension.

## Overview

The Confluence integration allows you to share knowledge entries directly to your Confluence workspace as blog posts. This makes it easy to document solutions and share them with your broader team.

## Prerequisites

- A Confluence Cloud account (Atlassian)
- Administrator or appropriate permissions to create blog posts in your space
- An Atlassian API token

## Setup Instructions

### 1. Get Your Confluence Domain

Your Confluence domain is the URL you use to access Confluence. It typically looks like:

```
your-company.atlassian.net
```

**How to find it:**

- Open your Confluence workspace in a browser
- Look at the URL in the address bar
- Copy only the domain part (e.g., `company.atlassian.net`)
- **Do not include** `https://` or `/wiki/` paths

**Example:**

- Full URL: `https://acme-corp.atlassian.net/wiki/spaces/TEAM/overview`
- Domain to use: `acme-corp.atlassian.net`

---

### 2. Generate an API Token

API tokens are used to securely authenticate with Confluence without sharing your password.

**Steps:**

1. Go to [Atlassian Account Settings - API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **"Create API token"**
3. Give it a label (e.g., "TeamSystem Navify Extension")
4. Click **"Create"**
5. **Copy the token immediately** (you won't be able to see it again)
6. Store it securely

**Important Security Notes:**

- Treat API tokens like passwords - keep them secret
- Never share your API token publicly
- You can revoke tokens at any time from the same page
- Tokens have the same permissions as your user account

---

### 3. Find Your Space Key or ID

The Space Key identifies which Confluence space the blog posts will be created in. You can use either the space key (recommended) or numeric space ID.

**Method 1: From URL (Easiest & Recommended)**

1. Navigate to your Confluence space
2. Look at the URL - it will look like:
   ```
   https://your-company.atlassian.net/wiki/spaces/TEAMSPACE/overview
   ```
3. The space key is the part after `/spaces/` (in this example: `TEAMSPACE`)
4. Use this space key in the extension settings

**Method 2: From Space Settings**

1. Navigate to your Confluence space
2. Click **"Space settings"** in the left sidebar
3. Click **"Space details"**
4. Look for the **"Space Key"** field
5. Copy the space key (e.g., "TEAM", "DEV", "PROJ")

**Note:** The extension automatically converts space keys to numeric IDs internally, so you don't need to worry about finding the numeric ID. Just use the space key!

---

### 4. Configure the Extension

1. Open the TeamSystem Navify Chrome extension
2. Click the **"Settings"** tab in the navigation
3. Fill in the configuration form:
   - **Confluence Domain**: Your domain (e.g., `company.atlassian.net`)
   - **Email**: Your Atlassian account email
   - **API Token**: The token you generated in step 2
   - **Space Key/ID**: The space key from step 3 (e.g., "TEAM")

4. Click **"Test Connection"** to verify your credentials
   - If successful, you'll see a green success message
   - If it fails, double-check your credentials

5. Click **"Save Configuration"** to store your settings

---

## Using the Integration

Once configured, you can share knowledge entries to Confluence:

1. Open any knowledge entry detail view
2. Click the **"Share"** button
3. Select **"Share to Confluence"** from the menu
4. The extension will:
   - Convert the entry to Confluence format
   - Create a new blog post in your configured space
   - Open the new blog post in your browser

---

## Troubleshooting

### Connection Test Fails

**Problem:** "Connection failed. Please check your credentials."

**Solutions:**

1. Verify your domain is correct (no `https://` or trailing slashes)
2. Confirm your email matches your Atlassian account
3. Make sure your API token is copied correctly (no extra spaces)
4. Verify the Space Key exists and you have permission to access it
5. Check that your API token hasn't been revoked
6. Ensure the space key is in uppercase if required (e.g., "TEAM" not "team")

### Blog Post Creation Fails

**Problem:** Blog post doesn't get created when sharing.

**Solutions:**

1. Ensure you have permission to create blog posts in the space
2. Verify your Confluence account is active and not locked
3. Check the browser console for detailed error messages
4. Try the "Test Connection" feature again

### Space Key Not Working

**Problem:** Getting errors about invalid space.

**Solutions:**

1. Verify you're using the correct space key from the URL
2. Try using uppercase for the space key (e.g., "TEAM" instead of "team")
3. Verify you have access to the space
4. Make sure the space isn't archived
5. Confirm the space allows blog posts
6. Check if the space is a personal space (starts with ~) - these may require special handling

---

## Security Best Practices

1. **API Token Storage**: Tokens are stored in Chrome's local storage (not synced across devices)
2. **Never Share Tokens**: Don't commit tokens to git or share them in messages
3. **Regular Rotation**: Periodically regenerate your API tokens
4. **Minimal Permissions**: Use an account with only necessary permissions
5. **Revoke When Needed**: If compromised, immediately revoke the token from Atlassian settings

---

## FAQ

**Q: Can I use multiple spaces?**
A: Currently, one space is configured at a time. You can change the Space Key in settings to switch spaces.

**Q: Should I use the space key or numeric space ID?**
A: Use the space key (e.g., "TEAM"). It's easier to find and the extension automatically converts it to the numeric ID required by the API.

**Q: What format are blog posts created in?**
A: Blog posts use Confluence's storage format (HTML with Confluence macros) for proper formatting.

**Q: Can I edit blog posts after creation?**
A: Yes! The extension opens the new blog post after creation, where you can make any edits in Confluence.

**Q: Will this work with Confluence Server/Data Center?**
A: This integration is designed for Confluence Cloud. Server/Data Center may require different API endpoints.

**Q: What happens to my API token if I uninstall the extension?**
A: Chrome storage is cleared when you uninstall. For security, also revoke the token from Atlassian settings.

---

## Additional Resources

- [Confluence Cloud REST API Documentation](https://developer.atlassian.com/cloud/confluence/rest/v2/)
- [Atlassian API Token Management](https://id.atlassian.com/manage-profile/security/api-tokens)
- [Confluence Space Administration Guide](https://support.atlassian.com/confluence-cloud/docs/space-administration/)

---

## Support

If you encounter issues not covered in this guide, please:

1. Check the browser console for error messages
2. Verify all prerequisites are met
3. Try clearing configuration and setting it up again
4. Contact your team administrator for help

---

**Last Updated:** 2024
**Version:** 1.0.0
