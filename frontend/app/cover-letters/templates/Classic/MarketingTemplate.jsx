import React from "react";
import { getFontClass } from "@/app/utils/font";

const MarketingCoverLetter = ({ coverLetterData = {}, font }) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    body = "",
    closing = "",
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
    className="max-w-4xl mx-auto bg-white text-gray-800 font-sans leading-relaxed shadow-xl border border-gray-200">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-wide">
              {profile.full_name}
            </h1>
            <div className="flex items-center space-x-3">
              <span className="bg-white/20 px-4 py-1 rounded-full backdrop-blur-sm font-medium">
                📈 Marketing Professional
              </span>
              <span className="bg-white/20 px-4 py-1 rounded-full backdrop-blur-sm font-medium">
                🎯 Growth Specialist
              </span>
            </div>
          </div>

          <div className="mt-6 md:mt-0 bg-white/15 backdrop-blur-sm rounded-xl p-4">
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
              {profile.linkedin && (
                <p className="flex items-center">
                  <span className="mr-3">💼</span> {profile.linkedin}
                </p>
              )}
              {profile.portfolio && (
                <p className="flex items-center">
                  <span className="mr-3">🌐</span> {profile.portfolio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Date and Recipient */}
        <div className="flex flex-col md:flex-row md:justify-between items-start">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-600 font-medium">{date}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-gradient-to-l from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
              {recipient.hiring_manager_name && (
                <p className="font-bold text-gray-900 text-lg">
                  {recipient.hiring_manager_name}
                </p>
              )}
              {recipient.job_title && (
                <p className="text-gray-600">{recipient.job_title}</p>
              )}
              {recipient.company_name && (
                <p className="font-bold text-purple-600 text-lg">
                  {recipient.company_name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Greeting */}
        {recipient.hiring_manager_name && (
          <div className="relative bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 p-6 rounded-2xl border-l-4 border-orange-400">
            <div className="absolute -top-3 left-6 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              🎯 CAMPAIGN BRIEF
            </div>
            <p className="text-xl pt-2">
              <span className="text-gray-600">Hello</span>
              <span className="font-bold text-gray-900">
                {" "}
                {recipient.hiring_manager_name}
              </span>
              <span className="text-gray-600">!</span>
            </p>
            <p className="text-gray-600 mt-1">
              Ready to amplify your brand's impact? 📢
            </p>
          </div>
        )}

        {/* Introduction */}
        {introduction.intro_para && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-2xl border border-green-200">
            <div className="flex items-start space-x-4">
              <div className="bg-green-500 text-white p-3 rounded-full">
                <span className="text-xl">🚀</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">
                  Marketing Impact Statement
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

                const marketingColors = [
                  "from-blue-100 to-cyan-100 border-blue-300 bg-blue-500",
                  "from-green-100 to-emerald-100 border-green-300 bg-green-500",
                  "from-purple-100 to-violet-100 border-purple-300 bg-purple-500",
                  "from-orange-100 to-yellow-100 border-orange-300 bg-orange-500",
                ];

                const colorSet =
                  marketingColors[index % marketingColors.length];
                const [bgGradient, borderColor, badgeColor] =
                  colorSet.split(" ");

                return (
                  <div
                    key={index}
                    className={`bg-gradient-to-r ${bgGradient} border-2 border-dashed ${borderColor} rounded-2xl p-6 relative`}
                  >
                    <div
                      className={`absolute -top-3 left-6 ${badgeColor} text-white px-4 py-1 rounded-full text-sm font-bold flex items-center`}
                    >
                      <span className="mr-2">
                        {header.match(/🎯|📊|🚀|💡/)?.[0] || "📈"}
                      </span>
                      {header
                        .replace(/\*\*/g, "")
                        .replace(/🎯|📊|🚀|💡/g, "")
                        .trim()}
                    </div>
                    <div className="space-y-3 pt-2">
                      {content.map((line, lineIndex) => (
                        <div key={lineIndex} className="flex items-start">
                          {line.includes("•") && (
                            <span className="text-purple-600 mr-3 font-bold text-lg">
                              →
                            </span>
                          )}
                          <p className="text-gray-800 leading-relaxed flex-1">
                            {line.replace("•", "").trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } else {
                return (
                  <p
                    key={index}
                    className="text-gray-700 leading-relaxed text-lg bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300"
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
          <div className="relative">
            <p className="text-lg leading-relaxed mb-5 mx-4">{closing.text}</p>
          </div>
          )}
      </div>
    </div>
  );
};

export default MarketingCoverLetter;
