'use client';

import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { $coverLetter } from '@/app/utils/coverLetterObservable';
import {
  getCoverLetterFromLocalDB,
  defaultCoverLetterData,
} from '@/app/utils/coverLetterService';
import type { CoverLetterData } from '@/app/utils/coverLetterService';
import { createSteps } from '@/app/cover-letters/createSteps';
import CoverLetterProfession from '@/app/cover-letters/components/Coverletter/CoverLetterProfession';
import CoverLetterProfile from '@/app/cover-letters/components/Coverletter/CoverLetterProfile';
import CoverLetterIntroduction from '@/app/cover-letters/components/Coverletter/CoverLetterIntroduction';
import CoverLetterBody from '@/app/cover-letters/components/Coverletter/CoverLetterBody';
import CoverLetterClosing from '@/app/cover-letters/components/Coverletter/CoverLetterClosing';

function deepMerge(
  base: CoverLetterData,
  partial: Partial<CoverLetterData>
): CoverLetterData {
  const next: CoverLetterData = { ...base, ...partial };
  if (partial.profile)
    next.profile = { ...base.profile, ...partial.profile };
  if (partial.recipient)
    next.recipient = { ...base.recipient, ...partial.recipient };
  if (partial.introduction)
    next.introduction = { ...base.introduction, ...partial.introduction };
  if (partial.closing)
    next.closing = { ...base.closing, ...partial.closing };
  if (partial.cover_style)
    next.cover_style = { ...base.cover_style, ...partial.cover_style };
  return next;
}

export default function CreateCoverLetterStepPage() {
  const params = useParams();
  const step = params?.step as string;

  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>(() => {
    const stored = getCoverLetterFromLocalDB();
    const current = $coverLetter.getValue();
    const base = stored && Object.keys(stored).length > 0
      ? { ...defaultCoverLetterData, ...stored }
      : { ...defaultCoverLetterData, ...current };
    return base;
  });

  useEffect(() => {
    const sub = $coverLetter.subscribe((data) => {
      setCoverLetterData((prev) => ({ ...prev, ...data }));
    });
    return () => sub.unsubscribe();
  }, []);

  const handleUpdate = (partial: Partial<CoverLetterData>) => {
    const current = $coverLetter.getValue();
    const merged = deepMerge(
      { ...defaultCoverLetterData, ...current },
      partial
    );
    $coverLetter.next(merged);
  };

  const data = {
    ...defaultCoverLetterData,
    ...coverLetterData,
    profile: { ...defaultCoverLetterData.profile, ...coverLetterData.profile },
    recipient: { ...defaultCoverLetterData.recipient, ...coverLetterData.recipient },
    introduction: { ...defaultCoverLetterData.introduction, ...coverLetterData.introduction },
    closing: { ...defaultCoverLetterData.closing, ...coverLetterData.closing },
    cover_style: { ...defaultCoverLetterData.cover_style, ...coverLetterData.cover_style },
  };

  if (!createSteps.some((s) => s.name === step)) {
    notFound();
  }

  switch (step) {
    case 'profession':
      return (
        <CoverLetterProfession
          coverLetterData={data}
          onUpdate={handleUpdate}
        />
      );
    case 'profile':
      return (
        <CoverLetterProfile
          coverLetterData={data}
          onUpdate={handleUpdate}
        />
      );
    case 'introduction':
      return (
        <CoverLetterIntroduction
          coverLetterData={data}
          onUpdate={handleUpdate}
        />
      );
    case 'body':
      return (
        <CoverLetterBody
          coverLetterData={data}
          onUpdate={handleUpdate}
        />
      );
    case 'closing':
      return (
        <CoverLetterClosing
          coverLetterData={data}
          onUpdate={handleUpdate}
        />
      );
    default:
      return null;
  }
}
