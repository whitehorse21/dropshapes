import React from "react";
import { getFontClass } from "@/app/utils/font";

const ProfessionalCoverLetter = ({ coverLetterData = {}, font }) => {
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
    <div  style={{ fontFamily: selectedFont, minHeight: "11in" }} className="max-w-4xl mx-auto bg-white text-gray-800 p-8 font-serif leading-relaxed space-y-6 shadow-lg border border-gray-200">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.full_name}</h1>
        <div className="text-sm text-gray-600 space-y-1">
          {profile.address && (
            <p>
              {profile.address}
              {profile.city ? `, ${profile.city}` : ""}{" "}
              {profile.state ? `${profile.state}` : ""}{" "}
              {profile.zipCode || ""}
            </p>
          )}
          {(profile.email || profile.phone) && (
            <p>
              {profile.email && <span className="mr-4">📧 {profile.email}</span>}
              {profile.phone && <span>📞 {profile.phone}</span>}
            </p>
          )}
          {(profile.website || profile.linkedin) && (
            <p>
              {profile.website && (
                <a
                  href={profile.website}
                  className="text-blue-600 hover:underline mr-4"
                >
                  🌐 Portfolio
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  className="text-blue-600 hover:underline"
                >
                  💼 LinkedIn
                </a>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="text-right text-sm text-gray-600">{date}</div>

      {/* Recipient Info */}
      {(recipient.hiring_manager_name || recipient.company_name) && (
        <div className="space-y-1 text-sm">
          {recipient.hiring_manager_name && (
            <p className="font-semibold">{recipient.hiring_manager_name}</p>
          )}
          {recipient.job_title && <p>Hiring Manager</p>}
          {recipient.company_name && (
            <p className="font-semibold">{recipient.company_name}</p>
          )}
          {recipient.company_address && <p>{recipient.company_address}</p>}
        </div>
      )}

      {/* Subject Line */}
      {recipient.job_title && (
        <div className="font-semibold text-gray-900">
          <p>
            <strong>Re: Application for {recipient.job_title} Position</strong>
          </p>
        </div>
      )}

      {/* Salutation */}
      {recipient.hiring_manager_name && (
        <div>
          <p>
            Dear {introduction.title || ""} {recipient.hiring_manager_name},
          </p>
        </div>
      )}

      {/* Introduction */}
      {introduction.intro_para && (
        <div className="leading-relaxed">
          <p>{introduction.intro_para}</p>
        </div>
      )}

      {/* Body */}
      {body && (
        <div className="space-y-4 leading-relaxed">
          {body.split("\n\n").map((paragraph, index) => (
            <p key={index} className="text-justify">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* Closing */}
      {closing.text && (
        <div className="space-y-4">
          <p className="leading-relaxed text-justify">{closing.text}</p>

          <div className="pt-4">
            <p>Sincerely,</p>
            <div className="mt-8 mb-2">
              <div className="border-b border-gray-400 w-48"></div>
            </div>
            <p className="font-semibold">{profile.full_name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalCoverLetter;
