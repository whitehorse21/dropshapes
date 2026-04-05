"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { $coverLetter } from "@/app/utils/coverLetterObservable";
import apiService from "@/app/apimodule/utils/apiService";
import endpoints from "@/app/apimodule/endpoints/ApiEndpoints";
import { Loader } from "lucide-react";
import type { CoverLetterData } from "@/app/utils/coverLetterService";
import {
  defaultCoverLetterData,
  defaultIntroduction,
  defaultClosing,
} from "@/app/utils/coverLetterService";

interface TextGenerateModalProps {
  show?: boolean;
  onHide: () => void;
  sectionName?: "introduction" | "body" | "closing";
  title?: string;
}

export default function TextGenerateModal({
  show = false,
  onHide,
  sectionName = "introduction",
  title = "Improve with AI",
}: TextGenerateModalProps) {
  const [isImproving, setIsImproving] = useState(false);
  const [creditLoading, setCreditsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    introduction?: string;
    body?: string;
    closing?: string;
  } | null>(null);
  const [usage, setUsage] = useState<{
    ai_credits_remaining?: number;
    subscription_plan?: string;
  } | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setCreditsLoading(true);
        const response = await apiService.get(endpoints.subscriptionUsage);
        setUsage(response?.data ?? null);
      } catch (err) {
        console.error("Failed to load subscription info", err);
      } finally {
        setCreditsLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  const handleClose = () => {
    setIsImproving(false);
    setAiResult(null);
    onHide();
  };

  const handleImproveWithAi = async () => {
    try {
      setIsImproving(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const selectedProfession =
        typeof window !== "undefined"
          ? localStorage.getItem("coverLetter_selectedProfession")
          : null;
      const jobDescription =
        typeof window !== "undefined"
          ? localStorage.getItem("coverLetter_jobDescription")
          : null;
      const baseUrl =
        typeof process.env.NEXT_PUBLIC_API_URL === "string"
          ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
          : "";
      const res = await fetch(`${baseUrl}cover-letters/ai-enhance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          profession: selectedProfession,
          jobDescription: jobDescription || selectedProfession,
          sections: [sectionName],
        }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (error) {
      console.error("Error improving with AI:", error);
    } finally {
      setIsImproving(false);
    }
  };

  const handleApplyImprovement = () => {
    if (!aiResult) return;
    const current = $coverLetter.getValue();
    const updated: CoverLetterData = {
      ...defaultCoverLetterData,
      ...current,
      profile: { ...defaultCoverLetterData.profile, ...current.profile },
      recipient: { ...defaultCoverLetterData.recipient, ...current.recipient },
      introduction: {
        ...defaultIntroduction,
        ...current.introduction,
      },
      closing: { ...defaultClosing, ...current.closing },
    };

    if (sectionName === "body") {
      updated.body = (aiResult.body ?? "").replace(/\\n/g, "\n");
    } else if (sectionName === "closing") {
      updated.closing = { ...updated.closing, text: aiResult.closing ?? "" };
    } else if (sectionName === "introduction") {
      let introText = aiResult.introduction ?? "";
      const prefix = "Dear Hiring Manager,\n\n";
      if (introText.startsWith(prefix)) {
        introText = introText.slice(prefix.length);
      }
      updated.introduction = {
        ...current.introduction,
        intro_para: introText,
      };
    }

    $coverLetter.next(updated);
    handleClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      <div
        className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden
                  bg-white/90 dark:bg-gray-900/80
                  backdrop-blur-md shadow-2xl border border-white/20
                  rounded-3xl animate-[fadeInUp_0.3s_ease-out]"
      >
        <div
          className="flex items-center justify-between px-6 py-4
                    border-b border-white/10 dark:border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
            {title}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Icon icon="mingcute:close-line" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {!aiResult ? (
            <p className="text-gray-700 dark:text-gray-300 text-center text-lg leading-relaxed">
              ⚡ Click below to let{" "}
              <span className="font-semibold text-blue-500">AI</span> improve
              your <strong>{sectionName}</strong> section.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              <div
                className="p-5 rounded-2xl border border-green-300 dark:border-green-600
                          bg-gradient-to-br from-green-50 to-green-100/40
                          dark:from-green-900/20 dark:to-green-800/10
                          shadow-md"
              >
                <h4 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">
                  Improved{" "}
                  {sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap leading-relaxed">
                  {sectionName === "introduction" &&
                    (() => {
                      const prefix = "Dear Hiring Manager,\n\n";
                      let text = aiResult.introduction ?? "";
                      if (text.startsWith(prefix)) {
                        text = text.slice(prefix.length);
                      }
                      return text;
                    })()}
                  {sectionName === "body" &&
                    (aiResult.body ?? "").replace(/\\n/g, "\n")}
                  {sectionName === "closing" && (aiResult.closing ?? "")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-white/10 dark:border-gray-700/50">
          {creditLoading ? (
            <div className="flex justify-center my-5">
              <Loader className="animate-spin w-5 h-5" />
            </div>
          ) : (
            usage && (
              <div className="mb-4 text-sm text-gray-300">
                <p>
                  <strong>Credits Remaining:</strong>{" "}
                  {usage.ai_credits_remaining ?? "N/A"}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Each AI improvement consumes <strong>1 credit</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Plan: {usage.subscription_plan ?? "Free"}
                </p>
              </div>
            )
          )}

          {!aiResult && (
            <button
              onClick={handleImproveWithAi}
              disabled={isImproving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700
                     disabled:bg-blue-400 text-white shadow-md
                     flex items-center gap-2 transition-all"
            >
              {isImproving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Icon icon="mingcute:magic-2-line" className="w-4 h-4" />
                  Improve with AI
                </>
              )}
            </button>
          )}

          {aiResult && (
            <button
              onClick={handleApplyImprovement}
              className="relative px-6 py-2.5 rounded-xl
             bg-gradient-to-r from-purple-800 via-purple-700 to-purple-800 hover:shadow-lg cursor-pointer"
            >
              <span className="relative z-10">Use This Improvement</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
