# User Flow Documentation

## Overview
This document details all user flows for the TeamSystem Navify Chrome extension.

---

## Flow 1: First Time User Experience

### Steps:
1. User installs extension from Chrome Web Store (or loads unpacked)
2. Extension icon appears in Chrome toolbar
3. User clicks extension icon
4. **Search View** loads with:
   - Welcome message
   - Search input field
   - Example queries (clickable)
   - Feature highlights

### User Actions:
- Read about features
- Click example query OR type custom query
- Submit search

### Expected Outcome:
- User understands what the extension does
- User performs first search
- Mock data loads automatically

---

## Flow 2: Engineering Problem Search

### Scenario: Developer has a production bug

### Steps:
1. User opens extension
2. Types: "API returns 500 error in production"
3. AI classifies as **Engineering** query
4. System searches knowledge base
5. **Results View** displays:
   - 2 Previous Solutions (if any match)
   - 3 Recommended Experts (Backend engineers, DevOps)
   - 2 Documentation Links (API troubleshooting guides)

### User Actions:

#### Option A: View Previous Solution
1. Click solution card
2. **Detail View** shows:
   - Full problem description
   - Solution summary
   - Step-by-step resolution
   - Code examples
   - Resources used
   - Who solved it
3. Read solution
4. Rate as "helpful" or "not helpful"
5. Back to results OR back to search

#### Option B: Contact Expert
1. Click expert card
2. View expert profile:
   - Expertise tags
   - Statistics (questions answered, rating, response time)
   - Availability status
3. Click "Teams Chat" button
4. Microsoft Teams opens with expert's contact
5. Pre-filled context: Original query
6. User chats with expert
7. *(Future: Conversation auto-tracked)*
8. *(Future: Summary auto-generated)*

#### Option C: View Documentation
1. Click documentation card
2. External link opens in new tab
3. User reads internal wiki/confluence page

### Expected Outcome:
- User finds solution or expert quickly
- Problem gets resolved
- User rates solution for future reference

---

## Flow 3: HR Query

### Scenario: Employee needs to request time off

### Steps:
1. User opens extension
2. Types: "How do I request parental leave?"
3. AI classifies as **HR** query
4. **Results View** displays:
   - Previous HR Solutions (policy explanations)
   - HR Contact Card with:
     - HR Manager name and role
     - "Teams Chat" button
     - "Email" button
     - "HR Portal" link
   - Related Policy Documents (PDFs, links)

### User Actions:

#### Quick Contact Flow:
1. Click "Teams Chat" button on HR card
2. Microsoft Teams opens with HR contact
3. User asks question directly

#### OR Email Flow:
1. Click "Email" button
2. Outlook/default email client opens
3. Pre-filled subject: "Question: How do I request parental leave?"
4. To: HR contact email
5. User types message and sends

#### OR Self-Service Flow:
1. Click previous solution about parental leave
2. Read detailed policy explanation
3. Download attached form
4. Follow instructions
5. Rate solution as helpful

### Expected Outcome:
- User contacts HR quickly OR
- User finds self-service answer
- Reduces HR's repetitive questions

---

## Flow 4: Knowledge Discovery (Browsing)

### Scenario: User exploring what's available

### Steps:
1. User opens extension
2. Scrolls through example queries
3. Clicks "Database migration best practices"
4. **Results View** shows:
   - High-quality solution from 2 months ago
   - Multiple experts who helped
   - Detailed documentation links
5. User clicks solution
6. **Detail View** shows:
   - Complete migration guide
   - 7-step process
   - Code examples
   - Shared files (migration scripts)
   - Links to wiki pages
7. User bookmarks (mentally) for future reference
8. Rates as "helpful"

### Expected Outcome:
- User learns from past experiences
- Proactive learning reduces future questions
- High-quality content gets more visibility

---

## Flow 5: Repeat Search (Using History)

### Scenario: User wants to revisit a previous search

### Steps:
1. User opens extension
2. Clicks "History" tab
3. **History View** displays:
   - List of recent searches
   - Timestamps (e.g., "2h ago", "Yesterday")
   - Most recent at top
4. User finds "API returns 500 error in production"
5. Clicks history item
6. Same results as original search load
7. User views updated solution or new expert

