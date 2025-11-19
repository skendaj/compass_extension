// Offscreen document for OCR processing
// Using Tesseract.js with workerBlobURL: false to avoid CSP issues!
console.log('📄 Offscreen document loaded for OCR processing');

// Preprocess image for better OCR accuracy
async function preprocessImage(imageData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas with 2x scale for better OCR
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Scale up 2x for better text recognition
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      
      // Draw scaled image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Increase contrast and convert to grayscale
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        
        // Increase contrast (simple threshold)
        const contrasted = gray > 128 ? 255 : 0;
        
        data[i] = contrasted;     // R
        data[i + 1] = contrasted; // G
        data[i + 2] = contrasted; // B
        // Alpha stays the same
      }
      
      // Put processed image back
      ctx.putImageData(imageData, 0, 0);
      
      // Return as data URL
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = imageData;
  });
}

// Perform OCR using Tesseract.js with workerBlobURL: false
async function performOCR(imageData: string): Promise<string> {
  try {
    console.log('🔍 Starting OCR with Tesseract.js (workerBlobURL: false)...');
    console.log('📏 Image data length:', imageData.length);
    
    // Preprocess image for better accuracy
    console.log('🎨 Preprocessing image for better OCR...');
    const processedImage = await preprocessImage(imageData);
    console.log('✅ Image preprocessed (scaled 2x, high contrast)');
    
    // Import Tesseract
    const Tesseract = await import('tesseract.js');
    console.log('✅ Tesseract imported');
    
    const workerPath = chrome.runtime.getURL('tesseract/worker.min.js');
    const corePath = chrome.runtime.getURL('tesseract/tesseract-core-lstm.wasm.js');
    const langPath = chrome.runtime.getURL('tessdata/');
    
    console.log('🔗 Worker path:', workerPath);
    console.log('🔗 Core path:', corePath);
    console.log('🔗 Lang path:', langPath);
    console.log('⚙️ Creating Tesseract worker with workerBlobURL: false...');
    
    // THE KEY FIX: workerBlobURL: false prevents the blob URL CSP violation!
    const worker = await (Tesseract.createWorker as any)('eng', 1, {
      workerPath,
      corePath,
      langPath,
      workerBlobURL: false, // 🔑 THIS IS THE FIX!
      cacheMethod: 'none',
      gzip: false, // 🔑 Don't try to load .gz files
      logger: (m: any) => {
        const progress = m.progress ? `${Math.round(m.progress * 100)}%` : '';
        console.log('📋 Tesseract:', m.status, progress);
      }
    });
    
    // Set better parameters for screen text
    console.log('⚙️ Configuring Tesseract for screen text...');
    await (worker as any).setParameters({
      tessedit_pageseg_mode: '6', // Assume uniform block of text
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,-:;!?\'\"()[]{}@#$%&*+=/<>\\|_~`',
    });
    
    console.log('✅ Worker created, running recognition...');
    const result = await (worker as any).recognize(processedImage);
    
    // Clean up
    await (worker as any).terminate();
    
    const extractedText = result.data.text.trim();
    
    console.log('✅ OCR Extraction Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 EXTRACTED TEXT:');
    console.log(extractedText);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 OCR Confidence:', Math.round(result.data.confidence) + '%');
    
    return extractedText;
  } catch (error) {
    console.error('❌ OCR error in offscreen:', error);
    throw error;
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Offscreen received message:', message);
  
  if (message.type === 'PERFORM_OCR_OFFSCREEN') {
    console.log('🔄 Processing OCR request in offscreen document...');
    performOCR(message.imageData)
      .then(text => {
        console.log('✅ OCR successful, sending response with text:', text.substring(0, 50) + '...');
        sendResponse({ success: true, text });
      })
      .catch(error => {
        console.error('❌ OCR failed in offscreen:', error);
        sendResponse({ success: false, error: error.message || String(error) });
      });
    
    // Return true to indicate we'll send response asynchronously
    return true;
  }
  
  // Return false for messages we don't handle
  return false;
});

console.log('✅ Offscreen document ready to process OCR requests');
console.log('🔗 Extension ID:', chrome.runtime.id);

