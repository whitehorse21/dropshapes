import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateTeacher = ({ coverLetterData = {}, font = 'Inter' }) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    experience = '',
    achievements = '',
    alignment = '',
    closing = ''
  } = coverLetterData;

  const {
    full_name = '[Your Name]',
    email,
    phone_number,
    location,
    first_name,
    last_name
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
      <div className="text-center mb-8 pb-6 border-b-2 border-blue-500">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {first_name && last_name ? `${first_name} ${last_name}` : full_name || '[Your Name]'}
        </h1>
        <div className="text-blue-600 text-lg font-semibold mb-3 flex items-center justify-center gap-2">
          {job_title}
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          {email && <div>📧 {email}</div>}
          {phone_number && <div>📞 {phone_number}</div>}
          {location && <div>📍 {location}</div>}
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
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
        <p className="text-gray-700 leading-relaxed">
          {introduction.intro_para ||
            `I am writing to express my strong interest in the ${job_title} position at ${company_name}. As a passionate educator with [X] years of experience in creating engaging learning environments and fostering student success, I am excited about the opportunity to contribute to your educational mission and make a meaningful impact on student lives.`}
        </p>
      </div>

      {/* Body Paragraphs */}
      
      {/* Closing */}
      <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-500 rounded-r-lg">
        <p className="text-gray-700 leading-relaxed">
          {closing.text ||
            `I would welcome the opportunity to discuss how my passion for education, proven teaching strategies, and commitment to student success can contribute to the continued excellence at ${company_name}. Thank you for considering my application. I look forward to hearing from you soon.`}
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
      </div>

      {/* Footer Note */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>🎓 Committed to Educational Excellence and Student Success</p>
      </div>
    </div>
  );
};

export default TemplateTeacher;
