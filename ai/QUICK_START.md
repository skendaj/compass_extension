# Quick Start Guide: Teams Integration

## 🚀 Getting Started in 5 Minutes

This guide will help you capture your first Teams conversation and save it to Compass Navify.

---

## Prerequisites

- ✅ Compass extension installed in Chrome
- ✅ Access to Microsoft Teams
- ✅ Logged into the Compass extension

---

## Step-by-Step Guide

### Part 1: Contact an Expert (2 minutes)

1. **Open Compass Extension**
   - Click the Compass icon in your browser toolbar

2. **Search for Your Question**
   - Type your question in the search bar
   - Example: "How to deploy to Azure"
   - Press Enter or click Search

3. **Find a Solution**
   - Browse the search results
   - Click on any entry that has an expert contact

4. **Contact the Expert**
   - Scroll down to the "Contact" section
   - Click the **"Teams"** button
   - Teams will open with a pre-filled message like:
     ```
     Hi Andrea Vitali, How to deploy to Azure?
     ```
   - Send the message

5. **Get Your Answer**
   - Wait for the expert to respond
   - Have a quick conversation
   - Example response: "First, configure your Azure credentials in the settings..."

---

### Part 2: Capture the Conversation (1 minute)

1. **Look for the Capture Button**
   - While still on the Teams page with your conversation visible
   - Find the **purple floating button** in the bottom-left corner
   - It should show a "Capture Chat" option

2. **Click "Capture Chat"**
   - Button will show a loading spinner
   - Wait 2-3 seconds for processing

3. **Review the Captured Data**
   - A modal will appear showing:
     - ❓ **Question**: "How to deploy to Azure?"
     - 📝 **Overview**: Summary of the conversation
     - 🔑 **Key Points**: Important takeaways
   
   **Notice:** The modal only shows the expert's responses, not your initial question in the Key Points section!

---

### Part 3: Save to Navify (1 minute)

1. **Click "Save to Navify"**
   - Button is at the bottom of the modal
   - The extension will open with a form

2. **Review Pre-filled Data**
   - **Title**: Your question (automatically filled)
   - **Problem/Question**: Your question (automatically filled)
   - **Solution/Content**: The expert's responses (automatically filled)

3. **Add Tags (Optional)**
   - Type a tag and press Enter
   - Examples: "azure", "deployment", "devops"
   - You can add multiple tags

4. **Click "Save"**
   - Your entry will be saved instantly
   - You'll see the detail view of your saved entry

---

### Part 4: Find It Later (30 seconds)

1. **Go to Search**
   - Click "Search" in the navigation menu

2. **Search for Your Entry**
   - Type keywords from your question
   - Example: "Azure deploy"

3. **View Your Entry**
   - Your saved entry will appear in the results
   - Click on it to view full details
   - It's now part of your personal knowledge base!

---

## Visual Walkthrough

### What You'll See: Capture Modal

```
┌─────────────────────────────────────────────────────┐
│  📥 Captured Teams Chat                          ×  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Chat Name: Chat with Andrea Vitali                │
│  Participants: You, Andrea Vitali                  │
│  Messages: 3                                        │
│  Date Range: 1/19/2025 - 1/19/2025                 │
│                                                     │
│  ❓ Question                                        │
│  How to deploy to Azure?                           │
│                                                     │
│  📝 Overview                                        │
│  Chat conversation between You, Andrea Vitali      │
│  with 3 relevant messages.                         │
│                                                     │
│  🔑 Key Points                                      │
│  • Andrea: First, configure Azure credentials      │
│  • Andrea: Then run the deployment script          │
│  • Andrea: Check the logs for any errors           │
│                                                     │
│  [Copy to Clipboard]  [Save to Navify]             │
└─────────────────────────────────────────────────────┘
```

### What You'll See: New Entry Form

```
┌─────────────────────────────────────────────────────┐
│  📄 Create New Knowledge Entry                   ×  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  👥 Imported from Microsoft Teams chat              │
│                                                     │
│  Title *                                            │
│  ┌─────────────────────────────────────────────┐  │
│  │ How to deploy to Azure?                     │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Problem/Question (optional)                        │
│  ┌─────────────────────────────────────────────┐  │
│  │ How to deploy to Azure?                     │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Solution/Content *                                 │
│  ┌─────────────────────────────────────────────┐  │
│  │ Andrea: First, configure Azure credentials  │  │
│  │ Andrea: Then run the deployment script      │  │
│  │ Andrea: Check the logs for errors           │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Tags                                               │
│  [azure] [deployment] [____________]                │
│                                                     │
│  [Cancel]                            [💾 Save]      │
└─────────────────────────────────────────────────────┘
```

