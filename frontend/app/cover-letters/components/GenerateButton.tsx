'use client';

import { Sparkles } from 'lucide-react';

interface GenerateButtonProps {
  handleOpenModal: () => void;
}

export default function GenerateButton({ handleOpenModal }: GenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={handleOpenModal}
      className="cover-letter-generate-btn"
      aria-label="Generate content with AI"
    >
      <Sparkles className="cover-letter-generate-btn__icon" size={18} strokeWidth={2} />
      <span className="cover-letter-generate-btn__label">Generate</span>
    </button>
  );
}
