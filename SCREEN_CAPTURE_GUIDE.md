# Screen Capture & OCR Feature Guide

## Overview

The Screen Capture feature allows users to capture chat conversations or any text on their screen and automatically extract the text using OCR (Optical Character Recognition) technology. This extracted text can then be used as a search query in the Navify extension.

## Technologies Used

- **html2canvas**: For capturing screen content
- **Tesseract.js**: For OCR text extraction (supports 100+ languages)
- **React**: For UI components

## How It Works

### 1. User Interaction Flow

1. User clicks the "Capture Text" button in the search view
2. An overlay appears with crosshair cursor
3. User drags to select the area containing text
4. Upon release, the selected area is captured
5. OCR processes the image and extracts text
6. Extracted text is automatically populated in the search input

### 2. Architecture

```
ScreenCaptureButton (Component)
    ↓
screenCaptureService (Service)
    ├── captureSelectedArea() → Captures screen region
    └── extractTextFromImage() → OCR processing
```

## Usage

### Basic Usage in Search View

The screen capture button is already integrated into the SearchView component:

```tsx
<ScreenCaptureButton onTextExtracted={handleTextExtracted} />
```

### Manual Integration

You can integrate the screen capture feature into any component:

```tsx
import ScreenCaptureButton from './components/ScreenCaptureButton';

function MyComponent() {
  const handleTextExtracted = (text: string) => {
    console.log('Extracted text:', text);
    // Do something with the text
  };

  return (
    <ScreenCaptureButton onTextExtracted={handleTextExtracted} />
  );
}
```

### Direct Service Usage

You can also use the service directly:

```tsx
import { screenCaptureService } from './services/screenCaptureService';

// Capture and extract in one go
const text = await screenCaptureService.captureAndExtractText((progress) => {
  console.log(`Progress: ${progress}%`);
});

// Or do it in steps
const imageData = await screenCaptureService.captureSelectedArea();
if (imageData) {
  const text = await screenCaptureService.extractTextFromImage(imageData);
}
```

## API Reference

### ScreenCaptureButton Component

**Props:**
- `onTextExtracted: (text: string) => void` - Callback when text is extracted

**States:**
- `isProcessing: boolean` - Whether capture/OCR is in progress
- `progress: number` - Progress percentage (0-100)
- `error: string | null` - Error message if any

### screenCaptureService

#### Methods

**`captureSelectedArea(): Promise<string | null>`**
- Shows selection overlay for user to select screen area
- Returns base64 image data or null if cancelled
- Press ESC to cancel selection

**`extractTextFromImage(imageData: string, onProgress?: (progress: number) => void): Promise<string>`**
- Extracts text from image using OCR
- `imageData`: Base64 image string
- `onProgress`: Optional callback for progress updates
- Returns extracted text

**`captureAndExtractText(onProgress?: (progress: number) => void): Promise<string | null>`**
- Combines capture and extraction in one operation
- Shows progress from 0-100%
- Returns extracted text or null if cancelled

**`captureScreen(): Promise<string | null>`**
- Captures entire screen/tab
- Returns base64 image data

**`captureElement(selector: string): Promise<string | null>`**
- Captures specific DOM element
- `selector`: CSS selector for target element
- Returns base64 image data

**`initOCR(): Promise<void>`**
- Manually initialize OCR worker
- Automatically called when needed

**`terminateOCR(): Promise<void>`**
- Cleanup OCR worker to free memory

## Performance Considerations

### Memory Management

The OCR worker is initialized on-demand and kept in memory for better performance. To free memory:

```tsx
await screenCaptureService.terminateOCR();
```

### Progress Tracking

OCR processing can take a few seconds. Use progress callbacks to show user feedback:

```tsx
await screenCaptureService.captureAndExtractText((progress) => {
  setProgressPercent(progress);
});
```

### Image Quality

- Larger captures = more processing time
- Better contrast = better OCR accuracy
- Text size should be at least 12-14px for optimal results

## User Experience Tips

### Best Practices for Selection

1. **Capture readable text**: Ensure text is clear and not too small
2. **Good contrast**: Dark text on light background works best
3. **Avoid decorative fonts**: Standard fonts give better results
4. **Single language**: Mixed languages may reduce accuracy

### Visual Feedback

The component provides:
- Loading spinner during processing
- Progress percentage display
- Error messages if capture fails
- Success indication when complete

### Keyboard Shortcuts

- **ESC**: Cancel selection overlay

## Common Use Cases

### 1. Capture Teams/Slack Messages

Perfect for capturing conversation snippets to search for solutions:
```
User selects chat messages → OCR extracts text → Searches knowledge base
```

### 2. Capture Error Messages

Quickly capture error dialogs or console output:
```
User selects error message → Text extracted → Finds relevant solutions
```

### 3. Capture Documentation

Extract text from screenshots or images:
```
User selects documentation image → Text extracted → Creates searchable content
```

## Troubleshooting

### OCR Not Working

1. Check browser console for errors
2. Ensure image quality is good
3. Try smaller selection area
4. Check if Tesseract.js loaded properly

### Selection Overlay Not Appearing

1. Check z-index conflicts
2. Ensure no other overlays are blocking
3. Try refreshing the extension

### Poor Text Recognition

1. Increase capture area
2. Ensure good contrast
3. Use standard fonts if possible
4. Clean/crop selection to text only

## Future Enhancements

Potential improvements:
- Multi-language support (currently English)
- Image preprocessing for better OCR
- Save captured images to history
- Batch processing of multiple captures
- Custom OCR training for specific fonts
- Direct integration with Teams/Slack APIs

## Security & Privacy

- All OCR processing happens **locally in the browser**
- No images or text are sent to external servers
- Tesseract.js runs entirely client-side
- Captured data is temporary and not stored unless explicitly saved

## Dependencies

```json
{
  "tesseract.js": "^6.0.1",
  "html2canvas": "^1.4.1"
}
```

## License

This feature uses open-source libraries:
- Tesseract.js: Apache 2.0
- html2canvas: MIT

