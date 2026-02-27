import React from "react";
import { getFontClass } from "@/app/utils/font";

const ModernCoverLetter = ({ coverLetterData = {} , font}) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    body = "",
    closing = {},
    date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  } = coverLetterData;
  const selectedFont = getFontClass(font);

  return (
    <div 
    
     style={{ fontFamily: selectedFont, minHeight: "11in" }}
    className="max-w-4xl mx-auto bg-white text-gray-800 font-sans leading-relaxed shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
            {recipient.job_title && (
              <p className="text-blue-100 text-lg font-medium">
                {recipient.job_title} Candidate
              </p>
            )}
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="space-y-1 text-sm">
              {profile.email && (
                <p className="flex items-center justify-end md:justify-start">
                  <span className="mr-2">📧</span> {profile.email}
                </p>
              )}
              {profile.phone && (
                <p className="flex items-center justify-end md:justify-start">
                  <span className="mr-2">📱</span> {profile.phone}
                </p>
              )}
              {profile.linkedin && (
                <p className="flex items-center justify-end md:justify-start">
                  <span className="mr-2">🔗</span> {profile.linkedin}
                </p>
              )}
              {profile.website && (
                <p className="flex items-center justify-end md:justify-start">
                  <span className="mr-2">🌐</span> {profile.website}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Date and Recipient */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{date}</p>
          </div>
          <div className="text-right">
            {recipient.hiring_manager_name && (
              <p className="font-semibold text-gray-900">
                {recipient.hiring_manager_name}
              </p>
            )}
            {recipient.job_title && (
              <p className="text-gray-600">{recipient.job_title}</p>
            )}
            {recipient.company_name && (
              <p className="font-semibold text-blue-600">
                {recipient.company_name}
              </p>
            )}
          </div>
        </div>

        {/* Modern Greeting */}
        {recipient.hiring_manager_name && (
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-lg">
              <span className="text-gray-600">Hello</span>
              <span className="font-semibold text-gray-900">
                {" "}
                {recipient.hiring_manager_name}
              </span>
            </p>
          </div>
        )}

        {/* Introduction */}
        {introduction.intro_para && (
          <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
            <p className="text-lg leading-relaxed">
              {introduction.intro_para}
            </p>
          </div>
        )}

        {/* Body */}
        {body && (
          <div className="space-y-6">
            {body.split("\n\n").map((section, index) => {
              if (section.includes("**")) {
                const lines = section.split("\n");
                const header = lines[0];
                const content = lines.slice(1);

                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      {header.replace(/\*\*/g, "").replace(/🚀|💡|🎯/g, (match) => (
                        <span className="mr-2 text-2xl">{match}</span>
                      ))}
                    </h3>
                    <div className="space-y-2">
                      {content.map((line, lineIndex) => (
                        <p
                          key={lineIndex}
                          className="text-gray-700 leading-relaxed"
                        >
                          {line.replace(/•/g, "→")}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              } else {
                return (
                  <p
                    key={index}
                    className="text-gray-700 leading-relaxed text-lg"
                  >
                    {section}
                  </p>
                );
              }
            })}
          </div>
        )}

        {/* Closing */}
        {closing.text && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg">
            <p className="text-lg leading-relaxed text-gray-800 mb-4">
              {closing.text}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Best regards,</p>
                <p className="text-xl font-bold text-gray-900">
                  {profile.full_name}
                </p>
              </div>
            </div>
          </div>
        )}        

      </div>
    </div>
  );
};

export default ModernCoverLetter;
