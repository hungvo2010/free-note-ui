import React from 'react';

interface LockIndicatorProps {
  isLocked: boolean;
}

export const LockIndicator: React.FC<LockIndicatorProps> = ({ isLocked }) => {
  if (!isLocked) return null;
  
  return (
    <div className="whiteboard-lock-indicator">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-10-4c0-2.206 1.794-4 4-4s4 1.794 4 4v4h-8v-4zm11 16h-14v-10h14v10z"/>
      </svg>
    </div>
  );
}; 