### Expected Outcome:
- Quick access to frequently needed info
- No need to retype queries
- Efficiency improvement

---

## Flow 6: Rating and Feedback

### Scenario: User consumed a solution

### Steps:
1. User in **Detail View** of a solution
2. Scrolls to bottom
3. Sees "Was this helpful?" section
4. Current stats: 12 helpful, 1 not helpful
5. User clicks "Yes, this helped" button
6. Count updates to 13 helpful
7. Thank you message appears
8. Rating persists (can't vote again)

### Impact:
- Solution ranking improves
- Quality solutions surface higher in search
- Poor solutions get demoted or flagged for review

---

## Flow 7: No Results Found

### Scenario: User searches for something not in knowledge base

### Steps:
1. User types: "How to configure quantum encryption?"
2. System searches but finds no matches
3. **Results View** displays:
   - "No results found" message
   - Suggestion: "Try rephrasing or using different keywords"
   - *(Future: "Ask a question to create new entry")*

### Expected Outcome:
- User tries different keywords OR
- User contacts someone directly OR
- *(Future: Creates new question thread)*

---

## Flow 8: Expert Availability Check

### Scenario: User needs to know if expert is available

### Steps:
1. User searches engineering problem
2. **Results View** shows 3 experts
3. Expert cards display:
   - Expert 1: 🟢 Available
   - Expert 2: 🟡 Busy
   - Expert 3: 🔴 Away
4. User prioritizes contacting "Available" expert
5. Clicks "Teams Chat"

### Expected Outcome:
- Better response times
- Reduced frustration
- Experts aren't overwhelmed when unavailable

---

## Flow 9: Multi-Expert Solution

### Scenario: Complex problem solved by team

### Steps:
1. User views solution detail
2. **Contributors** section shows:
   - Original asker
   - 3 experts who helped (Backend Lead, DevOps, Security)
3. User can see:
   - Who contributed what
   - Different expertise areas
4. User knows entire team involved

### Expected Outcome:
- Credit to all contributors
- User knows who to contact for different aspects
- Team collaboration is visible

---

## Flow 10: Resource-Rich Solution

### Scenario: Solution includes many resources

### Steps:
1. User views solution about "Setting up CI/CD"
2. **Resources** section includes:
   - 5 documentation links (confluence, wiki, GitHub)
   - 3 files (config files, scripts)
   - Video recording link
3. User clicks each resource
4. New tabs open with materials
5. User downloads files
6. User follows guide step-by-step

### Expected Outcome:
- Comprehensive learning
- All materials in one place
- Successful implementation

---

## Edge Cases & Error Handling

### Edge Case 1: Chrome Storage Full
- System notifies user
- Suggests clearing old history
- Maintains critical knowledge entries

### Edge Case 2: Offline Mode
- Extension works with cached data
- "Offline mode" indicator shown
- Sync when back online

### Edge Case 3: Expert Left Company
- Profile marked as "Inactive"
- Redirects to their manager or similar expert
- Historical contributions remain

### Edge Case 4: Outdated Solution
- Users can flag as "outdated"
- Admin reviews and updates or archives
- Warning badge shown on old entries

---

## User Journey Metrics

### Success Metrics:
- **Time to Resolution**: From search to solved
- **Self-Service Rate**: % finding answers without contacting someone
- **Contact Success Rate**: % of expert contacts leading to resolution
- **Knowledge Base Growth**: New entries per week
- **User Engagement**: Searches per user per day

### User Satisfaction:
- Solution helpfulness ratings
- Expert ratings
- Feature usage analytics
- User feedback/comments

---

## Future Flow Enhancements

### Planned Features:

#### 1. Ask a Question Flow
- User can submit new question
- System creates ticket
- Notifies relevant experts
- Tracks to resolution
- Auto-generates summary

#### 2. Conversation Tracking
- Monitors Teams/Slack chats
- Detects when issue resolved
- Prompts for summary
- Adds to knowledge base

#### 3. Proactive Suggestions
- Analyzes what user is working on
- Suggests relevant documentation
- "People also searched for..."
- Trending issues in company

#### 4. Mobile App
- Same flows on mobile
- Push notifications for replies
- Voice search capability

---

This user flow document should be updated as features evolve and new flows are added.

