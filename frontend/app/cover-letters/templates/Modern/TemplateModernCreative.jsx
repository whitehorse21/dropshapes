import React from "react";
import { getFontClass } from "@/app/utils/font";

const TemplateModernCreative = ({ coverLetterData = {},font }) => {
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
      <div className="mb-8 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-2">
          {profile.full_name || "[Your Name]"}
        </h1>
        <div className="space-y-1 text-purple-100">
          <p>{profile.email || "[Your Email]"}</p>
          <p>{profile.phone_number || "[Your Phone]"}</p>
          <p>{profile.location || "[Your Address]"}</p>
        </div>
      </div>

      {/* Date */}
      

      {/* Employer Info */}
      <div className="mb-8">
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
      <div className="mb-6">
        <p className="text-gray-900">
          {introduction.greet_text ||
            `Hello ${recipient.hiring_manager_name || "Creative Team"},`}
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
              I'm thrilled to submit my application for the{" "}
              {recipient.job_title || "[Position Title]"} role at{" "}
              {recipient.company_name || "[Company Name]"}. As a passionate
              creative professional who believes in the power of innovative
              design and storytelling, I'm excited about the opportunity to
              bring fresh perspectives and artistic excellence to your dynamic
              team.
            </p>

            <p>
              My creative journey has been defined by a commitment to pushing
              boundaries and exploring new possibilities. I specialize in
              translating complex ideas into visually compelling narratives that
              resonate with diverse audiences. Whether working on brand identity,
              digital experiences, or multimedia campaigns, I approach each
              project with curiosity, creativity, and a dedication to excellence.
            </p>

            <p>
              What draws me to {recipient.company_name || "[Company Name]"} is
              your reputation for creative innovation and your commitment to
              meaningful design. I would love to discuss how my artistic vision
              and passion for creative excellence can contribute to your team's
              continued success and creative impact.
            </p>
          </>
        )}
      </div>

      {/* Closing */}
      <div className="mt-8">
        <p className="text-gray-900 mb-4">{closing.text || "Creatively yours,"}</p>
        <p className="text-gray-900 font-medium">
          {profile.full_name || "[Your Name]"}
        </p>
      </div>
    </div>
  );
};

export default TemplateModernCreative;
