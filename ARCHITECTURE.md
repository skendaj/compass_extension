# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Chrome Extension                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Popup UI (React)                      │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │ Search View │  │ Results View │  │ Detail View     │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↓↑                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Service Layer                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │AI Classifier │  │Storage Svc   │  │Integration Svc │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↓↑                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Chrome Storage API (Local)                   │  │
│  │  • Knowledge Base  • Users  • History  • Conversations    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↓↑                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          Background Service Worker                        │  │
│  │  • Event Handling  • External Links  • Context Menus     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────────┐
│                    External Integrations                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │MS Teams API  │  │ Outlook API  │  │ Internal Docs (Wiki) │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Layer (React Components)

#### 1. App.tsx (Main Controller)
**Responsibilities:**
- Route between different views
- Manage global state
- Orchestrate search operations
- Initialize mock data

**State Management:**
- currentView: 'search' | 'results' | 'detail' | 'history'
- searchQuery: string
- searchResults: SearchResult[]
- selectedEntry: KnowledgeEntry | null

#### 2. SearchView Component
**Responsibilities:**
- Display search interface
- Handle query input
- Show example queries
- Present feature highlights

**Props:**
- onSearch: (query: string) => void
- isLoading: boolean

#### 3. ResultsView Component
**Responsibilities:**
- Display categorized search results
- Render solution, expert, and documentation cards
- Handle navigation to detail view
- Provide expert contact actions

**Props:**
- query: string
- results: SearchResult[]
- onViewDetail: (entry: KnowledgeEntry) => void
- onBack: () => void

#### 4. KnowledgeDetailView Component
**Responsibilities:**
- Show full solution details
- Display contributors and resources
- Handle rating functionality
- Format dates and durations

**Props:**
- entry: KnowledgeEntry
- onBack: () => void
- onRate: (entryId: string, helpful: boolean) => void

#### 5. HistoryView Component
**Responsibilities:**
- Display search history
- Format timestamps
- Enable re-searching from history

**Props:**
- onSearch: (query: string) => void

---

## Service Layer

### 1. AIClassifier Service

**Purpose:** Classify user queries into categories and extract technical terms

**Methods:**

```typescript
classify(query: string): ClassificationResult
// Returns: { category, confidence, keywords }

extractTechnicalTerms(query: string): string[]
// Returns: Array of technical keywords
```

**Algorithm:**
1. Convert query to lowercase
2. Match against keyword dictionaries
   - Engineering keywords (500+ terms)
   - HR keywords (50+ terms)
3. Count matches in each category
4. Calculate confidence score
5. Extract matched keywords
6. Return classification

**Confidence Calculation:**
```
confidence = 0.5 + (matches / totalWords)
capped at 0.95
```

### 2. StorageService

**Purpose:** Abstract Chrome storage operations

**Methods:**

```typescript
// Knowledge Base
saveKnowledgeEntry(entry: KnowledgeEntry): Promise<void>
getAllKnowledgeEntries(): Promise<KnowledgeEntry[]>
getKnowledgeEntryById(id: string): Promise<KnowledgeEntry | null>
updateKnowledgeEntry(id: string, updates: Partial<KnowledgeEntry>): Promise<void>
searchKnowledgeEntries(query: string, tags?: string[]): Promise<KnowledgeEntry[]>
incrementViews(entryId: string): Promise<void>
rateKnowledgeEntry(entryId: string, helpful: boolean): Promise<void>

// Users/Experts
saveUser(user: User): Promise<void>
getAllUsers(): Promise<User[]>
getUserById(id: string): Promise<User | null>
searchExperts(tags: string[], limit: number): Promise<User[]>

// Conversations
saveConversation(conversation: ConversationTracker): Promise<void>
getAllConversations(): Promise<ConversationTracker[]>
getActiveConversations(): Promise<ConversationTracker[]>

// Search History
saveSearchQuery(query: string): Promise<void>
getSearchHistory(): Promise<{query: string, timestamp: Date}[]>
```

**Storage Schema:**
```javascript
chrome.storage.local = {
  knowledgeEntries: KnowledgeEntry[],
  users: User[],
  conversations: ConversationTracker[],
  searchHistory: SearchHistoryItem[],
  documentation: DocumentationLink[]
}
```

**Search Algorithm:**
1. Retrieve all knowledge entries
2. Filter by:
   - Title contains query (case-insensitive)
   - Problem description contains query
   - Solution contains query
   - Tags match query
