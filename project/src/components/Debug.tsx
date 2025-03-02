import React, { useState, useEffect } from 'react';

interface DebugInfo {
  userAgent: string;
  windowSize: string;
  location: string;
  errors: string[];
}

const Debug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    userAgent: '',
    windowSize: '',
    location: '',
    errors: []
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Collect debug information
    const info: DebugInfo = {
      userAgent: window.navigator.userAgent,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      location: window.location.href,
      errors: []
    };

    // Set up error listener
    const errorHandler = (event: ErrorEvent) => {
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, `${event.message} at ${event.filename}:${event.lineno}`]
      }));
    };

    window.addEventListener('error', errorHandler);

    // Update debug info
    setDebugInfo(info);

    // Clean up
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50"
        title="Show Debug Info"
      >
        🐞
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Debug Information</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>User Agent:</strong> 
          <div className="bg-gray-100 p-2 rounded overflow-x-auto">
            {debugInfo.userAgent}
          </div>
        </div>
        
        <div>
          <strong>Window Size:</strong> {debugInfo.windowSize}
        </div>
        
        <div>
          <strong>Current URL:</strong> 
          <div className="bg-gray-100 p-2 rounded overflow-x-auto">
            {debugInfo.location}
          </div>
        </div>
        
        <div>
          <strong>Errors ({debugInfo.errors.length}):</strong>
          {debugInfo.errors.length > 0 ? (
            <div className="bg-red-50 p-2 rounded max-h-40 overflow-y-auto">
              {debugInfo.errors.map((error, index) => (
                <div key={index} className="text-red-600 mb-1">
                  {error}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-green-50 p-2 rounded text-green-600">
              No errors detected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Debug;
