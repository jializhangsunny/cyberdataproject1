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
      <div className="absolute top-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-md shadow-lg pointer-events-auto z-100">
        <span className="font-semibold">View-Only Mode</span>
      </div>
      
      {/* Invisible overlay that blocks interactions */}
      <div 
        className="absolute inset-0" 
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
      />
    </div>
  );
}