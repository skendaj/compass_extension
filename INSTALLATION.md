# Installation Guide

## Quick Start - Load Extension Locally

### Prerequisites
- Node.js v16+ installed
- Google Chrome browser
- Terminal/Command line access

### Step 1: Install Dependencies
```bash
cd /Users/skendaj/Desktop/Dev/extension
npm install
```

### Step 2: Build the Extension
```bash
npm run build
```

This creates a `dist/` folder with the compiled extension.

### Step 3: Load Extension in Chrome

1. Open Google Chrome
2. Navigate to: `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **"Load unpacked"** button
5. Select the `dist` folder from this project
6. The extension icon should appear in your Chrome toolbar!

### Step 4: Test the Extension

1. Click the extension icon in your toolbar
2. The popup should open showing the search interface
3. Try searching:
   - "API returns 500 error in production" (Engineering query)
   - "How to request parental leave" (HR query)
   - "Database migration best practices" (Engineering query)
4. Click on results to view details
5. Rate solutions
6. Check the History tab

## Development Mode (Hot Reload)

For active development with hot reloading:

```bash
npm run dev
```

Then in Chrome:
1. Load the extension as described above
2. When you make changes, Vite will rebuild automatically
3. Click the refresh icon on the extension card in `chrome://extensions/`
4. Or reload the popup to see changes

## Troubleshooting

### Issue: Extension icon not showing
**Solution:** The extension will use Chrome's default puzzle piece icon. This is normal - icons are placeholders.

### Issue: "Manifest file is missing or unreadable"
**Solution:** Make sure you selected the `dist` folder, not the root folder.

### Issue: Extension doesn't load
**Solution:** 
1. Check console for errors in `chrome://extensions/`
2. Rebuild: `npm run build`
3. Remove and re-add the extension

### Issue: Changes not reflecting
**Solution:**
1. Click the refresh icon on extension card
2. Or remove and re-add the extension
3. Close and reopen the popup

### Issue: No data showing
**Solution:** Mock data initializes on first use. Try:
1. Open the extension
2. Perform a search
3. Data should load automatically

## File Structure After Build

```
dist/
├── index.html              # Popup HTML
├── index.js               # Main React app (bundled)
├── background.js          # Service worker
├── manifest.json          # Extension configuration
├── assets/
│   └── index-*.css        # Compiled styles
└── icons/                 # Icon placeholders
    ├── icon16.png.txt
    ├── icon48.png.txt
    └── icon128.png.txt
```

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Search interface displays
- [ ] Example queries are clickable
- [ ] Search returns results
- [ ] Engineering queries show experts and solutions
- [ ] HR queries show HR contacts
- [ ] Solution detail view works
- [ ] Rating functionality works
- [ ] History tab shows searches
- [ ] Back button navigation works
- [ ] "Teams Chat" and "Email" buttons open correctly

## Running in Production

For production deployment:

1. **Add Real Icons**: Replace icon placeholders in `icons/` folder
2. **Update Manifest**: Add production metadata
3. **Build**: `npm run build`
4. **Package**: Zip the `dist` folder
5. **Upload**: Submit to Chrome Web Store

## Chrome Web Store Submission

### Prepare for Submission
1. Create proper icon files (16x16, 48x48, 128x128 PNG)
2. Add screenshots (1280x800 or 640x400)
3. Write store description
4. Set up privacy policy
5. Pay one-time $5 developer fee

### Submission Checklist
- [ ] Valid manifest.json
- [ ] All icons present
- [ ] Privacy policy URL
- [ ] Store description
- [ ] Screenshots (at least 1)
- [ ] Detailed description of permissions used

## Development Tips

### Live Reload Setup
```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Watch for changes
npm run build -- --watch
```

### Debug the Extension
1. Right-click extension icon → "Inspect popup"
2. Opens DevTools for popup
3. View console logs, inspect elements, debug React

### Debug Background Script
1. Go to `chrome://extensions/`
2. Find your extension
3. Click "Service worker" link
4. Opens DevTools for background script

### Clear Storage (Reset Data)
```javascript
// In popup console (DevTools)
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
});
```

## Performance Notes

- Extension popup is isolated from web pages
- Storage limited to 10MB (Chrome storage.local)
- Popup closes when user clicks outside
- Background script runs as service worker (Manifest V3)

## Browser Compatibility

- **Chrome**: Fully supported (v88+)
- **Edge**: Should work (Chromium-based)
- **Firefox**: Requires manifest conversion (not currently supported)
- **Safari**: Not supported

## Next Steps

After installation, you can:
1. Customize mock data in `src/services/mockData.ts`
2. Add real company users and knowledge entries
3. Integrate with company APIs
4. Deploy to your organization

## Support

If you encounter issues:
1. Check browser console for errors
2. Review `chrome://extensions/` for extension errors
3. Rebuild the extension
4. Check that all dependencies installed correctly

Enjoy your TeamSystem Navify! 🎯

