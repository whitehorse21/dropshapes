import React from 'react';
import { getFontClass } from "@/app/utils/font";

const TemplateGraphicDesignerCL = ({ coverLetterData = {}, font = 'Inter' }) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    body = '',
    closing = {}
  } = coverLetterData;

  const {
    full_name = '[Your Name]',
    email,
    phone_number,
    website,
    linkedin
  } = profile;

  const {
    company_name = '[Company Name]',
    job_title = '[Position]',
    hiring_manager_name = '[Hiring Manager]'
  } = recipient;

  const selectedFont = getFontClass(font);
  return (
    <div
      className={`max-w-2xl mx-auto p-8 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 text-gray-900 ${font}`}
      style={{ fontFamily: selectedFont }}
    >
      {/* Creative Header */}
      <div className="text-center mb-8 pb-6 border-b-4 border-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-border rounded-lg">
        <div className="bg-white p-6 rounded-lg border-4 border-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-border">
          <div className="bg-white p-4 rounded-lg">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {full_name}
            </h1>
            <div className="text-lg font-semibold mb-3 flex items-center justify-center gap-2">
              {job_title}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {email && <div>📧 {email}</div>}
              {phone_number && <div>📞 {phone_number}</div>}
              {website && <div>🌐 Portfolio: {website}</div>}
              {linkedin && <div>💼 {linkedin}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Date and Address */}
      <div className="mb-6 text-sm text-gray-700 bg-white p-4 rounded-lg shadow-md">
        
        <div className="mb-4">
          <div className="font-semibold">{hiring_manager_name}</div>
           <p className="text-gray-600">{job_title || 'job title'}</p>
          <div>{company_name}</div>
        </div>
      </div>

      {/* Salutation */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <p className="text-gray-900">
          {introduction.greet_text || `Dear Creative Team at ${company_name},`}
        </p>
      </div>

      {/* Introduction */}
      {introduction.intro_para && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-lg border-l-6 border-orange-500">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🎯</div>
            <p className="text-gray-700 leading-relaxed">
              {introduction.intro_para}
            </p>
          </div>
        </div>
      )}

      {/* Body Paragraphs */}
      <div className="space-y-6 mb-6">
        {body ? (
          <div dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <>
            <div className="p-6 bg-white rounded-lg shadow-lg border-l-6 border-pink-500">
              <h3 className="font-bold text-pink-700 mb-3 flex items-center gap-2 text-lg">
                ✨ Creative Portfolio & Design Excellence
              </h3>
              <p className="text-gray-700 leading-relaxed">
                My design journey encompasses a diverse range of creative projects including brand identity development,
                digital marketing campaigns, print design, and web graphics. I am proficient in Adobe Creative Suite
                (Photoshop, Illustrator, InDesign), Figma, and emerging design tools. I pride myself on translating complex
                ideas into visually compelling designs that resonate with target audiences.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg border-l-6 border-purple-500">
              <h3 className="font-bold text-purple-700 mb-3 flex items-center gap-2 text-lg">
                🚀 Innovation & Collaborative Spirit
              </h3>
              <p className="text-gray-700 leading-relaxed">
                I thrive in collaborative environments where creativity meets strategy. My experience working with
                cross-functional teams including marketing, product development, and client services has honed my
                ability to balance creative vision with business objectives and project constraints.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg border-l-6 border-blue-500">
              <h3 className="font-bold text-blue-700 mb-3 flex items-center gap-2 text-lg">
                🎨 Brand Alignment & Creative Vision
              </h3>
              <p className="text-gray-700 leading-relaxed">
                What draws me to {company_name} is your reputation for innovation and creative excellence. I am particularly
                inspired by your recent campaigns and design initiatives. I believe my creative approach and attention to
                detail align perfectly with your company's mission to deliver exceptional visual experiences.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Closing */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-lg border-l-6 border-green-500">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💝</div>
          <p className="text-gray-700 leading-relaxed">
            {closing.text || `I would love the opportunity to discuss how my creative vision, technical skills, and collaborative approach can contribute to ${company_name}'s continued success. Thank you for considering my application.`}
          </p>
        </div>
      </div>

      {/* Signature */}
      <div className="text-right bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <p className="text-gray-900">Creatively yours,</p>
        </div>
        <div className="font-bold text-lg bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
          {full_name}
        </div>
        <div className="text-sm text-gray-600 mt-2 italic">
          🎨 "Designing Tomorrow's Visual Stories Today"
        </div>
      </div>

    </div>
  );
};

export default TemplateGraphicDesignerCL;
