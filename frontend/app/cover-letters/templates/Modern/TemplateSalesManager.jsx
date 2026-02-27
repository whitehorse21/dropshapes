import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateSalesManager = ({ coverLetterData = {}, font }) => {
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
      <div className="mb-8 bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          {profile.full_name || '[Your Name]'}
        </h1>
        <div className="space-y-1 text-green-100">
          {profile.email && <p>{profile.email}</p>}
          {profile.phone_number && <p>{profile.phone_number}</p>}
          {profile.address && <p>{profile.address}</p>}
        </div>
      </div>

      {/* Date */}
      

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
                `As a results-driven sales manager with extensive experience in revenue generation, team leadership, 
                and strategic account management, I am excited to apply for the 
                ${recipient.job_title || '[Position Title]'} position at 
                ${recipient.company_name || '[Company Name]'}. My proven track record of exceeding sales 
                targets and building high-performing sales teams aligns perfectly with your revenue growth objectives.`}
            </p>

            <p>
              Throughout my sales career, I have successfully led teams that consistently exceed quota while 
              developing long-term client relationships and expanding market share. My expertise includes strategic 
              sales planning, pipeline management, customer relationship management, and sales process optimization. 
              I excel at identifying new business opportunities, negotiating complex deals, and implementing sales 
              strategies that drive sustainable revenue growth.
            </p>

            <p>Key achievements that demonstrate my sales leadership capabilities include:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Led sales team to achieve 145% of annual quota, generating $25M+ in new revenue</li>
              <li>Increased territory revenue by 200% through strategic account development and team coaching</li>
              <li>Reduced sales cycle time by 30% through process optimization and CRM implementation</li>
              <li>Built and managed sales team of 12 representatives with 95% quota attainment rate</li>
            </ul>

            <p>
              What sets me apart as a sales leader is my ability to balance individual achievement with team 
              development. I understand that sustainable sales success requires both strong personal performance 
              and the ability to motivate and develop others. My coaching approach has consistently resulted in 
              high team performance, low turnover, and exceptional customer satisfaction. I excel at creating 
              a culture of accountability, collaboration, and continuous improvement.
            </p>

            <p>
              I am particularly interested in {recipient.company_name || '[Company Name]'} because of your 
              reputation for sales excellence and market innovation. I would welcome the opportunity to discuss 
              how my sales leadership expertise and passion for driving revenue growth can contribute to your 
              sales team's continued success and expansion goals.
            </p>
          </>
        )}
      </div>

      {/* Closing */}
      <div className="mt-8">
        <p className="text-gray-900 mb-4">
          {closing.text || 'Best regards,'}
        </p>
        <p className="text-gray-900 font-medium">
          {profile.full_name || '[Your Name]'}
        </p>
      </div>
    </div>
  );
};

export default TemplateSalesManager;
