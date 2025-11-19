// Content Script - Floating Widget like Loom

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
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#ffffff" viewBox="0 0 256 256">

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
      width: 68px;
      height: 68px;
      background: #01BEE7;
      box-shadow: 0 2px 8px rgba(0, 34, 51, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .tkw-floating-button:hover {
      background: #00a8cf;
      box-shadow: 0 4px 12px rgba(0, 34, 51, 0.3);
    }

    .tkw-floating-button:active {
      transform: scale(0.98);
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
    button.addEventListener("click", openModal);
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

// Initialize widget when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    createFloatingWidget();
    checkCurrentPageUrl();
  });
} else {
  createFloatingWidget();
  checkCurrentPageUrl();
}

// Export for TypeScript
export {};
