"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/app/apimodule/axiosConfig/Axios";
import endpoints from "@/app/apimodule/endpoints/ApiEndpoints";
import {
  apiResumeToFormData,
  type ResumeData,
} from "@/app/utils/resumeService";
import ResumeBodyContent from "@/app/resumes/components/ResumeBodyContent";
import { exportAsHtml, exportResumeAsDocxFromHtml } from "@/app/utils/exportUtils";
import { toast } from "react-hot-toast";

function PreviewContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingDocx, setExportingDocx] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(`${endpoints.resumes}/${id}`);
        setResumeData(apiResumeToFormData(res.data as Record<string, unknown>));
      } catch {
        router.push("/resumes");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const pageTitle: string = resumeData
    ? (() => {
        const t = (resumeData.resume_title || "").trim();
        if (t && t !== "New Resume") return t;
        const pi = resumeData.personalInfo || {};
        const name = [pi.firstName, pi.lastName].filter(Boolean).join(" ").trim();
        if (name) return `${name}'s Resume`;
        return "Resume Preview";
      })()
    : "Resume Preview";

  useEffect(() => {
    if (!resumeData) return;
    const prev = document.title;
    document.title = `${pageTitle} | Resumes`;
    return () => {
      document.title = prev;
    };
  }, [resumeData, pageTitle]);

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleExportHtml = () => {
    const name = (resumeData?.resume_title || "Resume").replace(/[^\w\s-]/g, "").trim() || "Resume";
    exportAsHtml(contentRef.current, `${name}.html`, "resume");
  };

  const handleExportDocx = async () => {
    if (!resumeData) return;
    setExportingDocx(true);
    try {
      const name = (resumeData.resume_title || "Resume").replace(/[^\w\s-]/g, "").trim() || "Resume";
      await exportResumeAsDocxFromHtml(contentRef.current, name, "resume");
      toast.success("Resume downloaded as DOCX");
    } catch {
      toast.error("Failed to export DOCX");
    } finally {
      setExportingDocx(false);
    }
  };

  if (loading || !resumeData) {
    return (
      <section className="view-section active-view" aria-label="Loading resume">
        <div className="resume-preview-loading">
          <div className="resume-preview-loading-spinner" aria-hidden="true" />
          <p className="resume-preview-loading-text">Loading resume...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="view-section active-view" aria-label="Resume preview">
      <div className="resume-preview-page">
        <header className="resume-no-print resume-preview-header">
          <div className="resume-preview-header-inner">
            <button
              type="button"
              className="btn-resume resume-preview-back"
              onClick={() => router.push("/resumes")}
              aria-label="Back to resumes list"
            >
              ← Back
            </button>
            <h1 className="resume-preview-title">{pageTitle}</h1>
            <div className="resume-preview-actions">
              <div className="resume-preview-actions-export" role="group" aria-label="Export options">
                <button
                  type="button"
                  className="btn-resume btn-resume-sm"
                  onClick={handlePrint}
                  aria-label="Print or save as PDF"
                >
                  Print / PDF
                </button>
                <button type="button" className="btn-resume btn-resume-sm" onClick={handleExportHtml}>
                  HTML
                </button>
                <button
                  type="button"
                  className="btn-resume btn-resume-sm"
                  onClick={handleExportDocx}
                  disabled={exportingDocx}
                >
                  {exportingDocx ? "…" : "DOCX"}
                </button>
              </div>
              <button
                type="button"
                className="btn-resume btn-resume-primary"
                onClick={() => router.push(`/resumes/final-resume/${id}`)}
                aria-label="Edit this resume"
              >
                Edit resume
              </button>
            </div>
          </div>
        </header>

        <div className="resume-preview-body">
          <ResumeBodyContent ref={contentRef} resumeData={resumeData} />
        </div>
      </div>
    </section>
  );
}

export default function PreviewPage() {
  return <PreviewContent />;
}
