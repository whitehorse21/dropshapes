import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateNursingProfessional = ({ coverLetterData = {}, font }) => {
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
      <div className="mb-8 border-l-4 border-blue-500 pl-6">
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
        <p className="text-gray-900 font-medium">
          {recipient.hiring_manager_name || '[Hiring Manager Name]'}
        </p>
         <p className="text-gray-600">{recipient.job_title || 'job title'}</p>
        <p className="text-gray-600">
          {recipient.company_name || '[Company Name]'}
        </p>
        <p className="text-gray-600">
          {recipient.company_address || '[Company Address]'}
        </p>
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
              As a dedicated nursing professional with extensive experience in patient care, clinical excellence, 
              and healthcare delivery, I am excited to apply for the {recipient.job_title || '[Position Title]'} 
              position at {recipient.company_name || '[Company Name]'}. My commitment to providing compassionate, 
              evidence-based care and my proven track record of improving patient outcomes align perfectly 
              with your healthcare team's mission.
            </p>

            <p>
              Throughout my nursing career, I have successfully provided direct patient care across diverse 
              healthcare settings, from acute care to community health. My clinical expertise includes patient 
              assessment, medication administration, wound care, and patient education. I excel at working 
              collaboratively with interdisciplinary teams to develop and implement comprehensive care plans 
              that prioritize patient safety, comfort, and recovery.
            </p>

            <p>
              Notable achievements that demonstrate my nursing excellence include:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Maintained 98% patient satisfaction scores through compassionate and attentive care</li>
              <li>Reduced medication errors by 30% through implementation of safety protocols</li>
              <li>Mentored 15+ new nurses, contributing to 95% retention rate in high-stress unit</li>
              <li>Led quality improvement initiative that decreased patient fall rates by 25%</li>
            </ul>

            <p>
              What defines my nursing practice is my unwavering commitment to patient advocacy and clinical 
              excellence. I understand that nursing is both a science and an art, requiring technical competence 
              and emotional intelligence. My ability to remain calm under pressure, communicate effectively 
              with patients and families, and collaborate with healthcare teams has consistently resulted in 
              positive patient outcomes and team satisfaction.
            </p>

            <p>
              I am particularly drawn to {recipient.company_name || '[Company Name]'} because of your commitment 
              to patient-centered care and clinical innovation. I would welcome the opportunity to discuss how 
              my nursing expertise and passion for healthcare excellence can contribute to your team's continued 
              success in providing exceptional patient care.
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

export default TemplateNursingProfessional;
