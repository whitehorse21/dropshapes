import React from "react";
import { getFontClass } from "@/app/utils/font";

const ProjectManagerTemplate = ({ coverLetterData = {},font }) => {
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
      fontFamily: selectedFont || "'Segoe UI', 'Roboto', sans-serif",
      maxWidth: "8.5in",
      margin: "0 auto",
      padding: "0.75in",
      lineHeight: "1.6",
      color: "#2c3e50",
      backgroundColor: "#ffffff",
      minHeight: "11in",
      boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      position: "relative",
    },
    letterhead: {
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      color: "white",
      padding: "30px",
      marginBottom: "30px",
      borderRadius: "8px",
      textAlign: "center",
      position: "relative",
    },
    professionalAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: "linear-gradient(to right, #3498db, #2ecc71, #f39c12, #e74c3c)",
    },
    name: {
      fontSize: "26px",
      fontWeight: "700",
      marginBottom: "8px",
      letterSpacing: "1px",
    },
    title: { fontSize: "16px", fontWeight: "500", marginBottom: "15px", opacity: 0.9 },
    certifications: {
      fontSize: "13px",
      marginBottom: "15px",
      backgroundColor: "rgba(255,255,255,0.2)",
      padding: "8px 15px",
      borderRadius: "20px",
      display: "inline-block",
    },
    contactInfo: {
      fontSize: "13px",
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      flexWrap: "wrap",
      opacity: 0.9,
    },
    date: {
      textAlign: "right",
      fontSize: "14px",
      color: "#7f8c8d",
      marginBottom: "30px",
      fontWeight: "500",
    },
    recipientSection: {
      marginBottom: "30px",
      padding: "20px",
      backgroundColor: "#f8f9fa",
      borderLeft: "4px solid #2c3e50",
      borderRadius: "0 8px 8px 0",
    },
    recipientInfo: { fontSize: "15px", color: "#2c3e50", fontWeight: "600" },
    salutation: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#2c3e50",
      marginBottom: "25px",
    },
    introduction: {
      fontSize: "16px",
      color: "#2c3e50",
      marginBottom: "25px",
      textAlign: "justify",
      lineHeight: "1.7",
      padding: "20px",
      backgroundColor: "#ecf0f1",
      borderLeft: "4px solid #3498db",
      borderRadius: "0 8px 8px 0",
    },
    highlights: {
      fontSize: "14px",
      color: "#2c3e50",
      marginBottom: "25px",
      lineHeight: "1.8",
      whiteSpace: "pre-line",
      backgroundColor: "#fdfdfe",
      padding: "25px",
      border: "1px solid #bdc3c7",
      borderRadius: "8px",
    },
    closing: {
      fontSize: "15px",
      color: "#2c3e50",
      marginBottom: "40px",
      textAlign: "justify",
      lineHeight: "1.7",
    },
    signature: { marginTop: "40px" },
    signatureLine: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#2c3e50",
      marginBottom: "5px",
    },
    signatureTitle: { fontSize: "14px", color: "#7f8c8d", fontWeight: "500" },
    projectStats: {
      backgroundColor: "#e8f6f3",
      border: "2px solid #16a085",
      borderRadius: "8px",
      padding: "15px",
      margin: "20px 0",
      textAlign: "center",
    },
    statsText: { color: "#138d75", fontWeight: "700", fontSize: "14px" },
    methodologyBadges: {
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      margin: "15px 0",
      flexWrap: "wrap",
    },
    badge: {
      backgroundColor: "#3498db",
      color: "white",
      padding: "6px 12px",
      borderRadius: "15px",
      fontSize: "11px",
      fontWeight: "600",
    },
    watermark: {
      position: "absolute",
      bottom: "30px",
      right: "40px",
      fontSize: "10px",
      color: "#2c3e50",
      opacity: 0.2,
      transform: "rotate(-45deg)",
      fontWeight: "700",
    },
  };

  return (
    <div style={styles.container}>
      {/* Letterhead */}
      <div style={styles.letterhead}>
        <div style={styles.professionalAccent}></div>
        <div style={styles.name}>{profile.full_name}</div>
        <div style={styles.title}>{recipient.job_title || "Senior Project Manager & Team Leader"}</div>
        {profile.certifications && (
          <div style={styles.certifications}>{profile.certifications}</div>
        )}
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
        <div style={styles.salutation}>Dear {recipient.hiring_manager_name},</div>
      )}

      {/* Introduction */}
      {introduction.intro_para && <div style={styles.introduction}>{introduction.intro_para}</div>}



      {/* Body */}
      {body && <div style={styles.highlights}>{body}</div>}

      {/* Closing */}
      {closing.text && <div style={styles.closing}>{closing.text}</div>}

      {/* Signature */}
      <div style={styles.signature}>
        <div style={styles.signatureLine}>Sincerely,</div>
        <div style={styles.signatureLine}>{profile.full_name}</div>
      </div>

    </div>
  );
};

export default ProjectManagerTemplate;
