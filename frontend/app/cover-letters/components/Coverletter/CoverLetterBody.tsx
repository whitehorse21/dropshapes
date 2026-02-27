'use client';

import { useState } from 'react';
import TextGenerateModal from '../Modal/TextGenerateModal';
import GenerateButton from '../GenerateButton';
import type { CoverLetterData } from '@/app/utils/coverLetterService';

interface CoverLetterBodyProps {
  coverLetterData: CoverLetterData;
  onUpdate: (updates: Partial<CoverLetterData>) => void;
}

export default function CoverLetterBody({
  coverLetterData,
  onUpdate,
}: CoverLetterBodyProps) {
  const [modalShow, setModalShow] = useState(false);

  const handleContentChange = (value: string) => {
    onUpdate({ body: value });
  };

  return (
    <div className="cover-letter-create-step-content">
      <form className="space-y-6">
        <div className="w-full min-w-0">
          <label className="block text-base font-medium mb-2">Cover Letter Body</label>
          <textarea
            className="w-full min-h-[200px] px-4 py-3 rounded-lg form-field-input resize-y"
            value={coverLetterData?.body ?? ''}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Write the main body of your cover letter here..."
          />
          <div className="flex justify-end mt-2">
            <GenerateButton handleOpenModal={() => setModalShow(true)} />
          </div>
        </div>
      </form>
      <TextGenerateModal
        show={modalShow}
        sectionName="body"
        onHide={() => setModalShow(false)}
        title="Generate Body Content"
      />
    </div>
  );
}
