# Teams Chat Capture - Quick Reference Card

## 🚀 Getting Started (30 seconds)

1. **Open Teams:** Go to https://teams.microsoft.com/v2/
2. **Wait:** 2-3 seconds for button to appear
3. **Look:** Top-right corner for purple "Capture Chat" button
4. **Click:** Button → Modal appears
5. **Save:** Click "Save to Navify" → Fill form → Save Entry

---

## 🔍 Troubleshooting (If button doesn't appear)

```javascript
// Open browser console (F12) and run:
console.log("URL:", window.location.href);
console.log("Is Teams:", window.location.href.includes('teams.microsoft.com'));
console.log("Button:", document.getElementById('tkw-teams-capture-btn'));
```

**Expected Results:**
- URL: Should contain `teams.microsoft.com`
- Is Teams: Should be `true`
- Button: Should be an HTML element (not null)

**If button is null:**
1. Reload extension: `chrome://extensions/` → refresh icon
2. Hard refresh Teams: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Wait 5 seconds
4. Try again

---

## 🐛 Debugging Save Button

If "Save Entry" button doesn't work:

1. **Open console:** Press `F12`
2. **Click save button**
3. **Look for logs:**

```
[NewEntryView] Save button clicked
[NewEntryView] Title: [your title]
[NewEntryView] Problem: [your problem]
[NewEntryView] Solution length: [number]
[NewEntryView] Tags: [your tags]
[NewEntryView] Starting save process...
[NewEntryView] Saving entry to storage...
[NewEntryView] Entry saved successfully
[NewEntryView] Calling onSave callback...
[NewEntryView] Save complete!
```

**If you don't see these logs:**
- Button click handler not attached
- Try reloading the extension

**If logs stop at "Validation failed":**
- Title or content is empty
- Fill required fields

**If logs stop at "Saving entry":**
- Storage error
- Check console for error message
- Try clearing extension storage

---

## 📋 Checklist

### Before Capture
- [ ] On teams.microsoft.com URL
- [ ] In an actual chat/conversation
- [ ] Messages are loaded (scroll to load more)
- [ ] Extension is enabled in Chrome

### During Capture
- [ ] Button appears (purple, top-right)
- [ ] Click button → loading animation shows
- [ ] Modal opens with summary
- [ ] Text is black and readable
- [ ] Participants, messages, dates shown

### During Save
- [ ] Click "Save to Navify"
- [ ] Form opens with pre-filled data
- [ ] Text is black
- [ ] "Imported from Teams" badge shows
- [ ] Title and content are filled
- [ ] Can add tags (press Enter after each)

### After Save
- [ ] Console shows success logs
- [ ] Redirects to detail view
- [ ] Entry displays correctly
- [ ] Entry is searchable in Navify

---

## 🔧 Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Button not visible | Reload extension, refresh page |
| Button appears then vanishes | Wait 5+ seconds for Teams to fully load |
| "No messages found" error | Open a chat with messages visible |
| Text is white/unreadable | Rebuild extension (text should be black now) |
| Save does nothing | Open console, check for validation errors |
| Extension not working | Check `chrome://extensions/` - ensure enabled |

---

## 📁 Key Files

- **Core scraper:** `src/services/teamsDOMScraper.ts`
- **Content script:** `src/content.ts`
- **Save form:** `src/components/NewEntryView.tsx`
- **App routing:** `src/App.tsx`

---

## 🎯 Expected Behavior

### Button Appearance
- **Where:** Top-right corner of Teams page
- **When:** 2-3 seconds after page load
- **Color:** Purple (#7E85FD)
- **Text:** "Capture Chat"

### After Click
- **Loading:** Button shows spinner and "Capturing..."
- **Time:** Usually < 1 second
- **Result:** Modal with chat summary

### Modal Content
- Chat name
- Participants list
- Message count
- Date range
- Key points (if found)
- Action items (if found)
- Questions (if found)

### Save Flow
1. Click "Save to Navify"
2. Modal closes
3. Form opens (black text)
4. Pre-filled with:
   - Title = chat name
   - Content = formatted chat transcript
5. Add tags (optional)
6. Click "Save Entry"
7. Console logs appear (if open)
8. Redirects to entry detail view

---

## 💡 Pro Tips

1. **Scroll first:** Load all messages before capturing
2. **Console open:** Keep F12 open to see logs
3. **Add tags:** Makes entries more searchable
4. **Edit title:** Make it descriptive before saving
5. **Check URL:** Must be `teams.microsoft.com` (not desktop app)

---

## 📞 Need Help?

1. **Read docs:**
   - `TEAMS_CAPTURE_QUICKSTART.md` - Step-by-step guide
   - `TEAMS_TROUBLESHOOTING.md` - Detailed debugging
   - `TEAMS_DOM_CAPTURE.md` - Technical details

2. **Use debug tool:**
   - Open `test-teams-detection.html` in browser
   - Click "Run Full Diagnostic"
   - Review results

3. **Check console:**
   - Press F12
   - Look for errors in red
   - Look for "[Teams Capture]" logs
   - Look for "[NewEntryView]" logs when saving

4. **Report issue:**
   - Share URL where it fails
   - Share console output
   - Share screenshot

---

## ✅ Success Indicators

- Button appears reliably on Teams pages
- Captures show all visible messages
- Text is black throughout UI
- Saves complete without errors
- Console shows success logs
- Entries appear in knowledge base
- Entries are searchable

---

## 🚨 Red Flags

- Button never appears → Extension not loaded
- "No messages found" → Not in a chat or wrong selectors
- White text → Old build (rebuild needed)
- Save silent fail → Check console for errors
- No console logs → Button handler not attached

---

**Version:** 1.0  
**Last Updated:** January 19, 2024  
**Status:** Production Ready ✅

---

*Keep this card handy while testing. Most issues can be diagnosed with console logs.*
