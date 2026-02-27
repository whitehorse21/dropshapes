import React from "react";
import { getFontClass } from "@/app/utils/font";

const AcademicTemplate = ({ coverLetterData = {},font }) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    body = "",
    closing = {}
  } = coverLetterData;

  const date = new Date().toLocaleDateString();
  const selectedFont = getFontClass(font);

  return (
    <div 
     style={{ fontFamily: selectedFont, minHeight: "11in" }}
     className="max-w-4xl mx-auto p-10 bg-white shadow-xl font-serif leading-relaxed relative">
      {/* Header */}
      <div className="text-center border-b-2 border-blue-900 pb-6 mb-8 bg-gradient-to-b from-gray-50 to-white">
        <h1 className="text-3xl font-bold text-blue-900 mb-1">
          {profile.full_name || "[Your Name]"}
        </h1>
        <p className="italic text-gray-700 mb-2">
          {recipient.job_title || "Ph.D. in Computer Science"}
        </p>
        <p className="text-sm text-gray-600">
          {(profile.phone_number || "[Phone]")} • {(profile.email || "[Email]")}
        </p>
      </div>

      {/* Date */}
      

      {/* Recipient */}
      <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-200">
        <p className="font-medium text-gray-800">
          {recipient.hiring_manager_name || "[Hiring Manager Name]"}
        </p>
         <p className="text-gray-600">{recipient.job_title || 'job title'}</p>
        <p className="text-gray-700">
          {recipient.company_name || "[Company Name]"}
        </p>
        {recipient.company_address && (
          <p className="text-gray-700">{recipient.company_address}</p>
        )}
      </div>

      {/* Salutation */}
      <div className="mb-6 font-semibold text-gray-900">
        {introduction.greet_text ||
          `Dear ${recipient.hiring_manager_name || "Hiring Committee"},`}
      </div>

      {/* Introduction */}
      <div className="mb-6 text-gray-800 text-justify border-l-4 border-blue-900 pl-4 bg-gray-50 py-3 rounded-r">
        {introduction.intro_para ||
          `I am writing to express my strong interest in the ${
            recipient.job_title || "[Job Title]"
          } position at ${recipient.company_name || "[Company Name]"}.`}
      </div>

      {/* Body */}
      <div className="mb-6 text-gray-800 whitespace-pre-line">
        {body ? (
          <div dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          "📚 Research Excellence & Scholarly Impact..."
        )}
      </div>

      {/* Closing */}
      <div className="mb-8 text-gray-800 text-justify">
        {closing.text || "Thank you for your consideration."}
      </div>

      {/* Signature */}
      <div className="mt-10">
        <p className="font-semibold text-blue-900 mb-1">Sincerely,</p>
        <p className="font-semibold text-blue-900">
          {profile.full_name || "[Your Name]"}
        </p>
      </div>
    </div>
  );
};

export default AcademicTemplate;
