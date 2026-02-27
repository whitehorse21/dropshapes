import React from "react";
import { getFontClass } from "@/app/utils/font";

const NursingTemplate = ({ coverLetterData = {}, font }) => {
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
    className="max-w-4xl mx-auto bg-white text-gray-800 font-sans leading-relaxed shadow-2xl border border-gray-200">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 text-white p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 text-6xl">🏥</div>
          <div className="absolute bottom-4 left-4 text-4xl">💙</div>
        </div>

        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 tracking-wide">
                {profile.full_name}
              </h1>
              {profile.license && (
                <div className="flex flex-wrap items-center space-x-4 text-blue-200">
                  <span className="bg-blue-800/50 px-3 py-1 rounded-full text-sm font-medium">
                    {profile.license}
                  </span>
                </div>
              )}
              {profile.certifications && (
                <p className="mt-2 text-blue-100">{profile.certifications}</p>
              )}
            </div>

            <div className="mt-6 md:mt-0 bg-blue-800/30 backdrop-blur-sm rounded-xl p-4 border border-blue-700">
              <div className="space-y-2 text-sm">
                {profile.email && (
                  <p className="flex items-center">
                    <span className="mr-3">📧</span> {profile.email}
                  </p>
                )}
                {profile.phone && (
                  <p className="flex items-center">
                    <span className="mr-3">📱</span> {profile.phone}
                  </p>
                )}
                {profile.city && (
                  <p className="flex items-center">
                    <span className="mr-3">📍</span> {profile.city}
                  </p>
                )}
                {profile.license && (
                  <p className="flex items-center">
                    <span className="mr-3">🏥</span> {profile.license}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Date and Recipient */}
        <div className="flex flex-col md:flex-row md:justify-between items-start">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 font-medium">{date}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              {recipient.hiring_manager_name && (
                <p className="font-bold text-gray-900">
                  {recipient.hiring_manager_name}
                </p>
              )}
              {recipient.job_title && (
                <p className="text-gray-600">{recipient.job_title}</p>
              )}
              {recipient.company_name && (
                <p className="font-bold text-teal-700">{recipient.company_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Greeting */}
        {recipient.hiring_manager_name && (
          <div className="bg-gradient-to-r from-blue-50 via-teal-50 to-green-50 p-6 rounded-xl border border-blue-200">
            <p className="text-lg">
              Dear{" "}
              <span className="font-bold text-teal-600">
                {recipient.hiring_manager_name}
              </span>
              ,
            </p>
          </div>
        )}

        {/* Introduction */}
        {introduction.intro_para && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-8 rounded-xl border border-teal-200">
            <div className="flex items-start space-x-4">
              <div className="bg-teal-600 text-white p-3 rounded-lg">
                <span className="text-xl">🩺</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-3">
                  Nursing Professional Summary
                </h3>
                <p className="text-lg leading-relaxed text-gray-800">
                  {introduction.intro_para}
                </p>
              </div>
            </div>
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
                    className="bg-blue-50 border border-teal-200 rounded-lg p-6"
                  >
                    <h3 className="font-bold text-gray-900 mb-3">
                      {header.replace(/\*\*/g, "")}
                    </h3>
                    <div className="space-y-2">
                      {content.map((line, lineIndex) => (
                        <p key={lineIndex} className="text-gray-800 leading-relaxed">
                          {line.replace(/•/g, "→")}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={index}
                    className="bg-blue-50 p-6 rounded-lg border-l-4 border-teal-600"
                  >
                    <p className="text-gray-800 leading-relaxed text-lg">
                      {section}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* Closing */}
        {closing.text && (
            <div className="relative">
              <p className="text-lg text-gray-800 mx-4  leading-relaxed mb-6">{closing.text}</p>
            </div>
        )}

        {/* Footer */}
        
      </div>
    </div>
  );
};

export default NursingTemplate;
