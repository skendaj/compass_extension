# Quick Start Guide - 5 Minutes to Running

## Step 1: Load the Extension (2 minutes)

The extension is **already built** and ready to use!

### Load in Chrome:
1. Open Google Chrome
2. Type in address bar: `chrome://extensions/`
3. Turn ON "Developer mode" (toggle in top-right)
4. Click "Load unpacked" button
5. Navigate to and select: `/Users/skendaj/Desktop/Dev/extension/dist`
6. ✅ Done! Extension icon appears in toolbar

---

## Step 2: First Search (1 minute)

1. Click the extension icon in your Chrome toolbar
2. The popup opens with a search interface
3. Click one of the example queries:
   - **"API returns 500 error in production"**
4. See categorized results load:
   - Previous Solutions (2)
   - Recommended Experts (3)
   - Documentation (2)

---

## Step 3: Explore a Solution (1 minute)

1. Click on the first solution card
2. View the detailed solution:
   - Problem description
   - Solution steps
   - Code examples
   - Who solved it
   - Resources
3. Scroll to bottom
4. Click "Yes, this helped" to rate it
5. See the count increase!

---

## Step 4: Try Different Queries (1 minute)

Go back to search and try:

### HR Query:
- Type: **"How to request parental leave"**
- See HR-specific results
- Notice the "Teams Chat" and "Email" buttons

### Engineering Query:
- Type: **"React component not re-rendering"**
- See engineering-focused results
- Browse expert profiles

### Check History:
- Click "History" tab
- See your recent searches
- Click any to re-run instantly

---

## ✅ You're Done!

In 5 minutes you've:
- ✅ Loaded a Chrome extension
- ✅ Performed searches
- ✅ Viewed detailed solutions
- ✅ Rated content
- ✅ Explored experts
- ✅ Used search history

---

## What's Next?

### Customize It:
- Edit mock data: `src/services/mockData.ts`
- Add your team members
- Add your company's Q&A
- Rebuild: `npm run build`

### Share It:
- Demo to your team (see DEMO_GUIDE.md)
- Gather feedback
- Plan integrations

### Extend It:
- Add real AI integration
- Connect to company databases
- Integrate with Teams/Slack
- See FEATURE_SPECIFICATION.md for ideas

---

## Troubleshooting

**Can't see extension icon?**
→ Look for a puzzle piece icon (icons are placeholders)

**No results showing?**
→ Mock data loads automatically on first search

**Want to reset data?**
→ Right-click extension → Inspect popup → Console:
```javascript
chrome.storage.local.clear()
```

**Need more help?**
→ See INSTALLATION.md for detailed guide

---

## File Locations

- **Extension**: `/Users/skendaj/Desktop/Dev/extension/dist/`
- **Source Code**: `/Users/skendaj/Desktop/Dev/extension/src/`
- **Documentation**: Root folder (*.md files)

---

**That's it! You're ready to go! 🚀**

For complete documentation, see:
- README.md - Full guide
- FEATURE_SPECIFICATION.md - All features
- USER_FLOW.md - User journeys
- ARCHITECTURE.md - Technical details
- DEMO_GUIDE.md - Presentation script

