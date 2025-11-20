import React, { useState, useEffect } from "react";
import { Save, X, FileText, Users, Tag } from "lucide-react";
import { KnowledgeEntry, User } from "../types";
import { storageService } from "../services/storageService";

interface NewEntryViewProps {
  onSave: (entry: KnowledgeEntry) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    content: string;
    question?: string;
  };
}

const NewEntryView: React.FC<NewEntryViewProps> = ({
  onSave,
  onCancel,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState(initialData?.content || "");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSolution(initialData.content);

      // Use the question parameter if provided
      if (initialData.question) {
        setProblem(initialData.question);
      }
    }
  }, [initialData]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("[NewEntryView] Save button clicked");
    console.log("[NewEntryView] Title:", title);
    console.log("[NewEntryView] Problem:", problem);
    console.log("[NewEntryView] Solution length:", solution.length);
    console.log("[NewEntryView] Tags:", tags);

    if (!title.trim()) {
      setError("Title is required");
      console.error("[NewEntryView] Validation failed: Title is required");
      return;
    }
    if (!solution.trim()) {
      setError("Solution/Content is required");
      console.error("[NewEntryView] Validation failed: Solution is required");
      return;
    }

    setIsSaving(true);
    console.log("[NewEntryView] Starting save process...");

    try {
      const currentUser: User = {
        id: "current-user",
        name: "Current User",
        email: "user@company.com",
        role: "User",
        department: "General",
        expertiseTags: [],
        contactMethods: {
          email: "user@company.com",
        },
        stats: {
          questionsAsked: 0,
          questionsAnswered: 0,
          solutionRating: 0,
          responseTime: 0,
        },
        availability: "available",
        avatar: "",
      };

      const newEntry: KnowledgeEntry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        problem: problem.trim() || "Imported from Teams chat",
        solution: {
          summary: solution.trim(),
          steps: [],
          codeSnippets: [],
        },
        askedBy: currentUser,
        solvedBy: [currentUser],
        tags: tags.length > 0 ? tags : ["teams-import"],
        category: "general",
        resources: {
          links: [],
          files: [],
          documentation: [],
        },
        metadata: {
          createdAt: new Date(),
          resolvedAt: new Date(),
          resolutionTime: 0,
          difficulty: "easy",
          views: 0,
          helpfulCount: 0,
          notHelpfulCount: 0,
        },
        status: "active",
      };

      console.log("[NewEntryView] Saving entry to storage...", newEntry);
      await storageService.saveKnowledgeEntry(newEntry);
      console.log("[NewEntryView] Entry saved successfully");

      // Also save to backend API
      try {
        const backendUrl = "http://localhost:5000/api/knowledge";

        // Format content properly for the API with User/Admin prefixes
        let apiContent = solution.trim();

        // If this is from Teams, reconstruct with User/Admin format
        if (initialData && problem) {
          // Format as User: question, Admin: answer
          apiContent = `User: ${problem}\nAdmin: ${solution.trim()}`;
        }

        const apiBody = {
          content: apiContent,
        };

        console.log("[NewEntryView] Sending to API:", apiBody);

        const response = await fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiBody),
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log(
            "[NewEntryView] Entry saved to backend successfully:",
            responseData,
          );
        } else {
          console.warn(
            "[NewEntryView] Failed to save to backend:",
            response.statusText,
          );
        }
      } catch (backendErr) {
        console.warn(
          "[NewEntryView] Backend save failed (backend may be offline):",
          backendErr,
        );
        // Don't fail the entire save if backend is unavailable
      }

      console.log("[NewEntryView] Calling onSave callback...");
      onSave(newEntry);
      console.log("[NewEntryView] Save complete!");
    } catch (err) {
      console.error("[NewEntryView] Error saving entry:", err);
      setError("Failed to save entry. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <div className="new-entry-view">
      <div className="new-entry-header">
        <h2>
          <FileText size={24} />
          Create New Knowledge Entry
        </h2>
        <button className="close-btn" onClick={onCancel} title="Cancel">
          <X size={20} />
        </button>
      </div>

      {initialData && (
        <>
          <div className="import-notice">
            <Users size={16} />
            <span>Imported from Microsoft Teams chat</span>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="new-entry-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a clear, descriptive title"
            className="form-input"
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="problem">
            Problem/Question <span className="optional">(optional)</span>
          </label>
          <textarea
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="What problem does this solve? What question does it answer?"
            className="form-textarea"
            rows={3}
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="solution">
            Solution/Content <span className="required">*</span>
          </label>
          <textarea
            id="solution"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Provide the detailed solution, explanation, or knowledge content"
            className="form-textarea solution-textarea"
            rows={12}
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">
            <Tag size={16} />
            Tags
          </label>
          <div className="tags-container">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="tag-remove"
                  disabled={isSaving}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type a tag and press Enter"
            className="form-input"
            disabled={isSaving}
          />
          <p className="form-help">
            Tags help others find this entry. Press Enter to add each tag.
          </p>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="spinner-small"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Entry
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .new-entry-view {
          padding: 0;
          max-width: 100%;
          margin: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .new-entry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e0e0e0;
          flex-shrink: 0;
        }

        .new-entry-header h2 {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #002233;
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          font-family: 'Cairo', 'Roboto', sans-serif;
        }

        .new-entry-header h2 svg {
          color: #002233;
        }

        .close-btn {
          background: transparent;
          border: 2px solid #e0e0e0;
          color: #666;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          border-color: #7E85FD;
          color: #7E85FD;
          background: #f5f5f5;
        }

        .import-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f0f9ff;
          border-left: 4px solid #7E85FD;
          border-radius: 4px;
          margin: 16px 24px;
          color: #002233;
          font-size: 14px;
          font-weight: 500;
        }

        .api-payload-preview {
          margin-bottom: 24px;
        }

        .api-payload-preview h3 {
          color: #002233;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .api-payload-info {
          background: #f8f9fa;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
        }

        .api-method {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e0e0e0;
        }

        .method-badge {
          background: #4CAF50;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          font-family: monospace;
        }

        .api-method code {
          color: #002233;
          font-size: 13px;
          background: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
          font-family: monospace;
        }

        .api-body strong {
          color: #002233;
          font-size: 13px;
          display: block;
          margin-bottom: 8px;
        }

        .api-body pre {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 12px;
          overflow-x: auto;
          font-size: 12px;
          color: #000;
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: monospace;
          max-height: 200px;
        }

        .solution-textarea {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.5;
        }

        .new-entry-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          flex: 1;
          overflow-y: auto;
        }

        .error-message {
          padding: 12px 16px;
          background: #fff5f5;
          border-left: 4px solid #ff4444;
          border-radius: 4px;
          color: #d32f2f;
          font-size: 14px;
          font-weight: 500;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #002233;
        }

        .required {
          color: #ff4444;
        }

        .optional {
          color: #999;
          font-weight: 400;
          font-size: 12px;
        }

        .form-input,
        .form-textarea {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          color: #000;
          transition: all 0.2s;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #7E85FD;
          box-shadow: 0 0 0 3px rgba(126, 133, 253, 0.1);
        }

        .form-input:disabled,
        .form-textarea:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-help {
          font-size: 12px;
          color: #666;
          margin: 0;
        }

        .new-entry-view * {
          color: #000;
        }

        .new-entry-view label,
        .new-entry-view p,
        .new-entry-view span {
          color: #002233;
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          min-height: 32px;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #7E85FD;
          color: white;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .tag-remove {
          background: transparent;
          border: none;
          color: white;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .tag-remove:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 8px;
          padding: 16px 24px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
          flex-shrink: 0;
        }

        .btn-primary,
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: #7E85FD;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #6B72E8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(126, 133, 253, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #002233;
          border: 2px solid #e0e0e0;
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: #7E85FD;
          color: #7E85FD;
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default NewEntryView;