---

## Tips & Tricks

### 💡 Best Practices

1. **Ask Clear Questions**
   - Good: "How to fix 'null pointer' error in React components?"
   - Bad: "help with error"

2. **Add Relevant Tags**
   - Use technology names: "react", "azure", "nodejs"
   - Use categories: "deployment", "debugging", "setup"

3. **Edit Before Saving**
   - Review the captured content
   - Add any missing context
   - Clean up formatting if needed

4. **Capture Frequently**
   - Don't wait until the conversation is over
   - Capture key solutions as they happen
   - Build your knowledge base incrementally

### ⚡ Keyboard Shortcuts

- **Enter** in tag field → Add tag
- **Ctrl/Cmd + S** in form → Save (if implemented)
- **Esc** → Cancel/Close

### 🎯 What Gets Captured

✅ **Included:**
- Expert responses after your question
- Follow-up messages
- Code snippets shared in chat
- Links and references

❌ **Excluded:**
- Your initial auto-generated question
- Messages before the question
- System notifications
- Reactions and emojis (usually)

---

## Troubleshooting

### "Capture Chat" Button Not Visible

**Solution:**
1. Make sure you're on `teams.microsoft.com`
2. Refresh the Teams page
3. Look for the purple button in bottom-left corner
4. Check that the chat has messages

### Question Not Extracted

**Reason:** The question must be in the format "Hi [Name], [Question]?"

**Solution:**
1. Use the Teams button from Compass to send questions
2. Make sure the question ends with "?"
3. Manual questions may not be detected

### Save Button Does Nothing

**Check:**
1. Is the Title field filled?
2. Is the Solution/Content field filled?
3. Check browser console (F12) for errors

### Entry Not Searchable

**Wait:** Give it 1-2 seconds after saving

**Try:**
1. Use different keywords
2. Search for tags you added
3. Check the detail view to see what was saved

---

## Success Checklist

After completing your first capture, verify:

- [ ] Teams message had a question mark
- [ ] Capture modal showed the extracted question
- [ ] Key Points didn't include your question
- [ ] New entry form was pre-populated
- [ ] Entry saved successfully
- [ ] Detail view displayed the entry
- [ ] Entry appears in search results

---

## What's Next?

### Build Your Knowledge Base
- Capture 3-5 conversations per week
- Tag entries consistently
- Review and update old entries

### Share with Your Team
- Use the Share button in entry details
- Share deep links to specific entries
- Encourage colleagues to add their solutions

### Explore Advanced Features
- Connect to Confluence (if configured)
- Try the Knowledge Graph view
- Set up email notifications (if available)

---

## Need Help?

### Check Documentation
- **Technical Details:** `TEAMS_INTEGRATION_IMPROVEMENTS.md`
- **Full Test Guide:** `TESTING_GUIDE.md`
- **Implementation:** `IMPLEMENTATION_SUMMARY.md`

### Debug Mode
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for logs starting with `[Teams Capture]` or `[NewEntryView]`

### Common Issues
- Backend offline: Extension still works, data saved locally
- Long conversations: May take 3-5 seconds to process
- Multiple questions: Only the first one is extracted

---

## Quick Reference

| Action | Location |
|--------|----------|
| Contact Expert | Knowledge Detail View → Contact Section |
| Capture Chat | Teams Page → Purple Button → Capture Chat |
| Review Capture | Modal appears automatically |
| Save Entry | Modal → Save to Navify → Review → Save |
| Find Entry | Search View → Type keywords → Results |

---

## Time Investment

- **First capture:** ~5 minutes (learning the flow)
- **Subsequent captures:** ~1-2 minutes
- **Long-term benefit:** Instant answers to repeated questions

---

## Final Tips

🎉 **Congratulations!** You're now set up to build your personal knowledge base from Teams conversations.

**Remember:**
- Every conversation is potential knowledge
- Capture solutions as they happen
- Tag consistently for better search
- Review and update entries over time

**Happy Knowledge Building!** 🚀

---

## Feedback

Help us improve! Let us know:
- What worked well
- What was confusing
- What features you'd like to see

---

*Last Updated: January 2025*
*Version: 1.0.0*