3. Sort by:
   - Primary: (helpfulCount - notHelpfulCount)
   - Secondary: Creation date (recent first)
4. Return ranked results

### 3. Background Service Worker

**Purpose:** Handle background tasks and external integrations

**Event Listeners:**

```typescript
chrome.runtime.onInstalled
// Initialize storage on first install

chrome.runtime.onMessage
// Handle messages:
// - openTeamsChat
// - openEmail
// - openDocumentation

chrome.contextMenus.onClicked
// "Search in Knowledge Base" on text selection
```

---

## Data Flow

### Search Flow

```
1. User enters query in SearchView
   ↓
2. App.handleSearch() called
   ↓
3. AIClassifier.classify(query)
   → Returns: { category: 'engineering', confidence: 0.85, keywords: [...] }
   ↓
4. StorageService.searchKnowledgeEntries(query)
   → Returns: KnowledgeEntry[]
   ↓
5. AIClassifier.extractTechnicalTerms(query)
   → Returns: ['api', 'error', '500', 'production']
   ↓
6. StorageService.searchExperts(technicalTerms)
   → Returns: User[] (experts)
   ↓
7. Filter mockDocumentation by tags
   → Returns: DocumentationLink[]
   ↓
8. Combine all results into SearchResult[]
   ↓
9. Update state and navigate to ResultsView
   ↓
10. ResultsView renders categorized results
```

### Detail View Flow

```
1. User clicks solution card in ResultsView
   ↓
2. App.handleViewDetail(entry) called
   ↓
3. StorageService.incrementViews(entry.id)
   → Updates view count in storage
   ↓
4. Set selectedEntry state
   ↓
5. Navigate to 'detail' view
   ↓
6. KnowledgeDetailView renders with full entry
```

### Rating Flow

```
1. User clicks "Yes, this helped" in KnowledgeDetailView
   ↓
2. handleRate(true) called
   ↓
3. StorageService.rateKnowledgeEntry(entryId, true)
   ↓
4. Storage updates:
   entry.metadata.helpfulCount++
   ↓
5. Re-fetch updated entry
   ↓
6. Update selectedEntry state
   ↓
7. Component re-renders with new counts
   ↓
8. Show "Thank you" message
```

---

## Data Models

### Core Entities

#### User
```typescript
{
  id: string                    // Unique identifier
  name: string                  // Full name
  email: string                 // Contact email
  role: string                  // Job title
  department: string            // Engineering, HR, etc.
  expertiseTags: string[]       // Skills/expertise
  contactMethods: {
    teams?: string              // Teams username
    slack?: string              // Slack handle
    email: string               // Email (duplicate for structure)
  }
  stats: {
    questionsAsked: number
    questionsAnswered: number
    solutionRating: number      // Average 0-5
    responseTime: number        // Minutes
  }
  availability: enum            // available | busy | away
  avatar?: string               // Emoji or image
}
```

#### KnowledgeEntry
```typescript
{
  id: string
  title: string                 // Summary title
  problem: string               // Original question
  solution: {
    summary: string             // TL;DR
    steps: string[]             // Ordered list
    codeSnippets?: string[]     // Code examples
  }
  askedBy: User                 // Who asked
  solvedBy: User[]              // Who helped (can be multiple)
  tags: string[]                // Keywords for search
  category: enum                // engineering | hr | general
  resources: {
    links: string[]
    files: FileReference[]
    documentation: string[]
  }
  metadata: {
    createdAt: Date
    resolvedAt: Date
    resolutionTime: number      // Minutes
    difficulty: enum            // easy | medium | hard
    views: number
    helpfulCount: number        // Upvotes
    notHelpfulCount: number     // Downvotes
  }
  status: enum                  // active | outdated | verified
}
```

#### SearchResult
```typescript
{
  type: 'solution' | 'expert' | 'documentation'
  relevanceScore: number        // 0-1 score
  data: KnowledgeEntry | User | DocumentationLink
}
```

---

## State Management

### Current Approach: React useState

**Pros:**
- Simple for small extension
- No additional dependencies
- Easy to understand

**State Location:** App.tsx (top level)

**State Flow:**
```
App (global state)
 ├─> SearchView (presentation only)
 ├─> ResultsView (presentation only)
 ├─> KnowledgeDetailView (local rating state)
 └─> HistoryView (local history state)
```

### Future: Consider Zustand for Complex State

