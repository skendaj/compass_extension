// Content Script - Floating Widget like Loom

// Create and inject the floating widget
function createFloatingWidget() {
  // Check if widget already exists
  if (document.getElementById('team-knowledge-widget')) {
    return;
  }

  // Create widget container
  const widget = document.createElement('div');
  widget.id = 'team-knowledge-widget';
  widget.innerHTML = `
    <div class="tkw-floating-button" id="tkw-button" title="Navify">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="url(#gradient)" />
        <path d="M16 8C13.79 8 12 9.79 12 12C12 14.21 13.79 16 16 16C18.21 16 20 14.21 20 12C20 9.79 18.21 8 16 8Z" fill="white"/>
        <circle cx="16" cy="22" r="2" fill="white"/>
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stop-color="#667eea" />
            <stop offset="100%" stop-color="#764ba2" />
          </linearGradient>
        </defs>
      </svg>
      <div class="tkw-pulse"></div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #team-knowledge-widget {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }

    .tkw-floating-button {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .tkw-floating-button:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .tkw-floating-button:active {
      transform: scale(0.98);
    }

    .tkw-pulse {
      display: none;
    }

    /* Modal styles */
    .tkw-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
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
      border-radius: 16px;
      width: 600px;
      max-width: 90vw;
      height: 700px;
      max-height: 90vh;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tkw-modal-title {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }

    .tkw-modal-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .tkw-modal-close:hover {
      background: rgba(255, 255, 255, 0.3);
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
        border-radius: 0;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(widget);

  // Add click handler
  const button = document.getElementById('tkw-button');
  if (button) {
    button.addEventListener('click', openModal);
  }
}

// Open modal with extension popup
function openModal(params?: string) {
  // Check if modal already exists
  if (document.getElementById('tkw-modal')) {
    return;
  }

  const baseUrl = chrome.runtime.getURL('index.html');
  const iframeUrl = params ? `${baseUrl}?${params}` : baseUrl;

  const modal = document.createElement('div');
  modal.id = 'tkw-modal';
  modal.className = 'tkw-modal';
  modal.innerHTML = `
    <div class="tkw-modal-content">
      <div class="tkw-modal-header">
        <h2 class="tkw-modal-title">🎯 Navify</h2>
        <button class="tkw-modal-close" id="tkw-close-modal">×</button>
      </div>
      <div class="tkw-modal-body">
        <iframe class="tkw-modal-iframe" src="${iframeUrl}"></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal handlers
  const closeBtn = document.getElementById('tkw-close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // ESC key to close
  document.addEventListener('keydown', handleEscKey);
}

// Close modal
function closeModal() {
  const modal = document.getElementById('tkw-modal');
  if (modal) {
    modal.style.animation = 'tkw-fadeOut 0.2s forwards';
    setTimeout(() => {
      modal.remove();
    }, 200);
  }
  document.removeEventListener('keydown', handleEscKey);
}

// Handle ESC key
function handleEscKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeModal();
  }
}

// Add fadeOut animation
const fadeOutStyle = document.createElement('style');
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
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const link = target.closest('a');
  
  if (link && link.href) {
    const href = link.href;
    
    // Check if it's a knowledge link
    if (href.includes('knowledge.company.com')) {
      console.log('Knowledge link clicked:', href);
      e.preventDefault();
      e.stopPropagation();
      
      // Parse the URL
      try {
        const url = new URL(href);
        const pathParts = url.pathname.split('/').filter(p => p);
        
        console.log('Path parts:', pathParts);
        
        if (pathParts[0] === 'entry' && pathParts[1]) {
          console.log('Opening entry:', pathParts[1]);
          openModal(`entry=${pathParts[1]}`);
        } else if (pathParts[0] === 'search') {
          const query = url.searchParams.get('q');
          if (query) {
            console.log('Opening search:', query);
            openModal(`q=${encodeURIComponent(query)}`);
          }
        }
      } catch (error) {
        console.error('Error parsing deep link:', error);
      }
      
      return false;
    }
  }
}, true); // Use capture phase to intercept before other handlers

// Also check current page URL on load
function checkCurrentPageUrl() {
  const url = window.location.href;
  
  if (url.includes('knowledge.company.com')) {
    console.log('On knowledge page:', url);
    
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      
      if (pathParts[0] === 'entry' && pathParts[1]) {
        console.log('Auto-opening entry from URL:', pathParts[1]);
        // Small delay to ensure widget is created
        setTimeout(() => {
          openModal(`entry=${pathParts[1]}`);
        }, 500);
      } else if (pathParts[0] === 'search') {
        const query = urlObj.searchParams.get('q');
        if (query) {
          console.log('Auto-opening search from URL:', query);
          setTimeout(() => {
            openModal(`q=${encodeURIComponent(query)}`);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error checking page URL:', error);
    }
  }
}

// Initialize widget when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createFloatingWidget();
    checkCurrentPageUrl();
  });
} else {
  createFloatingWidget();
  checkCurrentPageUrl();
}

// Export for TypeScript
export {};

