import axiosInstance from "../apimodule/axiosConfig/Axios";
import endpoints from "../apimodule/endpoints/ApiEndpoints";
import { create } from "zustand";
import { $resume, updateResumeData } from "../utils/resumeService";

const useResumeStore = create((set) => ({
  loading: false,
  error: null,
  // ✅ Add these states
  aiSuggestions: null,
  aiSectionSuggestion: null,
  resumeProfilePicture: null, // File object
  setResumeProfilePicture: (file) => {
    set({
      resumeProfilePicture: file,
    });
  },

  clearResumeProfilePicture: () => {
    set({
      resumeProfilePicture: null,
    });
  },

  // ✅ Add a setter to reset suggestion
  setAiSectionSuggestion: (data) => set({ aiSectionSuggestion: data }),

  createResume: async (resumeData) => {
    set({ loading: true });
    try {
      console.log("final data ", resumeData);
      const response = await axiosInstance.post(endpoints.resumes, resumeData);
      const data = response.data;
      console.log("resume ", data);
      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      console.error("Resume creation failed", error);
      set({ loading: false });
      return { success: false, error: error.message || "Failed submit resume" };
    }
  },
  updateResumeToServer: async (resumeData) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.put(
        `${endpoints.resumes}/${resumeData.id}`,
        resumeData
      );
      const data = response.data;
      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.message || "Failed submit resume" };
    }
  },
  fetchUserAllResumes: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem("access");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}resumes/?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch resumes");
      const data = await response.json();
      console.log("data", data);

      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      console.error("User resume fetched failed", error);
      set({ loading: false });
      return {
        success: false,
        error: error.message || "Failed to fetchuser resume",
      };
    }
  },
  fetchUserResume: async (resumeId) => {
    set({ loading: true });
    try {
      console.log("resumeID ", resumeId);
      const response = await axiosInstance.get(
        `${endpoints.resumes}/${resumeId}`
      );
      const data = response.data;
      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      console.error("User resume fetched failed", error);
      set({ loading: false });
      return {
        success: false,
        error: error.message || "Failed to fetchuser resume",
      };
    }
  },
  fetchAISuggestionsForSection: async (resumeId, section) => {
    console.log(resumeId, "section ", section);
    set({ loading: true, error: null });

    try {
      const authToken = localStorage.getItem("access");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}resumes/${resumeId}/ai-improve?section_name=${section}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!res.ok)
        throw new Error("Failed to improve resume. Please try again.");

      const suggestionData = await res.json();
      console.log("specific section suggestion", suggestionData);

      // ✅ Store in state
      set({ loading: false, aiSectionSuggestion: suggestionData });

      return { success: true, sectionSuggestions: suggestionData };
    } catch (err) {
      set({
        loading: false,
        error: err.message || "Failed to fetch AI suggestions",
        aiSectionSuggestion: null, // ✅ reset on error
      });
      return { success: false, error: err.message };
    }
  },

  fetchAISuggestions: async (resumeId) => {
    set({ loading: true, error: null });
    try {
      const authToken = localStorage.getItem("access");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}resumes/${resumeId}/ai-improve-all`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to improve resume. Please try again.");
      }
      const suggestionData = await res.json();

      const validSuggestions = {};
      const sections = [
        "resume_title",
        "profile",
        "summary",
        "experience",
        "education",
        "certifications",
      ];
      sections.forEach((section) => {
        if (suggestionData[section]) {
          if (Array.isArray(suggestionData[section])) {
            validSuggestions[section] = suggestionData[section].filter(
              (item) =>
                item &&
                typeof item === "object" &&
                "original" in item &&
                "improved" in item
            );
            if (validSuggestions[section].length === 0) {
              delete validSuggestions[section];
            }
          } else if (
            typeof suggestionData[section] === "object" &&
            suggestionData[section] !== null
          ) {
            if (
              "original" in suggestionData[section] &&
              "improved" in suggestionData[section]
            ) {
              validSuggestions[section] = suggestionData[section];
            }
          }
        }
      });

      if (Object.keys(validSuggestions).length === 0) {
        throw new Error("No valid suggestions found in API response.");
      }

      set({ loading: false, aiSuggestions: validSuggestions });
      return { success: true, suggestions: validSuggestions };
    } catch (err) {
      set({
        loading: false,
        error: err.message || "Failed to fetch AI suggestions",
      });
      return { success: false, error: err.message };
    }
  },
  submitResume: async (
    resumeDataFromClient,
    router,
    toast,
    setIsSubmitting
  ) => {
    const resume = $resume.getValue();
    const resumeID = `${resumeDataFromClient?.id || ""}`.trim();
    const resumeProfilePicture = useResumeStore.getState().resumeProfilePicture;

    console.log("cannotbe null ", resumeProfilePicture);

    // Create a FormData object to handle file upload
    const formData = new FormData();

    // Append JSON data as a string
    const resumeFormData = {
      ...resume,
      template_category: resumeDataFromClient.template_category,
      resume_type: resumeDataFromClient.resume_type,
      education: resume.education || [],
      certifications: resume.certifications || [],
      skills: resume.skills || [],
      hobbies: resume.hobbies || [],
      languages: resume.languages || [],
      summary: resume.summary || "",
      personalInfo: resume.personalInfo || {},
      experience: resume.experience || [],
      custom_section: resume.custom_section || [],
    };

    formData.append("resume_data", JSON.stringify(resumeFormData));

    // Append profile_image if exists
    if (resumeProfilePicture instanceof File) {
      formData.append("profile_image", resumeProfilePicture);
    }

    setIsSubmitting(true);
    console.log("Submitting Resume Data (FormData):", resumeFormData);

    try {
      let finalId = resumeID;

      if (!resumeID) {
        // Create new resume
        console.log("📝 No ID found. Creating new resume...");
        const response = await axiosInstance.post(`/api/resumes/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response?.data?.id) {
          finalId = response.data.id;
          console.log("final==== ", response.data);

          updateResumeData({
            ...resumeFormData,
            profile_image: response.data?.profile_image,
            id: finalId,
          });
          console.log("✅ Resume created");
          toast.success("Resume Submitted");
        } else {
          throw new Error("Failed to create resume");
        }
      } else {
        // Update existing resume
        console.log("✏️ Updating existing resume...");
        const response = await axiosInstance.put(
          `/api/resumes/${resumeID}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (!response?.data?.id) {
          throw new Error("Failed to update resume");
        }
        console.log("✅ Resume updated");
      }

      router.push(`/resumes/final-resume/${finalId}`);
    } catch (error) {
      console.error("Error submitting resume:", error);
      toast.error(
        "Could not save resume before submitting. Showing preview from local data."
      );
    } finally {
      setIsSubmitting(false);
    }
  },
}));

export default useResumeStore;
