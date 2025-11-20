# Chat Extraction Improvements

## Overview

Enhanced the Teams chat extraction feature to provide a cleaner, more structured Q&A format with proper API payload preparation for the Navify knowledge base.

## Key Improvements

### 1. **Structured Q&A Display** 💬

The chat messages are now intelligently parsed and displayed as question-answer pairs:

```
Q1 (User Name): How do I fix Docker port conflict?
A1 (Expert Name): Change the port to 5433 in docker-compose.yml

Q2 (User Name): Should I restart the container?
A2 (Expert Name): Yes, run docker-compose down and then docker-compose up
```

**Benefits:**
- Clear separation between questions and answers
- Visual badges (Q1, A1, etc.) for easy scanning
- Color-coded backgrounds (blue for questions, teal for answers)
- Shows who asked and who answered

### 2. **API Payload Preview** 📦

Before saving, users can now see the exact JSON payload that will be sent to the knowledge API:

```json
{
  "content": "User: My Docker container wont start. Error: port 5432 already in use.\nAdmin: Change to port 5433 in docker-compose. User: Works now!"
}
```

**Features:**
- Shows the POST endpoint: `http://localhost:5000/api/knowledge`
- Displays the exact request body
- Copy button to copy the API payload to clipboard
- Formatted JSON for easy reading

### 3. **Improved Content Processing**

The extraction now:
- Filters out auto-generated questions from Teams
- Groups related messages into Q&A pairs
- Removes noise and focuses on relevant content
- Formats content in a consistent "User: question / Admin: answer" structure

### 4. **Enhanced Modal UI**

The Teams capture modal now includes:
- **Copy Messages** button - Copy Q&A formatted text
- **Copy API Payload** button - Copy the JSON payload
- **Create New Knowledge Entry** button - Opens the knowledge form

### 5. **Knowledge Entry Form Improvements**

When creating an entry from Teams chat:
- API payload preview is shown at the top
- Content is pre-populated in the correct format
- Question field is auto-extracted from the first "User:" message
- Monospace font for better readability of technical content

## Technical Changes

### New Function: `extractQAPairs()`

Located in `src/services/teamsDOMScraper.ts`:

```typescript
export function extractQAPairs(messages: TeamsChatMessage[]): {
  question: string;
  answer: string;
  pairs: Array<{ question: string; answer: string; questionBy: string; answerBy: string }>;
  formattedQA: string;
  apiPayload: { content: string };
}
```

This function:
1. Analyzes messages to identify questions (contains "?")
2. Groups subsequent messages as answers
3. Creates structured Q&A pairs
4. Formats content for both display and API submission

### Updated Components

**teamsDOMScraper.ts**
- Added `extractQAPairs()` function
- Modified `extractTeamsChat()` to include qaPairs in return value

**content.ts**
- Updated `showTeamsChatModal()` to display Q&A pairs
- Added API payload preview section
- Added "Copy API Payload" button
- Enhanced CSS styling for Q&A display

**NewEntryView.tsx**
- Added API payload preview display
- Updated save logic to use formatted content
- Enhanced form with monospace font for technical content

## Usage

### 1. Capture Teams Chat

1. Navigate to a Teams chat with Q&A content
2. Click the "Capture Chat" button (purple, top-right)
3. Review the Q&A formatted messages in the modal

### 2. Review API Payload

- Scroll to the "📦 API Payload Preview" section
- Verify the content format
- Use "Copy API Payload" button to copy JSON

### 3. Create Knowledge Entry

1. Click "Create New Knowledge Entry"
2. Review the pre-populated fields
3. See the API payload preview at the top
4. Adjust as needed and click "Save Entry"

### 4. API Integration

When saved, the extension:
- Saves locally to browser storage
- POSTs to `http://localhost:5000/api/knowledge` with:
  ```json
  {
    "content": "User: question\nAdmin: answer"
  }
  ```

## Example Output

### Before (Raw Chat)
```
{"content": "My Docker container wont start. Error: port 5432 already in use. Change to port 5433 in docker-compose. Works now!"}
```

### After (Structured Q&A)
```
{
  "content": "User: My Docker container wont start. Error: port 5432 already in use.\nAdmin: Change to port 5433 in docker-compose.\nUser: Works now!"
}
```

## Benefits

✅ **Less Chaos** - Clear Q&A structure instead of raw text dump
✅ **API Ready** - Proper JSON format for knowledge API
✅ **Transparency** - See exactly what will be sent before saving
✅ **Flexibility** - Copy messages or payload separately
✅ **Better UX** - Color-coded, badge-labeled messages

## API Specification

The extension prepares data according to the Navify API spec:

**Endpoint:** `POST http://localhost:5000/api/knowledge`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "content": "User: [question]\nAdmin: [answer]"
}
```

**Response:** Returns the created knowledge article with ID

## Future Enhancements

Potential improvements:
- [ ] Support for multi-turn conversations (Q1, A1, Q2, A2, etc.)
- [ ] Automatic tagging based on content analysis
- [ ] Option to edit API payload before sending
- [ ] Preview of how content will appear in Navify
- [ ] Support for code blocks and formatting preservation
- [ ] Attachment handling (images, files)

## Testing

To test the improvements:

1. Start the Navify backend: `cd compass_hackathon && npm run start`
2. Load the extension in Chrome
3. Navigate to a Teams chat
4. Send a test conversation:
   - User: "How do I fix port conflicts in Docker?"
   - Expert: "Use docker ps to find the process and change the port in docker-compose.yml"
5. Click "Capture Chat"
6. Verify Q&A formatting
7. Check API payload preview
8. Click "Create New Knowledge Entry"
9. Verify the content is properly formatted
10. Save and verify the POST request in network tab

## Support

For issues or questions:
- Check browser console for detailed logs
- Verify backend is running on port 5000
- Ensure Teams page is fully loaded before capturing