```typescript
// Future state store structure
interface AppStore {
  // UI State
  currentView: View
  isLoading: boolean
  
  // Data State
  searchQuery: string
  searchResults: SearchResult[]
  selectedEntry: KnowledgeEntry | null
  searchHistory: SearchHistoryItem[]
  
  // Actions
  setCurrentView: (view: View) => void
  performSearch: (query: string) => Promise<void>
  selectEntry: (entry: KnowledgeEntry) => void
  rateEntry: (id: string, helpful: boolean) => Promise<void>
}
```

---

## Performance Considerations

### 1. Storage Optimization
- **Issue:** Chrome storage.local limited to 10MB
- **Solution:** 
  - Implement LRU cache for search history (max 50 items)
  - Archive old knowledge entries
  - Compress large text fields

### 2. Search Performance
- **Issue:** Linear search O(n) slow with large datasets
- **Current:** Fine for <1000 entries
- **Future:** 
  - Implement indexed search
  - Use Web Workers for heavy search
  - Add debouncing to search input

### 3. Rendering Performance
- **Issue:** Large result lists slow to render
- **Solution:**
  - Virtual scrolling for long lists
  - Lazy load images/avatars
  - Memoize expensive computations

---

## Security & Privacy

### Data Security
- All data stored locally in browser
- No server-side storage (in demo version)
- Chrome's security sandbox applies

### Privacy Considerations
- User search history stored locally
- No tracking or analytics (in demo)
- Contact information requires user action to use

### Future Production Security
- Authentication via company SSO
- Role-based access control
- Audit logging
- Data encryption at rest
- HTTPS for all API calls

---

## Scalability Plan

### Phase 1: Current (Local Extension)
- Chrome storage only
- Mock data
- Single user
- Max 1000 entries

### Phase 2: Connected Extension
- Backend API integration
- Real user authentication
- Shared knowledge base
- 10,000+ entries

### Phase 3: Enterprise Platform
- Vector database for semantic search
- AI-powered summarization
- Real-time conversation tracking
- Analytics dashboard
- Multi-tenant support
- Unlimited entries

### Technology Migration Path

```
Phase 1 (Current):
Frontend: React + Chrome Storage

Phase 2 (Connected):
Frontend: React
Backend: Node.js + Express
Database: PostgreSQL
Cache: Redis
Auth: OAuth 2.0

Phase 3 (Enterprise):
Frontend: React + Mobile App
Backend: Microservices (Node.js)
Databases: 
  - PostgreSQL (relational data)
  - Pinecone/Weaviate (vector search)
  - Redis (cache)
AI: OpenAI API / Azure OpenAI
Integrations: Microsoft Graph, Slack
Infrastructure: AWS/Azure
Monitoring: Grafana + Prometheus
```

---

## API Design (Future)

### REST Endpoints

```
POST   /api/search
Body: { query: string, filters?: object }
Returns: { results: SearchResult[] }

GET    /api/knowledge/:id
Returns: { entry: KnowledgeEntry }

POST   /api/knowledge
Body: { entry: KnowledgeEntry }
Returns: { id: string }

PUT    /api/knowledge/:id
Body: { updates: Partial<KnowledgeEntry> }
Returns: { success: boolean }

POST   /api/knowledge/:id/rate
Body: { helpful: boolean }
Returns: { success: boolean }

GET    /api/experts
Query: ?tags=nodejs,api&limit=5
Returns: { experts: User[] }

GET    /api/users/:id
Returns: { user: User }

POST   /api/conversations
Body: { conversation: ConversationTracker }
Returns: { id: string }

GET    /api/history
Returns: { history: SearchHistoryItem[] }
```

---

## Testing Strategy

### Unit Tests
- AI Classifier logic
- Storage service methods
- Data transformations
- Utility functions

### Component Tests
- React component rendering
- User interactions
- State updates
- Props handling

### Integration Tests
- Search flow end-to-end
- Rating functionality
- Expert contact flow
- History navigation

### E2E Tests (Chrome Extension)
- Install extension
- Perform search
- View details
- Rate solution
- Check storage persistence

---

## Deployment

### Development
```bash
npm run dev
# Load unpacked in Chrome
```

### Production Build
```bash
npm run build
# Package dist/ folder
# Upload to Chrome Web Store
```

### CI/CD Pipeline (Future)
```
1. Commit to main branch
   ↓
2. GitHub Actions triggered
   ↓
3. Run tests (unit, integration)
   ↓
4. Build extension (npm run build)
   ↓
5. Create ZIP package
   ↓
6. Upload to Chrome Web Store API
   ↓
7. Notify team
```

---

This architecture supports current demo functionality and provides a clear path for enterprise scaling.

