import React from "react";
import { getFontClass } from "@/app/utils/font";

const TemplateModernMinimal = ({ coverLetterData = {}, font }) => {
  const {
    profile = {},
    recipient = {},
    body = "",
    introduction = {},
    closing = {},
  } = coverLetterData;

  const today = new Date().toLocaleDateString() 
  const selectedFont = getFontClass(font);;

  return (
    <div className="max-w-4xl mx-auto p-12 bg-white"  style={{ fontFamily: selectedFont, minHeight: "11in" }}>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl font-light text-gray-900 mb-4">
          {profile.full_name || "[Your Name]"}
        </h1>
        <div className="text-gray-600 space-y-1 text-sm">
          <p>{profile.email || "[Your Email]"}</p>
          <p>{profile.phone_number || "[Your Phone]"}</p>
          <p>{profile.location || "[Your Location]"}</p>
        </div>
      </div>

      {/* Date */}
      

      {/* Employer Info */}
      <div className="mb-10">
        <p className="text-gray-900 font-medium">
          {recipient.hiring_manager_name || "[Hiring Manager Name]"}
        </p>
        <p className="text-gray-700 font-medium">
          {recipient.job_title || "[Job title]"}
        </p>
        <p className="text-gray-600">
          {recipient.company_name || "[Company Name]"}
        </p>
        <p className="text-gray-600">
          {recipient.company_address || "[Company Address]"}
        </p>
      </div>

      {/* Salutation */}
      <div className="mb-8">
        <p className="text-gray-900">
          {introduction.greet_text ||
            `Dear ${recipient.hiring_manager_name || "Hiring Manager"},`}
        </p>
      </div>

      {/* Introduction Paragraph */}
      {introduction.intro_para && (
        <div className="mb-8 text-gray-700 leading-relaxed">
          <p>{introduction.intro_para}</p>
        </div>
      )}

      {/* Body */}
      <div className="space-y-8 text-gray-700 leading-relaxed">
        {body ? (
          <div dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <>
            <p>
              I am writing to express my interest in the{" "}
              {recipient.job_title || "[Position Title]"}
              position at {recipient.company_name || "[Company Name]"}.
            </p>

            <p>
              My professional approach emphasizes clarity, efficiency, and
              meaningful results. I believe in the power of focused execution
              and clean, thoughtful solutions that drive real value for
              organizations and their stakeholders.
            </p>

            <p>
              I would appreciate the opportunity to discuss how my experience
              aligns with your needs.
            </p>
          </>
        )}
      </div>

      {/* Closing */}
      <div className="mt-12">
        <p className="text-gray-900 mb-6">{closing.text || "Sincerely,"}</p>
        <p className="text-gray-900">{profile.full_name || "[Your Name]"}</p>
      </div>
    </div>
  );
};

export default TemplateModernMinimal;
