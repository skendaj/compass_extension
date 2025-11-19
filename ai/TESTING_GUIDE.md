# Teams Integration Testing Guide

## Quick Test: End-to-End Teams Chat Capture

This guide will walk you through testing the complete Teams chat capture and display functionality.

## Prerequisites

- Chrome browser with the Compass extension installed
- Access to Microsoft Teams (teams.microsoft.com)
- The extension should be loaded and active

## Test 1: Question Mark Auto-Addition

**Purpose:** Verify that questions automatically get a "?" at the end when contacting experts via Teams.

### Steps:

1. Open the Compass extension
2. Search for any topic (e.g., "How to deploy to Azure")
3. Click on a search result to view details
4. Scroll to the "Contact" section
5. Click the "Teams" button

### Expected Result:

- Teams opens in a new tab with a pre-filled message
- Message format: "Hi [Name], [Question]?"
- Question should end with "?" even if the original problem didn't have one

### Example:

```
Original problem: "How to migrate a project to Vapor 3"
Teams message: "Hi Andrea Vitali, How to migrate a project to Vapor 3?"
```

---

## Test 2: Complete Chat Capture Flow

**Purpose:** Test the entire flow from sending a question to saving and displaying the captured chat.

### Steps:

#### Part A: Send Question via Teams

1. Open Compass extension
2. Search for a topic
3. Click on a result with an expert contact
4. Click the "Teams" button to open Teams chat
5. Note the auto-generated message sent
6. Have a brief conversation (or simulate with another account):
   - Example response: "You should install the vapor3 package and run migrations"
   - Add a follow-up if desired

#### Part B: Capture the Chat

1. While still on the Teams page with your conversation visible
2. Look for the **purple floating button** (Compass widget) in bottom-left corner
3. If on a chat page, you should see a **"Capture Chat"** button
4. Click "Capture Chat"
5. Wait for the capture process to complete (spinner animation)

#### Part C: Review the Modal

The modal should appear with the following sections:

```
📥 Captured Teams Chat
├─ Chat Name: [Detected or "Untitled Chat"]
├─ Participants: [Your name, Expert name]
├─ Messages: [Number of relevant messages only]
├─ Date Range: [Today's date]
│
├─ ❓ Question
│  └─ "How to migrate a project to Vapor 3?"
│
├─ 📝 Overview
│  └─ "Chat conversation between... with X relevant messages"
│
└─ 🔑 Key Points
   └─ [Extracted from expert responses only]
```

**Key Verification Points:**

- ✅ The "Question" section shows ONLY the question (without "Hi [Name],")
- ✅ Question ends with "?"
- ✅ Key Points section does NOT include the auto-generated message
- ✅ Key Points only show responses AFTER your question
- ✅ Message count reflects relevant messages only

#### Part D: Save to Navify

1. In the modal, click **"Save to Navify"** button
2. The extension should open with a new entry form pre-populated:
   - **Title:** The extracted question
   - **Problem/Question:** The extracted question
   - **Solution/Content:** The filtered conversation (expert responses only)

#### Part E: Review and Complete Save

1. Review the pre-populated fields
2. Add tags if desired (e.g., "vapor", "migration")
3. Click **"Save"** button

#### Part F: Verify Display

After saving, you should:

1. ✅ Immediately see the **Detail View** of your saved entry
2. ✅ See all your data correctly displayed:
   - Title matches the question
   - Problem section shows the question
   - Solution shows the conversation
   - "Imported from Microsoft Teams chat" badge visible

#### Part G: Verify Searchability

1. Click "Back to Search" or the Search nav button
2. Search for keywords from your question (e.g., "Vapor 3")
3. ✅ Your newly saved entry should appear in results
4. Click on it to verify it opens correctly

### Expected Timeline:

- Capture: ~2-3 seconds
- Modal review: User-driven
- Save process: ~1-2 seconds
- Display: Immediate

---

## Test 3: Backend Integration (Optional)

**Purpose:** Verify that entries are also saved to the backend when available.

### Prerequisites:

