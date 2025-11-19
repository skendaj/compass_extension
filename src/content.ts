// Content Script - Floating Widget like Loom
import { extractTeamsChat, isTeamsPage } from "./services/teamsDOMScraper";

// Create and inject the floating widget
function createFloatingWidget() {
  // Check if widget already exists
  if (document.getElementById("team-knowledge-widget")) {
    return;
  }

  // Create widget container
  const widget = document.createElement("div");
  widget.id = "team-knowledge-widget";
  widget.innerHTML = `
    <div class="tkw-floating-button" id="tkw-button" title="TeamSystem Navify">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM7 11.5L16 8L12.5 17.0021L11 13L7 11.5Z"></path>
      </svg>
    </div>
  `;

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap');

    #team-knowledge-widget {
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 999999;
      font-family: 'Roboto', 'Cairo', sans-serif;
    }

    .tkw-floating-button {
      position: relative;
      width: 60px;
      height: 60px;
      background: #7E85FD;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(126, 133, 253, 0.4);
      margin: 20px;
    }

    .tkw-floating-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(126, 133, 253, 0.6);
    }

    .tkw-floating-button:active {
      transform: scale(0.95);
    }

    .tkw-floating-button svg {
      width: 28px;
      height: 28px;
      color: white;
    }

    /* Modal styles */
    .tkw-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 34, 51, 0.7);
      backdrop-filter: blur(4px);
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      animation: tkw-fadeIn 0.2s forwards;
    }

    @keyframes tkw-fadeIn {
      to {
        opacity: 1;
      }
    }

    .tkw-modal-content {
      background: white;
      width: 1600px;
      max-width: 90vw;
      height: 1200px;
      max-height: 90vh;
      box-shadow: 0 20px 60px rgba(0, 34, 51, 0.4);
      overflow: hidden;
      transform: scale(0.9);
      animation: tkw-slideIn 0.3s forwards;
    }

    @keyframes tkw-slideIn {
      to {
        transform: scale(1);
      }
    }

    .tkw-modal-header {
      background: #002233;
      color: white;
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #01BEE7;
    }

    .tkw-modal-title {
      font-family: 'Cairo', 'Roboto', sans-serif;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      letter-spacing: 0.5px;
      color: #fff
    }

    .tkw-modal-close {
      background: transparent;
      border: 2px solid #01BEE7;
      color: #01BEE7;
      width: 36px;
      height: 36px;
      cursor: pointer;
      font-size: 24px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .tkw-modal-close:hover {
      background: #01BEE7;
      color: #002233;
    }

    .tkw-modal-body {
      height: calc(100% - 72px);
    }

    .tkw-modal-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      #team-knowledge-widget {
        bottom: 16px;
        left: 16px;
      }

      .tkw-floating-button {
        width: 56px;
        height: 56px;
        margin: 16px;
      }

      .tkw-floating-button svg {
        width: 24px;
        height: 24px;
      }

      .tkw-modal-content {
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(widget);

  // Add click handler
  const button = document.getElementById("tkw-button");
  if (button) {
    button.addEventListener("click", () => openModal());
  }
}

