// Content Script - Floating Widget like Loom

// Ensure Chrome extension API is available
if (typeof chrome === 'undefined' || !chrome.runtime) {
  console.error('❌ TeamSystem Navify: Chrome extension API not available. Extension may not be loaded correctly.');
}

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
    <div class="tkw-buttons-container">
      <div class="tkw-floating-button" id="tkw-capture-button" title="Capture Text (OCR)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      </div>
      <div class="tkw-floating-button tkw-main-button" id="tkw-button" title="TeamSystem Navify">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM7 11.5L16 8L12.5 17.0021L11 13L7 11.5Z"></path>
        </svg>
      </div>
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

    .tkw-buttons-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
      padding: 20px;
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
      border: none;
    }

    #tkw-capture-button {
      width: 30px;
      height: 30px;
      background: #01BEE7;
      box-shadow: 0 2px 8px rgba(1, 190, 231, 0.4);
    }

    #tkw-capture-button svg {
      width: 16px;
      height: 16px;
    }

    .tkw-floating-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(126, 133, 253, 0.6);
    }

    #tkw-capture-button:hover {
      box-shadow: 0 6px 18px rgba(1, 190, 231, 0.6);
    }

    .tkw-floating-button:active {
      transform: scale(0.95);
    }

    .tkw-floating-button svg {
      width: 28px;
      height: 28px;
      color: white;
    }

    .tkw-floating-button.tkw-processing {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .tkw-floating-button.tkw-processing svg {
      animation: tkw-spin 1s linear infinite;
    }

    @keyframes tkw-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
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
      .tkw-buttons-container {
        padding: 16px;
        gap: 6px;
      }

      .tkw-floating-button {
        width: 56px;
        height: 56px;
      }

      #tkw-capture-button {
        width: 28px;
        height: 28px;
      }

      #tkw-capture-button svg {
        width: 14px;
        height: 14px;
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

  // Add click handler for main button
  const button = document.getElementById("tkw-button");
  if (button) {
    button.addEventListener("click", () => openModal());
  }

  // Add click handler for capture button
  const captureButton = document.getElementById("tkw-capture-button");
  if (captureButton) {
    captureButton.addEventListener("click", () => handleScreenCapture(captureButton));
  }
}

// Handle screen capture functionality
async function handleScreenCapture(button: HTMLElement) {
  console.log('📸 Screen capture initiated from floating button...');
  
  // Add processing state
  button.classList.add('tkw-processing');
  
  try {
    // Show selection overlay
    const imageDataUrl = await captureScreenSelection();
    
    if (!imageDataUrl) {
      console.log('⚠️ Capture cancelled - no image data received');
      console.log('ℹ️  This could be due to: selection too small, ESC pressed, or capture error');
      button.classList.remove('tkw-processing');
      return;
    }
    
    console.log('🖼️ Image captured, sending for OCR processing...');
    console.log('📏 Image data size:', imageDataUrl.length, 'characters');
    
    // Check if chrome API is available
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      console.error('❌ Chrome extension API not available');
      button.classList.remove('tkw-processing');
      return;
    }
    
    // Send image to background for OCR processing
    console.log('📤 Sending image to background for OCR processing...');
    console.log('🔗 Chrome runtime ID:', chrome.runtime.id);
    console.log('🔗 Message type: PERFORM_OCR');
    
    chrome.runtime.sendMessage(
      {
        type: 'PERFORM_OCR',
        imageData: imageDataUrl
      },
      (response) => {
        console.log('📨 Received response from background:', response);
        
        if (chrome.runtime.lastError) {
          console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
          console.error('❌ Error message:', chrome.runtime.lastError.message);
          button.classList.remove('tkw-processing');
          openModal(); // Open modal without OCR
          return;
        }
        
        if (response && response.success && response.text) {
          console.log('✅ OCR completed successfully!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📝 EXTRACTED TEXT:');
          console.log(response.text);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          // Open modal with the extracted text as search query
          button.classList.remove('tkw-processing');
          openModal(`search=${encodeURIComponent(response.text)}`);
        } else {
          console.error('❌ OCR failed:', response?.error);
          button.classList.remove('tkw-processing');
          openModal(); // Open modal without OCR
        }
      }
    );
    
  } catch (error) {
    console.error('❌ Screen capture error:', error);
    button.classList.remove('tkw-processing');
  }
}

