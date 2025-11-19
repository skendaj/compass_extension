# Teams Question Capture - Debugging Guide

## Issue: Question Still Shows "Hi Name, ..."

If the captured question still shows the full message with greeting instead of the clean question, follow these debugging steps.

## Step-by-Step Debugging

### 1. Check Chrome Storage

Open **Chrome DevTools** → **Application** → **Storage** → **Local Storage** → `chrome-extension://[your-extension-id]`

Look for key: `currentSearchQuery`

**Expected value:** Your original search query (e.g., "How to deploy to production?")

**If missing or wrong:**
- The query wasn't saved when you clicked "Teams Chat"
- Or storage was cleared

### 2. Check Console Logs (Navify Side)

When you click "Teams Chat" button, check console:

```
[ResultsView] Stored search query for Teams chat: How to deploy to production?
```

**If this log is missing:**
- The `openTeamsChat()` function in `ResultsView.tsx` isn't executing properly
- Or storage permissions are missing

### 3. Check Console Logs (Teams Side)

When Teams page loads, check console:

```
[Teams Capture] Teams page detected! URL: https://teams.microsoft.com/...
[Teams Capture] Loaded search query from storage: How to deploy to production?
```

**If "Loaded search query" is missing:**
- Storage isn't being read properly
- Or `loadSearchQueryFromStorage()` failed

### 4. Check Console Logs (Save Button Click)

When you click "Save to Navify", check console:

```
[Teams Capture] Save button clicked
[Teams Capture] Stored search query: How to deploy to production?
[Teams Capture] Extracted question from first message: Hi Sarah, How to deploy...
[Teams Capture] Final question used: How to deploy to production?
```

**Priority Logic:**
1. If `Stored search query` has a value → Use it ✅
2. Else if `Extracted question` has a value → Use it (with greeting removed)
3. Else → "No question recorded"

## Common Issues & Solutions

### Issue 1: Storage Not Persisting

**Symptom:** Query is saved but not loaded in Teams tab

**Solution:**
```javascript
// Check manifest.json has storage permission
"permissions": [
  "storage"
]
```

### Issue 2: Teams Opens Before Storage Saves

**Symptom:** Race condition - Teams opens too fast

**Solution:** Already handled with `async/await`:
```javascript
await chrome.storage.local.set({ currentSearchQuery: query });
```

### Issue 3: Extension Reloaded Between Steps

**Symptom:** Query lost after extension reload

**Solution:** 
- Don't reload extension between searching and capturing
- Complete the flow in one session

### Issue 4: Multiple Tabs Confusion

**Symptom:** Wrong query captured from different search

**Solution:**
- Each new search overwrites the stored query
- Only the most recent search query is kept
- Complete one flow before starting another

## Manual Testing Steps

### Test 1: End-to-End Flow

1. **Open Navify** (extension popup or page)
2. **Search:** "How to deploy to production?"
3. **Check console:** Should see "Stored search query for Teams chat: ..."
4. **Check DevTools → Application → Storage:** Should see `currentSearchQuery`
5. **Click "Teams Chat"** on an expert
6. **New tab opens:** Teams
7. **Check console in Teams tab:** Should see "Loaded search query from storage: ..."
8. **Send message:** "Hi Sarah, How to deploy to production? I need help."
9. **Click "Capture Chat"** button
10. **Click "Save to Navify"**
11. **Check alert:** Should show:
    ```
    QUESTION:
    How to deploy to production?
    ```

### Test 2: Direct Teams (No Stored Query)

1. **Open Teams directly** (not from Navify)
2. **Send message:** "Hi John, Can you help with API errors?"
3. **Click "Capture Chat"**
4. **Click "Save to Navify"**
5. **Check alert:** Should show:
    ```
    QUESTION:
    Can you help with API errors?
    ```
    (greeting removed)

### Test 3: Empty Storage

1. **Clear storage:** DevTools → Application → Local Storage → Clear All
2. **Open Teams directly**
3. **Send message:** "Hi, I have a question about deployments"
4. **Capture and save**
5. **Check alert:** Should extract and clean the question

## Verify Code Changes

### File: `src/content.ts` (Line ~782)

```typescript
const question =
  currentSearchQuery ||           // 1st priority ✅
  chatData.extractedQuestion ||   // 2nd priority
  "No question recorded";         // 3rd priority
```

### File: `src/components/ResultsView.tsx` (Line ~39)

```typescript
await chrome.storage.local.set({ currentSearchQuery: query });
console.log("[ResultsView] Stored search query for Teams chat:", query);
```

### File: `src/services/teamsDOMScraper.ts` (Line ~324)

```typescript
export function extractQuestionFromFirstMessage(
  messages: TeamsChatMessage[],
): string | null {
  // Greeting removal logic
}
```

## Expected Behavior Matrix

| Scenario | Stored Query | First Message | Result |
|----------|-------------|---------------|--------|
| Normal flow | "How to deploy?" | "Hi Sarah, How to deploy?" | "How to deploy?" |
| Direct Teams | (empty) | "Hi John, Can you help?" | "Can you help?" |
| Empty message | (empty) | "Hi" | "No question recorded" |
| No greeting | "Fix API" | "Fix API errors please" | "Fix API" |

## Still Not Working?

### Check Extension Reload

After making code changes:
1. `npm run build`
2. Go to `chrome://extensions/`
3. Click **Reload** on your extension
4. **Close all Navify and Teams tabs**
5. **Open fresh tabs** and test again

### Check Build Output

```bash
cd compass_extension
npm run build
```

Should show:
```
✓ built in XXXms
dist/content.js created
```

### Check File Versions

Make sure you're editing the source files, not the built files:
- Edit: `src/content.ts`
- Not: `dist/content.js`

### Check Browser Console Filters

Make sure console isn't filtering out logs:
- Clear any filter text
- Set level to "Verbose" or "All"
- Check "Preserve log" to keep logs across navigation

## Get Help

If still not working, provide these details:

1. **Console logs** from both Navify and Teams tabs
2. **Storage contents** from DevTools → Application
3. **Extension version**: Check `manifest.json` version
4. **Chrome version**: chrome://version
5. **Steps taken**: Exact sequence of clicks

---

**Last Updated:** 2024-01-19  
**Related Docs:** TEAMS_QUESTION_EXTRACTION.md, SIMPLE_ALERT_FEATURE.md
