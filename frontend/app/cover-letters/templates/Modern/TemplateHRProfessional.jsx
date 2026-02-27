import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateHRProfessional = ({ coverLetterData = {}, font = 'Inter' }) => {
  const {
    profile = {},
    recipient = {},
    body,
    closing,
    introduction
  } = coverLetterData;

  const {
    first_name,
    last_name,
    full_name,
    email,
    phone_number,
    address,
    linkedin
  } = profile;

  const {
    company_name = '[Company Name]',
    job_title = '[Position]',
    hiring_manager_name = '[Hiring Manager]'
  } = recipient;

  const today = new Date().toLocaleDateString() 
  const selectedFont = getFontClass(font);;

  return (
    <div className={`max-w-2xl mx-auto p-8 bg-white text-gray-900 ${font}`} style={{ fontFamily: selectedFont }}>
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-2 border-purple-500">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {first_name && last_name ? `${first_name} ${last_name}` : full_name || '[Your Name]'}
        </h1>
        <div className="text-purple-600 text-lg font-semibold mb-3 flex items-center justify-center gap-2">
          {job_title}
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          {email && <div>📧 {email}</div>}
          {phone_number && <div>📞 {phone_number}</div>}
          {address && <div>📍 {address}</div>}
          {linkedin && <div>💼 {linkedin}</div>}
        </div>
      </div>

      {/* Date and Address */}
      <div className="mb-6 text-sm text-gray-700">
        <div className="mb-4">{today}</div>
        <div className="mb-4">
          <div className="font-semibold">{hiring_manager_name}</div>
           <p className="text-gray-600">{job_title || 'job title'}</p>
          <div>{company_name}</div>
        </div>
      </div>

      {/* Salutation */}
      <div className="mb-6">
        <p className="text-gray-900">Dear {hiring_manager_name},</p>
      </div>

      {/* Introduction */}
      <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
        <p className="text-gray-700 leading-relaxed">
          {introduction.intro_para ||
            `I am excited to submit my application for the ${job_title} role at ${company_name}. With [X] years of comprehensive experience in human resources management, talent acquisition, employee development, and organizational strategy, I am passionate about creating positive workplace cultures that drive both employee satisfaction and business success.`}
        </p>
      </div>

      {/* Body Paragraphs */}
      <div className="space-y-6 mb-6">
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
            🎯 Talent Acquisition & Workforce Planning
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {body ||
              `In my previous roles, I have successfully led end-to-end recruitment processes, from workforce planning and job analysis to candidate sourcing, interviewing, and onboarding. I have experience with various recruitment strategies including social recruiting, campus hiring, and executive search. My expertise in using ATS systems, conducting behavioral interviews, and implementing diversity and inclusion initiatives has resulted in improved hiring quality and reduced time-to-fill metrics.`}
          </p>
        </div>

      </div>

      {/* Closing */}
      <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-500 rounded-r-lg">
        <p className="text-gray-700 leading-relaxed">
          {closing.text ||
            `I would welcome the opportunity to discuss how my strategic HR expertise, people-centered approach, and passion for organizational excellence can contribute to ${company_name}'s continued success. Thank you for your consideration, and I look forward to the possibility of joining your team.`}
        </p>
      </div>

      {/* Signature */}
      <div className="text-right">
        <div className="mb-4">
          <p className="text-gray-900">Sincerely,</p>
        </div>
        <div className="font-semibold text-gray-900">
          {first_name && last_name ? `${first_name} ${last_name}` : full_name || '[Your Name]'}
        </div>
        <div className="text-sm text-purple-600 mt-2">
          👥 Building Great Teams, Driving Success
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>🤝 Committed to People Excellence and Organizational Growth</p>
      </div>
    </div>
  );
};

export default TemplateHRProfessional;
