import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateModernDark = ({ coverLetterData = {},font }) => {
  const {
    profile = {},
    recipient = {},
    body = '',
    introduction = {},
    closing = {}
  } = coverLetterData;

  const today = new Date().toLocaleDateString()
   const selectedFont = getFontClass(font);;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-900 text-white shadow-2xl"  style={{ fontFamily: selectedFont, minHeight: "11in" }}>
      {/* Header */}
      <div className="mb-8 border-b border-gray-700 pb-6">
        <h1 className="text-3xl font-bold mb-2 text-white">
          {profile.full_name || '[Your Name]'}
        </h1>
        <div className="space-y-1 text-gray-300">
          <p>{profile.email || '[Your Email]'}</p>
          <p>{profile.phone_number || '[Your Phone]'}</p>
          <p>{profile.location || '[Your Location]'}</p>
        </div>
      </div>

      {/* Employer Info */}
      <div className="mb-8">
        <p className="text-white font-medium">
          {recipient.hiring_manager_name || '[Hiring Manager Name]'}
        </p>
          <p className="text-gray-200 font-medium">
          {recipient.job_title || "[Job title]"}
        </p>
        <p className="text-gray-300">{recipient.company_name || '[Company Name]'}</p>
        <p className="text-gray-300">{recipient.company_address || '[Company Address]'}</p>
      </div>

      {/* Salutation */}
      <div className="mb-6">
        <p className="text-white">
          {introduction.greet_text ||
            `Dear ${recipient.hiring_manager_name || 'Hiring Manager'},`}
        </p>
      </div>

      {/* Introduction Paragraph */}
      {introduction.intro_para && (
        <div className="mb-6 text-gray-200 leading-relaxed">
          <p>{introduction.intro_para}</p>
        </div>
      )}

      {/* Body */}
      <div className="space-y-6 text-gray-200 leading-relaxed">
        {body ? (
          <div dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <>
            <p>
              I am writing to express my strong interest in the {recipient.job_title || '[Position Title]'} 
              position at {recipient.company_name || '[Company Name]'}. With my contemporary approach to 
              problem-solving and innovative mindset, I am excited about the opportunity to contribute 
              to your forward-thinking organization.
            </p>
            <p>
              My professional philosophy centers on embracing modern methodologies and cutting-edge 
              technologies to deliver exceptional results. I thrive in dynamic environments where 
              innovation is valued and where I can leverage my skills to drive meaningful impact.
            </p>
            <p>
              {recipient.company_name || '[Company Name]'}'s reputation for innovation and excellence 
              aligns perfectly with my professional values. I would welcome the opportunity to discuss 
              how my modern perspective and commitment to excellence can contribute to your team's 
              continued success.
            </p>
          </>
        )}
      </div>

      {/* Closing */}
      <div className="mt-8">
        <p className="text-white mb-4">
          {closing.text || 'Sincerely,'}
        </p>
        <p className="text-white font-medium">
          {profile.full_name || '[Your Name]'}
        </p>
      </div>
    </div>
  );
};

export default TemplateModernDark;
