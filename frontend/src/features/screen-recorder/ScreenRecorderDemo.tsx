import React from 'react';
import ScreenRecorder from '../../components/shared/ScreenRecorder';
import { useTheme } from '../../contexts/ThemeContext';
import { ProtectProFeature } from '../../components/ProtectProFeature';

/**
 * Screen Recorder Demo Page - Clean and Simple Design
 * 
 * Demonstrates the Loom-style screen recording feature
 * Requires Pro subscription
 */
export const ScreenRecorderDemo: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  const handleUploadComplete = (url: string) => {
    console.log('Video uploaded successfully:', url);
    alert(`Video uploaded! URL: ${url}`);
  };

  return (
    <ProtectProFeature
      featureName="Screen Recording"
      featureKey="screenRecording"
      description="Record your screen, webcam, and voice to create professional tutorials and course content."
    >
      <div className={`min-h-screen ${
        isDarkMode 
          ? 'bg-gray-900' 
          : 'bg-gray-50'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-blue-600'
            }`}>
              Screen Recording
            </h1>
            <p className={`text-base ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Record your screen, webcam, and voice to create tutorials and course content
            </p>
          </div>

          {/* Recorder Component */}
          <ScreenRecorder 
            onUploadComplete={handleUploadComplete}
            maxDurationSeconds={600} // 10 minutes
          />
        </div>
      </div>
    </ProtectProFeature>
  );
};

export default ScreenRecorderDemo;
