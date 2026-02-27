import React from "react";
import { getFontClass } from "@/app/utils/font";

const ConsultingTemplate = ({ coverLetterData = {}, font }) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    body = "",
    closing = {}
  } = coverLetterData;

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
const selectedFont = getFontClass(font);
  return (
    <div 
     style={{ fontFamily: selectedFont, minHeight: "11in" }}
    className="relative max-w-4xl mx-auto p-10 bg-white shadow-xl leading-relaxed font-sans min-h-[11in]">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8 mb-8 relative">
        <h1 className="text-2xl font-light tracking-widest uppercase mb-1">
          {profile.full_name || "[Your Name]"}
        </h1>
        <p className="text-sm tracking-wide opacity-90 mb-1">
          {recipient.job_title || "Management Consultant"}
        </p>
        <div className="text-xs flex flex-wrap justify-center gap-3 opacity-90">
          {profile.phone_number && <span>{profile.phone_number}</span>}
          {profile.phone_number && profile.email && <span>•</span>}
          {profile.email && <span>{profile.email}</span>}
          {(profile.phone_number || profile.email) && profile.linkedin && <span>•</span>}
          {profile.linkedin && <span>{profile.linkedin}</span>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600"></div>
      </div>

      {/* Date */}
      <div className="text-right text-gray-500 text-sm font-medium mb-6">{date}</div>

      {/* Recipient */}
      <div className="mb-6 bg-gray-50 border-l-4 border-blue-900 p-4 rounded-r">
        <p className="text-gray-800 font-semibold">
          {recipient.hiring_manager_name || "[Hiring Manager Name]"}
        </p>
        {recipient.job_title && <p className="text-gray-600">{recipient.job_title}</p>}
        {recipient.department && <p className="text-gray-700">{recipient.department}</p>}
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
          `Dear ${recipient.hiring_manager_name || "Hiring Manager"},`}
      </div>

      {/* Introduction */}
      <div className="mb-6 text-gray-800 text-justify border-l-4 border-blue-900 pl-4 bg-gray-50 py-3 rounded-r">
        {introduction.intro_para ||
          `I am writing to express my strong interest in the ${
            recipient.job_title || "[Job Title]"
          } position within the ${recipient.department || "[Department]"} at ${
            recipient.company_name || "[Company Name]"
          }.`}
      </div>

      {/* Client Impact Highlight */}
      {profile.client_impact && (
        <div className="my-6 bg-green-50 border-2 border-green-600 rounded p-3 text-center font-semibold text-green-600 text-sm">
          {profile.client_impact}
        </div>
      )}

      {/* Body */}
      <div className="mb-6 text-gray-800 whitespace-pre-line">
        {body ? (
          <div dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          "🎯 Strategic Consulting & Client Impact..."
        )}
      </div>

      {/* Closing */}
      <div className="mb-8 text-gray-800 text-justify">
        {closing.text ||
          "I would welcome the opportunity to discuss how my consulting experience and analytical skills can contribute to your organization's success."}
      </div>

      {/* Signature */}
      <div className="mt-10">
        <p className="font-semibold text-blue-900 mb-1">Sincerely,</p>
        <p className="font-semibold text-blue-900">
          {profile.full_name || "[Your Name]"}
        </p>
        {profile.mba && (
          <p className="text-gray-600 text-sm font-medium">{profile.mba}</p>
        )}
      </div>
     
    </div>
  );
};

export default ConsultingTemplate;
