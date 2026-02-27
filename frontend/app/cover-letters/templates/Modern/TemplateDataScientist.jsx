import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateDataScientist = ({ coverLetterData = {},font }) => {
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
          <p>{profile.location || '[Your Address]'}</p>
        </div>
      </div>

      {/* Date */}
      

      {/* Employer Info */}
      <div className="mb-8">
        <p className="text-gray-900 font-medium">{recipient.hiring_manager_name || '[Hiring Manager Name]'}</p>
        <p className="text-gray-600">{recipient.job_title || '[Job title]'}</p>
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
              As a passionate data scientist with extensive experience in machine learning, statistical analysis, 
              and data-driven decision making, I am excited to apply for the {recipient.job_title || '[Position Title]'} 
              position at {recipient.company_name || '[Company Name]'}. My expertise in extracting actionable insights 
              from complex datasets and building predictive models aligns perfectly with your data science objectives.
            </p>

            <p>
              Throughout my career, I have successfully developed and deployed machine learning solutions that 
              have driven significant business value. My technical expertise spans Python, R, SQL, and advanced 
              ML frameworks including TensorFlow, PyTorch, and scikit-learn. I excel at the full data science 
              lifecycle, from data collection and preprocessing to model development, validation, and production deployment.
            </p>

            <p>
              Notable achievements that demonstrate my data science capabilities include:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Developed a customer churn prediction model that reduced churn by 25% and saved $2M annually</li>
              <li>Built recommendation systems serving 1M+ users with 40% improvement in engagement metrics</li>
              <li>Led A/B testing initiatives that optimized conversion rates by 35% across digital platforms</li>
              <li>Implemented automated ML pipelines reducing model training time by 60%</li>
            </ul>

            <p>
              What distinguishes me as a data scientist is my ability to bridge the gap between complex technical 
              analysis and business strategy. I excel at communicating insights to both technical and non-technical 
              stakeholders, ensuring that data-driven recommendations are understood and actionable. My collaborative 
              approach has enabled successful cross-functional partnerships with engineering, product, and business teams.
            </p>

            <p>
              I am particularly excited about {recipient.company_name || '[Company Name]'}'s commitment to leveraging 
              data for innovation and growth. I would welcome the opportunity to discuss how my analytical expertise 
              and passion for turning data into strategic advantage can contribute to your data science initiatives.
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

export default TemplateDataScientist;
