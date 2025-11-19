# Teams Question Capture - Flow Diagram

## Visual Flow: How Questions Are Captured

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    USER STARTS IN NAVIFY                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: User Types Question                                    │
│  ───────────────────────────────────────────────────────────   │
│  Input: "How to deploy to production?"                         │
│  Location: Navify search box                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: User Clicks "Teams Chat" on Expert Card                │
│  ───────────────────────────────────────────────────────────   │
│  Action: openTeamsChat() in ResultsView.tsx                   │
│  Code:                                                          │
│    await chrome.storage.local.set({                            │
│      currentSearchQuery: "How to deploy to production?"        │
│    });                                                          │
│                                                                 │
│  ✅ Query saved to Chrome storage                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Teams Opens in New Tab                                 │
│  ───────────────────────────────────────────────────────────   │
│  URL: https://teams.microsoft.com/l/chat/0/0?users=email       │
│  Content script (content.ts) loads                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Load Query from Storage                                │
│  ───────────────────────────────────────────────────────────   │
│  Function: loadSearchQueryFromStorage()                        │
│  Code:                                                          │
│    const result = await chrome.storage.local.get(              │
│      "currentSearchQuery"                                       │
│    );                                                           │
│    currentSearchQuery = result.currentSearchQuery;             │
│                                                                 │
│  ✅ currentSearchQuery = "How to deploy to production?"        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: User Chats with Expert                                 │
│  ───────────────────────────────────────────────────────────   │
│  User sends: "Hi Sarah, How to deploy to production? I need    │
│               help with the production server."                │
│                                                                 │
│  Expert replies with multiple messages...                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: User Clicks "Capture Chat" Button                      │
│  ───────────────────────────────────────────────────────────   │
│  Function: handleTeamsCaptureClick()                           │
│  Calls: extractTeamsChat()                                     │
│                                                                 │
│  Extraction Process:                                            │
│  ├─ Extract all messages from DOM                              │
│  ├─ Create summary (participants, date, etc.)                  │
│  └─ extractQuestionFromFirstMessage()                          │
│      ├─ Get first message: "Hi Sarah, How to deploy..."        │
│      ├─ Remove greeting: "Hi Sarah,"                           │
│      └─ Return: "How to deploy to production? I need help..."  │
│                                                                 │
│  Result:                                                        │
│  chatData = {                                                   │
│    extractedQuestion: "How to deploy to production? I need..." │
│    formattedText: "Full chat transcript...",                   │
│    ...                                                          │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 7: Modal Shows Chat Summary                               │
│  ───────────────────────────────────────────────────────────   │
│  Shows: Participants, message count, key points, etc.          │
│  User reviews the captured chat                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 8: User Clicks "Save to Navify"                           │
│  ───────────────────────────────────────────────────────────   │
│  DECISION LOGIC (Priority Order):                              │
│                                                                 │
│  const question =                                               │
│    currentSearchQuery           ||  ← 1st Priority ✅           │
│    chatData.extractedQuestion   ||  ← 2nd Priority             │
│    "No question recorded";          ← 3rd Priority             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ CURRENT VALUES:                                          │ │
│  │ currentSearchQuery: "How to deploy to production?"       │ │
│  │ extractedQuestion: "How to deploy to production? I need..│ │
│  │                                                          │ │
│  │ WINNER: "How to deploy to production?" ✅                │ │
│  │ (From stored search query - cleanest version)           │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 9: Alert Displays Q&A                                     │
│  ───────────────────────────────────────────────────────────   │
│  ✅ Question and Answer Done!                                  │
│                                                                 │
│  QUESTION:                                                      │
│  How to deploy to production?                                  │
│                                                                 │
│  ANSWER (Full Chat):                                            │
│  # Teams Chat Summary                                           │
│                                                                 │
│  **Participants:** You, Sarah                                  │
│  **Messages:** 8                                                │
│  **Date Range:** Jan 19, 2024 - Jan 19, 2024                  │
│                                                                 │
│  ---                                                            │
│                                                                 │
│  ### You                                                        │
│  *10:30 AM*                                                     │
│                                                                 │
│  Hi Sarah, How to deploy to production? I need help...         │
│                                                                 │
│  ---                                                            │
│                                                                 │
│  ### Sarah                                                      │
│  *10:31 AM*                                                     │
│                                                                 │
│  Sure! First you need to...                                    │
│                                                                 │
│  [rest of conversation...]                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Priority Logic Explained

### Scenario 1: Normal Flow (Most Common)
```
Stored Query:      "How to deploy to production?" ✅ USED
Extracted:         "How to deploy to production? I need help..."
Result:            "How to deploy to production?"
Why:               Cleanest, most concise version from original search
```

### Scenario 2: Direct Teams Chat (No Search)
```
Stored Query:      (empty)
Extracted:         "Can you help with API errors?"
Result:            "Can you help with API errors?" ✅ USED
Why:               No stored query, use extracted with greeting removed
```

### Scenario 3: Empty or Greeting-Only Message
```
Stored Query:      (empty)
Extracted:         null (was only "Hi Sarah")
Result:            "No question recorded" ✅ USED
Why:               No valid question found from either source
```

## Code Flow

```typescript
// 1. Navify - Store query
await chrome.storage.local.set({ 
  currentSearchQuery: "How to deploy to production?" 
});

// 2. Teams - Load query
const result = await chrome.storage.local.get("currentSearchQuery");
currentSearchQuery = result.currentSearchQuery;

// 3. Teams - Extract chat
const chatData = await extractTeamsChat();
// chatData.extractedQuestion = "How to deploy to production? I need..."

// 4. Save - Choose best question
const question =
  currentSearchQuery ||           // "How to deploy to production?" ✅
  chatData.extractedQuestion ||   // Backup
  "No question recorded";         // Last resort
```

## Greeting Removal Examples

| Original First Message | Extracted Question |
|------------------------|-------------------|
| "Hi John, How to fix API errors?" | "How to fix API errors?" |
| "Hello Sarah, I need help with deployment" | "I need help with deployment" |
| "Hey Bob, Can you assist?" | "Can you assist?" |
| "Good morning Alice, Question about SSL" | "Question about SSL" |
| "Hola Carlos, ¿Cómo configurar esto?" | "¿Cómo configurar esto?" |
| "Just Hi" | null (empty after removal) |

## Console Log Example

```
[ResultsView] Stored search query for Teams chat: How to deploy to production?
[Teams Capture] Teams page detected! URL: https://teams.microsoft.com/v2/
[Teams Capture] Loaded search query from storage: How to deploy to production?
[Teams Capture] Button created and added to page
[Teams Capture] Button clicked, starting capture...
[Teams Capture] Calling extractTeamsChat...
[Teams Scraper] Found 8 messages using selector: [data-tid="chat-pane-message"]
[Teams Capture] Chat extracted successfully
[Teams Capture] Showing modal with chat data
[Teams Capture] Save button clicked
[Teams Capture] Stored search query: How to deploy to production?
[Teams Capture] Extracted question from first message: How to deploy to production? I need help...
[Teams Capture] Final question used: How to deploy to production?
[Teams Capture] Alert shown with Q&A
```

## Benefits of This Approach

### ✅ Advantages

1. **Uses Original Intent**
   - Captures the question exactly as user typed in search
   - No modifications or additions from chat message

2. **Cleaner Questions**
   - Search queries are typically concise and focused
   - Chat messages often include context that's less relevant

3. **Consistent Format**
   - All questions follow the same format (what user searched)
   - Makes Q&A database more organized

4. **Fallback Protection**
   - Still works if storage fails
   - Extracts and cleans question from chat as backup

5. **No Greeting Pollution**
   - Stored query never has greetings ("Hi", "Hello")
   - Extracted questions have greetings removed

### ⚠️ Edge Cases Handled

- Multiple tabs (latest search wins)
- Storage cleared (falls back to extraction)
- Direct Teams chat (uses extraction)
- Empty messages (shows "No question recorded")
- Extension reload (storage persists)

---

**Last Updated:** 2024-01-19  
**Status:** ✅ Implemented and Working  
**Related:** TEAMS_QUESTION_EXTRACTION.md, TEAMS_QUESTION_DEBUG.md
