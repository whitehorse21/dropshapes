import useCoverLetterStore from "./coverLetterStore";

export const useCoverLetter = () => {
  const {
    loadingCL,
    error,
    coverLetters,
    fetchUserAllCoverLetters,
    createCoverLetter,
    currentCoverLetter,
    setCurrentCoverLetter,
    deleteCoverLetter,
    fetchCoverLetterById,
    updateCoverLetter
  } = useCoverLetterStore();


  return {
    loadingCL,
    error,
    coverLetters,
    fetchUserAllCoverLetters,
    createCoverLetter,
    currentCoverLetter,
    setCurrentCoverLetter,
    deleteCoverLetter,
    fetchCoverLetterById,
    updateCoverLetter
  };
};
