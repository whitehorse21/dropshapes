"use client";

import React, { useState } from "react";
import { ResumesPageContent } from "@/app/resumes/ResumesPageContent";
import { CoverLettersContent } from "@/app/cover-letters/CoverLettersContent";

type JobTab = "resumes" | "cover-letters";

export default function JobPage() {
  const [activeTab, setActiveTab] = useState<JobTab>("resumes");

  return (
    <section
      id="view-job"
      className="view-section active-view"
      aria-label="Job – Resumes & Cover Letters"
    >
      <div className="tool-page-wrap job-page">
        <div className="job-tabs" role="tablist" aria-label="Job sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "resumes"}
            aria-controls="job-panel-resumes"
            id="job-tab-resumes"
            className={`job-tab ${activeTab === "resumes" ? "job-tab--active" : ""}`}
            onClick={() => setActiveTab("resumes")}
          >
            Resumes
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "cover-letters"}
            aria-controls="job-panel-cover-letters"
            id="job-tab-cover-letters"
            className={`job-tab ${activeTab === "cover-letters" ? "job-tab--active" : ""}`}
            onClick={() => setActiveTab("cover-letters")}
          >
            Cover Letters
          </button>
        </div>

        <div className="job-tab-panels">
          <div
            id="job-panel-resumes"
            role="tabpanel"
            aria-labelledby="job-tab-resumes"
            className="job-tab-panel"
            hidden={activeTab !== "resumes"}
          >
            {activeTab === "resumes" && <ResumesPageContent />}
          </div>
          <div
            id="job-panel-cover-letters"
            role="tabpanel"
            aria-labelledby="job-tab-cover-letters"
            className="job-tab-panel"
            hidden={activeTab !== "cover-letters"}
          >
            {activeTab === "cover-letters" && <CoverLettersContent />}
          </div>
        </div>
      </div>
    </section>
  );
}
