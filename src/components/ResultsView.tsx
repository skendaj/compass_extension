import React from "react";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  MessageSquare,
  FileText,
  User,
  CheckCircle,
} from "lucide-react";
import {
  SearchResult,
  KnowledgeEntry,
  User as UserType,
  DocumentationLink,
} from "../types";
import ChatSummaryButton from "./ChatSummaryButton";

interface ResultsViewProps {
  query: string;
  results: SearchResult[];
  onViewDetail: (entry: KnowledgeEntry) => void;
  onBack: () => void;
  notFoundMessage?: string | null;
}

const ResultsView: React.FC<ResultsViewProps> = ({
  query,
  results,
  onViewDetail,
  onBack,
  notFoundMessage,
}) => {
  const solutions = results.filter((r) => r.type === "solution");
  const experts = results.filter((r) => r.type === "expert");
  const documentation = results.filter((r) => r.type === "documentation");

  const openTeamsChat = (user: UserType) => {
    if (user.contactMethods.teams) {
      window.open(
        `https://teams.microsoft.com/l/chat/0/0?users=${user.email}`,
        "_blank",
      );
    }
  };

  const openEmail = (user: UserType) => {
    window.open(`mailto:${user.email}?subject=Question: ${query}`, "_blank");
  };

  const openLink = (url: string) => {
    window.open(url, "_blank");
  };

  const renderSolutionCard = (result: SearchResult) => {
    const entry = result.data as KnowledgeEntry;
    const score = entry.metadata.helpfulCount - entry.metadata.notHelpfulCount;

    return (
      <div
        key={entry.id}
        className="result-card solution-card"
        onClick={() => onViewDetail(entry)}
      >
        <div className="card-header">
          <div className="card-icon solution-icon">
            <CheckCircle size={20} />
          </div>
          <div className="card-meta">
            <span className={`category-badge ${entry.category}`}>
              {entry.category}
            </span>
            <span className="difficulty-badge">
              {entry.metadata.difficulty}
            </span>
          </div>
        </div>

        <h3 className="card-title">{entry.title}</h3>
        <p className="card-description">{entry.problem}</p>

        <div className="solution-preview">
          <strong>Solution:</strong>
          <p>{entry.solution.summary}</p>
        </div>

        <div className="card-tags">
          {entry.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="card-footer">
          <div className="solver-info">
            <span className="solver-avatar">
              {entry.solvedBy[0]?.avatar || "👤"}
            </span>
            <span>Solved by {entry.solvedBy[0]?.name}</span>
          </div>
          <div className="stats">
            <span className="stat">👍 {entry.metadata.helpfulCount}</span>
            <span className="stat">👁️ {entry.metadata.views}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderExpertCard = (result: SearchResult) => {
    const expert = result.data as UserType;

    return (
      <div key={expert.id} className="result-card expert-card">
        <div className="expert-header">
          <span className="expert-avatar-lg">{expert.avatar || "👤"}</span>
          <div className="expert-info">
            <h3 className="expert-name">{expert.name}</h3>
            <p className="expert-role">{expert.role}</p>
            <span className={`availability-badge ${expert.availability}`}>
              {expert.availability}
            </span>
          </div>
        </div>

        <div className="expert-tags">
          {expert.expertiseTags.slice(0, 6).map((tag) => (
            <span key={tag} className="tag expertise-tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="expert-stats">
          <div className="expert-stat">
            <span className="stat-label">Questions Answered</span>
            <span className="stat-value">{expert.stats.questionsAnswered}</span>
          </div>
          <div className="expert-stat">
            <span className="stat-label">Rating</span>
            <span className="stat-value">
              ⭐ {expert.stats.solutionRating.toFixed(1)}
            </span>
          </div>
          <div className="expert-stat">
            <span className="stat-label">Avg Response</span>
            <span className="stat-value">{expert.stats.responseTime}m</span>
          </div>
        </div>

        <div className="expert-actions">
          <button
            className="action-btn primary"
            onClick={() => openTeamsChat(expert)}
          >
            <MessageSquare size={16} />
            Teams Chat
          </button>
          <button
            className="action-btn secondary"
            onClick={() => openEmail(expert)}
          >
            <Mail size={16} />
            Email
          </button>
        </div>

        <ChatSummaryButton expert={expert} query={query} />
      </div>
    );
  };

  const renderDocumentationCard = (result: SearchResult) => {
    const doc = result.data as DocumentationLink;

    return (
      <div
        key={doc.id}
        className="result-card doc-card"
        onClick={() => openLink(doc.url)}
      >
        <div className="card-icon doc-icon">
          <FileText size={20} />
        </div>
        <h3 className="card-title">{doc.title}</h3>
        <p className="card-description">{doc.description}</p>
        <div className="card-tags">
          {doc.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="doc-source">
          <span className="source-badge">{doc.source}</span>
          <ExternalLink size={14} />
        </div>
      </div>
    );
  };

  return (
    <div className="results-view">
      <div className="results-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div>
          <h2>Results for: "{query}"</h2>
          <p className="results-count">
            Found {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {notFoundMessage && (
        <div className="not-found-message">
          <div className="message-icon">💡</div>
          <p>{notFoundMessage}</p>
        </div>
      )}

      {results.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try rephrasing your question or using different keywords</p>
        </div>
      ) : (
        <div className="results-sections">
          {solutions.length > 0 && (
            <section className="results-section">
              <h3 className="section-title">
                <CheckCircle size={20} />
                Previous Solutions ({solutions.length})
              </h3>
              <div className="results-grid">
                {solutions.map(renderSolutionCard)}
              </div>
            </section>
          )}

          {experts.length > 0 && (
            <section className="results-section">
              <h3 className="section-title">
                <User size={20} />
                Recommended Experts ({experts.length})
              </h3>
              <div className="results-grid">
                {experts.map(renderExpertCard)}
              </div>
            </section>
          )}

          {documentation.length > 0 && (
            <section className="results-section">
              <h3 className="section-title">
                <FileText size={20} />
                Documentation ({documentation.length})
              </h3>
              <div className="results-grid">
                {documentation.map(renderDocumentationCard)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsView;
