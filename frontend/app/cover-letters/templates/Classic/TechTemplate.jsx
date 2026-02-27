import React from "react";
import { getFontClass } from "@/app/utils/font";

const TechTemplate = ({ coverLetterData = {}, font }) => {
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
      fontFamily: selectedFont ||  "'Inter', 'Helvetica Neue', Arial, sans-serif",
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
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "30px",
      marginBottom: "30px",
      borderRadius: "12px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    },
    name: {
      fontSize: "26px",
      fontWeight: "700",
      marginBottom: "8px",
      letterSpacing: "1px",
    },
    title: {
      fontSize: "16px",
      fontWeight: "500",
      marginBottom: "15px",
      opacity: "0.9",
    },
    contactInfo: {
      fontSize: "13px",
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      flexWrap: "wrap",
      opacity: "0.95",
    },
    date: {
      textAlign: "right",
      fontSize: "14px",
      color: "#718096",
      marginBottom: "30px",
      fontWeight: "500",
    },
    recipientSection: {
      marginBottom: "30px",
      padding: "20px",
      backgroundColor: "#f7fafc",
      borderLeft: "4px solid #667eea",
      borderRadius: "0 8px 8px 0",
    },
    recipientInfo: { fontSize: "15px", color: "#2d3748", fontWeight: "600" },
    salutation: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#2d3748",
      marginBottom: "25px",
    },
    introduction: {
      fontSize: "16px",
      color: "#2d3748",
      marginBottom: "25px",
      textAlign: "justify",
      lineHeight: "1.7",
      padding: "20px",
      backgroundColor: "#edf2f7",
      borderLeft: "4px solid #667eea",
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
    signatureLine: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#667eea",
      marginBottom: "5px",
    },
    signatureTitle: {
      fontSize: "14px",
      color: "#718096",
      fontWeight: "500",
    },
    watermark: {
      position: "absolute",
      bottom: "30px",
      right: "40px",
      fontSize: "10px",
      color: "#667eea",
      opacity: "0.3",
      transform: "rotate(-45deg)",
      fontWeight: "700",
    },
  };

  return (
    <div style={styles.container}>
      {/* Letterhead */}
      <div style={styles.letterhead}>
        <div style={styles.name}>{profile.full_name}</div>
        <div style={styles.title}>{recipient.job_title || "Full Stack Software Engineer"}</div>
        <div style={styles.contactInfo}>
          {profile.phone && <span>{profile.phone}</span>}
          {profile.email && (
            <>
              <span>•</span>
              <span>{profile.email}</span>
            </>
          )}
        </div>
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
        <div style={styles.salutation}>Hi {recipient.hiring_manager_name},</div>
      )}

      {/* Introduction */}
      {introduction.intro_para && <div style={styles.introduction}>{introduction.intro_para}</div>}

      {/* Body */}
      {body && <div style={styles.highlights}>{body}</div>}

      {/* Closing */}
      {closing.text && <div style={styles.closing}>{closing.text}</div>}

      {/* Signature */}
      <div style={styles.signature}>
        <div style={styles.signatureLine}>Best regards,</div>
        <div style={styles.signatureLine}>{profile.full_name}</div>
      </div>
    </div>
  );
};

export default TechTemplate;