// Capture screen selection and return image data URL
async function captureScreenSelection(): Promise<string | null> {
  return new Promise((resolve) => {
    console.log('🔍 Creating selection overlay...');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      cursor: crosshair;
      z-index: 9999999;
    `;

    const selectionBox = document.createElement('div');
    selectionBox.style.cssText = `
      position: absolute;
      border: 2px dashed #01bee7;
      background: rgba(1, 190, 231, 0.1);
      display: none;
    `;
    overlay.appendChild(selectionBox);

    let startX = 0;
    let startY = 0;
    let isSelecting = false;

    overlay.addEventListener('mousedown', (e: MouseEvent) => {
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = '0';
      selectionBox.style.height = '0';
      selectionBox.style.display = 'block';
    });

    overlay.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isSelecting) return;

      const currentX = e.clientX;
      const currentY = e.clientY;
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);

      selectionBox.style.left = `${left}px`;
      selectionBox.style.top = `${top}px`;
      selectionBox.style.width = `${width}px`;
      selectionBox.style.height = `${height}px`;
    });

    overlay.addEventListener('mouseup', (e: MouseEvent) => {
      if (!isSelecting) return;
      
      isSelecting = false;
      const endX = e.clientX;
      const endY = e.clientY;

      // Calculate capture area
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);

      if (width < 10 || height < 10) {
        console.log('⚠️ Selection too small');
        overlay.remove();
        document.removeEventListener('keydown', handleEscape);
        resolve(null);
        return;
      }

      console.log(`📐 Capture area: ${width}x${height} at (${x}, ${y})`);
      console.log('📸 Capturing screenshot...');
      
      // Remove overlay and escape listener
      overlay.remove();
      document.removeEventListener('keydown', handleEscape);
      
      // Capture using Chrome's tabs.captureVisibleTab API instead
      // Since html2canvas has CSP issues in content scripts
      setTimeout(async () => {
        try {
          console.log('📸 Requesting screenshot from background script...');
          
          // Check if chrome API is available
          if (typeof chrome === 'undefined' || !chrome.runtime) {
            throw new Error('Chrome extension API not available');
          }
          

          // Send message to background to capture the visible tab
          chrome.runtime.sendMessage(
            {
              type: 'CAPTURE_SCREENSHOT',
              area: { x, y, width, height }
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                resolve(null);
                return;
              }
              
              if (response && response.success && response.dataUrl) {
                console.log('✅ Screenshot received from background, size:', response.dataUrl.length, 'bytes');
                resolve(response.dataUrl);
              } else {
                console.error('❌ Failed to get screenshot:', response?.error);
                resolve(null);
              }
            }
          );
        } catch (error) {
          console.error('❌ Screenshot capture failed:', error);
          console.error('Error details:', error instanceof Error ? error.message : String(error));
          resolve(null);
        }
      }, 100); // Small delay to ensure overlay is fully removed
    });

    // Cancel on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.body.contains(overlay)) {
          overlay.remove();
        }
        document.removeEventListener('keydown', handleEscape);
        console.log('⚠️ Capture cancelled by user (ESC pressed)');
        resolve(null);
      }
    };
    document.addEventListener('keydown', handleEscape);

    document.body.appendChild(overlay);
  });
}

// Open modal with extension popup
function openModal(params?: string): void {
  // Check if modal already exists
  if (document.getElementById("tkw-modal")) {
    return;
  }

  // Check if chrome API is available
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.error('❌ Chrome extension API not available');
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
