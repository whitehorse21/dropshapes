import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateLegalProfessional = ({ coverLetterData = {}, font }) => {
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
      <div className="mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {profile.full_name || '[Your Name]'}
        </h1>
        <div className="text-gray-600 space-y-1">
          {profile.email && <p>{profile.email}</p>}
          {profile.phone_number && <p>{profile.phone_number}</p>}
          {profile.address && <p>{profile.address}</p>}
        </div>
      </div>

      {/* Date */}
      

      {/* Employer Info */}
      <div className="mb-8">
        <p className="text-gray-900 font-medium">{recipient.hiring_manager_name || '[Hiring Manager Name]'}</p>
         <p className="text-gray-600">{recipient.job_title || 'job title'}</p>
        <p className="text-gray-600">{recipient.company_name || '[Company Name]'}</p>
        <p className="text-gray-600">{recipient.company_address || '[Company Address]'}</p>
      </div>

      {/* Salutation */}
      <div className="mb-6">
        <p className="text-gray-900">
          {introduction.greet_text || `Dear ${recipient.hiring_manager_name || 'Hiring Manager'},`}
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
                `As a dedicated legal professional with extensive experience in corporate law, compliance, 
                and legal advisory services, I am writing to express my strong interest in the 
                ${recipient.job_title || '[Position Title]'} position at ${recipient.company_name || '[Company Name]'}. 
                My comprehensive legal expertise and proven track record of providing strategic counsel 
                to organizations positions me to make a significant contribution to your legal team.`}
            </p>

            <p>
              Throughout my legal career, I have successfully managed complex litigation matters, negotiated 
              high-value commercial agreements, and provided strategic legal guidance on corporate transactions. 
              My practice areas include contract law, employment law, intellectual property, regulatory compliance, 
              and mergers & acquisitions. I excel at identifying legal risks, developing mitigation strategies, 
              and ensuring organizational compliance with evolving regulatory requirements.
            </p>

            <p>Notable achievements that demonstrate my legal expertise include:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Successfully defended $50M+ commercial litigation matter, securing favorable settlement</li>
              <li>Negotiated and closed M&A transactions totaling $200M+ in deal value</li>
              <li>Implemented comprehensive compliance program reducing regulatory risk by 75%</li>
              <li>Led intellectual property portfolio management protecting $100M+ in asset value</li>
            </ul>

            <p>
              What sets me apart as a legal professional is my business-minded approach to legal counsel. 
              I understand that legal advice must be practical, cost-effective, and aligned with business 
              objectives. My ability to communicate complex legal concepts in accessible terms has enabled 
              successful collaboration with executives, business units, and external stakeholders.
            </p>

            <p>
              I am particularly drawn to {recipient.company_name || '[Company Name]'} because of your commitment 
              to ethical business practices and legal excellence. I would welcome the opportunity to discuss 
              how my legal expertise and dedication to providing strategic counsel can support your organization's 
              continued success and growth.
            </p>
          </>
        )}
      </div>

      {/* Closing */}
      <div className="mt-8">
        <p className="text-gray-900 mb-4">
          {closing.text || 'Respectfully yours,'}
        </p>
        <p className="text-gray-900 font-medium">
          {profile.full_name || '[Your Name]'}
        </p>
      </div>
    </div>
  );
};

export default TemplateLegalProfessional;
