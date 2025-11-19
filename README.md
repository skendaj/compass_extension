# TeamSystem Navify - Chrome Extension

An intelligent Chrome extension that acts as an internal StackOverflow-style assistant for enterprise team productivity. It routes users to the right people and information while building an organizational knowledge base.

## 🚀 Features

### Smart Role Routing

- **Engineering Queries**: Returns relevant internal documentation, recommended experts (Engineering Managers, Tech Leads, SMEs), and their contact methods
- **HR Queries**: Returns HR contacts with quick action buttons to open Microsoft Teams or Outlook

### AI-Enhanced Support Flow

- Automatically generates summaries when users resolve issues with experts
- Captures problem statements, solutions, shared resources, and key steps
- Stores summaries in a searchable knowledge base

### Internal Knowledge Search

- Search previous solutions and conversations
- Find experts who solved similar problems
- Access internal documentation and resources
- Rate solutions for quality assurance

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Chrome browser

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Mode

Run the development server:

```bash
npm run dev
```

This will start Vite in development mode. The extension will hot-reload when you make changes.

### 3. Build for Production

Build the extension:

```bash
npm run build
```

This creates a `dist` folder with the compiled extension.

### 4. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

The extension icon should appear in your Chrome toolbar!

## 🎯 Usage

### Basic Search

1. Click the extension icon in your toolbar
2. Type your question or problem
3. View categorized results:
   - Previous solutions
   - Recommended experts
   - Internal documentation

### Contact Experts

- Click on an expert card to see their profile
- Use "Teams Chat" or "Email" buttons to reach out
- Pre-filled context helps experts understand your issue

### View Solutions

- Click on any solution card to see full details
- Review problem description, solution steps, and code examples
- Rate solutions as helpful or not helpful

### Search History

- Click the "History" tab to see your recent searches
- Click any history item to re-run that search

## 📁 Project Structure

```
extension/
├── src/
│   ├── components/           # React components
│   │   ├── SearchView.tsx    # Main search interface
│   │   ├── ResultsView.tsx   # Search results display
│   │   ├── KnowledgeDetailView.tsx  # Solution details
│   │   └── HistoryView.tsx   # Search history
│   ├── services/             # Business logic
│   │   ├── aiClassifier.ts   # AI query classification
│   │   ├── storageService.ts # Chrome storage management
│   │   └── mockData.ts       # Demo data
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   ├── background.ts         # Service worker
│   └── styles.css            # Global styles
├── manifest.json             # Chrome extension manifest
├── index.html                # Extension popup HTML
├── package.json
├── vite.config.ts            # Vite configuration
└── README.md
```

## 🎨 UI Components

### Search View

- Natural language search input
- Example queries for quick access
- Feature highlights

### Results View

- **Solutions Section**: Previous solved issues with ratings
- **Experts Section**: Team members with expertise and availability
- **Documentation Section**: Links to internal resources

### Detail View

- Full solution with step-by-step instructions
- Code examples and shared resources
- Contributor information
- Rating functionality

## 🧠 AI Classification Logic

The extension uses keyword-based classification to route queries:

**Engineering Keywords**: code, bug, error, API, database, deploy, docker, kubernetes, etc.

**HR Keywords**: leave, vacation, benefits, payroll, insurance, onboarding, etc.

The classifier:

1. Extracts keywords from the query
2. Counts matches in each category
3. Returns category with confidence score
4. Finds experts matching technical terms

## 💾 Data Storage

Uses Chrome's `storage.local` API to store:

- Knowledge base entries
- User profiles and experts
- Search history
- Conversation tracking

All data is stored locally in the browser.

## 🔧 Configuration

### Adding Mock Data

Edit `src/services/mockData.ts` to add:

- Team members and experts
- Example knowledge entries
- Documentation links

### Customizing Classification

Edit `src/services/aiClassifier.ts` to adjust:

- Keyword lists for different categories
- Confidence thresholds
- Technical term extraction

## 🚀 Future Enhancements

- [ ] Integration with real AI APIs (OpenAI, Azure OpenAI)
- [ ] Microsoft Teams bot integration
- [ ] Slack integration
- [ ] Automatic conversation tracking
- [ ] Vector similarity search for better matching
- [ ] Analytics dashboard
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Admin panel for knowledge base management

## 🔐 Security & Privacy

- All data stored locally in browser
- No external API calls in demo version
- Contact information requires user action to use
- Respects Chrome extension security policies

## 🤝 Contributing

This is an enterprise internal tool. For production use:

1. Replace mock data with real company data
2. Integrate with company authentication
3. Connect to company databases/APIs
4. Set up proper security and access controls

## 📄 License

Internal use only - Enterprise license

## 📞 Support

For questions or issues, contact your IT department or the development team.

---

Built with ❤️ using React, TypeScript, and Vite

# compass_extension
