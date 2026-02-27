import React from "react";
import { getFontClass } from "@/app/utils/font";

const CreativeCoverLetter = ({ coverLetterData = {}, font }) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    body = "",
    closing = {},
  } = coverLetterData;

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedBody =
    body ||
    `🎨 **My Design Philosophy**
I believe great design tells a story, solves problems, and creates emotional connections. My approach combines user research, creative thinking, and iterative design to craft experiences that users love.

📊 **Recent Achievements**
→ Redesigned e-commerce platform resulting in 35% increase in conversions
→ Led design thinking workshops for cross-functional teams of 20+ members
→ Created design system adopted across 5 product lines

🌟 **What Excites Me About Your Company**
Your recent campaign for sustainable brands resonates deeply with my values. I admire how you balance creative excellence with social impact, and I'd love to bring my expertise in user experience and visual storytelling to your team.

🚀 **My Creative Toolkit**
→ User Research & Testing
→ Figma, Sketch, Adobe Creative Suite
→ Prototyping & Wireframing
→ Design Systems & Style Guides
→ Front-end Development (HTML/CSS/JS)

💡 **Beyond the Pixels**
When I'm not designing, you'll find me exploring local art galleries, experimenting with analog photography, or mentoring emerging designers through local meetups.`;

const selectedFont = getFontClass(font);
  return (
    <div 
     style={{ fontFamily: selectedFont, minHeight: "11in" }}
    className="max-w-4xl mx-auto bg-white overflow-hidden shadow-2xl">
      {/* Creative Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute top-12 right-8 w-8 h-8 bg-yellow-300 rounded-full"></div>
          <div className="absolute bottom-6 left-12 w-12 h-12 bg-pink-300 rounded-full"></div>
          <div className="absolute bottom-8 right-16 w-6 h-6 bg-green-300 rounded-full"></div>
        </div>

        <div className="relative p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-wide">
                {profile.full_name || "[First Name]"}
              </h1>
              <div className="flex items-center space-x-2 text-lg">
                <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  ✨ {recipient.job_title || "Creative Designer"}
                </span>
              </div>
            </div>

            <div className="mt-6 md:mt-0 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="space-y-2 text-sm">
                {profile.email && (
                  <p className="flex items-center">
                    <span className="mr-3">📧</span> {profile.email}
                  </p>
                )}
                {profile.phone_number && (
                  <p className="flex items-center">
                    <span className="mr-3">📱</span> {profile.phone_number}
                  </p>
                )}
                {profile.portfolio && (
                  <p className="flex items-center">
                    <span className="mr-3">🎨</span> {profile.portfolio}
                  </p>
                )}
                {profile.instagram && (
                  <p className="flex items-center">
                    <span className="mr-3">📷</span> {profile.instagram}
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
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl">
            <p className="text-sm text-gray-600 font-medium">{date}</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="bg-gradient-to-l from-blue-100 to-indigo-100 p-4 rounded-xl">
              <p className="font-bold text-gray-900 text-lg">
                {recipient.hiring_manager_name || "[Hiring Manager]"}
              </p>
              <p className=" text-gray-800 text-lg">
                {recipient.job_title || "[Hiring Manager]"}
              </p>

              <p className="font-bold text-purple-600 text-lg">
                {recipient.company_name || "[Company Name]"}
              </p>
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pink-400 to-purple-600 rounded-full"></div>
          <div className="pl-8">
            <p className="text-2xl">
              <span className="text-gray-600">Hey there,</span>
              <span className="font-bold text-gray-900">
                {" "}
                {recipient.hiring_manager_name || "Creative Team"}
              </span>
              <span className="text-3xl">! 🎨</span>
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="relative bg-gradient-to-r from-yellow-50 via-pink-50 to-purple-50 p-8 rounded-2xl border-2 border-dashed border-purple-300">
          <div className="absolute -top-3 left-6 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">
            ✨ INTRODUCTION
          </div>
          <p className="text-lg leading-relaxed text-gray-800 pt-2">
            {introduction.intro_para ||
              `Design isn't just what I do—it's how I see the world. I'm thrilled to apply for the ${
                recipient.job_title || "[Job Title]"
              } position at ${recipient.company_name || "[Company Name]"}.`}
          </p>
        </div>

        {/* Body */}
        <div className="space-y-6">
          {formattedBody.split("\n\n").map((section, index) => (
            <p key={index} className="text-gray-700 leading-relaxed text-lg">
              {section}
            </p>
          ))}
          {closing.text.split("\n\n").map((section, index) => (
            <p key={index} className="text-lg text-gray-600 leading-relaxed mb-6">
              {section ||
                "I'd love to show you my portfolio and discuss how my creative vision can help your team innovate and inspire!"}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreativeCoverLetter;
