import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateExecutiveLeader = ({ coverLetterData = {}, font }) => {
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
      <div className="mb-8 border-b-4 border-yellow-500 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {profile.full_name || '[Your Name]'}
        </h1>
        <div className="text-gray-600 space-y-1 text-lg">
          {profile.email && <p>{profile.email}</p>}
          {profile.phone_number && <p>{profile.phone_number}</p>}
          {profile.address && <p>{profile.address}</p>}
        </div>
      </div>

      {/* Date */}
      

      {/* Employer Info */}
      <div className="mb-8">
        <p className="text-gray-900 font-medium text-lg">
          {recipient.hiring_manager_name || '[Hiring Manager Name]'}
        </p>
         <p className="text-gray-600">{recipient.job_title || 'job title'}</p>
        <p className="text-gray-600">{recipient.company_name || '[Company Name]'}</p>
        <p className="text-gray-600">{recipient.company_address || '[Company Address]'}</p>
      </div>

      {/* Salutation */}
      <div className="mb-6">
        <p className="text-gray-900 text-lg">
          {introduction.greet_text ||
            `Dear ${recipient.hiring_manager_name || 'Board of Directors / Hiring Committee'},`}
        </p>
      </div>

      {/* Body */}
      <div className="space-y-6 text-gray-800 leading-relaxed text-lg">
        {body ? (
          <div dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <>
            <p>
              {introduction.intro_para ||
                `As a seasoned executive leader with over 15 years of experience driving organizational transformation 
                and sustainable growth, I am honored to present my candidacy for the 
                ${recipient.job_title || '[Position Title]'} position at 
                ${recipient.company_name || '[Company Name]'}. My proven track record of leading complex 
                organizations through periods of change and delivering exceptional shareholder value positions 
                me to make an immediate and lasting impact.`}
            </p>

            <p>
              Throughout my executive career, I have consistently delivered results that exceed expectations 
              while building high-performing teams and fostering cultures of innovation and excellence. 
              My leadership philosophy centers on strategic vision, operational excellence, and stakeholder 
              value creation. I have successfully led organizations through digital transformation, 
              market expansion, M&A integration, and cultural transformation initiatives.
            </p>

            <p>Executive achievements that demonstrate my leadership impact include:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Transformed a $500M division, increasing revenue by 150% and EBITDA by 200% over 4 years</li>
              <li>Led successful acquisition and integration of 8 companies totaling $2B in enterprise value</li>
              <li>Implemented digital transformation strategy resulting in 40% operational efficiency gains</li>
              <li>Built and scaled global teams across 15+ countries while maintaining 95%+ employee engagement</li>
            </ul>

            <p>
              What defines my executive leadership is the ability to balance strategic thinking with operational 
              execution, while maintaining unwavering focus on sustainable value creation. I excel at building 
              consensus among diverse stakeholders, navigating complex regulatory environments, and making 
              difficult decisions that position organizations for long-term success. My collaborative leadership 
              style has consistently resulted in exceptional board, investor, and employee satisfaction.
            </p>

            <p>
              I am particularly drawn to {recipient.company_name || '[Company Name]'} because of your commitment 
              to [industry leadership/innovation/growth]. I would welcome the opportunity to discuss how my 
              executive experience and passion for building exceptional organizations can contribute to your 
              continued success and strategic objectives.
            </p>
          </>
        )}
      </div>

      {/* Closing */}
      <div className="mt-8">
        <p className="text-gray-900 mb-4 text-lg">
          {closing.text || 'Respectfully,'}
        </p>
        <p className="text-gray-900 font-bold text-xl">
          {profile.full_name || '[Your Name]'}
        </p>
      </div>
    </div>
  );
};

export default TemplateExecutiveLeader;