// Open modal with extension popup
function openModal(params?: string) {
  // Check if modal already exists
  if (document.getElementById("tkw-modal")) {
    return;
  }

  const baseUrl = chrome.runtime.getURL("index.html");
  const iframeUrl = params ? `${baseUrl}?${params}` : baseUrl;

  const modal = document.createElement("div");
  modal.id = "tkw-modal";
  modal.className = "tkw-modal";
  modal.innerHTML = `
    <div class="tkw-modal-content">
      <div class="tkw-modal-header">
        <h2 class="tkw-modal-title">TeamSystem Navify</h2>
        <button class="tkw-modal-close" id="tkw-close-modal">×</button>
      </div>
      <div class="tkw-modal-body">
        <iframe class="tkw-modal-iframe" src="${iframeUrl}"></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal handlers
  const closeBtn = document.getElementById("tkw-close-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Click outside to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // ESC key to close
  document.addEventListener("keydown", handleEscKey);
}

// Close modal
function closeModal() {
  const modal = document.getElementById("tkw-modal");
  if (modal) {
    modal.style.animation = "tkw-fadeOut 0.2s forwards";
    setTimeout(() => {
      modal.remove();
    }, 200);
  }
  document.removeEventListener("keydown", handleEscKey);
}

// Handle ESC key
function handleEscKey(e: KeyboardEvent) {
  if (e.key === "Escape") {
    closeModal();
  }
}

// Add fadeOut animation
const fadeOutStyle = document.createElement("style");
fadeOutStyle.textContent = `
  @keyframes tkw-fadeOut {
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(fadeOutStyle);

// Draggable function removed - widget is now static

// Listen for deep link clicks
document.addEventListener(
  "click",
  (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a");

    if (link && link.href) {
      const href = link.href;

      // Check if it's a knowledge link
      if (href.includes("knowledge.company.com")) {
        console.log("Knowledge link clicked:", href);
        e.preventDefault();
        e.stopPropagation();

        // Parse the URL
        try {
          const url = new URL(href);
          const pathParts = url.pathname.split("/").filter((p) => p);

          console.log("Path parts:", pathParts);

          if (pathParts[0] === "entry" && pathParts[1]) {
            console.log("Opening entry:", pathParts[1]);
            openModal(`entry=${pathParts[1]}`);
          } else if (pathParts[0] === "search") {
            const query = url.searchParams.get("q");
            if (query) {
              console.log("Opening search:", query);
              openModal(`q=${encodeURIComponent(query)}`);
            }
          }
        } catch (error) {
          console.error("Error parsing deep link:", error);
        }

        return false;
      }
    }
  },
  true,
); // Use capture phase to intercept before other handlers

// Also check current page URL on load
function checkCurrentPageUrl() {
  const url = window.location.href;

  if (url.includes("knowledge.company.com")) {
    console.log("On knowledge page:", url);

    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter((p) => p);

      if (pathParts[0] === "entry" && pathParts[1]) {
        console.log("Auto-opening entry from URL:", pathParts[1]);
        // Small delay to ensure widget is created
        setTimeout(() => {
          openModal(`entry=${pathParts[1]}`);
        }, 500);
      } else if (pathParts[0] === "search") {
        const query = urlObj.searchParams.get("q");
        if (query) {
          console.log("Auto-opening search from URL:", query);
          setTimeout(() => {
            openModal(`q=${encodeURIComponent(query)}`);
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error checking page URL:", error);
    }
  }
}

// Teams Chat Capture functionality
function createTeamsCaptureButton() {
  // Check if we're on Teams and button doesn't exist
  if (!isTeamsPage() || document.getElementById("tkw-teams-capture-btn")) {
    return;
  }

  console.log("[Teams Capture] Creating capture button...");

  const captureButton = document.createElement("div");
  captureButton.id = "tkw-teams-capture-btn";
  captureButton.innerHTML = `
    <button class="tkw-teams-capture-button" title="Capture this Teams chat to Navify">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12L12 17L7 12H10V8H14V12H17Z"/>
      </svg>
      <span>Capture Chat</span>
    </button>
  `;

  // Add styles for Teams capture button
  const style = document.createElement("style");
  style.textContent = `
    #tkw-teams-capture-btn {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 999998;
      font-family: 'Roboto', 'Cairo', sans-serif;
    }

    .tkw-teams-capture-button {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #7E85FD;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 24px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(126, 133, 253, 0.4);
      transition: all 0.3s ease;
    }

    .tkw-teams-capture-button:hover {
      background: #6B72E8;
      box-shadow: 0 6px 20px rgba(126, 133, 253, 0.6);
      transform: translateY(-2px);
    }

    .tkw-teams-capture-button:active {
      transform: translateY(0);
    }

    .tkw-teams-capture-button svg {
      width: 20px;
      height: 20px;
    }

    .tkw-teams-capture-loading {
      opacity: 0.7;
      cursor: wait;
    }

    .tkw-teams-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 34, 51, 0.85);
      backdrop-filter: blur(4px);
      z-index: 1000001;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      animation: tkw-fadeIn 0.2s forwards;
    }

    .tkw-teams-modal-content {
      background: white;
      width: 900px;
      max-width: 90vw;
      max-height: 80vh;
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(0, 34, 51, 0.4);
      overflow: hidden;
      transform: scale(0.9);
      animation: tkw-slideIn 0.3s forwards;
      display: flex;
      flex-direction: column;
    }

    .tkw-teams-modal-header {
      background: #002233;
      color: white;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #01BEE7;
    }

    .tkw-teams-modal-title {
      font-family: 'Cairo', 'Roboto', sans-serif;
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }

    .tkw-teams-modal-close {
      background: transparent;
      border: 2px solid #01BEE7;
      color: #01BEE7;
      width: 32px;
      height: 32px;
      cursor: pointer;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      border-radius: 4px;
    }

    .tkw-teams-modal-close:hover {
      background: #01BEE7;
      color: #002233;
    }

    .tkw-teams-modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
      color: #000;
    }

    .tkw-teams-summary {
      font-family: 'Roboto', sans-serif;
      color: #000;
    }

    .tkw-teams-summary h3 {
      color: #002233;
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 18px;
    }

    .tkw-teams-summary p {
      color: #333;
      line-height: 1.6;
      margin-bottom: 12px;
    }

    .tkw-teams-summary ul {
      list-style: none;
      padding: 0;
    }

    .tkw-teams-summary li {
      padding: 8px 12px;
      margin-bottom: 8px;
      background: #f5f5f5;
      border-left: 3px solid #7E85FD;
      border-radius: 4px;
      color: #000;
    }

    .tkw-teams-info {
      display: flex;
      gap: 24px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f0f9ff;
      border-radius: 8px;
    }

    .tkw-teams-info-item {
      display: flex;
      flex-direction: column;
    }

    .tkw-teams-info-label {
      font-size: 12px;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .tkw-teams-info-value {
      font-size: 14px;
      color: #002233;
      font-weight: 500;
    }

    .tkw-teams-modal-footer {
      padding: 16px 24px;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .tkw-teams-btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .tkw-teams-btn-primary {
      background: #7E85FD;
      color: white;
    }

    .tkw-teams-btn-primary:hover {
      background: #6B72E8;
    }

    .tkw-teams-btn-secondary {
      background: white;
      color: #002233;
      border: 2px solid #e0e0e0;
    }

    .tkw-teams-btn-secondary:hover {
      background: #f8f9fa;
      border-color: #7E85FD;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(captureButton);

  // Add click handler
  const button = captureButton.querySelector(".tkw-teams-capture-button");
  if (button) {
    button.addEventListener("click", handleTeamsCaptureClick);
  }

  console.log("[Teams Capture] Button created and added to page");
}

async function handleTeamsCaptureClick() {
  console.log("[Teams Capture] Button clicked, starting capture...");
  const button = document.querySelector(
    ".tkw-teams-capture-button",
  ) as HTMLElement;
  if (!button) return;

  // Show loading state
  button.classList.add("tkw-teams-capture-loading");
  const originalText = button.innerHTML;
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.3"/>
      <path d="M12 2v4c3.31 0 6 2.69 6 6h4c0-5.52-4.48-10-10-10z"/>
    </svg>
    <span>Capturing...</span>
  `;

  // Add spinning animation
  const spinStyle = document.createElement("style");
  spinStyle.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(spinStyle);

  try {
    console.log("[Teams Capture] Calling extractTeamsChat...");
    const chatData = await extractTeamsChat();
    console.log("[Teams Capture] Chat extracted successfully:", chatData);
    showTeamsChatModal(chatData);
  } catch (error) {
    console.error("[Teams Capture] Error capturing Teams chat:", error);
    alert(
      `Error capturing chat: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  } finally {
    // Restore button
    button.classList.remove("tkw-teams-capture-loading");
    button.innerHTML = originalText;
  }
}

function showTeamsChatModal(chatData: any) {
  console.log("[Teams Capture] Showing modal with chat data");
  // Remove existing modal if any
  const existingModal = document.getElementById("tkw-teams-chat-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const { summary, formattedText, keySummary, context } = chatData;

  const modal = document.createElement("div");
  modal.id = "tkw-teams-chat-modal";
  modal.className = "tkw-teams-modal";

  const chatTitle = context.chatName || "Untitled Chat";
  const startDate = new Date(summary.dateRange.start).toLocaleDateString();
  const endDate = new Date(summary.dateRange.end).toLocaleDateString();

  modal.innerHTML = `
    <div class="tkw-teams-modal-content">
      <div class="tkw-teams-modal-header">
        <h2 class="tkw-teams-modal-title">📥 Captured Teams Chat</h2>
        <button class="tkw-teams-modal-close" id="tkw-close-teams-modal">×</button>
      </div>
      <div class="tkw-teams-modal-body">
        <div class="tkw-teams-summary">
          <div class="tkw-teams-info">
            <div class="tkw-teams-info-item">
              <span class="tkw-teams-info-label">Chat Name</span>
              <span class="tkw-teams-info-value">${chatTitle}</span>
            </div>
            <div class="tkw-teams-info-item">
              <span class="tkw-teams-info-label">Participants</span>
              <span class="tkw-teams-info-value">${summary.participants.join(", ")}</span>
            </div>
            <div class="tkw-teams-info-item">
              <span class="tkw-teams-info-label">Messages</span>
              <span class="tkw-teams-info-value">${summary.messageCount}</span>
            </div>
            <div class="tkw-teams-info-item">
              <span class="tkw-teams-info-label">Date Range</span>
              <span class="tkw-teams-info-value">${startDate} - ${endDate}</span>
            </div>
          </div>

          <h3>📝 Overview</h3>
          <p>${keySummary.overview}</p>

          ${
            keySummary.keyPoints.length > 0
              ? `
            <h3>🔑 Key Points</h3>
            <ul>
              ${keySummary.keyPoints.map((point: string) => `<li>${point}</li>`).join("")}
            </ul>
          `
              : ""
          }

          ${
            keySummary.actionItems.length > 0
              ? `
            <h3>✅ Action Items</h3>
            <ul>
              ${keySummary.actionItems.map((item: string) => `<li>${item}</li>`).join("")}
            </ul>
          `
              : ""
          }

          ${
            keySummary.questions.length > 0
              ? `
            <h3>❓ Questions</h3>
            <ul>
              ${keySummary.questions.map((q: string) => `<li>${q}</li>`).join("")}
            </ul>
          `
              : ""
          }
        </div>
      </div>
      <div class="tkw-teams-modal-footer">
        <button class="tkw-teams-btn tkw-teams-btn-secondary" id="tkw-copy-chat">Copy to Clipboard</button>
        <button class="tkw-teams-btn tkw-teams-btn-primary" id="tkw-save-chat">Save to Navify</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listeners
  const closeBtn = document.getElementById("tkw-close-teams-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => modal.remove());
  }

  const copyBtn = document.getElementById("tkw-copy-chat");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard
        .writeText(formattedText)
        .then(() => {
          copyBtn.textContent = "✓ Copied!";
          setTimeout(() => {
            copyBtn.textContent = "Copy to Clipboard";
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
          alert("Failed to copy to clipboard");
        });
    });
  }

  const saveBtn = document.getElementById("tkw-save-chat");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      console.log("[Teams Capture] Save button clicked");
      modal.remove();
      // Open Navify with the chat data pre-filled
      const params = new URLSearchParams({
        action: "new-from-teams",
        title: chatTitle,
        content: formattedText,
      });
      console.log(
        "[Teams Capture] Opening modal with params:",
        params.toString(),
      );
      openModal(params.toString());
    });
  }

  // Click outside to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Check if we should create Teams capture button
function checkAndInitTeamsCapture() {
  if (isTeamsPage()) {
    console.log(
      "[Teams Capture] Teams page detected! URL:",
      window.location.href,
    );
    // Wait a bit for Teams to load
    setTimeout(() => {
      createTeamsCaptureButton();
    }, 2000);

    // Also watch for navigation changes in Teams SPA
    const observer = new MutationObserver(() => {
      if (!document.getElementById("tkw-teams-capture-btn")) {
        console.log("[Teams Capture] Button missing, recreating...");
        createTeamsCaptureButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } else {
    console.log("[Teams Capture] Not a Teams page. URL:", window.location.href);
  }
}

// Initialize widget when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    createFloatingWidget();
    checkCurrentPageUrl();
    checkAndInitTeamsCapture();
  });
} else {
  createFloatingWidget();
  checkCurrentPageUrl();
  checkAndInitTeamsCapture();
}

// Export for TypeScript
export {};
