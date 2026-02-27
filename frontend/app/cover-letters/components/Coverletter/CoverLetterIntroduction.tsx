'use client';

import { useState } from 'react';
import TextGenerateModal from '../Modal/TextGenerateModal';
import FormField from '../FormField';
import GenerateButton from '../GenerateButton';
import type { CoverLetterData } from '@/app/utils/coverLetterService';

interface CoverLetterIntroductionProps {
  coverLetterData: CoverLetterData;
  onUpdate: (updates: Partial<CoverLetterData>) => void;
}

export default function CoverLetterIntroduction({
  coverLetterData,
  onUpdate,
}: CoverLetterIntroductionProps) {
  const [modalShow, setModalShow] = useState(false);

  const handleGreetChange = (value: string) => {
    onUpdate({
      introduction: {
        ...coverLetterData?.introduction,
        greet_text: value,
      },
    });
  };

  const handleContentChange = (value: string) => {
    onUpdate({
      introduction: {
        ...coverLetterData?.introduction,
        intro_para: value,
      },
    });
  };

  return (
    <div className="cover-letter-create-step-content">
      <form className="space-y-6">
        <div className="space-y-4">
          <h5 className="text-lg font-semibold">Introduction</h5>
          <FormField
            label="Greeting"
            name="greet_text"
            value={coverLetterData?.introduction?.greet_text ?? ''}
            onChange={(e) => handleGreetChange(e.target.value)}
            placeholder="e.g., Dear Hiring Manager,"
            className="min-w-0"
          />
          <div className="min-w-0">
            <label className="block text-sm font-medium mb-2">Intro Paragraph</label>
            <textarea
              className="w-full min-h-[160px] px-4 py-3 rounded-lg form-field-input resize-y"
              value={coverLetterData?.introduction?.intro_para ?? ''}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write your cover letter introduction here..."
            />
            <div className="flex justify-end mt-2">
              <GenerateButton handleOpenModal={() => setModalShow(true)} />
            </div>
          </div>
        </div>
      </form>
      <TextGenerateModal
        show={modalShow}
        sectionName="introduction"
        onHide={() => setModalShow(false)}
        title="Generate Introduction Paragraph"
      />
    </div>
  );
}
