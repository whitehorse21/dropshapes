import React from "react";
import { getFontClass } from "@/app/utils/font";

const ExecutiveTemplate = ({ coverLetterData = {}, font }) => {
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

  const styles = {
    container: {
      fontFamily: selectedFont || "'Crimson Text', 'Times New Roman', serif",
      maxWidth: "8.5in",
      margin: "0 auto",
      padding: "0.75in",
      lineHeight: "1.6",
      color: "#1a1a1a",
      backgroundColor: "#ffffff",
      minHeight: "11in",
      boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      position: "relative",
    },
    letterhead: {
      textAlign: "center",
      borderBottom: "3px solid #8B5A3C",
      paddingBottom: "20px",
      marginBottom: "30px",
      background: "linear-gradient(135deg, #f8f6f4 0%, #ffffff 100%)",
    },
    name: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#8B5A3C",
      marginBottom: "8px",
      letterSpacing: "1px",
    },
    title: {
      fontSize: "16px",
      fontWeight: "500",
      color: "#5D4E75",
      marginBottom: "15px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    contactInfo: {
      fontSize: "14px",
      color: "#666666",
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      flexWrap: "wrap",
    },
    date: {
      textAlign: "right",
      fontSize: "14px",
      color: "#666666",
      marginBottom: "30px",
      fontStyle: "italic",
    },
    recipientSection: {
      marginBottom: "30px",
      lineHeight: "1.4",
    },
    recipientInfo: {
      fontSize: "15px",
      color: "#333333",
      fontWeight: "500",
    },
    salutation: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#333333",
      marginBottom: "25px",
    },
    introduction: {
      fontSize: "16px",
      color: "#2C3E50",
      marginBottom: "25px",
      textAlign: "justify",
      lineHeight: "1.7",
      fontWeight: "400",
      paddingLeft: "10px",
      borderLeft: "4px solid #8B5A3C",
    },
    highlights: {
      fontSize: "15px",
      color: "#333333",
      marginBottom: "25px",
      lineHeight: "1.7",
      whiteSpace: "pre-line",
    },
    closing: {
      fontSize: "15px",
      color: "#333333",
      marginBottom: "40px",
      textAlign: "justify",
      lineHeight: "1.7",
    },
    signature: {
      marginTop: "40px",
    },
    signatureLine: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#8B5A3C",
      marginBottom: "5px",
    },
    signatureTitle: {
      fontSize: "14px",
      color: "#666666",
      fontStyle: "italic",
    },
    watermark: {
      position: "absolute",
      bottom: "30px",
      right: "40px",
      fontSize: "10px",
      color: "#cccccc",
      opacity: "0.7",
      transform: "rotate(-45deg)",
    },
  };


  return (
    <div style={styles.container} >
      {/* Letterhead */}
      <div style={styles.letterhead}>
        <div style={styles.name}>
          {profile.full_name || ""}
        </div>
        {recipient.job_title && <div style={styles.title}>{recipient.job_title}</div>}
        <div style={styles.contactInfo}>
          {profile.phone && <span>{profile.phone}</span>}
          {profile.phone && profile.email && <span>•</span>}
          {profile.email && <span>{profile.email}</span>}
          {(profile.phone || profile.email) && profile.linkedin && <span>•</span>}
          {profile.linkedin && <span>{profile.linkedin}</span>}
        </div>
      </div>

      {/* Date */}
      <div style={styles.date}>{date}</div>

      {/* Recipient */}
      <div style={styles.recipientSection}>
        <div style={styles.recipientInfo}>
          {recipient.hiring_manager_name && <>{recipient.hiring_manager_name}<br/></>}
          {recipient.company_name && <>{recipient.company_name}<br/></>}
          {recipient.job_title && <>{recipient.job_title}</>}
        </div>
      </div>

      {/* Salutation */}
      {recipient.hiringManagerName && (
        <div style={styles.salutation}>
          Dear {recipient.hiringManagerName},
        </div>
      )}

      {/* Introduction */}
      {introduction && (
        <div style={styles.introduction}>{introduction.intro_para}</div>
      )}

      {/* Body */}
      {body && <div style={styles.highlights}>{body}</div>}

      {/* Closing */}
      {closing && <div style={styles.closing}>{closing.text}</div>}

      {/* Signature */}
      <div style={styles.signature}>
        <div style={styles.signatureLine}>Sincerely,</div>
        <div style={styles.signatureLine}>
         {profile.full_name || ""}
        </div>
      </div>

    </div>
  );
};

export default ExecutiveTemplate;
