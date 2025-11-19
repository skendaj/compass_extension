# Teams Chat Question Extraction

## Overview

The Teams chat capture feature now intelligently uses the **original search query** as the question, and also pre-fills the Teams message box with this query instead of auto-generated greetings like "Hi John" or "Hello Alice".

## Why This Improvement?

Previously, Teams would auto-generate a greeting message like "Hi Andrea Vitali," when you clicked "Teams Chat". This meant:

- The chat started with a greeting instead of the actual question
- The captured question would show "Hi Name," instead of the real query
- Users had to manually type or edit their question

**Now:** The actual search query is pre-filled in Teams and used as the question when capturing the chat.

## How It Works

### 1. Pre-filled Message in Teams

When you click **"Teams Chat"**, the system now:

1. **Stores your search query** in Chrome storage
2. **Pre-fills the Teams message** with your actual question (not "Hi Name,")
3. **Opens Teams** with the question ready to send

### 2. Question Capture Logic

When you click **"Save to Navify"**, the system:

1. **Uses the stored search query** from Navify (the original question you typed)
2. **Falls back to extracting the first message** if no search query exists
3. **Removes common greetings** from extracted message using pattern matching (backup only)
4. **Cleans up the text** to get the actual question

### 3. Supported Greeting Patterns (Fallback Only)

The system automatically removes these greeting patterns:

```
Hi John,
Hello Alice!
Hey Bob.
Good morning Sarah,
Dear Michael,
Greetings everyone,
Hola Carlos,
Ciao Maria,
```

And standalone greetings:

```
Hi, ...
Hello! ...
Hey, ...
```

### 4. Example: Complete Flow

**Step 1 - User searches in Navify:**

```
How to deploy to production?
```

**Step 2 - User clicks "Teams Chat":**

- Query stored: `How to deploy to production?`
- Teams URL includes: `&message=How%20to%20deploy%20to%20production%3F`

**Step 3 - Teams opens with pre-filled message:**

```
How to deploy to production?
```

(NOT "Hi Sarah, How to deploy to production?")

**Step 4 - User sends message (as-is or modified):**

```
How to deploy to production?
```

**Step 5 - Capture shows:**

```
QUESTION: How to deploy to production?
```

(From stored search query - clean and accurate!)

---

**Legacy Scenario (Direct Teams, no pre-fill):**

If Teams was opened directly (not from Navify) and first message was:

```
Hi Sarah, How to deploy to production? The build fails with error 500.
```

Extracted question would be:

```
How to deploy to production? The build fails with error 500.
```

(greeting removed via extraction logic)

## Technical Implementation

### Function: `extractQuestionFromFirstMessage()`

Located in `src/services/teamsDOMScraper.ts`

```typescript
export function extractQuestionFromFirstMessage(
  messages: TeamsChatMessage[],
): string | null;
```

**Process:**

1. Gets the first message content
2. Applies regex patterns to remove greetings
3. Trims whitespace
4. Returns cleaned question or null

### Integration Points

**In `extractTeamsChat()`:**

```typescript
const extractedQuestion = extractQuestionFromFirstMessage(messages);

return {
  summary,
  formattedText,
  keySummary,
  context,
  extractedQuestion, // ← New field
};
```

**In `showTeamsChatModal()` (content.ts):**

```typescript
// Prioritize stored search query over extracted question
const question =
  currentSearchQuery || chatData.extractedQuestion || "No question recorded";
```

## User Experience

### Scenario 1: With Stored Search Query (Normal Flow)

```
✅ Question and Answer Done!

QUESTION:
How to deploy to production?

ANSWER (Full Chat):
Hi Sarah, How to deploy to production? The build fails with error 500.
[Rest of chat transcript...]
```

### Scenario 2: Without Stored Query (Direct Teams Chat)

```
✅ Question and Answer Done!

QUESTION:
How to deploy to production? The build fails with error 500.

ANSWER (Full Chat):
[Chat transcript with greeting removed from question...]
```

## Fallback Behavior

The system uses a **priority-based approach**:

1. **First Priority:** Stored search query from Navify search (most accurate)
2. **Second Priority:** Extracted question from chat's first message (with greetings removed)
3. **Third Priority:** "No question recorded"

This ensures you always use the original question as typed in Navify, which is cleaner and more precise than the chat message.

## Supported Languages

The greeting removal currently supports:

- English (Hi, Hello, Hey, Good morning/afternoon/evening, Dear, Greetings)
- Spanish (Hola)
- Italian (Ciao)

**Note:** The core question will be captured regardless of language; these patterns just help clean up common greetings.

## Testing

### Test Scenario 1: Normal Flow (With Stored Query)

1. Search in Navify: "How to fix API errors?"
2. Click "Teams Chat" on expert
3. Send message in Teams: "Hi John, Can you help with API errors?"
4. Capture chat
5. **Expected:** Question = "How to fix API errors?" (from stored search query)

### Test Scenario 2: Direct Teams Chat (No Stored Query)

1. Open Teams directly (not from Navify)
2. Send message: "Hi John, The deployment is failing with 500 error"
3. Capture chat
4. **Expected:** Question = "The deployment is failing with 500 error" (extracted, greeting removed)

### Test Scenario 3: Empty First Message (No Stored Query)

1. Open Teams directly
2. Send message with only "Hi" or empty message
3. Capture chat
4. **Expected:** Question = "No question recorded"

## Console Logging

When you click "Save to Navify", check the browser console for:

```
[Teams Capture] Stored search query: How to deploy to production?
[Teams Capture] Extracted question from first message: How to deploy to production? The build fails with error 500.
[Teams Capture] Final question used: How to deploy to production?
```

This helps verify which question source was used. The stored query takes priority.

## Future Enhancements

Potential improvements:

- [ ] Support for more languages and greeting patterns
- [ ] AI-powered question extraction from multi-turn conversations
- [ ] Question vs. Statement detection
- [ ] Extract multiple questions if the first message contains several
- [ ] Smart punctuation cleanup (e.g., multiple question marks)

## Code References

**Main Files:**

- `src/services/teamsDOMScraper.ts` - Question extraction logic
- `src/content.ts` - Modal display and question usage

**Key Functions:**

- `extractQuestionFromFirstMessage()` - Extracts and cleans question
- `extractTeamsChat()` - Orchestrates chat extraction
- `showTeamsChatModal()` - Displays question in alert

## Status

✅ **Implemented and tested**

- **Pre-filled message in Teams** with actual search query (PRIMARY FIX)
- Stored search query takes priority in capture
- Question extraction from first message (fallback)
- Greeting removal (English, Spanish, Italian)
- Console logging for debugging
- Build successful with no errors

## Related Documentation

- **TEAMS_MESSAGE_FIX.md** - Details about the pre-filled message fix
- **QUESTION_FLOW.md** - Visual flow diagram of question capture
- **TEAMS_QUESTION_DEBUG.md** - Debugging guide

---

**Last Updated:** 2024-01-19  
**Feature Version:** 2.0  
**Build Status:** ✅ Passing
