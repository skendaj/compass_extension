import React, { useState } from "react";
import { MessageSquare, Loader, CheckCircle, XCircle } from "lucide-react";
import { teamsIntegrationService } from "../services/teamsIntegration";
import { User as UserType } from "../types";

interface ChatSummaryButtonProps {
  expert: UserType;
  query: string;
}

const ChatSummaryButton: React.FC<ChatSummaryButtonProps> = ({
  expert,
  query,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const handleGetSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if authenticated
      const isConfigured = await teamsIntegrationService.isConfigured();
      if (!isConfigured) {
        setError("Please configure Teams integration in settings first");
        setIsLoading(false);
        return;
      }

      const token = await teamsIntegrationService.loadAccessToken();
      if (!token) {
        // Need to authenticate
        const authenticated = await teamsIntegrationService.authenticate();
        if (!authenticated) {
          setError("Authentication failed. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      // Get chat summary
      const chatSummary = await teamsIntegrationService.summarizeChat(
        expert.email,
      );

      if (!chatSummary) {
        setError("No chat found with this user or no messages available");
        setIsLoading(false);
        return;
      }

      setSummary(chatSummary);
      setShowSummary(true);
    } catch (err: any) {
      console.error("Error getting chat summary:", err);
      setError(err.message || "Failed to retrieve chat summary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsKnowledge = async () => {
    if (!summary) return;

    try {
      await teamsIntegrationService.saveAsKnowledgeEntry(
        summary,
        query,
        expert.email,
      );
      alert("Chat summary saved as knowledge entry!");
    } catch (err) {
      console.error("Error saving knowledge entry:", err);
      alert("Failed to save knowledge entry");
    }
  };

  return (
    <div className="chat-summary-container">
      <button
        className="chat-summary-button"
        onClick={handleGetSummary}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader size={16} className="spinner" />
            <span>Getting Chat Summary...</span>
          </>
        ) : (
          <>
            <MessageSquare size={16} />
            <span>Get Chat Summary</span>
          </>
        )}
      </button>

      {error && (
        <div className="summary-error">
          <XCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {showSummary && summary && (
        <>
          <div
            className="summary-overlay"
            onClick={() => setShowSummary(false)}
          />
          <div className="summary-modal">
            <div className="summary-header">
              <h3>Chat Summary with {expert.name}</h3>
              <button
                className="close-button"
                onClick={() => setShowSummary(false)}
              >
                ×
              </button>
            </div>

            <div className="summary-content">
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Messages:</span>
                  <span className="stat-value">{summary.messageCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Participants:</span>
                  <span className="stat-value">
                    {summary.participants.join(", ")}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Duration:</span>
                  <span className="stat-value">
                    {new Date(summary.startTime).toLocaleDateString()} -{" "}
                    {new Date(summary.endTime).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="summary-section">
                <h4>Summary</h4>
                <p>{summary.summary}</p>
              </div>

              {summary.keyTopics.length > 0 && (
                <div className="summary-section">
                  <h4>Key Topics</h4>
                  <div className="topic-tags">
                    {summary.keyTopics.map((topic: string) => (
                      <span key={topic} className="topic-tag">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {summary.actionItems.length > 0 && (
                <div className="summary-section">
                  <h4>Action Items</h4>
                  <ul className="action-list">
                    {summary.actionItems.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.resolution && (
                <div className="summary-section resolution">
                  <h4>
                    <CheckCircle size={18} />
                    Resolution
                  </h4>
                  <p>{summary.resolution}</p>
                </div>
              )}
            </div>

            <div className="summary-footer">
              <button
                className="save-knowledge-button"
                onClick={handleSaveAsKnowledge}
              >
                <CheckCircle size={16} />
                Save as Knowledge Entry
              </button>
              <button
                className="close-modal-button"
                onClick={() => setShowSummary(false)}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .chat-summary-container {
          margin-top: 12px;
        }

        .chat-summary-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        .chat-summary-button:hover:not(:disabled) {
          background: #e5e7eb;
          border-color: #d1d5db;
        }

        .chat-summary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .summary-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          margin-top: 8px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          color: #991b1b;
          font-size: 13px;
        }

        .summary-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9998;
          animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .summary-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 90%;
          max-width: 700px;
          max-height: 85vh;
          overflow: hidden;
          z-index: 9999;
          animation: slideUp 0.3s;
          display: flex;
          flex-direction: column;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .summary-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .close-button {
          background: transparent;
          border: none;
          font-size: 28px;
          color: #6b7280;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .summary-content {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .summary-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-value {
          font-size: 14px;
          color: #1f2937;
          font-weight: 600;
        }

        .summary-section {
          margin-bottom: 24px;
        }

        .summary-section h4 {
          margin: 0 0 12px 0;
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .summary-section p {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
        }

        .topic-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .topic-tag {
          padding: 6px 12px;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
        }

        .action-list {
          margin: 0;
          padding-left: 20px;
        }

        .action-list li {
          margin-bottom: 8px;
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
        }

        .summary-section.resolution {
          background: #d1fae5;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #6ee7b7;
        }

        .summary-section.resolution h4 {
          color: #065f46;
        }

        .summary-section.resolution p {
          color: #047857;
        }

        .summary-footer {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .save-knowledge-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .save-knowledge-button:hover {
          background: #5568d3;
        }

        .close-modal-button {
          padding: 10px 20px;
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-modal-button:hover {
          background: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default ChatSummaryButton;
