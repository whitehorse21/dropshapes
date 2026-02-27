'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface EducationContextValue {
  currentUnit: { id: number; title: string } | null;
  setCurrentUnit: (unit: { id: number; title: string } | null) => void;
  progress: Record<number, number>;
  updateProgress: (unitId: number, newProgress: number) => void;
  assignments: unknown[];
  setAssignments: (a: unknown[]) => void;
  resources: unknown[];
  setResources: (r: unknown[]) => void;
}

const EducationContext = createContext<EducationContextValue | null>(null);

export function EducationProvider({ children }: { children: React.ReactNode }) {
  const [currentUnit, setCurrentUnit] = useState<{ id: number; title: string } | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [assignments, setAssignments] = useState<unknown[]>([]);
  const [resources, setResources] = useState<unknown[]>([]);

  const updateProgress = useCallback((unitId: number, newProgress: number) => {
    setProgress((prev) => ({ ...prev, [unitId]: newProgress }));
  }, []);

  const value: EducationContextValue = {
    currentUnit,
    setCurrentUnit,
    progress,
    updateProgress,
    assignments,
    setAssignments,
    resources,
    setResources,
  };

  return (
    <EducationContext.Provider value={value}>
      {children}
    </EducationContext.Provider>
  );
}

export function useEducation(): EducationContextValue {
  const context = useContext(EducationContext);
  if (!context) {
    throw new Error('useEducation must be used within an EducationProvider');
  }
  return context;
}
