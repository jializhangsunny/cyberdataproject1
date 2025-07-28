// components/ViewerOverlay.tsx
"use client";

import React from 'react';
import { useAuth } from '@/context/authContext';

export default function ViewerOverlay() {
  const { user } = useAuth();
  
  if (user?.type !== 'viewer') {
    return null;
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ 
        backgroundColor: 'transparent',
        cursor: 'not-allowed' 
      }}
    >
      <div className="absolute top-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-md shadow-lg pointer-events-auto z-10000">
        <span className="font-semibold">View-Only Mode</span>
      </div>
      
      {/* Debug: Add some logging */}
      <div 
        className="absolute inset-0" 
        style={{ 
            pointerEvents: 'auto',
            right: '17px'
         }}
        onClick={(e) => {
        //   console.log('Click blocked');
          e.preventDefault();
        }}
        onMouseDown={(e) => {
        //   console.log('MouseDown blocked');
          e.preventDefault();
        }}
        onContextMenu={(e) => {
        //   console.log('Context menu blocked');
          e.preventDefault();
        }}
        onWheel={(e) => {
        //   console.log('Wheel event:', e);
          // Don't prevent this - let it scroll
        }}
        onKeyDown={(e) => {
          console.log('Key pressed:', e.key);
          if (!['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'].includes(e.key)) {
            // console.log('Key blocked:', e.key);
            e.preventDefault();
          }
        }}
      />
    </div>
  );
}