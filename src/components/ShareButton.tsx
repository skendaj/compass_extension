import React, { useState } from 'react';
import { Share2, Copy, Mail, Check, ExternalLink } from 'lucide-react';
import { DeepLinkService } from '../services/deepLinkService';

interface ShareButtonProps {
  entryId: string;
  entryTitle: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ entryId, entryTitle }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLink = DeepLinkService.generateShareLink(entryId, 'external');
  const socialLinks = DeepLinkService.getSocialShareLinks(shareLink, entryTitle);

  const handleCopyLink = async () => {
    const success = await DeepLinkService.copyToClipboard(shareLink);
    if (success) {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    }
  };

  const handleNativeShare = async () => {
    const shared = await DeepLinkService.shareNative(
      entryTitle,
      'Check out this solution from our team knowledge base',
      shareLink
    );
    if (shared) {
      setShowMenu(false);
    }
  };

  const handleShareToTeams = () => {
    window.open(socialLinks.teams, '_blank');
    setShowMenu(false);
  };

  const handleShareToEmail = () => {
    window.open(socialLinks.email);
    setShowMenu(false);
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
          <div className="share-menu-overlay" onClick={() => setShowMenu(false)} />
          <div className="share-menu">
            <div className="share-menu-header">
              <h4>Share this solution</h4>
            </div>

            <div className="share-link-preview">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="share-link-input"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>

            <div className="share-options">
              <button className="share-option" onClick={handleCopyLink}>
                {copied ? (
                  <>
                    <Check size={18} className="share-icon-success" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button className="share-option" onClick={handleShareToTeams}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.19 8.77q.39.47.39 1.13v5.76q0 .66-.39 1.13-.38.47-1 .47h-4.39v3.86q0 .66-.39 1.13-.38.47-1 .47H7.42q-.62 0-1-.47-.38-.47-.38-1.13V14.7H3.8q-.62 0-1-.47-.38-.47-.38-1.13V7.34q0-.66.38-1.13.38-.47 1-.47h3.24V1.88q0-.66.38-1.13.38-.47 1-.47h5q.62 0 1 .47.39.47.39 1.13v4.86h3.38q.62 0 1 .47z"/>
                </svg>
                <span>Share to Teams</span>
              </button>

              <button className="share-option" onClick={handleShareToEmail}>
                <Mail size={18} />
                <span>Share via Email</span>
              </button>

              {navigator.share && (
                <button className="share-option" onClick={handleNativeShare}>
                  <ExternalLink size={18} />
                  <span>More Options...</span>
                </button>
              )}
            </div>

            <div className="share-menu-footer">
              <p className="share-help-text">
                Anyone with this link can view this solution
              </p>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
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

        .share-link-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 12px;
          color: #6b7280;
          background: white;
          font-family: 'Courier New', monospace;
        }

        .share-link-input:focus {
          outline: none;
          border-color: #667eea;
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
      `}</style>
    </div>
  );
};

export default ShareButton;

