'use client';

import React from 'react';
import MemoryGame from '@/app/components/games/MemoryGame';

export default function MemoryPage() {
  return (
    <div className="home-content-wrapper flex flex-col items-center justify-center h-full">
      <MemoryGame />
    </div>
  );
}
