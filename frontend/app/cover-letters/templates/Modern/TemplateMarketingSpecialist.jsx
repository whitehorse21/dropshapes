import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateMarketingSpecialist = ({ coverLetterData = {} , font}) => {
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
      <div className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          {profile.full_name || '[Your Name]'}
        </h1>
        <div className="space-y-1 text-purple-100">
          <p>{profile.email || '[Your Email]'}</p>
          <p>{profile.phone_number || '[Your Phone]'}</p>
          <p>{profile.location || '[Your Address]'}</p>
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

      {/* Introduction */}
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
              As a creative and results-driven marketing specialist with extensive experience in digital marketing, 
              brand management, and campaign development, I am thrilled to apply for the {recipient.job_title || '[Position Title]'} 
              position at {recipient.company_name || '[Company Name]'}. My expertise in multi-channel marketing 
              strategies and proven track record of driving brand awareness and customer acquisition aligns 
              perfectly with your marketing objectives.
            </p>

            <p>
              Throughout my marketing career, I have successfully developed and executed comprehensive marketing 
              campaigns across digital and traditional channels. My technical expertise includes SEO/SEM, social 
              media marketing, content marketing, email marketing, and marketing automation platforms. I excel 
              at analyzing customer insights, identifying market opportunities, and creating compelling campaigns 
              that resonate with target audiences and drive measurable business results.
            </p>

            <p>Key achievements that demonstrate my marketing expertise include:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Increased brand awareness by 200% through integrated digital marketing campaign</li>
              <li>Generated 150% increase in qualified leads through targeted content marketing strategy</li>
              <li>Launched product campaigns resulting in $5M+ in new revenue within first year</li>
              <li>Improved email marketing conversion rates by 45% through personalization and A/B testing</li>
            </ul>

            <p>
              What distinguishes me as a marketing professional is my ability to combine creative storytelling 
              with data-driven strategy. I understand that successful marketing requires both compelling messaging 
              and measurable performance. My analytical approach enables me to continuously optimize campaigns, 
              improve ROI, and demonstrate clear business impact. I excel at collaborating with cross-functional 
              teams to ensure marketing initiatives align with broader business objectives.
            </p>

            <p>
              I am particularly excited about {recipient.company_name || '[Company Name]'}'s innovative approach 
              to [industry/market]. I would welcome the opportunity to discuss how my marketing expertise and 
              passion for building strong brands can contribute to your marketing team's continued success and growth.
            </p>
          </>
        )}
      </div>

      {/* Closing */}
      <div className="mt-8">
        <p className="text-gray-900 mb-4">{closing.text || 'Best regards,'}</p>
        <p className="text-gray-900 font-medium">{profile.full_name || '[Your Name]'}</p>
      </div>
    </div>
  );
};

export default TemplateMarketingSpecialist;
