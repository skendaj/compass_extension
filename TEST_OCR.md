# Testing OCR Feature - Step by Step

## ✅ Setup Complete
All Tesseract.js files are now bundled locally:
- ✅ Worker files in `dist/tesseract/`
- ✅ Language data in `dist/tessdata/eng.traineddata`
- ✅ All configured to use local paths (no CDN)

## 🔄 Testing Steps (IMPORTANT - Follow in Order)

### 1. Reload Extension
- Go to `chrome://extensions/`
- Find "TeamSystem Navify"
- Click the **Reload** button ⟳

### 2. Refresh Test Page
- Go to your test web page (e.g., Outlook, Teams)
- Press **F5** or **Cmd+R** to refresh
- This is **CRITICAL** - the old content script is invalid after extension reload

### 3. Open Background Console (Optional but Helpful)
- In `chrome://extensions/`, click "**service worker**" (blue link)
- This opens DevTools for background script
- Keep it open to see OCR processing logs

### 4. Test Screen Capture
- Click the **cyan camera button** (small button above main widget)
- Select text on the screen by clicking and dragging
- Release to capture

### 5. Watch for Logs
You should see:
```
📸 Screen capture initiated...
🔍 Creating selection overlay...
📐 Capture area: ...
✅ Screenshot received from background
📤 Sending image to background for OCR processing...
```

In background console:
```
📨 Background received message: PERFORM_OCR
🔧 Setting up offscreen document...
✅ Offscreen document created
📤 Sending image to offscreen document for OCR...
```

In offscreen (if visible):
```
📄 Offscreen document loaded for OCR processing
✅ Tesseract loaded
⚙️ Creating Tesseract worker with LOCAL files only...
📋 Tesseract: loading tesseract core
📋 Tesseract: initializing tesseract
📋 Tesseract: recognizing text
✅ OCR Extraction Complete!
📝 EXTRACTED TEXT:
[your text here]
```

## ⚠️ Common Issues

### "Extension context invalidated"
**Solution**: Refresh the test page after reloading extension

### "Receiving end does not exist"
**Solution**: Make sure background service worker is active (click "service worker" link to wake it up)

### Worker still loading from CDN
**Solution**: All files should be local now. Check console for actual paths being used.

## 📁 Files Modified
- `src/offscreen.html` - Loads Tesseract as script tag
- `src/offscreen.ts` - Uses local paths for worker, core, and language data
- `vite.config.ts` - Copies tessdata folder to dist
- `manifest.json` - Makes tessdata web accessible
- `public/tessdata/eng.traineddata` - Downloaded language data (22MB)

## 🎯 Expected Result
After capturing text:
1. Modal opens
2. Search input filled with extracted text
3. Search automatically triggered
4. Results displayed

