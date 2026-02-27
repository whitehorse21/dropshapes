import React from "react";
import { getFontClass } from "@/app/utils/font";

const FinanceCoverLetter = ({ coverLetterData = {} , font}) => {
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
    className="max-w-4xl mx-auto bg-white text-gray-800 font-serif leading-relaxed shadow-2xl border border-gray-300">
      {/* Professional Finance Header */}
      <div
        className="bg-gradient-to-r from-navy-900 to-blue-900 text-white p-8"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-wide">
              {profile.full_name || ""}
            </h1>
            <div className="flex items-center space-x-4 text-blue-200">
              {profile.certifications && (
                <span className="bg-blue-800/50 px-3 py-1 rounded-full text-sm font-medium">
                  {profile.certifications}
                </span>
              )}
              {recipient.job_title && (
                <span className="bg-blue-800/50 px-3 py-1 rounded-full text-sm font-medium">
                  💼 {recipient.job_title}
                </span>
              )}
            </div>
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
              {profile.linkedin && (
                <p className="flex items-center">
                  <span className="mr-3">💼</span> {profile.linkedin}
                </p>
              )}
              {profile.city && profile.state && (
                <p className="flex items-center">
                  <span className="mr-3">📍</span> {profile.city},{" "}
                  {profile.state}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Professional Content Layout */}
      <div className="p-8 space-y-8">
        {/* Date and Recipient */}
        <div className="flex flex-col md:flex-row md:justify-between items-start border-b border-gray-200 pb-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">{date}</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              {recipient.hiring_manager_name && (
                <p className="font-bold text-gray-900 text-lg">
                  {recipient.hiring_manager_name}
                </p>
              )}
              {recipient.job_title && (
                <p className="text-gray-600">{recipient.job_title}</p>
              )}
              {recipient.company_name && (
                <p className="font-bold text-blue-700 text-lg">
                  {recipient.company_name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Salutation */}
        {recipient.hiring_manager_name && (
          <div className="border-l-4 border-blue-600 pl-6">
            <p className="text-lg font-medium">
              Dear {recipient.hiring_manager_name},
            </p>
          </div>
        )}

        {/* Executive Summary Box */}
        {introduction.intro_para && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white p-3 rounded-lg">
                <span className="text-xl">📊</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">
                  Executive Summary
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
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-600">
              <p className="text-gray-800 leading-relaxed text-lg">
                {body.replace("\n\n")}
              </p>
            </div>
          </div>
        )}

        {/* Closing */}
        {closing.text && (
          <div className="space-y-6">
            <div className="border-l-4 border-blue-400 pl-6">
              <p className="text-lg text-gray-800 leading-relaxed">{closing.text}</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceCoverLetter;
