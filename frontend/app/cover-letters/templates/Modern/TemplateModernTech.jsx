import React from "react";
import { getFontClass } from "@/app/utils/font";

const TemplateModernTech = ({ coverLetterData = {}, font }) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    body = "",
    closing = {},
  } = coverLetterData;

  const today = new Date().toLocaleDateString()
   const selectedFont = getFontClass(font);;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-100" style={{fontFamily: selectedFont}}>
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          {profile.full_name || "[Your Name]"}
        </h1>
        <div className="space-y-1 text-blue-100">
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
              I'm excited to apply for the{" "}
              {recipient.job_title || "[Position Title]"} position at{" "}
              {recipient.company_name || "[Company Name]"}. As a technology
              enthusiast with a passion for innovation and problem-solving, I'm
              thrilled about the opportunity to contribute to your cutting-edge
              technology initiatives.
            </p>
            <p>
              My technical journey has been driven by curiosity and a commitment
              to staying at the forefront of technological advancement. I
              specialize in leveraging modern technologies to build scalable,
              efficient solutions that drive business value. Whether working on
              web applications, mobile platforms, or emerging technologies, I
              approach each challenge with creativity and technical rigor.
            </p>
            <p>
              What excites me about {recipient.company_name || "[Company Name]"}{" "}
              is your reputation for technological innovation and your
              commitment to pushing boundaries. I would love to discuss how my
              technical expertise and passion for innovation can contribute to
              your team's continued success and technological advancement.
            </p>
          </>
        )}
      </div>

      {/* Closing */}
      <div className="mt-8">
        <p className="text-gray-900 mb-4">{closing.text || "Best regards,"}</p>
        <p className="text-gray-900 font-medium">
          {profile.full_name || "[Your Name]"}
        </p>
      </div>
    </div>
  );
};

export default TemplateModernTech;
