import React, { useState, useEffect } from "react";
import {
  Share2,
  Copy,
  Mail,
  Check,
  ExternalLink,
  FileText,
} from "lucide-react";
import { DeepLinkService } from "../services/deepLinkService";
import { shareConfluenceService } from "../services/shareConfluence";
import { storageService } from "../services/storageService";

interface ShareButtonProps {
  entryId: string;
  entryTitle: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ entryId, entryTitle }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"page" | "blogpost">("page");
  const [confluenceUrl, setConfluenceUrl] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    // Load content type from config and check if entry is already shared
    const loadData = async () => {
      const config = await shareConfluenceService.loadConfig();
      if (config) {
        setContentType(config.contentType || "page");
      }

      // Check if entry has Confluence URL
      const entry = await storageService.getKnowledgeEntryById(entryId);
      if (entry?.metadata.confluenceUrl) {
        setConfluenceUrl(entry.metadata.confluenceUrl);
        setIsShared(true);
      }
    };
    loadData();
  }, [entryId]);

  const shareLink = DeepLinkService.generateShareLink(entryId, "external");
  const socialLinks = DeepLinkService.getSocialShareLinks(
    shareLink,
    entryTitle,
  );

  const handleCopyLink = async () => {
    const linkToCopy = confluenceUrl || shareLink;
    const success = await DeepLinkService.copyToClipboard(linkToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    }
  };

  const handleShareToTeams = () => {
    window.open(socialLinks.teams, "_blank");
    setShowMenu(false);
  };

  const handleShareToEmail = () => {
    window.open(socialLinks.email);
    setShowMenu(false);
  };

  const handleShareToConfluence = async () => {
    // If already shared, just open the Confluence page
    if (isShared && confluenceUrl) {
      window.open(confluenceUrl, "_blank");
      return;
    }

    // Otherwise, share it
    setIsSharing(true);
    setShareStatus(null);

    // Get the knowledge entry
    const entry = await storageService.getKnowledgeEntryById(entryId);
    if (!entry) {
      setShareStatus("Entry not found");
      setIsSharing(false);
      return;
    }

    try {
      // Check if Confluence is configured
      const isConfigured = await shareConfluenceService.isConfigured();
      if (!isConfigured) {
        setShareStatus(
          "Please configure Confluence first in extension settings",
        );
        setIsSharing(false);
        return;
      }

      // Create the page or blog post
      const response = await shareConfluenceService.createBlogPost(entry);
      const webUrl = shareConfluenceService.getWebUrl(response);

      // Save the Confluence URL to the entry
      if (webUrl) {
        await storageService.updateKnowledgeEntry(entryId, {
          metadata: {
            ...entry.metadata,
            confluenceUrl: webUrl,
          },
        });
        setConfluenceUrl(webUrl);
        setIsShared(true);
      }

      setShareStatus(`Successfully shared to Confluence!`);

      // Open the created blog post in a new tab
      if (webUrl) {
        window.open(webUrl, "_blank");
      }

      setTimeout(() => {
        setShowMenu(false);
        setIsSharing(false);
        setShareStatus(null);
      }, 2000);
    } catch (error) {
      console.error("Error sharing to Confluence:", error);
      const contentName = contentType === "blogpost" ? "blog post" : "page";
      setShareStatus(`Failed to create ${contentName}`);
      setIsSharing(false);
    }
  };

  return (
    <div className="share-button-container">
      <button
        className="share-button"
        onClick={() => setShowMenu(!showMenu)}
        title="Share this solution"
      >
        <Share2 size={18} />
        Share
      </button>

      {showMenu && (
        <>
          <div
            className="share-menu-overlay"
            onClick={() => setShowMenu(false)}
          />
          <div className="share-menu">
            <div className="share-menu-header">
              <h4>Share this solution</h4>
            </div>

            {confluenceUrl && (
              <div className="share-link-preview">
                <div className="share-link-input-wrapper">
                  <input
                    type="text"
                    value={confluenceUrl}
                    readOnly
                    className="share-link-input"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    className="copy-link-button"
                    onClick={handleCopyLink}
                    title="Copy link"
                  >
                    {copied ? (
                      <Check size={16} className="copy-icon-success" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="share-options">
              {confluenceUrl && (
                <button className="share-option" onClick={handleShareToTeams}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.19 8.77q.39.47.39 1.13v5.76q0 .66-.39 1.13-.38.47-1 .47h-4.39v3.86q0 .66-.39 1.13-.38.47-1 .47H7.42q-.62 0-1-.47-.38-.47-.38-1.13V14.7H3.8q-.62 0-1-.47-.38-.47-.38-1.13V7.34q0-.66.38-1.13.38-.47 1-.47h3.24V1.88q0-.66.38-1.13.38-.47 1-.47h5q.62 0 1 .47.39.47.39 1.13v4.86h3.38q.62 0 1 .47z" />
                  </svg>
                  <span>Share to Teams</span>
                </button>
              )}

              {confluenceUrl && (
                <button className="share-option" onClick={handleShareToEmail}>
                  <Mail size={18} />
                  <span>Share via Email</span>
                </button>
              )}

              <button
                className="share-option"
                onClick={handleShareToConfluence}
                disabled={isSharing}
              >
                {isSharing ? (
                  <>
                    <div className="spinner" />
                    <span>Sharing...</span>
                  </>
                ) : isShared ? (
                  <>
                    <FileText size={18} />
                    <span>View on Confluence</span>
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    <span>
                      Share to Confluence (
                      {contentType === "blogpost" ? "Blog Post" : "Page"})
                    </span>
                  </>
                )}
              </button>
            </div>

            {shareStatus && shareStatus !== "shared" && (
              <div
                className={`share-status ${shareStatus.includes("Successfully") ? "success" : "error"}`}
              >
                {shareStatus}
              </div>
            )}

            <div className="share-menu-footer">
              <p className="share-help-text">
                {confluenceUrl
                  ? "Share the Confluence link with your team"
                  : "Share to Confluence first to get a shareable link"}
              </p>
            </div>
          </div>
        </>
      )}

      <style>{`
        .share-button-container {
          position: relative;
        }

        .share-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
        }

        .share-button:hover {
          background: #e5e7eb;
          border-color: #d1d5db;
        }

        .share-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
        }

        .share-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid #e5e7eb;
          width: 320px;
          z-index: 1000;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .share-menu-header {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
        }

        .share-menu-header h4 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
        }

        .share-link-preview {
          padding: 12px 16px;
          background: #f9fafb;
        }

        .share-link-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .share-link-input {
          width: 100%;
          padding: 8px 40px 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 12px;
          color: #6b7280;
          background: white;
          font-family: "Courier New", monospace;
        }

        .share-link-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .copy-link-button {
          position: absolute;
          right: 8px;
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .copy-link-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .copy-icon-success {
          color: #16a34a;
        }

        .share-options {
          padding: 8px;
        }

        .share-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 14px;
          color: #374151;
        }

        .share-option:hover {
          background: #f3f4f6;
        }

        .share-icon-success {
          color: #16a34a;
        }

        .share-menu-footer {
          padding: 12px 16px;
          border-top: 1px solid #f3f4f6;
        }

        .share-help-text {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }

        .share-option:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .share-option:disabled:hover {
          background: transparent;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #e5e7eb;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .share-status {
          padding: 12px 16px;
          margin: 8px;
          border-radius: 8px;
          font-size: 13px;
          text-align: center;
          animation: slideIn 0.3s ease-out;
        }

        .share-status.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #6ee7b7;
        }

        .share-status.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ShareButton;
