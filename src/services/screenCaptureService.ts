// Screen Capture and OCR Service
import html2canvas from 'html2canvas';
import { createWorker } from 'tesseract.js';

class ScreenCaptureService {
  private worker: Tesseract.Worker | null = null;
  private ocrProgressHandler: ((progress: number) => void) | null = null;

  private getResourceUrl(relativePath: string): string {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
        return chrome.runtime.getURL(relativePath);
      }
    } catch (error) {
      console.warn('⚠️ Unable to resolve chrome runtime URL, falling back to relative path:', error);
    }
    return relativePath;
  }

  // Initialize OCR worker
  async initOCR(): Promise<void> {
    if (this.worker) return;
    
    console.log('🔧 Initializing Tesseract.js worker (v5)...');
    
    try {
      const workerPath = this.getResourceUrl('tesseract/worker.min.js');
      const corePath = this.getResourceUrl('tesseract/tesseract-core-lstm.wasm.js');
      const langPath = 'https://tessdata.projectnaptha.com/4.0.0';

      console.log('🔗 Worker path:', workerPath);
      console.log('🔗 Core path:', corePath);
      console.log('🔗 Lang path:', langPath);

      // Create worker with v5 API
      // Signature: createWorker(langs, oem, options)
      // - langs: 'eng' (language to use)
      // - oem: 1 (LSTM only, default)
      // - options: configuration object
      const worker = await (createWorker as any)('eng', 1, {
        workerPath,
        langPath,
        corePath,
        logger: (m: any) => {
          const progress = m.progress ? `${Math.round(m.progress * 100)}%` : '';
          console.log('📋 Tesseract:', m.status, progress);

          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            const progressPercent = Math.round(m.progress * 100);
            console.log(`🔄 OCR Progress: ${progressPercent}%`);
            if (this.ocrProgressHandler) {
              this.ocrProgressHandler(progressPercent);
            }
          }
        }
      }) as Tesseract.Worker;
      
      this.worker = worker;
      console.log('✅ Tesseract.js worker initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Tesseract worker:', error);
      throw error;
    }
  }

  // Terminate OCR worker to free resources
  async terminateOCR(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  // Capture entire screen (current tab)
  async captureScreen(): Promise<string | null> {
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Screen capture error:', error);
      return null;
    }
  }

  // Capture a specific element by selector
  async captureElement(selector: string): Promise<string | null> {
    try {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      const canvas = await html2canvas(element as HTMLElement, {
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Element capture error:', error);
      return null;
    }
  }

  // Capture a selected area (returns a promise that resolves when user selects area)
  async captureSelectedArea(): Promise<string | null> {
    return new Promise((resolve) => {
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
        z-index: 999999;
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

      overlay.addEventListener('mouseup', async (e: MouseEvent) => {
        if (!isSelecting) return;
        
        isSelecting = false;
        const endX = e.clientX;
        const endY = e.clientY;

        // Remove overlay
        document.body.removeChild(overlay);

        // Calculate capture area
        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        if (width < 10 || height < 10) {
          resolve(null);
          return;
        }

        // Capture the selected area
        try {
          const canvas = await html2canvas(document.body, {
            useCORS: true,
            allowTaint: true,
            logging: false,
            x,
            y,
            width,
            height,
            scrollX: 0,
            scrollY: 0,
          });
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          console.error('Capture error:', error);
          resolve(null);
        }
      });

      // Cancel on Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          document.body.removeChild(overlay);
          document.removeEventListener('keydown', handleEscape);
          resolve(null);
        }
      };
      document.addEventListener('keydown', handleEscape);

      document.body.appendChild(overlay);
    });
  }

  // Extract text from image using OCR
  async extractTextFromImage(imageData: string, onProgress?: (progress: number) => void): Promise<string> {
    try {
      console.log('🔍 Starting OCR text extraction...');
      console.log('📏 Image data length:', imageData.length);
      
      await this.initOCR();
      
      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      console.log('⚙️ Running Tesseract.js recognition...');
      
      if (onProgress) {
        this.ocrProgressHandler = onProgress;
      }
      
      // Use v5 API
      const result = await this.worker.recognize(imageData);
      
      this.ocrProgressHandler = null;
      if (onProgress) {
        onProgress(100);
      }

      const extractedText = result.data.text.trim();
      
      console.log('✅ OCR Extraction Complete!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 EXTRACTED TEXT:');
      console.log(extractedText);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 OCR Confidence:', result.data.confidence + '%');
      console.log('📄 Full OCR Result:', result.data);

      return extractedText;
    } catch (error) {
      console.error('❌ OCR error:', error);
      throw error;
    }
  }

  // Capture screen area and extract text in one go
  async captureAndExtractText(onProgress?: (progress: number) => void): Promise<string | null> {
    try {
      if (onProgress) onProgress(10);
      
      const imageData = await this.captureSelectedArea();
      if (!imageData) {
        return null;
      }

      if (onProgress) onProgress(30);
      
      const text = await this.extractTextFromImage(imageData, (ocrProgress) => {
        if (onProgress) {
          // Map OCR progress from 30% to 100%
          onProgress(30 + Math.round(ocrProgress * 0.7));
        }
      });

      return text;
    } catch (error) {
      console.error('Capture and extract error:', error);
      return null;
    }
  }
}

export const screenCaptureService = new ScreenCaptureService();

