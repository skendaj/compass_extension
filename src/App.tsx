import React, { useState, useEffect } from "react";
import { Search, History, BookMarked, Settings } from "lucide-react";
import SearchView from "./components/SearchView";
import ResultsView from "./components/ResultsView";
import KnowledgeDetailView from "./components/KnowledgeDetailView";
import HistoryView from "./components/HistoryView";
import SettingsView from "./components/SettingsView";
import { KnowledgeEntry, User, DocumentationLink, SearchResult } from "./types";
import { aiClassifier } from "./services/aiClassifier";
import { storageService } from "./services/storageService";
import { initializeMockData, mockDocumentation } from "./services/mockData";
import { DeepLinkService } from "./services/deepLinkService";

type View = "search" | "results" | "detail" | "history" | "settings";

function App() {
  const [currentView, setCurrentView] = useState<View>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Initialize mock data on first load
  useEffect(() => {
    const init = async () => {
      const entries = await storageService.getAllKnowledgeEntries();
      if (entries.length === 0) {
        await initializeMockData();
      }

      // Check for pending deep link
      checkDeepLink();
    };
    init();
  }, []);

  // Handle deep links
  const checkDeepLink = async () => {
    const pendingLink = await DeepLinkService.getPendingLink();
    if (pendingLink) {
      const parsed = DeepLinkService.parseDeepLink(pendingLink);

      if (parsed.type === "entry" && parsed.id) {
        // Load specific entry
        const entry = await storageService.getKnowledgeEntryById(parsed.id);
        if (entry) {
          handleViewDetail(entry);
        }
      } else if (parsed.type === "search" && parsed.query) {
        // Perform search
        handleSearch(parsed.query);
      }
    }

    // Also check URL parameters (for iframe/modal)
    const urlParams = new URLSearchParams(window.location.search);
    const entryId = urlParams.get("entry");
    const searchQuery = urlParams.get("q");

    if (entryId) {
      const entry = await storageService.getKnowledgeEntryById(entryId);
      if (entry) {
        handleViewDetail(entry);
      }
    } else if (searchQuery) {
      handleSearch(searchQuery);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setSearchQuery(query);

    // Save search to history
    await storageService.saveSearchQuery(query);

    // Classify the query
    const classification = aiClassifier.classify(query);

    // Search knowledge base
    const knowledgeEntries = await storageService.searchKnowledgeEntries(query);

    // Find relevant experts
    const technicalTerms = aiClassifier.extractTechnicalTerms(query);
    const experts = await storageService.searchExperts(technicalTerms);

    // Combine results
    const results: SearchResult[] = [
      ...knowledgeEntries.map((entry) => ({
        type: "solution" as const,
        relevanceScore: 0.9,
        data: entry,
      })),
      ...experts.map((expert) => ({
        type: "expert" as const,
        relevanceScore: 0.8,
        data: expert,
      })),
      ...mockDocumentation
        .filter((doc) =>
          doc.tags.some((tag) =>
            technicalTerms.some((term) =>
              tag.toLowerCase().includes(term.toLowerCase()),
            ),
          ),
        )
        .map((doc) => ({
          type: "documentation" as const,
          relevanceScore: 0.7,
          data: doc,
        })),
    ];

    setSearchResults(results);
    setCurrentView("results");
    setIsLoading(false);
  };

  const handleViewDetail = async (entry: KnowledgeEntry) => {
    setSelectedEntry(entry);
    await storageService.incrementViews(entry.id);
    setCurrentView("detail");
  };

  const handleBack = () => {
    if (currentView === "detail") {
      setCurrentView("results");
    } else if (currentView === "results" || currentView === "history") {
      setCurrentView("search");
    }
  };

  const handleRateEntry = async (entryId: string, helpful: boolean) => {
    await storageService.rateKnowledgeEntry(entryId, helpful);
    // Refresh the entry
    const updatedEntry = await storageService.getKnowledgeEntryById(entryId);
    if (updatedEntry) {
      setSelectedEntry(updatedEntry);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          {/* <h1 className="title">TeamSystem Navify</h1> */}
          <p className="subtitle">
            Find answers, experts, and solutions instantly
          </p>
        </div>

        {/* Navigation */}
        <nav className="nav">
          <button
            className={`nav-btn ${currentView === "search" || currentView === "results" || currentView === "detail" ? "active" : ""}`}
            onClick={() => setCurrentView("search")}
          >
            <Search size={18} />
            <span>Search</span>
          </button>
          <button
            className={`nav-btn ${currentView === "history" ? "active" : ""}`}
            onClick={() => setCurrentView("history")}
          >
            <History size={18} />
            <span>History</span>
          </button>
          <button
            className={`nav-btn ${currentView === "settings" ? "active" : ""}`}
            onClick={() => setCurrentView("settings")}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {currentView === "search" && (
          <SearchView onSearch={handleSearch} isLoading={isLoading} />
        )}

        {currentView === "results" && (
          <ResultsView
            query={searchQuery}
            results={searchResults}
            onViewDetail={handleViewDetail}
            onBack={handleBack}
          />
        )}

        {currentView === "detail" && selectedEntry && (
          <KnowledgeDetailView
            entry={selectedEntry}
            onBack={handleBack}
            onRate={handleRateEntry}
          />
        )}

        {currentView === "history" && <HistoryView onSearch={handleSearch} />}

        {currentView === "settings" && <SettingsView />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          Tip: Ask questions naturally, like "How do I deploy to production?"
        </p>
      </footer>
    </div>
  );
}

export default App;
