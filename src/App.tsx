import React, { useState, useEffect } from "react";
import {
  Search,
  History,
  BookMarked,
  Settings,
  LogOut,
  GitGraphIcon,
} from "lucide-react";
import KnowledgeGraph from "./components/KnowledgeGraph";
import SearchView from "./components/SearchView";
import ResultsView from "./components/ResultsView";
import KnowledgeDetailView from "./components/KnowledgeDetailView";
import NewEntryView from "./components/NewEntryView";
import HistoryView from "./components/HistoryView";
import SettingsView from "./components/SettingsView";
import { LoginPage } from "./components/LoginPage";
import { useAuth } from "./contexts/AuthContext";
import { KnowledgeEntry, User, DocumentationLink, SearchResult } from "./types";
import { aiClassifier } from "./services/aiClassifier";
import { qnaService } from "./services/qnaService";
import { storageService } from "./services/storageService";
import { initializeMockData, mockDocumentation } from "./services/mockData";
import { DeepLinkService } from "./services/deepLinkService";
import { CTAIconButton } from "./components/CTA";
import { AvatarLetter } from "./components/AvatarLetter";

type View =
  | "search"
  | "results"
  | "detail"
  | "history"
  | "settings"
  | "graph"
  | "new-entry";

function App() {
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();
  const [currentView, setCurrentView] = useState<View>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);
  const [newEntryInitialData, setNewEntryInitialData] = useState<
    | {
        title: string;
        content: string;
        question?: string;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    const init = async () => {
      const entries = await storageService.getAllKnowledgeEntries();
      if (entries.length === 0) {
        await initializeMockData();
      }

      checkDeepLink();
    };

    if (isAuthenticated) {
      init();
    }
  }, [isAuthenticated]);

  const checkDeepLink = async () => {
    const pendingLink = await DeepLinkService.getPendingLink();
    if (pendingLink) {
      const parsed = DeepLinkService.parseDeepLink(pendingLink);

      if (parsed.type === "entry" && parsed.id) {
        const entry = await storageService.getKnowledgeEntryById(parsed.id);
        if (entry) {
          handleViewDetail(entry);
        }
      } else if (parsed.type === "search" && parsed.query) {
        handleSearch(parsed.query);
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");
    const entryId = urlParams.get("entry");
    const searchQuery = urlParams.get("q");

    if (action === "new-from-teams") {
      const title = urlParams.get("title");
      const content = urlParams.get("content");
      const question = urlParams.get("question");

      if (title && content) {
        console.log("[App] Opening new entry from Teams:", {
          title,
          content,
          question,
        });
        setNewEntryInitialData({
          title,
          content,
          question: question || undefined,
        });
        setCurrentView("new-entry");
      }
    } else if (entryId) {
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

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await storageService.saveSearchQuery(query);

    const classification = aiClassifier.classify(query);

    const qnaResp = await qnaService.ask(query);

    const knowledgeEntries = await storageService.searchKnowledgeEntries(query);

    const technicalTerms = aiClassifier.extractTechnicalTerms(query);
    const experts = await storageService.searchExperts(technicalTerms);

    const combined: SearchResult[] = [];

    if (qnaResp) {
      if ((qnaResp as any).found === true) {
        const ke = qnaService.mapFoundToKnowledgeEntry(
          qnaResp as any,
          classification.category,
          query,
        );
        combined.push({ type: "solution", relevanceScore: 1.0, data: ke });
        setNotFoundMessage(null);
      } else {
        const notFound = qnaResp as any;
        setNotFoundMessage(
          notFound.message ||
            "I don't have an exact answer, but here are some people who might help and related documentation:",
        );

        if (Array.isArray(notFound.suggestedContacts)) {
          combined.push(
            ...notFound.suggestedContacts.map((c: any) => ({
              type: "expert" as const,
              relevanceScore: 0.85,
              data: qnaService.mapSuggestedContactToUser(c),
            })),
          );
        }
        if (Array.isArray(notFound.relatedDocs)) {
          combined.push(
            ...notFound.relatedDocs.map((d: any) => ({
              type: "documentation" as const,
              relevanceScore: 0.8,
              data: qnaService.mapRelatedDocToDocumentationLink(d),
            })),
          );
        }
      }
    } else {
      setNotFoundMessage(null);
    }

    combined.push(
      ...knowledgeEntries.map((entry) => ({
        type: "solution" as const,
        relevanceScore: 0.9,
        data: entry,
      })),
    );

    combined.push(
      ...experts.map((expert) => ({
        type: "expert" as const,
        relevanceScore: 0.8,
        data: expert,
      })),
    );
    combined.push(
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
    );

    const results: SearchResult[] = combined;

    setSearchResults(results);

    const solutionResults = results.filter((r) => r.type === "solution");
    if (solutionResults.length === 1) {
      const entry = solutionResults[0].data as KnowledgeEntry;
      await handleViewDetail(entry);
    } else {
      setCurrentView("results");
    }

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
    const updatedEntry = await storageService.getKnowledgeEntryById(entryId);
    if (updatedEntry) {
      setSelectedEntry(updatedEntry);
    }
  };

  const handleSaveNewEntry = async (entry: KnowledgeEntry) => {
    console.log("[App] New entry saved:", entry);
    setNewEntryInitialData(undefined);

    // Show success and navigate to the detail view
    setSelectedEntry(entry);
    setCurrentView("detail");

    // Optional: Also trigger a search to refresh results with the new entry
    // This ensures the entry appears in search results immediately
    if (searchQuery) {
      // Refresh current search results to include new entry
      setTimeout(() => {
        handleSearch(searchQuery);
      }, 100);
    }
  };

  const handleCancelNewEntry = () => {
    console.log("[App] New entry cancelled");
    setNewEntryInitialData(undefined);
    setCurrentView("search");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  if (authLoading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage appName="TeamSystem Navify" />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <p className="subtitle">
            Get instant answers or connect with experts in your organization
          </p>
          <nav className="nav">
            <button
              className={`nav-btn ${currentView === "search" || currentView === "results" || currentView === "detail" ? "active" : ""}`}
              onClick={() => setCurrentView("search")}
            >
              <Search size={18} />
              <span>Search</span>
            </button>
            <button
              className={`nav-btn ${currentView === "graph" ? "active" : ""}`}
              onClick={() => setCurrentView("graph")}
            >
              <GitGraphIcon size={18} />
              <span>Graph</span>
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
          {user && (
            <div className="user-info">
              <AvatarLetter name={user.name} />
              <CTAIconButton
                onClick={handleLogout}
                title="Sign out"
                disabled={isLoggingOut}
                icon={<LogOut size={16} />}
              />
            </div>
          )}
        </div>
      </header>

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
            notFoundMessage={notFoundMessage}
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

        {currentView === "graph" && <KnowledgeGraph />}

        {currentView === "new-entry" && (
          <NewEntryView
            onSave={handleSaveNewEntry}
            onCancel={handleCancelNewEntry}
            initialData={newEntryInitialData}
          />
        )}
      </main>
    </div>
  );
}

export default App;
