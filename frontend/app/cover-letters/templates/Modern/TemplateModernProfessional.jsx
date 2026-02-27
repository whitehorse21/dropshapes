import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateModernProfessional = ({ coverLetterData = {},font }) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    body = '',
    closing = {}
  } = coverLetterData;

  const today = new Date().toLocaleDateString() 
  const selectedFont = getFontClass(font);;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg"  style={{ fontFamily: selectedFont, minHeight: "11in" }}>
      {/* Header */}
      <div className="mb-8 border-b-2 border-blue-600 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {profile.full_name || '[Your Name]'}
        </h1>
        <div className="text-gray-600 space-y-1">
          <p>{profile.email || '[Your Email]'}</p>
          <p>{profile.phone_number || '[Your Phone]'}</p>
          <p>{profile.location || '[Your Location]'}</p>
        </div>
      </div>

      {/* Date */}
      

      {/* Employer Info */}
      <div className="mb-8">
        <p className="text-gray-900 font-medium">
          {recipient.hiring_manager_name || '[Hiring Manager Name]'}
        </p>
          <p className="text-gray-700 font-medium">
          {recipient.job_title || "[Job title]"}
        </p>
        <p className="text-gray-600">
          {recipient.company_name || '[Company Name]'}
        </p>
        <p className="text-gray-600">
          {recipient.company_address || '[Company Address]'}
        </p>
      </div>

      {/* Salutation */}
      <div className="mb-6">
        <p className="text-gray-900">
          {introduction.greet_text ||
            `Dear ${recipient.hiring_manager_name || 'Hiring Manager'},`}
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
              I am writing to express my interest in the {recipient.job_title || '[Position Title]'} 
              position at {recipient.company_name || '[Company Name]'}. With a strong background in 
              delivering professional outcomes, I believe I can be a valuable asset to your team.
            </p>
            <p>
              Throughout my career, I have cultivated a reputation for professionalism, attention 
              to detail, and a results-oriented mindset. My skills in cross-functional collaboration 
              and strategic execution have contributed significantly to organizational success.
            </p>
            <p>
              I admire {recipient.company_name || '[Company Name]'}'s commitment to innovation and 
              excellence and would be honored to contribute to your continued growth.
            </p>
          </>
        )}
      </div>

      {/* Closing */}
      <div className="mt-8">
        <p className="text-gray-900 mb-4">
          {closing.text || 'Sincerely,'}
        </p>
        <p className="text-gray-900 font-medium">
          {profile.full_name || '[Your Name]'}
        </p>
      </div>
    </div>
  );
};

export default TemplateModernProfessional;
