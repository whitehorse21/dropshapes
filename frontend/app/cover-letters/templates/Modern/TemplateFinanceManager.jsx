import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateFinanceManager = ({ coverLetterData = {}, font }) => {
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
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg"  style={{ fontFamily: selectedFont, minHeight: "11in" }}>
      {/* Header */}
      <div className="mb-8 border-l-4 border-green-600 pl-6">
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
              As an accomplished finance manager with extensive experience in financial planning, analysis, 
              and strategic decision support, I am excited to apply for the {recipient.job_title || '[Position Title]'} 
              position at {recipient.company_name || '[Company Name]'}. My expertise in financial modeling, 
              budgeting, and performance analysis, combined with my ability to drive business growth through 
              data-driven insights, aligns perfectly with your finance team's objectives.
            </p>

            <p>
              Throughout my finance career, I have successfully managed multi-million dollar budgets, led 
              financial planning and analysis initiatives, and provided strategic guidance to senior leadership 
              teams. My technical expertise includes advanced financial modeling, variance analysis, forecasting, 
              and profitability analysis. I excel at translating complex financial data into actionable business 
              recommendations that drive operational efficiency and profitability.
            </p>

            <p>
              Key achievements that demonstrate my finance management capabilities include:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Led annual budgeting process for $250M P&L, improving forecast accuracy by 25%</li>
              <li>Implemented financial controls and reporting systems reducing month-end close by 5 days</li>
              <li>Identified cost optimization opportunities resulting in $15M annual savings</li>
              <li>Developed ROI models for capital investments totaling $100M+ over 3 years</li>
            </ul>

            <p>
              What distinguishes me as a finance professional is my ability to balance analytical rigor with 
              strategic business acumen. I understand that finance is not just about numbers, but about enabling 
              business growth and creating value. My collaborative approach has enabled successful partnerships 
              with operations, sales, and executive teams to drive business performance and achieve financial 
              targets consistently.
            </p>

            <p>
              I am particularly interested in {recipient.company_name || '[Company Name]'} because of your 
              commitment to financial excellence and growth. I would welcome the opportunity to discuss how 
              my financial expertise and passion for driving business results can contribute to your finance 
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

export default TemplateFinanceManager;