- Backend server running at `http://localhost:5000`

### Steps:

1. Follow Test 2 completely
2. After clicking "Save", open browser DevTools (F12)
3. Go to Console tab
4. Look for these log messages:

```
[NewEntryView] Saving entry to storage...
[NewEntryView] Entry saved successfully
[NewEntryView] Entry saved to backend successfully  ← This indicates backend save worked
[NewEntryView] Calling onSave callback...
```

### Expected Results:

- ✅ Console shows "Entry saved to backend successfully"
- ✅ Entry is still displayed even if backend fails
- ✅ No error alerts to user

### Backend Down Test:

1. Stop the backend server
2. Capture and save a Teams chat
3. ✅ Save should still complete successfully
4. ✅ Console shows warning: "Backend save failed (backend may be offline)"
5. ✅ Entry is still visible and searchable

---

## Test 4: Message Filtering Verification

**Purpose:** Ensure only relevant messages are captured.

### Setup a Test Scenario:

Have a Teams conversation like this:

```
Message 1 (You): "Hi Andrea, How to deploy to production?"
Message 2 (Andrea): "First, make sure you run tests"
Message 3 (Andrea): "Then use the deployment script"
Message 4 (You): "Thanks!"
```

### Capture and Verify:

1. Capture the chat
2. Check the modal's Key Points section

### Expected Result:

The captured content should include:

- ✅ Message 2: "First, make sure you run tests"
- ✅ Message 3: "Then use the deployment script"
- ✅ Message 4: "Thanks!"

But should NOT include:

- ❌ Message 1: "Hi Andrea, How to deploy to production?"

The question should appear separately in the "Question" section.

---

## Test 5: Data Persistence

**Purpose:** Verify that saved entries persist across extension sessions.

### Steps:

1. Complete Test 2 (save an entry from Teams)
2. Close the extension popup
3. Reopen the extension
4. Search for your saved entry
5. ✅ Entry should still be there and fully functional

### Also Test:

1. Close the browser completely
2. Reopen and test the extension
3. ✅ Saved entries should persist

---

## Common Issues and Solutions

### Issue 1: Capture Button Not Appearing

**Symptoms:** No "Capture Chat" button on Teams page

**Solutions:**

1. Make sure you're on a Teams chat page (URL contains `teams.microsoft.com`)
2. Refresh the Teams page
3. Check that the purple Compass floating button appears in bottom-left
4. Try clicking the floating button to open the capture UI

### Issue 2: All Messages Captured (Not Filtered)

**Symptoms:** The auto-generated question appears in Key Points

**Solutions:**

1. Verify your message starts with "Hi [Name]," followed by a question with "?"
2. The question must be in the exact format for detection to work
3. Try sending the question again using the Teams button from Compass

### Issue 3: Modal Doesn't Show

**Symptoms:** Click "Capture Chat" but nothing happens

**Solutions:**

1. Check browser console for errors (F12 → Console)
2. Verify you're on a page with visible chat messages
3. Try refreshing the Teams page and capturing again

### Issue 4: Can't Save Entry

**Symptoms:** Click "Save" but nothing happens or error appears

**Solutions:**

1. Make sure Title field is filled
2. Make sure Solution/Content field has data
3. Check console for specific error messages
4. Try filling in the Problem/Question field manually if empty

### Issue 5: Saved Entry Not in Search Results

**Symptoms:** Entry saved but doesn't appear when searching

**Solutions:**

1. Wait 1-2 seconds after saving (slight delay for indexing)
2. Try searching with different keywords from your entry
3. Check the Detail View to see what tags/keywords are saved
4. Try a more general search term

---

## Success Criteria Checklist

Use this checklist to verify all functionality:

### Question Handling:
- [ ] Question mark automatically added when contacting via Teams
- [ ] Question extracted correctly from Teams chat
- [ ] Question appears in dedicated section of modal
- [ ] Question used as entry title

### Message Filtering:
- [ ] Auto-generated message NOT in Key Points
- [ ] Only messages AFTER question are captured
- [ ] Message count shows relevant messages only
- [ ] Conversation flow preserved correctly

