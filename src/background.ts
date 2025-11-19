// Background Service Worker for Chrome Extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('TeamSystem Navify installed!');
  
  // Initialize storage with default values
  chrome.storage.local.set({
    firstRun: true,
    installDate: new Date().toISOString(),
  });
  
  // Context menu integration (optional enhancement)
  try {
    chrome.contextMenus.create({
      id: 'searchKnowledge',
      title: 'Search in Knowledge Base',
      contexts: ['selection'],
    });
  } catch (e) {
    console.log('Context menu already exists or error:', e);
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background received message:', request.type || request.action);
  
  if (request.action === 'openTeamsChat') {
    // Open Microsoft Teams chat
    chrome.tabs.create({
      url: request.url,
    });
    sendResponse({ success: true });
  }
  
  if (request.action === 'openEmail') {
    // Open email client
    chrome.tabs.create({
      url: request.url,
    });
    sendResponse({ success: true });
  }
  
  if (request.action === 'openDocumentation') {
    // Open documentation link
    chrome.tabs.create({
      url: request.url,
    });
    sendResponse({ success: true });
  }
  
  if (request.type === 'CAPTURE_SCREENSHOT') {
    // Handle screenshot capture request
    console.log('📸 Received CAPTURE_SCREENSHOT request');
    captureAndCropScreenshot(request.area, sender.tab?.windowId)
      .then(dataUrl => {
        console.log('✅ Screenshot captured and cropped');
        sendResponse({ success: true, dataUrl });
      })
      .catch(error => {
        console.error('❌ Screenshot error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }
  
  if (request.type === 'PERFORM_OCR') {
    // Handle OCR request with image data
    console.log('🔍 Received PERFORM_OCR request');
    console.log('📏 Image data length:', request.imageData?.length);
    
    performOCROnImage(request.imageData)
      .then(text => {
        console.log('✅ OCR completed successfully!');
        console.log('📝 Extracted text:', text);
        sendResponse({ success: true, text });
      })
      .catch(error => {
        console.error('❌ OCR error in background:', error);
        console.error('❌ Error details:', error.message, error.stack);
        sendResponse({ success: false, error: error.message || String(error) });
      });
    return true; // Keep channel open for async response
  }
  
  return true;
});

// Capture and crop screenshot
async function captureAndCropScreenshot(area: { x: number, y: number, width: number, height: number }, windowId?: number): Promise<string> {
  try {
    console.log('📸 Capturing visible tab...');
    
    // Capture the visible tab
    const dataUrl = windowId 
      ? await chrome.tabs.captureVisibleTab(windowId, { format: 'png' })
      : await chrome.tabs.captureVisibleTab({ format: 'png' });

    console.log('✂️ Cropping to selected area...');

    // Convert data URL to blob without fetch (fetch doesn't work well with data URLs in service workers)
    const blob = await dataURLToBlob(dataUrl);

    // Create ImageBitmap from blob (works in service workers)
    const imageBitmap = await createImageBitmap(blob);

    // Create canvas with the cropped dimensions
    const canvas = new OffscreenCanvas(area.width, area.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw the cropped portion
    ctx.drawImage(
      imageBitmap,
      area.x, area.y, area.width, area.height,  // Source rectangle
      0, 0, area.width, area.height              // Destination rectangle
    );

    // Convert to blob and then to data URL
    const croppedBlob = await canvas.convertToBlob({ type: 'image/png' });
    const croppedDataUrl = await blobToDataURL(croppedBlob);

    console.log('✅ Screenshot cropped successfully');
    return croppedDataUrl;
  } catch (error) {
    console.error('❌ Error in captureAndCropScreenshot:', error);
    throw error;
  }
}

// Handle screen capture and OCR
async function handleScreenCaptureOCR(area: { x: number, y: number, width: number, height: number }, tabId?: number): Promise<string> {
  if (!tabId) {
    throw new Error('No tab ID provided');
  }

  try {
    console.log('📸 Capturing tab screenshot...');
    
    // Capture the visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(undefined, {
      format: 'png'
    });

    console.log('🖼️ Screenshot captured, processing area...');

    // Create a canvas to crop the image
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });

    // Create canvas and crop to selected area
    const canvas = new OffscreenCanvas(area.width, area.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw the cropped portion
    ctx.drawImage(
      img,
      area.x, area.y, area.width, area.height,
      0, 0, area.width, area.height
    );

    // Convert to blob and then to data URL
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const croppedDataUrl = await blobToDataURL(blob);

    console.log('✂️ Image cropped, performing OCR...');

    // Perform OCR using Tesseract.js
    const text = await performOCR(croppedDataUrl);
    
    console.log('📝 OCR result:', text);
    
    return text;
  } catch (error) {
    console.error('❌ Error in handleScreenCaptureOCR:', error);
    throw error;
  }
}

// Convert blob to data URL
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Convert data URL to Blob
function dataURLToBlob(dataUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Split the data URL
      const parts = dataUrl.split(',');
      if (parts.length !== 2) {
        throw new Error('Invalid data URL format');
      }
      
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png';
      const base64 = parts[1];
      
      // Decode base64
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: mime });
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });
}

