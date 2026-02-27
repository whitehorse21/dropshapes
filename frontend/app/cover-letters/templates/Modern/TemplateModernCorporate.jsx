import React from "react";
import { getFontClass } from "@/app/utils/font";

const TemplateModernCorporate = ({ coverLetterData = {}, font }) => {
  const {
    profile = {},
    introduction = {},
    body = "",
    closing = {},
    recipient = {},
  } = coverLetterData;

  const today = new Date().toLocaleDateString()
   const selectedFont = getFontClass(font);;


  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg"  style={{ fontFamily: selectedFont, minHeight: "11in" }}>
      {/* Header */}
      <div className="mb-8 bg-gray-800 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          {profile.full_name || "[Your Name]"}
        </h1>
        <div className="space-y-1 text-gray-300">
          <p>{profile.email || "[Your Email]"}</p>
          <p>{profile.phone_number || "[Your Phone]"}</p>
          <p>{profile.location || "[Your Location]"}</p>
        </div>
      </div>

      {/* Date */}
      

      {/* Employer Info */}
      <div className="mb-8">
        <p className="text-gray-900 font-medium">
          {recipient.hiring_manager_name || "[Hiring Manager Name]"}
        </p>
        <p className="text-gray-800">{recipient.job_title}</p>
        <p className="text-gray-600">
          {recipient.company_name || "[Company Name]"}
        </p>
        <p className="text-gray-600">
          {recipient.company_address || "[Company Address]"}
        </p>
      </div>

      {/* Salutation / Greeting */}
      <div className="mb-6">
        <p className="text-gray-900">
          {introduction.greet_text ||
            `Dear ${recipient.hiring_manager_name || "Hiring Manager"},`}
        </p>
      </div>

      {/* Introduction Paragraph */}
      {introduction.intro_para && (
        <div className="mb-6 text-gray-800 leading-relaxed">
          <p>{introduction.intro_para}</p>
        </div>
      )}

      {/* Body */}
      <div className="space-y-6 text-gray-800 leading-relaxed">
        {body ? (
          <div dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <>
            <p>
              I am writing to express my strong interest in the{" "}
              {recipient.job_title || "[Position Title]"} position at{" "}
              {recipient.company_name || "[Company Name]"}. With my extensive
              corporate experience and proven track record of driving business
              excellence, I am confident in my ability to make a significant
              contribution to your organization's continued success.
            </p>
            <p>
              My corporate background encompasses strategic planning,
              operational excellence, and cross-functional leadership. I have
              successfully managed large-scale initiatives, optimized business
              processes, and delivered results that align with organizational
              objectives.
            </p>
            <p>
              I am particularly drawn to{" "}
              {recipient.company_name || "[Company Name]"} because of your
              reputation for excellence and commitment to sustainable growth. I
              would welcome the opportunity to contribute to your team.
            </p>
          </>
        )}
      </div>

      {/* Closing */}
      <div className="mt-8">
        <p className="text-gray-900 mb-4">
          {closing.text || "Sincerely,"}
        </p>
        <p className="text-gray-900 font-medium">
          {profile.full_name || "[Your Name]"}
        </p>
      </div>
    </div>
  );
};

export default TemplateModernCorporate;
