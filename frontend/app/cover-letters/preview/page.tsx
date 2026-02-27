'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /cover-letters/preview (no id) → redirect to list.
 * Matches old_frontend behavior: preview is only for a specific letter.
 */
export default function CoverLetterPreviewIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/cover-letters');
  }, [router]);
  return (
    <section id="view-cover-letter-preview" className="view-section active-view" aria-label="Cover letter preview">
      <div className="cover-letter-preview-page">
        <div className="cover-letter-preview-loading">
          <div className="cover-letter-preview-spinner" aria-hidden="true" />
          <p className="cover-letter-preview-loading-text">Redirecting…</p>
        </div>
      </div>
    </section>
  );
}
