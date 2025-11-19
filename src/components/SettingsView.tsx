import React, { useState, useEffect } from "react";
import {
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { shareConfluenceService } from "../services/shareConfluence";

const SettingsView: React.FC = () => {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [showApiToken, setShowApiToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [testStatus, setTestStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const config = await shareConfluenceService.loadConfig();
    if (config) {
      setDomain(config.domain);
      setEmail(config.email);
      setApiToken(config.apiToken);
      setSpaceId(config.spaceId);
    }
  };

  const handleSave = async () => {
    if (!domain || !email || !apiToken || !spaceId) {
      setErrorMessage("All fields are required");
      setSaveStatus("error");
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);
    setErrorMessage("");

    try {
      await shareConfluenceService.setConfig({
        domain,
        email,
        apiToken,
        spaceId,
      });

      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus("error");
      setErrorMessage("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!domain || !email || !apiToken || !spaceId) {
      setErrorMessage("Please fill in all fields before testing");
      setTestStatus("error");
      return;
    }

    setIsTesting(true);
    setTestStatus(null);
    setErrorMessage("");

    try {
      // Temporarily save config for testing
      await shareConfluenceService.setConfig({
        domain,
        email,
        apiToken,
        spaceId,
      });

      const isConnected = await shareConfluenceService.testConnection();

      if (isConnected) {
        setTestStatus("success");
      } else {
        setTestStatus("error");
        setErrorMessage("Connection failed. Please check your credentials.");
      }

      setTimeout(() => setTestStatus(null), 5000);
    } catch (error) {
      setTestStatus("error");
      setErrorMessage("Connection failed. Please check your credentials.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearConfig = async () => {
    if (
      window.confirm("Are you sure you want to clear Confluence configuration?")
    ) {
      await shareConfluenceService.clearConfig();
      setDomain("");
      setEmail("");
      setApiToken("");
      setSpaceId("");
      setSaveStatus(null);
      setTestStatus(null);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <p className="settings-subtitle">
          Configure your Confluence integration
        </p>
      </div>

      <div className="settings-content">
        <section className="settings-section">
          <h3>Confluence Configuration</h3>
          <p className="section-description">
            Connect to your Confluence workspace to share knowledge entries as
            blog posts.
          </p>

          <div className="form-group">
            <label htmlFor="domain">
              Confluence Domain
              <span className="required">*</span>
            </label>
            <input
              id="domain"
              type="text"
              placeholder="your-company.atlassian.net"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="form-input"
            />
            <small className="help-text">
              Enter your Atlassian domain (e.g., company.atlassian.net)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email
              <span className="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="your-email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
            <small className="help-text">
              Your Atlassian account email address
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="apiToken">
              API Token
              <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <input
                id="apiToken"
                type={showApiToken ? "text" : "password"}
                placeholder="Enter your API token"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="form-input"
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowApiToken(!showApiToken)}
                title={showApiToken ? "Hide API token" : "Show API token"}
              >
                {showApiToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <small className="help-text">
              Generate an API token from{" "}
              <a
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                Atlassian Account Settings
              </a>
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="spaceId">
              Space Key or ID
              <span className="required">*</span>
            </label>
            <input
              id="spaceId"
              type="text"
              placeholder="e.g., TEAM or 123456789"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              className="form-input"
            />
            <small className="help-text">
              Enter your space key (e.g., "TEAM") or numeric space ID. The
              system will automatically convert space keys to IDs.
            </small>
          </div>

          {(saveStatus || testStatus || errorMessage) && (
            <div className={`status-message ${saveStatus || testStatus}`}>
              {saveStatus === "success" && (
                <>
                  <CheckCircle size={18} />
                  <span>Configuration saved successfully!</span>
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <XCircle size={18} />
                  <span>{errorMessage || "Failed to save configuration"}</span>
                </>
              )}
              {testStatus === "success" && (
                <>
                  <CheckCircle size={18} />
                  <span>Connection test successful!</span>
                </>
              )}
              {testStatus === "error" && (
                <>
                  <XCircle size={18} />
                  <span>{errorMessage || "Connection test failed"}</span>
                </>
              )}
            </div>
          )}

          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Configuration</span>
                </>
              )}
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <div className="spinner" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <AlertCircle size={18} />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            <button className="btn btn-danger" onClick={handleClearConfig}>
              Clear Configuration
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3>How to Get Your Confluence Credentials</h3>
          <ol className="instructions-list">
            <li>
              <strong>Domain:</strong> Your Atlassian domain (e.g.,
              company.atlassian.net)
            </li>
            <li>
              <strong>API Token:</strong> Generate from{" "}
              <a
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                Atlassian Account Settings → Security → API tokens
              </a>
            </li>
            <li>
              <strong>Space Key/ID:</strong> Use your space key (e.g., "TEAM")
              found in the URL like /wiki/spaces/<strong>TEAM</strong>/overview,
              or use the numeric space ID from Space Settings
            </li>
          </ol>
        </section>
      </div>

      <style>{`
        .settings-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
        }

        .settings-header {
          margin-bottom: 32px;
        }

        .settings-header h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .settings-subtitle {
          margin: 0;
          font-size: 16px;
          color: #6b7280;
        }

        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .settings-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e5e7eb;
        }

        .settings-section h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .section-description {
          margin: 0 0 24px 0;
          font-size: 14px;
          color: #6b7280;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .required {
          color: #dc2626;
          margin-left: 4px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #1f2937;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon .form-input {
          padding-right: 44px;
        }

        .icon-button {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
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

        .icon-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .help-text {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          color: #6b7280;
        }

        .link {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }

        .link:hover {
          text-decoration: underline;
        }

        .status-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 20px;
          animation: slideIn 0.3s ease-out;
        }

        .status-message.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #6ee7b7;
        }

        .status-message.error {
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

        .button-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #5568d3;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-danger {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .btn-danger:hover {
          background: #fecaca;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .btn-secondary .spinner,
        .btn-danger .spinner {
          border-color: #d1d5db;
          border-top-color: #374151;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .instructions-list {
          margin: 16px 0;
          padding-left: 20px;
        }

        .instructions-list li {
          margin-bottom: 12px;
          line-height: 1.6;
          color: #374151;
        }

        .instructions-list strong {
          color: #1f2937;
        }
      `}</style>
    </div>
  );
};

export default SettingsView;
