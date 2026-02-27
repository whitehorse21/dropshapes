import React from "react";
import { getFontClass } from "@/app/utils/font";

const TemplateSoftwareEngineerCL = ({
  coverLetterData = {},
  font = "Inter",
}) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    body = "",
    closing = {},
  } = coverLetterData;

  const {
    full_name = "[Your Name]",
    email,
    phone_number,
    github,
    linkedin,
    website,
  } = profile;

  const {
    company_name = "[Company Name]",
    job_title = "[Position]",
    hiring_manager_name = "[Hiring Manager]",
  } = recipient;

  const selectedFont = getFontClass(font);
  return (
    <div
      className={`max-w-2xl mx-auto p-8 bg-gray-50 text-gray-900 ${font}`}
      style={{ fontFamily: selectedFont }}
    >
      {/* Header */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-t-4 border-blue-600">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{full_name}</h1>
          <div className="text-blue-600 text-lg font-semibold mb-3 flex items-center justify-center gap-2">
            {job_title}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            {email && <div>📧 {email}</div>}
            {phone_number && <div>📞 {phone_number}</div>}
            {github && <div>🔗 GitHub: {github}</div>}
            {linkedin && <div>💼 {linkedin}</div>}
            {website && <div>🌐 Portfolio: {website}</div>}
          </div>
        </div>
      </div>

      {/* Date and Address */}
      <div className="mb-6 text-sm text-gray-700 bg-white p-4 rounded-lg shadow-sm">
        
        <div className="mb-4">
          <div className="font-semibold">{hiring_manager_name}</div>
          <p className="text-gray-700 font-medium">
            {job_title || "[Job title]"}
          </p>
          <div className="font-semibold">{company_name}</div>
        </div>
      </div>

      {/* Salutation */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <p className="text-gray-900">
          {introduction.greet_text || `Dear ${hiring_manager_name},`}
        </p>
      </div>

      {/* Introduction */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg shadow-sm">
        <p className="text-gray-700 leading-relaxed">
          {introduction.intro_para ||
            `I am excited to apply for the ${job_title} role at ${company_name}. With [X] years of experience in full-stack development, a passion for clean code, and a proven track record of delivering scalable software solutions, I am eager to contribute to your engineering team and help drive innovative technology solutions that make a real impact.`}
        </p>
      </div>

      {/* Body Paragraphs */}
      <div className="space-y-6 mb-6">
        {body ? (
          <p>{body}</p>
        ) : (
          <>
            <div className="p-4 bg-purple-50 border-l-4 border-purple-600 rounded-r-lg shadow-sm">
              <h3 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                🚀 Project Leadership & Problem Solving
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Throughout my career, I have led cross-functional teams in agile
                environments, mentored junior developers, and collaborated
                closely with product managers and designers to deliver
                user-centric solutions. My recent achievements include [specific
                accomplishments like performance improvements, successful
                product launches, or architecture implementations] that directly
                contributed to business objectives and user satisfaction.
              </p>
              <div className="bg-white p-3 rounded border border-purple-200">
                <div className="text-xs text-purple-600 font-semibold mb-1">
                  KEY ACHIEVEMENTS:
                </div>
                <div className="text-sm text-gray-600">
                  • Performance Optimization • Team Leadership • Architecture
                  Design
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 border-l-4 border-orange-600 rounded-r-lg shadow-sm">
              <h3 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                🎯 Innovation & Continuous Learning
              </h3>
              <p className="text-gray-700 leading-relaxed">
                What excites me about {company_name} is your commitment to
                [specific technology/mission/values]. I am particularly
                interested in [mention specific projects, technologies, or
                company initiatives]. My passion for continuous learning,
                staying current with emerging technologies, and contributing to
                open-source projects aligns perfectly with your culture of
                innovation and technical excellence.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Technical Skills Highlight */}


      {/* Closing */}
      <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-600 rounded-r-lg shadow-sm">
        <p className="text-gray-700 leading-relaxed">
          {closing.text ||
            `I would welcome the opportunity to discuss how my technical skills, problem-solving approach, and passion for building exceptional software can contribute to ${company_name}'s engineering goals. I have included links to my GitHub profile and portfolio showcasing recent projects. Thank you for your consideration.`}
        </p>
      </div>

      {/* Signature */}
      <div className="text-right bg-white p-4 rounded-lg shadow-sm">
        <div className="mb-4">
          <p className="text-gray-900">Best regards,</p>
        </div>
        <div className="font-semibold text-gray-900">{full_name}</div>
        <div className="text-sm text-blue-600 mt-2">
          💻 Building the Future, One Line at a Time
        </div>
      </div>
    </div>
  );
};

export default TemplateSoftwareEngineerCL;
