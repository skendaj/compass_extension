import React, { useState } from "react";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Download,
  Calendar,
  Clock,
  Eye,
  Mail,
  MessageSquare,
} from "lucide-react";
import { KnowledgeEntry } from "../types";
import ShareButton from "./ShareButton";

interface KnowledgeDetailViewProps {
  entry: KnowledgeEntry;
  onBack: () => void;
  onRate: (entryId: string, helpful: boolean) => void;
}

const KnowledgeDetailView: React.FC<KnowledgeDetailViewProps> = ({
  entry,
  onBack,
  onRate,
}) => {
  const [hasRated, setHasRated] = useState(false);

  const handleRate = (helpful: boolean) => {
    if (!hasRated) {
      onRate(entry.id, helpful);
      setHasRated(true);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTeamsUrl = (email: string, name: string) => {
    const question = entry.problem.trim().endsWith("?")
      ? entry.problem
      : `${entry.problem}?`;
    const message = encodeURIComponent(`Hi ${name}, ${question}`);
    return `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}&message=${message}`;
  };

  const getOutlookUrl = (email: string) => {
    const subject = `Re: ${entry.title}`;
    return `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}`;
  };

  return (
    <div className="detail-view">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Results
        </button>
        <ShareButton entryId={entry.id} entryTitle={entry.title} />
      </div>

      <div className="detail-content">
        <div className="detail-title-section">
          <div className="title-badges">
            <span className={`category-badge ${entry.category}`}>
              {entry.category}
            </span>
            <span className="difficulty-badge">
              {entry.metadata.difficulty}
            </span>
            {entry.status === "verified" && (
              <span className="verified-badge">✓ Verified</span>
            )}
          </div>
          <h1 className="detail-title">{entry.title}</h1>

          <div className="detail-metadata">
            <span className="metadata-item">
              <Calendar size={16} />
              {formatDate(entry.metadata.createdAt)}
            </span>
          </div>
        </div>

        <section className="detail-section">
          <h2 className="section-heading">Problem</h2>
          <div className="section-content">
            <p>{entry.problem}</p>
          </div>
        </section>

        <section className="detail-section solution-section">
          <h2 className="section-heading">Solution</h2>
          <div className="section-content">
            <p className="solution-summary">{entry.solution.summary}</p>

            {entry.solution.steps.length > 0 && (
              <div className="solution-steps">
                <h3>Steps to resolve:</h3>
                <ol>
                  {entry.solution.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {entry.solution.codeSnippets &&
              entry.solution.codeSnippets.length > 0 && (
                <div className="code-snippets">
                  <h3>Code Examples:</h3>
                  {entry.solution.codeSnippets.map((snippet, index) => (
                    <pre key={index} className="code-block">
                      <code>{snippet}</code>
                    </pre>
                  ))}
                </div>
              )}
          </div>
        </section>

        <section className="detail-section">
          <h2 className="section-heading">Contact</h2>
          <div className="section-content">
            <div className="contributors">
              {entry.solvedBy.length > 0 && (
                <div className="contributor">
                  <span className="contributor-avatar">
                    {entry.solvedBy[0].avatar || "👤"}
                  </span>
                  <div className="contributor-info">
                    <div className="contributor-name">
                      {entry.solvedBy[0].name}
                    </div>
                    <div className="contributor-role">
                      {entry.solvedBy[0].role}
                    </div>
                  </div>
                  <div className="contributor-actions">
                    <button
                      className="contact-btn teams-btn"
                      onClick={() =>
                        window.open(
                          getTeamsUrl(
                            entry.solvedBy[0].email,
                            entry.solvedBy[0].name,
                          ),
                          "_blank",
                        )
                      }
                      title={`Message ${entry.solvedBy[0].name} on Teams`}
                    >
                      <MessageSquare size={16} />
                      Teams
                    </button>
                    <button
                      className="contact-btn email-btn"
                      onClick={() =>
                        window.open(
                          getOutlookUrl(entry.solvedBy[0].email),
                          "_blank",
                        )
                      }
                      title={`Send email to ${entry.solvedBy[0].name}`}
                    >
                      <Mail size={16} />
                      Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {(entry.resources.links.length > 0 ||
          entry.resources.files.length > 0) && (
          <section className="detail-section">
            <h2 className="section-heading">Resources</h2>
            <div className="section-content">
              {entry.resources.links.length > 0 && (
                <div className="resources-list">
                  <h3>Links:</h3>
                  <ul>
                    {entry.resources.links.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resource-link"
                        >
                          <ExternalLink size={14} />
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.resources.files.length > 0 && (
                <div className="resources-list">
                  <h3>Files:</h3>
                  <ul>
                    {entry.resources.files.map((file, index) => (
                      <li key={index}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resource-link"
                        >
                          <Download size={14} />
                          {file.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="detail-section">
          <h2 className="section-heading">Tags</h2>
          <div className="section-content">
            <div className="detail-tags">
              {entry.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="detail-section rating-section">
          <h2 className="section-heading">Was this helpful?</h2>
          <div className="section-content">
            <div className="rating-stats">
              <span className="rating-stat positive">
                <ThumbsUp size={16} />
                {entry.metadata.helpfulCount} helpful
              </span>
              <span className="rating-stat negative">
                <ThumbsDown size={16} />
                {entry.metadata.notHelpfulCount} not helpful
              </span>
            </div>

            {!hasRated ? (
              <div className="rating-actions">
                <button
                  className="rating-btn helpful"
                  onClick={() => handleRate(true)}
                >
                  <ThumbsUp size={18} />
                  Yes, this helped
                </button>
                <button
                  className="rating-btn not-helpful"
                  onClick={() => handleRate(false)}
                >
                  <ThumbsDown size={18} />
                  No, not helpful
                </button>
              </div>
            ) : (
              <div className="rating-thanks">
                <p>✓ Thank you for your feedback!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default KnowledgeDetailView;
