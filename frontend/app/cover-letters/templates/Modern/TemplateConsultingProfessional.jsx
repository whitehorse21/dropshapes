import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateConsultingProfessional = ({ coverLetterData = {},font }) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    body = "",
    closing = {}
  } = coverLetterData;

   const selectedFont = getFontClass(font);;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg"  style={{ fontFamily: selectedFont, minHeight: "11in" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {profile.full_name || '[Your Name]'}
        </h1>
        <div className="text-gray-600 space-y-1">
          {profile.email && <p>{profile.email}</p>}
          {profile.phone_number && <p>{profile.phone_number}</p>}
          {profile.portfolio_website && <p>{profile.portfolio_website}</p>}
        </div>
      </div>

  
      

      {/* Employer Info */}
      <div className="mb-8">
        <p className="text-gray-900 font-medium">
          {recipient.hiring_manager_name || '[Hiring Manager Name]'}
        </p>
         <p className="text-gray-600">{recipient.job_title || 'job title'}</p>
        <p className="text-gray-600">{recipient.company_name || '[Company Name]'}</p>
        <p className="text-gray-600">{recipient.company_address || '[Company Address]'}</p>
      </div>

      {/* Salutation */}
      <div className="mb-6">
        <p className="text-gray-900">
          {introduction.greet_text ||
            `Dear ${recipient.hiring_manager_name || 'Hiring Manager'},`}
        </p>
      </div>

      {/* Body */}
      <div className="space-y-6 text-gray-800 leading-relaxed">
        {body ? (
          <div dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <>
            <p>
              {introduction.intro_para ||
                `As a seasoned consulting professional with extensive experience in strategic advisory and 
                business transformation, I am excited to submit my application for the 
                ${recipient.job_title || '[Position Title]'} role at 
                ${recipient.company_name || '[Company Name]'}. My proven track record in delivering 
                high-impact consulting solutions and driving organizational excellence aligns perfectly with 
                your requirements.`}
            </p>

            <p>
              Throughout my consulting career, I have successfully led complex engagements across diverse 
              industries, specializing in strategic planning, operational optimization, and change management. 
              My approach combines analytical rigor with practical implementation strategies, ensuring that 
              recommendations translate into measurable business outcomes. I excel at synthesizing complex 
              business challenges into actionable insights and building consensus among stakeholders at all levels.
            </p>

            <p>Key achievements that demonstrate my consulting expertise include:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Led a digital transformation initiative that increased client operational efficiency by 35%</li>
              <li>Developed comprehensive market entry strategies for Fortune 500 companies expanding into new regions</li>
              <li>Facilitated strategic planning sessions resulting in $50M+ in identified cost savings</li>
              <li>Built and mentored high-performing consulting teams across multiple client engagements</li>
            </ul>

            <p>
              What sets me apart is my ability to combine strategic thinking with hands-on execution. 
              I understand that successful consulting requires not just brilliant analysis, but also the 
              ability to influence stakeholders, manage complex project dynamics, and deliver results under 
              tight timelines. My collaborative approach and strong communication skills have consistently 
              earned client satisfaction ratings above 95%.
            </p>

            <p>
              I am particularly drawn to {recipient.company_name || '[Company Name]'} because of your reputation 
              for delivering transformational outcomes for clients. I would welcome the opportunity to discuss 
              how my consulting expertise and passion for driving business excellence can contribute to your 
              team's continued success.
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

export default TemplateConsultingProfessional;
