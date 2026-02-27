"use client";

import * as csc from "country-state-city";
import { useState, useRef, useEffect } from "react";
import FormField from "../FormField";
import type { CoverLetterData } from "@/app/utils/coverLetterService";

interface CoverLetterProfileProps {
  coverLetterData: CoverLetterData;
  onUpdate: (updates: Partial<CoverLetterData>) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
const phoneRegex = /^\d{10,15}$/;

function validateField(field: string, value: string): string {
  if (["full_name", "email"].includes(field) && !value) {
    return "This field is required";
  }
  if (field === "email" && value && !emailRegex.test(value)) {
    return "Enter a valid email address";
  }
  if (field === "phone_number" && value && !phoneRegex.test(value)) {
    return "Enter a valid phone number (10-15 digits)";
  }
  if (
    ["linkedin_profile", "portfolio_website"].includes(field) &&
    value &&
    !urlRegex.test(value)
  ) {
    return "Enter a valid URL";
  }
  return "";
}

export default function CoverLetterProfile({
  coverLetterData,
  onUpdate,
}: CoverLetterProfileProps) {
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setLocationDropdownOpen(false);
      }
    }
    if (locationDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [locationDropdownOpen]);

  const countries = csc.Country.getAllCountries().map((country) => ({
    label: country.name,
    value: country.isoCode,
    ...country,
  }));

  const handleBlur = (field: string, value: string) => {
    const trimmedValue = value.trim();
    if (
      field === "full_name" ||
      field === "email" ||
      field === "phone_number"
    ) {
      onUpdate({
        profile: { ...coverLetterData.profile, [field]: trimmedValue },
      });
    } else if (
      field === "linkedin_profile" ||
      field === "portfolio_website" ||
      field === "location"
    ) {
      onUpdate({
        profile: { ...coverLetterData.profile, [field]: trimmedValue },
      });
    }
    const error = validateField(field, trimmedValue);
    setErrors((prev) => ({ ...prev, [field]: error }));
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleInputChange = (
    field: string,
    value: string,
    isRecipient = false,
  ) => {
    const finalValue = field === "email" ? value.trim().toLowerCase() : value;
    if (isRecipient) {
      onUpdate({
        recipient: { ...coverLetterData.recipient, [field]: finalValue },
      });
    } else {
      onUpdate({
        profile: { ...coverLetterData.profile, [field]: finalValue },
      });
    }
    if (touchedFields[field]) {
      const error = validateField(field, finalValue);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const profile = coverLetterData?.profile ?? {};
  const recipient = coverLetterData?.recipient ?? {};

  return (
    <div className="cover-letter-create-step-content">
      <h5 className="text-xl font-semibold mb-4">Profile</h5>
      <form className="space-y-8">
        <div className="cover-letter-create-step-content__section space-y-4">
          <h6 className="text-lg font-medium border-b border-[var(--glass-border)] pb-2">
            Personal Information
          </h6>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Full Name"
              name="full_name"
              value={profile.full_name ?? ""}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              onBlur={() => handleBlur("full_name", profile.full_name ?? "")}
              required
              error={touchedFields.full_name ? errors.full_name : ""}
              placeholder="Enter your full name"
              className="min-w-0"
            />
            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={profile.email ?? ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onBlur={() => handleBlur("email", profile.email ?? "")}
              required
              error={touchedFields.email ? errors.email : ""}
              placeholder="Enter your email address"
              className="min-w-0"
            />
            <FormField
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={profile.phone_number ?? ""}
              onChange={(e) =>
                handleInputChange("phone_number", e.target.value)
              }
              onBlur={() =>
                handleBlur("phone_number", profile.phone_number ?? "")
              }
              placeholder="Enter your phone number"
              helperText="Optional - 10 to 15 digits"
              error={touchedFields.phone_number ? errors.phone_number : ""}
              className="min-w-0"
            />
            <div className="min-w-0" ref={locationDropdownRef}>
              <label className="block text-sm font-medium mb-2">Location</label>
              <div className="cover-letter-country-dropdown">
                <button
                  type="button"
                  className="cover-letter-country-dropdown__trigger"
                  onClick={() => setLocationDropdownOpen((o) => !o)}
                  aria-expanded={locationDropdownOpen}
                  aria-haspopup="listbox"
                  aria-label="Select country"
                >
                  <span className="cover-letter-country-dropdown__value">
                    {profile.location || "Select a country"}
                  </span>
                  <span
                    className="cover-letter-country-dropdown__chevron"
                    aria-hidden
                  >
                    ▼
                  </span>
                </button>
                {locationDropdownOpen && (
                  <ul
                    className="cover-letter-country-dropdown__list"
                    role="listbox"
                    aria-label="Country options"
                  >
                    <li role="option">
                      <button
                        type="button"
                        className="cover-letter-country-dropdown__option"
                        onClick={() => {
                          handleInputChange("location", "");
                          setLocationDropdownOpen(false);
                        }}
                      >
                        Select a country
                      </button>
                    </li>
                    {countries.map((country) => (
                      <li key={country.value} role="option" aria-selected={profile.location === country.label}>
                        <button
                          type="button"
                          className="cover-letter-country-dropdown__option"
                          onClick={() => {
                            handleInputChange("location", country.label);
                            setLocationDropdownOpen(false);
                          }}
                        >
                          {country.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="cover-letter-create-step-content__section space-y-4">
          <h6 className="text-lg font-medium border-b border-[var(--glass-border)] pb-2">
            Professional Links
          </h6>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="LinkedIn Profile"
              name="linkedin_profile"
              value={profile.linkedin_profile ?? ""}
              onChange={(e) =>
                handleInputChange("linkedin_profile", e.target.value)
              }
              onBlur={() =>
                handleBlur("linkedin_profile", profile.linkedin_profile ?? "")
              }
              placeholder="https://linkedin.com/in/yourprofile"
              helperText="Optional - Your LinkedIn profile URL"
              error={
                touchedFields.linkedin_profile ? errors.linkedin_profile : ""
              }
              className="min-w-0"
            />
            <FormField
              label="Portfolio Website"
              name="portfolio_website"
              value={profile.portfolio_website ?? ""}
              onChange={(e) =>
                handleInputChange("portfolio_website", e.target.value)
              }
              onBlur={() =>
                handleBlur("portfolio_website", profile.portfolio_website ?? "")
              }
              placeholder="https://yourwebsite.com"
              helperText="Optional - Your portfolio or personal website"
              error={
                touchedFields.portfolio_website ? errors.portfolio_website : ""
              }
              className="min-w-0"
            />
          </div>
        </div>

        <div className="cover-letter-create-step-content__section space-y-4">
          <h6 className="text-lg font-medium border-b border-[var(--glass-border)] pb-2">
            Recipient Information
          </h6>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Company Name"
              name="company_name"
              value={recipient.company_name ?? ""}
              onChange={(e) =>
                handleInputChange("company_name", e.target.value, true)
              }
              placeholder="Enter company name"
              className="min-w-0"
            />
            <FormField
              label="Hiring Manager Name"
              name="hiring_manager_name"
              value={recipient.hiring_manager_name ?? ""}
              onChange={(e) =>
                handleInputChange("hiring_manager_name", e.target.value, true)
              }
              placeholder="Enter hiring manager's name"
              helperText="Optional - If known"
              className="min-w-0"
            />
            <FormField
              label="Job Title"
              name="job_title"
              value={recipient.job_title ?? ""}
              onChange={(e) =>
                handleInputChange("job_title", e.target.value, true)
              }
              placeholder="Enter the job title you're applying for"
              className="min-w-0"
            />
            <FormField
              label="Company Address"
              name="company_address"
              value={recipient.company_address ?? ""}
              onChange={(e) =>
                handleInputChange("company_address", e.target.value, true)
              }
              placeholder="Enter company address"
              helperText="Optional"
              className="min-w-0"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
