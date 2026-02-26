"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getResumeFromLocalDB,
  updateResumeData,
  defaultResumeData,
  defaultPersonalInfo,
  buildResumeCreatePayload,
  saveResumeData,
  type ResumeData,
  type PersonalInfo,
} from "@/app/utils/resumeService";
import { resumeSteps } from "@/app/resumes/resumeSteps";
import axiosInstance from "@/app/apimodule/axiosConfig/Axios";
import endpoints from "@/app/apimodule/endpoints/ApiEndpoints";
import { toast } from "react-hot-toast";
import ResumeBodyContent from "@/app/resumes/components/ResumeBodyContent";

export default function ResumeStepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const id = searchParams.get("id") || "";
  const step = params?.step as string;

  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const stored = getResumeFromLocalDB();
    if (stored) setResumeData(stored);
  }, [step]);

  const currentIndex = resumeSteps.findIndex((s) => s.name === step);
  const isFirstStep = currentIndex <= 0;
  const isLastStep = currentIndex === resumeSteps.length - 1;

  /** Get merged data for validation. Prefer localStorage (saved by page on each edit) then layout state, so current step data is never overwritten by stale layout state. */
  const getDataForValidation = (): Partial<ResumeData> => {
    const stored = getResumeFromLocalDB();
    const base = defaultResumeData ?? ({} as ResumeData);
    const storedObj =
      stored && typeof stored === "object"
        ? (stored as Partial<ResumeData>)
        : {};
    const layoutObj =
      resumeData && typeof resumeData === "object"
        ? (resumeData as Partial<ResumeData>)
        : {};
    const source = { ...layoutObj, ...storedObj };
    return {
      ...base,
      ...source,
      personalInfo: {
        ...defaultPersonalInfo,
        ...(base.personalInfo ?? {}),
        ...(layoutObj.personalInfo ?? {}),
        ...(storedObj.personalInfo ?? {}),
      },
    };
  };

  /**
   * Validate required fields for the current step. Returns error message or null if valid.
   */
  const validateCurrentStep = (): string | null => {
    const data = getDataForValidation();
    const pi: Partial<PersonalInfo> = data.personalInfo ?? {};

    switch (step) {
      case "profession": {
        const profession = (data.profession ?? "").toString().trim();
        if (!profession) return "Please select or enter your profession.";
        return null;
      }
      case "personal": {
        const firstName = (pi.firstName ?? "").toString().trim();
        const lastName = (pi.lastName ?? "").toString().trim();
        const email = (pi.email ?? "").toString().trim();
        if (!firstName) return "Please enter your first name.";
        if (!lastName) return "Please enter your last name.";
        if (!email) return "Please enter your email.";
        return null;
      }
      case "experience": {
        const exp = Array.isArray(data.experience) ? data.experience : [];
        if (exp.length === 0) return "Please add at least one work experience.";
        const invalid = exp.some(
          (e) =>
            !(e.company ?? "").toString().trim() ||
            !(e.role ?? "").toString().trim() ||
            !(e.startDate ?? "").toString().trim(),
        );
        if (invalid)
          return "Please fill in Company, Role, and Start date for each experience.";
        return null;
      }
      case "education": {
        const edu = Array.isArray(data.education) ? data.education : [];
        if (edu.length === 0) return "Please add at least one education entry.";
        const invalid = edu.some(
          (e) =>
            !(e.institution ?? "").toString().trim() ||
            !(e.degree ?? "").toString().trim() ||
            !(e.startDate ?? "").toString().trim(),
        );
        if (invalid)
          return "Please fill in Institution, Degree, and Start date for each entry.";
        return null;
      }
      case "extra":
      case "custom":
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const error = validateCurrentStep();
    if (error) {
      toast.error(error);
      return;
    }
    if (currentIndex < resumeSteps.length - 1) {
      router.push(`/resumes/new/${resumeSteps[currentIndex + 1].name}`);
    }
  };

  const handlePrev = () => {
    if (redirect === "final" && id) {
      router.push(`/resumes/final-resume/${id}`);
      return;
    }
    if (currentIndex > 0) {
      router.push(
        `/resumes/new/${resumeSteps[currentIndex - 1].name}${id ? `?id=${id}` : ""}`,
      );
    } else {
      router.push("/resumes/new");
    }
  };

  const handleCreateResume = async () => {
    if (isSubmitting) return;

    const stored = getResumeFromLocalDB();
    const fromStorage =
      stored &&
      typeof stored === "object" &&
      (stored as ResumeData).personalInfo &&
      ((stored as ResumeData).personalInfo?.firstName?.trim() ||
        (stored as ResumeData).personalInfo?.lastName?.trim() ||
        (stored as ResumeData).personalInfo?.email?.trim());
    const source = (fromStorage ? stored : resumeData) as Partial<ResumeData>;
    const base = defaultResumeData ?? ({} as ResumeData);
    const basePi: PersonalInfo = {
      ...defaultPersonalInfo,
      ...(base.personalInfo ?? {}),
    };
    const pi: Partial<PersonalInfo> = source?.personalInfo ?? {};
    const data: ResumeData = {
      ...base,
      ...source,
      personalInfo: {
        firstName: (pi.firstName ?? basePi.firstName ?? "").toString().trim(),
        lastName: (pi.lastName ?? basePi.lastName ?? "").toString().trim(),
        email: (pi.email ?? basePi.email ?? "").toString().trim(),
        phone: (pi.phone ?? basePi.phone ?? "") || undefined,
        location: (pi.location ?? basePi.location ?? "") || undefined,
        address: (pi.address ?? basePi.address ?? "") || undefined,
        linkedin: (pi.linkedin ?? basePi.linkedin ?? "") || undefined,
        website: (pi.website ?? basePi.website ?? "") || undefined,
      },
      experience: Array.isArray(source?.experience)
        ? source.experience
        : (base.experience ?? []),
      education: Array.isArray(source?.education)
        ? source.education
        : (base.education ?? []),
      skills: Array.isArray(source?.skills)
        ? source.skills
        : (base.skills ?? []),
      languages: Array.isArray(source?.languages)
        ? source.languages
        : (base.languages ?? []),
      hobbies: Array.isArray(source?.hobbies)
        ? source.hobbies
        : (base.hobbies ?? []),
      certifications: Array.isArray(source?.certifications)
        ? source.certifications
        : (base.certifications ?? []),
      custom_section: Array.isArray(source?.custom_section)
        ? source.custom_section
        : (base.custom_section ?? []),
    };

    if (
      !data.personalInfo.firstName ||
      !data.personalInfo.lastName ||
      !data.personalInfo.email
    ) {
      toast.error(
        "Please fill in at least first name, last name, and email in Personal Info.",
      );
      return;
    }

    if (typeof buildResumeCreatePayload !== "function") {
      toast.error("Resume service not loaded. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildResumeCreatePayload(data);
      const url = `${endpoints.resumes}/json`;
      const res = await axiosInstance.post(url, payload);
      const body = res.data as { id?: number; data?: { id?: number } };
      const createdId = body?.id ?? body?.data?.id;
      if (createdId) {
        const updated = { ...data, id: createdId, resume_title: payload.resume_title };
        saveResumeData(updated);
        updateResumeData(updated);
        toast.success("Resume created!");
        router.push(`/resumes/final-resume/${createdId}`);
      } else {
        console.error("Create resume: unexpected response", res.data);
        toast.error("Unexpected response from server. Please try again.");
      }
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { detail?: string | string[] }; status?: number };
        message?: string;
      };
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.join(", ")
        : typeof detail === "string"
          ? detail
          : err.message || "Failed to create resume";
      console.error("Create resume failed", {
        status: err.response?.status,
        detail: err.response?.data,
        message,
      });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentIndex < 0) {
    return (
      <div className="view-section active-view" style={{ padding: "24px" }}>
        <p>Invalid step.</p>
        <Link
          href="/resumes/new"
          className="btn-resume"
          style={{ display: "inline-flex", marginTop: "12px" }}
        >
          Back to templates
        </Link>
      </div>
    );
  }

  return (
    <div className="view-section active-view resume-step-layout">
      <aside className="resume-step-aside">
        <div className="resume-step-progress" aria-live="polite">
          Step {currentIndex + 1} of {resumeSteps.length}
        </div>
        <button
          type="button"
          className="btn-resume resume-step-back"
          onClick={handlePrev}
        >
          ← Back
        </button>
        <nav className="resume-step-nav" aria-label="Resume steps">
          {resumeSteps.map((s, i) => {
            const isActive = s.name === step;
            const isDone = i < currentIndex;
            return (
              <button
                key={s.name}
                type="button"
                className={`resume-step-nav-btn ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`}
                onClick={() =>
                  router.push(
                    `/resumes/new/${s.name}${id ? `?redirect=final&id=${id}` : ""}`,
                  )
                }
                aria-current={isActive ? "step" : undefined}
              >
                <span className="resume-step-nav-num">{i + 1}</span>
                <span className="resume-step-nav-label">{s.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="resume-step-main">
        <div className="resume-step-body">{children}</div>
        <div className="resume-step-footer">
          {!isFirstStep ? (
            <button type="button" className="btn-resume" onClick={handlePrev}>
              Previous
            </button>
          ) : (
            <span />
          )}
          <div className="resume-step-footer-actions">
            <button
              type="button"
              className="btn-resume"
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>
            {!isLastStep ? (
              <button
                type="button"
                className="btn-resume btn-resume-primary"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="btn-resume btn-resume-primary"
                onClick={handleCreateResume}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Resume"}
              </button>
            )}
          </div>
        </div>
      </main>

      {showPreview && (
        <div
          className="resume-preview-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Resume preview"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="resume-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="resume-preview-header">
              <h3>Preview</h3>
              <button
                type="button"
                className="resume-preview-close"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >
                ×
              </button>
            </div>
            <ResumeBodyContent
              resumeData={((): ResumeData => {
                const stored = getResumeFromLocalDB();
                if (!stored) return resumeData;
                return {
                  ...defaultResumeData,
                  ...stored,
                  personalInfo: {
                    ...defaultPersonalInfo,
                    ...stored.personalInfo,
                  },
                };
              })()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
