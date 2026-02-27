import React from "react";
import { getFontClass } from "@/app/utils/font";

const RemoteTemplate = ({ coverLetterData = {} , font}) => {
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

  const styles = {
    container: {
      fontFamily: selectedFont || "'Roboto', 'Helvetica Neue', Arial, sans-serif",
      maxWidth: "8.5in",
      margin: "0 auto",
      padding: "0.75in",
      lineHeight: "1.6",
      color: "#2d3748",
      backgroundColor: "#ffffff",
      minHeight: "11in",
      boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      position: "relative",
    },
    letterhead: {
      background: "linear-gradient(135deg, #4299e1 0%, #3182ce 50%, #2c5282 100%)",
      color: "white",
      padding: "25px",
      marginBottom: "30px",
      borderRadius: "12px",
      textAlign: "center",
      position: "relative",
    },
    cloudPattern: {
      position: "absolute",
      top: "10px",
      right: "20px",
      fontSize: "20px",
      opacity: "0.3",
    },
    name: { fontSize: "26px", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.5px" },
    title: { fontSize: "16px", fontWeight: "500", marginBottom: "15px", opacity: "0.9" },
    contactInfo: {
      fontSize: "13px",
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      flexWrap: "wrap",
      opacity: "0.9",
    },
    timezone: {
      fontSize: "12px",
      marginTop: "8px",
      backgroundColor: "rgba(255,255,255,0.2)",
      padding: "4px 12px",
      borderRadius: "15px",
      display: "inline-block",
    },
    date: { textAlign: "right", fontSize: "14px", color: "#718096", marginBottom: "30px", fontWeight: "500" },
    recipientSection: {
      marginBottom: "30px",
      padding: "20px",
      backgroundColor: "#f7fafc",
      borderLeft: "4px solid #4299e1",
      borderRadius: "0 8px 8px 0",
    },
    recipientInfo: { fontSize: "15px", color: "#2d3748", fontWeight: "600" },
    salutation: { fontSize: "16px", fontWeight: "700", color: "#2d3748", marginBottom: "25px" },
    introduction: {
      fontSize: "16px",
      color: "#2d3748",
      marginBottom: "25px",
      textAlign: "justify",
      lineHeight: "1.7",
      padding: "20px",
      backgroundColor: "#ebf8ff",
      borderLeft: "4px solid #4299e1",
      borderRadius: "0 8px 8px 0",
    },
    highlights: {
      fontSize: "14px",
      color: "#2d3748",
      marginBottom: "25px",
      lineHeight: "1.8",
      whiteSpace: "pre-line",
      backgroundColor: "#f7fafc",
      padding: "25px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
    },
    closing: {
      fontSize: "15px",
      color: "#2d3748",
      marginBottom: "40px",
      textAlign: "justify",
      lineHeight: "1.7",
    },
    signature: { marginTop: "40px" },
    signatureLine: { fontSize: "18px", fontWeight: "700", color: "#4299e1", marginBottom: "5px" },
    signatureTitle: { fontSize: "14px", color: "#718096", fontWeight: "500" },
    remoteStats: {
      backgroundColor: "#f0fff4",
      border: "2px solid #38a169",
      borderRadius: "8px",
      padding: "15px",
      margin: "20px 0",
      textAlign: "center",
    },
    statsText: { color: "#2f855a", fontWeight: "700", fontSize: "14px" },
    availabilityBadge: {
      display: "inline-block",
      backgroundColor: "#ed8936",
      color: "white",
      padding: "6px 12px",
      borderRadius: "15px",
      fontSize: "11px",
      fontWeight: "600",
      margin: "10px 0",
    },
    watermark: {
      position: "absolute",
      bottom: "30px",
      right: "40px",
      fontSize: "10px",
      color: "#4299e1",
      opacity: "0.3",
      transform: "rotate(-45deg)",
      fontWeight: "700",
    },
  };

  return (
    <div style={styles.container}>
      {/* Remote Letterhead */}
      <div style={styles.letterhead}>
        <div style={styles.name}>{profile.full_name}</div>
        <div style={styles.title}>{profile.title || "Remote Work Specialist & Digital Collaborator"}</div>
        <div style={styles.contactInfo}>
          {profile.phone && <span>{profile.phone}</span>}
          {profile.email && (
            <>
              <span>•</span>
              <span>{profile.email}</span>
            </>
          )}
          {profile.linkedin && (
            <>
              <span>•</span>
              <span>{profile.linkedin}</span>
            </>
          )}
        </div>
        {profile.timezone && (
          <div style={styles.timezone}>🕐 Available: {profile.timezone}</div>
        )}
      </div>

      {/* Date */}
      <div style={styles.date}>{date}</div>

      {/* Recipient */}
      {(recipient.hiring_manager_name || recipient.company_name) && (
        <div style={styles.recipientSection}>
          <div style={styles.recipientInfo}>
            {recipient.hiring_manager_name && <>{recipient.hiring_manager_name}<br/></>}
            {recipient.department && <>{recipient.department}<br/></>}
            {recipient.company_name}
          </div>
        </div>
      )}

      {/* Salutation */}
      {recipient.hiring_manager_name && (
        <div style={styles.salutation}>Hello {recipient.hiring_manager_name},</div>
      )}

      {/* Introduction */}
      {introduction.intro_para && <div style={styles.introduction}>{introduction.intro_para}</div>}


      {/* Body */}
      {body && <div style={styles.highlights}>{body}</div>}

      {/* Closing */}
      {closing.text && <div style={styles.closing}>{closing.text}</div>}

      {/* Signature */}
      <div style={styles.signature}>
        <div style={styles.signatureLine}>Best regards</div>
        <div style={styles.signatureLine}>{profile.full_name}</div>
      </div>     
    </div>
  );
};

export default RemoteTemplate;
