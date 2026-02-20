import axiosInstance from "../apimodule/axiosConfig/Axios";
import endpoints from "../apimodule/endpoints/ApiEndpoints";
import { AsyncCallbackSet } from "next/dist/server/lib/async-callback-set";
import { create } from "zustand";

const defaultCoverLetter = {
  cover_letter_title: "",
  cover_letter_type: "",
  cover_template_category: "",
  profile: {
    full_name: "",
    email: "",
    phone_number: "",
    location: "",
    linkedin_profile: "",
    portfolio_website: "",
  },
  recipient: {
    company_name: "",
    hiring_manager_name: "",
    job_title: "",
    company_address: "",
  },
  introduction: {
    greet_text: "",
    intro_para: "",
  },
  body: "",
  closing: {
    text: "",
  },
  cover_style: {
    font: "",
    color: "",
  },
};

const useCoverLetterStore = create((set) => ({
  loadingCL: false,
  error: null,
  coverLetters: [],
  currentCoverLetter: defaultCoverLetter,

  setCurrentCoverLetter: (data) =>
    set((state) => ({
      currentCoverLetter: {
        ...state.currentCoverLetter,
        ...data,
      },
    })),

  fetchUserAllCoverLetters: async (limit = 15) => {
    set({ loadingCL: true, error: null });
    try {
      const token = localStorage.getItem("access");
      //api need to mask later
      const response = await fetch(
        `https://api.dropshapes.com/api/cover-letters/?skip=0&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      const listcl = data.data;
      set({ coverLetters: listcl, loadingCL: false });
      return { success: true, listcl };
    } catch (error) {
      console.error("User cover letters fetch failed", error);
      set({
        loadingCL: false,
        error: error.message || "Failed to fetch cover letters",
      });
      return { success: false, error: error.message };
    }
  },

  fetchCoverLetterById: async (id) => {
    set({ loadingCL: true, error: null });

    try {
      const response = await axiosInstance.get(
        `${endpoints.coverLetters}${id}`
      );
      if (response.status === 200) {
        const coverLetter = response.data.data;
        set({
          loadingCL: false,
          // currentCoverLetter: coverLetter,
        });
        return { success: true, data: coverLetter };
      } else {
        throw new Error("Cover Letter not found");
      }
    } catch (error) {
      console.error("User Not Found with the id:", id);
      set({
        loadingCL: false,
        error: error.message || "Failed to fetch cover letter",
      });

      return {
        success: false,
        error: error.message || "Failed to fetch cover letter",
      };
    }
  },

  createCoverLetter: async (coverLetterData) => {
    set({ loadingCL: true });
    try {
      const response = await axiosInstance.post(
        `${endpoints.coverLetters}`,
        coverLetterData
      );
      const data = response.data;

      // ✅ Append the new cover letter to state
      set((state) => ({
        loadingCL: false,
        coverLetters: [...state.coverLetters, data],
      }));

      console.log("Submitted CL:", data);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Cover Letter Creation Failed:", error);

      set({
        loadingCL: false,
        error: error?.message || "Failed to submit Cover Letter",
      });

      return {
        success: false,
        error: error?.message || "Failed to submit Cover Letter",
      };
    }
  },

  deleteCoverLetter: async (id) => {
    set({ loadingCL: true });
    try {
      await axiosInstance.delete(`${endpoints.coverLetters}${id}`);
      set((state) => ({
        loadingCL: false,
        coverLetters: state.coverLetters.filter((cl) => cl.id !== id),
      }));
      return { success: true, message: "Cover Letter Deleted" };
    } catch (error) {
      console.error("Cover Letter Deletion Failed:", error);
      set({ loadingCL: false });
      return {
        success: false,
        error: error?.message || "Failed to delete Cover Letter",
      };
    }
  },

  updateCoverLetter: async (id, updatedData) => {
    set({ loadingCL: true });
    try {
      const response = await axiosInstance.put(
        `${endpoints.coverLetters}${id}`,
        updatedData
      );
      const updatedCL = response.data;

      set((state) => ({
        loadingCL: false,
        coverLetters: state.coverLetters.map((cl) =>
          cl.id === id ? updatedCL : cl
        ),
      }));

      return { success: true, data: updatedCL };
    } catch (error) {
      set({ loadingCL: false });
      return {
        success: false,
        error: error.message || "Failed to update Cover Letter",
      };
    }
  },
  handleSubmitCoverLetter: async () => {
    const state = get();
    const coverLetterData = state.currentCoverLetter;
    const hasId = coverLetterData?.id && coverLetterData.id !== "";

    const coverLetterPayload = {
      id: coverLetterData.id,
      cover_letter_title:
        coverLetterData.cover_letter_title || "New Cover Letter",
      cover_letter_type: coverLetterData.cover_letter_type,
      cover_template_category: coverLetterData.cover_template_category,
      profile: {
        full_name: coverLetterData.profile?.full_name || "",
        email: coverLetterData.profile?.email || "",
        phone_number: coverLetterData.profile?.phone_number || "",
        linkedin_profile: coverLetterData.profile?.linkedin_profile || "",
        portfolio_website: coverLetterData.profile?.portfolio_website || "",
        location: coverLetterData.profile?.location || "",
      },
      recipient: {
        company_name: coverLetterData.recipient?.company_name || "",
        hiring_manager_name:
          coverLetterData.recipient?.hiring_manager_name || "",
        company_address: coverLetterData.recipient?.company_address || "",
        job_title: coverLetterData.recipient?.job_title || "",
      },
      introduction: {
        greet_text: coverLetterData.introduction?.greet_text || "",
        intro_para: coverLetterData.introduction?.intro_para || "",
      },
      body: coverLetterData.body || "",
      closing: {
        text: coverLetterData.closing?.text || "",
      },
      cover_style: {
        font: coverLetterData.cover_style?.font || "Arial",
        color: coverLetterData.cover_style?.color || "#000000",
      },
    };

    try {
      set({ loadingCL: true });
      let response;

      if (hasId) {
        // Update existing cover letter
        response = await axiosInstance.put(
          `/api/cover-letters/${coverLetterData.id}`,
          coverLetterPayload
        );
      } else {
        // Create new cover letter
        response = await axiosInstance.post(
          `/api/cover-letters`,
          coverLetterPayload
        );

        if (response.data?.data?.id) {
          // Update Zustand with new ID
          set((state) => ({
            currentCoverLetter: {
              ...state.currentCoverLetter,
              id: response.data.data.id,
            },
          }));
        }
      }

      // ✅ Update coverLetters list in store
      set((state) => ({
        coverLetters: hasId
          ? state.coverLetters.map((cl) =>
              cl.id === coverLetterData.id ? response.data : cl
            )
          : [...state.coverLetters, response.data],
        loadingCL: false,
      }));

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Save Cover Letter Failed:", error);
      set({
        loadingCL: false,
        error: error.message || "Failed to save Cover Letter",
      });
      return {
        success: false,
        error: error.message || "Failed to save Cover Letter",
      };
    }
  },
}));

export default useCoverLetterStore;
