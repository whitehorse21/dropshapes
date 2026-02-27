'use client';

import { EducationProvider } from './context/EducationContext';

export default function EducationLayout({ children }: { children: React.ReactNode }) {
  return <EducationProvider>{children}</EducationProvider>;
}