// Perform OCR on image (simplified - delegates to extension context)
// Create or get existing offscreen document for OCR
async function setupOffscreenDocument() {
  console.log('🔧 Setting up offscreen document...');
  
  // Check if offscreen API is available
  if (!chrome.offscreen) {
    console.error('❌ chrome.offscreen API not available. Requires Chrome 109+');
    throw new Error('Offscreen documents not supported. Please update Chrome to version 109 or later.');
  }
  
  try {
    // Try to access existing offscreen document
    if ((chrome.runtime as any).getContexts) {
      const existingContexts = await (chrome.runtime as any).getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
      });

      if (existingContexts && existingContexts.length > 0) {
        console.log('✅ Offscreen document already exists');
        return;
      }
    }
  } catch (error) {
    // getContexts might not be available, ignore and try to create
    console.log('⚠️ Unable to check existing contexts, will try to create offscreen document');
  }

  try {
    console.log('🔧 Creating offscreen document for OCR...');
    await (chrome.offscreen as any).createDocument({
      url: 'offscreen.html',
      reasons: ['WORKERS'],
      justification: 'OCR text extraction using Tesseract.js worker'
    });
    console.log('✅ Offscreen document created successfully');
  } catch (error: any) {
    if (error.message && error.message.includes('Only a single offscreen')) {
      console.log('✅ Offscreen document already exists (from error)');
      return;
    }
    console.error('❌ Failed to create offscreen document:', error);
    throw error;
  }
}

async function performOCROnImage(imageData: string): Promise<string> {
  try {
    console.log('🔍 Starting OCR on captured image...');
    console.log('📏 Image data length:', imageData.length);
    console.log('🔍 Checking chrome.offscreen availability...');
    console.log('🔍 chrome.offscreen exists:', !!chrome.offscreen);
    console.log('🔍 Chrome version:', navigator.userAgent);
    
    // Check if offscreen API is available
    if (!chrome.offscreen) {
      console.error('❌ chrome.offscreen API not available!');
      console.log('💡 Fallback: Storing image for popup to process...');
      
      // Fallback: Store image and let popup handle OCR
      await chrome.storage.local.set({
        pendingOCR: imageData,
        ocrTimestamp: Date.now()
      });
      
      return 'POPUP_WILL_HANDLE';
    }
    
    // Ensure offscreen document exists
    console.log('⏳ Setting up offscreen document...');
    await setupOffscreenDocument();
    console.log('✅ Offscreen document setup complete');
    
    // Give the offscreen document a moment to initialize and load Tesseract
    console.log('⏳ Waiting for offscreen document to initialize...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Increased wait time
    
    console.log('📤 Sending image to offscreen document for OCR...');
    
    // Create a promise-based approach for the message
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: 'PERFORM_OCR_OFFSCREEN',
          imageData
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('❌ Runtime error when messaging offscreen:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          
          if (response && response.success) {
            console.log('✅ OCR completed successfully from offscreen');
            console.log('📝 Extracted text:', response.text);
            resolve(response.text);
          } else {
            console.error('❌ Offscreen OCR failed:', response?.error);
            reject(new Error(response?.error || 'OCR failed in offscreen'));
          }
        }
      );
    });
    
  } catch (error) {
    console.error('❌ OCR error in performOCROnImage:', error);
    throw error;
  }
}

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'searchKnowledge' && info.selectionText) {
    // Store selected text and open popup
    chrome.storage.local.set({
      pendingSearch: info.selectionText,
    });
    chrome.action.openPopup();
  }
});

// Badge notification for new knowledge entries (future enhancement)
function updateBadge(count: number) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Export for TypeScript
export {};

