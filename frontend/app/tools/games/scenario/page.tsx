'use client';

import React from 'react';
import ScenarioGame from '@/app/components/games/ScenarioGame';

export default function ScenarioPage() {
  return (
    <div className="home-content-wrapper flex flex-col items-center justify-center h-full">
      <ScenarioGame />
    </div>
  );
}
