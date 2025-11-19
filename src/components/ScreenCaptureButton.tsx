import React, { useState } from 'react';
import { Camera, Loader } from 'lucide-react';
import { screenCaptureService } from '../services/screenCaptureService';

interface ScreenCaptureButtonProps {
  onTextExtracted: (text: string) => void;
  onAutoSearch?: (text: string) => void;
}

const ScreenCaptureButton: React.FC<ScreenCaptureButtonProps> = ({ onTextExtracted, onAutoSearch }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    console.log('📸 Screen capture initiated...');
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const text = await screenCaptureService.captureAndExtractText((p) => setProgress(p));
      
      if (text) {
        console.log('✨ Text successfully extracted and passed to input');
        onTextExtracted(text);
        setProgress(100);
        
        // Auto-trigger search if callback provided
        if (onAutoSearch) {
          console.log('🔎 Auto-triggering search with extracted text...');
          setTimeout(() => {
            onAutoSearch(text);
          }, 300);
        }
        
        setTimeout(() => {
          setIsProcessing(false);
          setProgress(0);
        }, 500);
      } else {
        console.log('⚠️ Capture cancelled by user');
        setError('Capture cancelled or failed');
        setIsProcessing(false);
        setProgress(0);
      }
    } catch (err) {
      console.error('❌ Capture error:', err);
      setError('Failed to extract text from image');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="screen-capture-container">
      <button
        className="screen-capture-btn"
        onClick={handleCapture}
        disabled={isProcessing}
        title="Capture screen area and extract text"
      >
        {isProcessing ? (
          <>
            <Loader size={18} className="spinner" />
            <span>{progress}%</span>
          </>
        ) : (
          <>
            <Camera size={18} />
            <span>Capture Text</span>
          </>
        )}
      </button>

      {error && (
        <div className="capture-error">
          {error}
        </div>
      )}

      {isProcessing && (
        <div className="capture-progress-bar">
          <div 
            className="capture-progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ScreenCaptureButton;

