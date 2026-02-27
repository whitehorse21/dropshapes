'use client';

import { useState } from 'react';
import TextGenerateModal from '../Modal/TextGenerateModal';
import GenerateButton from '../GenerateButton';
import type { CoverLetterData } from '@/app/utils/coverLetterService';

interface CoverLetterClosingProps {
  coverLetterData: CoverLetterData;
  onUpdate: (updates: Partial<CoverLetterData>) => void;
}

export default function CoverLetterClosing({
  coverLetterData,
  onUpdate,
}: CoverLetterClosingProps) {
  const [modalShow, setModalShow] = useState(false);

  const handleContentChange = (value: string) => {
    onUpdate({ closing: { text: value } });
  };

  return (
    <div className="cover-letter-create-step-content">
      <form className="space-y-6">
        <div className="w-full min-w-0">
          <label className="block text-sm font-medium mb-2">Cover Letter Closing</label>
          <textarea
            className="w-full min-h-[160px] px-4 py-3 rounded-lg form-field-input resize-y"
            value={coverLetterData?.closing?.text ?? ''}
            rows={6}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Write your closing statement here..."
          />
          <div className="flex justify-end mt-2">
            <GenerateButton handleOpenModal={() => setModalShow(true)} />
          </div>
        </div>
      </form>
      <TextGenerateModal
        show={modalShow}
        sectionName="closing"
        onHide={() => setModalShow(false)}
        title="Generate Closing Cover letter Content"
      />
    </div>
  );
}
