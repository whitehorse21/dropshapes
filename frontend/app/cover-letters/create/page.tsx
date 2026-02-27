'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * /cover-letters/create redirects to first step (profile).
 * Template should already be selected from /cover-letters/new.
 */
export default function CreateCoverLetterPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/cover-letters/create/profession');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
