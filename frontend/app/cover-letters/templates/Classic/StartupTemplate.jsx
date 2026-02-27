import React from "react";
import { getFontClass } from "@/app/utils/font";

const StartupTemplate = ({ coverLetterData = {},font }) => {
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
      color: "#1a202c",
      backgroundColor: "#ffffff",
      minHeight: "11in",
      boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      position: "relative",
    },
    letterhead: {
      background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #ff9ff3 100%)",
      color: "white",
      padding: "25px",
      marginBottom: "30px",
      borderRadius: "15px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    },
    dynamicPattern: {
      position: "absolute",
      top: "-50px",
      right: "-50px",
      width: "150px",
      height: "150px",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.1)",
      transform: "rotate(45deg)",
    },
    name: {
      fontSize: "28px",
      fontWeight: "800",
      marginBottom: "8px",
      letterSpacing: "0.5px",
    },
    title: {
      fontSize: "16px",
      fontWeight: "600",
      marginBottom: "15px",
      opacity: "0.95",
    },
    contactInfo: {
      fontSize: "14px",
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      flexWrap: "wrap",
      opacity: "0.9",
    },
    motto: {
      fontSize: "12px",
      marginTop: "10px",
      fontStyle: "italic",
      opacity: "0.8",
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
      backgroundColor: "#fff5f5",
      borderLeft: "4px solid #ff6b6b",
      borderRadius: "0 10px 10px 0",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    recipientInfo: { fontSize: "15px", color: "#1a202c", fontWeight: "600" },
    salutation: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1a202c",
      marginBottom: "25px",
    },
    introduction: {
      fontSize: "16px",
      color: "#1a202c",
      marginBottom: "25px",
      textAlign: "justify",
      lineHeight: "1.7",
      padding: "20px",
      backgroundColor: "#f0fff4",
      borderLeft: "4px solid #48bb78",
      borderRadius: "0 10px 10px 0",
      fontWeight: "500",
    },
    highlights: {
      fontSize: "14px",
      color: "#1a202c",
      marginBottom: "25px",
      lineHeight: "1.8",
      whiteSpace: "pre-line",
      backgroundColor: "#fafafa",
      padding: "25px",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
    },
    closing: {
      fontSize: "15px",
      color: "#1a202c",
      marginBottom: "40px",
      textAlign: "justify",
      lineHeight: "1.7",
      fontWeight: "500",
    },
    signature: { marginTop: "40px" },
    signatureLine: { fontSize: "18px", fontWeight: "800", color: "#ff6b6b", marginBottom: "5px" },
    signatureTitle: { fontSize: "14px", color: "#718096", fontWeight: "600" },
    startupMetrics: {
      backgroundColor: "#f0f9ff",
      border: "2px solid #0ea5e9",
      borderRadius: "10px",
      padding: "15px",
      margin: "20px 0",
      textAlign: "center",
    },
    metricsText: { color: "#0369a1", fontWeight: "700", fontSize: "14px" },
    energyBadge: {
      display: "inline-block",
      backgroundColor: "#10b981",
      color: "white",
      padding: "8px 16px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      margin: "10px 0",
    },
    watermark: {
      position: "absolute",
      bottom: "30px",
      right: "40px",
      fontSize: "10px",
      color: "#ff6b6b",
      opacity: "0.3",
      transform: "rotate(-45deg)",
      fontWeight: "700",
    },
  };

  return (
    <div style={styles.container}>
      {/* Startup Letterhead */}
      <div style={styles.letterhead}>
        <div style={styles.dynamicPattern}></div>
        <div style={styles.name}>{profile.full_name}</div>
        <div style={styles.title}>{profile.title || "Startup Product Manager & Growth Expert"}</div>
        <div style={styles.contactInfo}>
          {profile.phone && <span>{profile.phone}</span>}
          {profile.email && (
            <>
              <span>•</span>
              <span>{profile.email}</span>
            </>
          )}
          {profile.twitter && (
            <>
              <span>•</span>
              <span>{profile.twitter}</span>
            </>
          )}
        </div>
        <div style={styles.motto}>
          {profile.motto || `"Move fast, break things, build amazing products"`}
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
        <div style={styles.salutation}>Hey {recipient.hiring_manager_name}!</div>
      )}

      {/* Introduction */}
      {introduction.intro_para && <div style={styles.introduction}>{introduction.intro_para}</div>}
      

      {/* Body */}
      {body && <div style={styles.highlights}>{body}</div>}

      {/* Closing */}
      {closing.text && <div style={styles.closing}>{closing.text}</div>}

      {/* Signature */}
      <div style={styles.signature}>
        <div style={styles.signatureLine}>{profile.full_name}</div>
        <div style={styles.signatureTitle}>{recipient.job_title || "Startup Product Manager"}</div>
      </div>
    </div>
  );
};

export default StartupTemplate;
