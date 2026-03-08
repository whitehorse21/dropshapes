"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import axiosInstance from "@/app/apimodule/axiosConfig/Axios";
import ApiEndpoints from "@/app/apimodule/endpoints/ApiEndpoints";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import CoverLetterTemplateRenderer from "@/app/cover-letters/templates";
import type { CoverLetterData } from "@/app/utils/coverLetterService";
import {
  defaultProfile,
  defaultRecipient,
  defaultIntroduction,
  defaultClosing,
  defaultCoverStyle,
} from "@/app/utils/coverLetterService";

interface ApiCoverLetter {
  id: number;
  cover_letter_title?: string;
  cover_letter_type?: string;
  cover_template_category?: string;
  profile?: Record<string, string> | null;
  recipient?: Record<string, string> | null;
  introduction?: { greet_text?: string; intro_para?: string } | null;
  body?: string | null;
  closing?: { text?: string } | null;
  cover_style?: { font?: string; color?: string } | null;
}

function mapApiToCoverLetterData(raw: ApiCoverLetter): CoverLetterData {
  const p = raw.profile || {};
  const r = raw.recipient || {};
  return {
    id: raw.id,
    cover_letter_title: raw.cover_letter_title ?? "",
    cover_letter_type: raw.cover_letter_type ?? "professional",
    cover_template_category: raw.cover_template_category ?? "professional",
    profile: {
      ...defaultProfile,
      ...raw.profile,
      full_name: (p.full_name ??
        p.fullname ??
        p.fullName ??
        defaultProfile.full_name) as string,
      phone_number: (p.phone_number ??
        p.phone ??
        defaultProfile.phone_number) as string,
      linkedin_profile: (p.linkedin_profile ??
        p.linkedin ??
        defaultProfile.linkedin_profile) as string,
      portfolio_website: (p.portfolio_website ??
        p.website ??
        defaultProfile.portfolio_website) as string,
    },
    recipient: { ...defaultRecipient, ...raw.recipient },
    introduction: { ...defaultIntroduction, ...raw.introduction },
    body: raw.body ?? "",
    closing: { ...defaultClosing, ...raw.closing },
    cover_style: raw.cover_style
      ? { ...defaultCoverStyle, ...raw.cover_style }
      : defaultCoverStyle,
  };
}

function PreviewContent() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string)?.trim?.() || "";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CoverLetterData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setData(null);
    const baseUrl = ApiEndpoints.coverLetters.replace(/\/$/, "");
    axiosInstance
      .get<{ success: boolean; data: ApiCoverLetter }>(`${baseUrl}/${id}/`)
      .then((res) => {
        if (!cancelled && res.data?.data) {
          setData(mapApiToCoverLetterData(res.data.data));
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load cover letter");
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: data?.cover_letter_title || "Cover Letter",
    pageStyle: `
      @page { size: A4; margin: 18mm; background: white; }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        background: #fff !important;
        background-color: #fff !important;
        color: #1a1a1a !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .cover-letter-print-area,
      .cover-letter-preview-document {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        background: #fff !important;
        background-color: #fff !important;
        color: #1a1a1a !important;
        box-shadow: none !important;
      }
      .cover-letter-template-wrapper {
        background: #fff !important;
        background-color: #fff !important;
      }
      /* A4 printable height ~10.28in; template min-height 11in would force 2 pages – use content height in print */
      .cover-letter-print-area .cover-letter-preview > div,
      .cover-letter-print-area [style*="min-height: 11in"],
      .cover-letter-print-area [style*="minHeight: 11in"] {
        min-height: auto !important;
      }
      .cover-letter-print-area .cover-letter-render__paper { padding: 0 !important; }
    `,
  });

  if (loading) {
    return (
      <div className="cover-letter-preview-root cover-letter-preview-loading-wrap">
        <div className="cover-letter-preview-loading">
          <div className="cover-letter-preview-spinner" aria-hidden="true" />
          <p className="cover-letter-preview-loading-text">
            Loading cover letter…
          </p>
        </div>
      </div>
    );
  }

  if (!id || !data) {
    return (
      <div className="cover-letter-preview-root cover-letter-preview-empty-wrap">
        <div className="cover-letter-preview-empty">
          <h2 className="cover-letter-preview-empty-title">
            Cover Letter Not Found
          </h2>
          <button
            type="button"
            onClick={() => router.push("/cover-letters")}
            className="btn-resume btn-resume-primary"
          >
            Back to Cover Letters
          </button>
        </div>
      </div>
    );
  }

  const title = data.cover_letter_title || "Cover Letter";

  return (
    <div className="cover-letter-preview-root">
      {/* Header – same structure as old_frontend preview [id]/page.jsx */}
      <div className="cover-letter-preview-header-bar print:hidden">
        <div className="cover-letter-preview-header-inner">
          <div className="cover-letter-preview-header-left">
            <button
              type="button"
              onClick={() => router.back()}
              className="cover-letter-preview-back-btn"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </button>
            <div>
              <h1 className="cover-letter-preview-title">{title}</h1>
              <p className="cover-letter-preview-template-label">
                Template: {data.cover_template_category || "—"}
              </p>
            </div>
          </div>
          <div className="cover-letter-preview-header-actions">
            <button
              type="button"
              className="btn-resume"
              onClick={() => router.push(`/cover-letters/edit/${id}`)}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn-resume btn-resume-primary ml-2"
              onClick={handlePrint}
            >
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Preview content – same as old: rounded-lg overflow-hidden wrapping renderer */}
      <div className="cover-letter-preview-content">
        <div
          className="cover-letter-preview-document cover-letter-print-area rounded-lg overflow-hidden"
          ref={printRef}
        >
          <CoverLetterTemplateRenderer data={data} />
        </div>
      </div>
    </div>
  );
}

export default function CoverLetterPreviewPage() {
  return <PreviewContent />;
}
