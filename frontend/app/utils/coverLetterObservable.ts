/**
 * RxJS observable for cover letter state (used by create flow and TextGenerateModal).
 * Synced with localStorage via coverLetterService.
 */
import { BehaviorSubject } from 'rxjs';
import {
  getCoverLetterFromLocalDB,
  saveCoverLetterData,
  defaultCoverLetterData,
} from '@/app/utils/coverLetterService';
import type { CoverLetterData } from '@/app/utils/coverLetterService';

const initial: CoverLetterData =
  typeof window !== 'undefined'
    ? (getCoverLetterFromLocalDB() ?? defaultCoverLetterData)
    : defaultCoverLetterData;

const subject = new BehaviorSubject<CoverLetterData>(initial);

export const $coverLetter = {
  getValue: (): CoverLetterData => subject.getValue(),
  next: (value: CoverLetterData) => {
    saveCoverLetterData(value);
    subject.next(value);
  },
  subscribe: (cb: (value: CoverLetterData) => void) => subject.subscribe(cb),
};
