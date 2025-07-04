'use client';

import { useState } from 'react';

interface DebugPanelProps {
  data: Record<string, any>;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ data }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="fixed bottom-0 right-0 z-50">
      <button
        className="bg-gray-700 text-white p-2 text-xs rounded-tl-md"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? 'Hide Debug' : 'Show Debug'}
      </button>
      
      {isVisible && (
        <div className="bg-gray-800 text-white p-4 rounded-tl-md w-80 max-h-96 overflow-auto">
          <h3 className="text-sm font-bold mb-2">Debug Information</h3>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