### UI/UX:
- [ ] Capture button appears on Teams pages
- [ ] Modal displays all sections correctly
- [ ] Pre-populated form opens after "Save to Navify"
- [ ] Detail view displays after saving
- [ ] "Imported from Microsoft Teams" badge shows

### Data Persistence:
- [ ] Entry saved to local storage
- [ ] Entry immediately searchable
- [ ] Entry persists after closing/reopening extension
- [ ] All fields preserved correctly

### Backend Integration:
- [ ] Backend save attempted when server running
- [ ] Console logs confirm backend save
- [ ] Graceful handling when backend offline
- [ ] No user-facing errors when backend fails

---

## Performance Benchmarks

Expected performance for each operation:

| Operation | Expected Time | Acceptable Max |
|-----------|--------------|----------------|
| Capture Chat | < 3 seconds | 5 seconds |
| Display Modal | Instant | 1 second |
| Open New Entry Form | Instant | 1 second |
| Save Entry | < 2 seconds | 3 seconds |
| Display Detail View | Instant | 1 second |
| Search Results | < 1 second | 2 seconds |

If any operation exceeds the acceptable max, check:
- Browser console for errors
- Network tab for failed requests
- Amount of data being processed

---

## Debug Mode

To get detailed logging for troubleshooting:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for logs prefixed with:
   - `[Teams Capture]` - Capture process logs
   - `[Teams Scraper]` - Message extraction logs
   - `[NewEntryView]` - Save process logs
   - `[App]` - Navigation and state logs

Example of successful flow logs:

```
[Teams Capture] Button clicked, starting capture...
[Teams Scraper] Found 5 messages using selector: [data-tid="chat-pane-message"]
[Teams Capture] Chat extracted successfully
[Teams Capture] Showing modal with chat data
[Teams Capture] Save button clicked
[Teams Capture] Opening modal with params: action=new-from-teams&title=...
[App] Opening new entry from Teams: {title, content, question}
[NewEntryView] Save button clicked
[NewEntryView] Saving entry to storage...
[NewEntryView] Entry saved successfully
[NewEntryView] Entry saved to backend successfully
[NewEntryView] Calling onSave callback...
[App] New entry saved
```

---

## Reporting Issues

If you find a bug, please report with:

1. **What you did:** Step-by-step reproduction steps
2. **What happened:** Actual behavior observed
3. **What you expected:** Expected behavior
4. **Console logs:** Copy relevant console messages
5. **Screenshots:** If UI issue, include screenshots
6. **Browser info:** Chrome version, OS

---

## Advanced Testing Scenarios

### Scenario 1: Multiple Questions in Chat

Have a conversation with multiple questions to see how the system handles it.

### Scenario 2: Long Conversations

Capture a chat with 20+ messages to test performance and filtering.

### Scenario 3: Special Characters

Include special characters in questions: "How to fix 'null' error in @Component?"

### Scenario 4: Code Snippets

Have expert share code in Teams and verify it's captured correctly.

### Scenario 5: Concurrent Saves

Try saving multiple Teams chats in quick succession.

---

## Automation Ready

This test suite is designed to be manually executed but structured for future automation. Each test has:

- Clear prerequisites
- Step-by-step instructions
- Expected results with verification points
- Success criteria

Consider automating with tools like:
- Selenium/Puppeteer for UI testing
- Chrome Extension testing frameworks
- API testing for backend integration

---

## Next Steps After Testing

Once all tests pass:

1. Deploy backend to production environment
2. Update backend URL in extension code
3. Test again with production backend
4. Monitor real-world usage
5. Collect user feedback
6. Iterate on improvements

---

## Questions or Issues?

If you encounter any issues during testing or need clarification:

1. Check the console logs first
2. Review the troubleshooting section
3. Refer to TEAMS_INTEGRATION_IMPROVEMENTS.md for technical details
4. Check that all components are running (extension, Teams page, backend if testing that)

Happy Testing! 🚀
