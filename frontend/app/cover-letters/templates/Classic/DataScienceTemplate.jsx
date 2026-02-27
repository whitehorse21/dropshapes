import React from "react";
import { getFontClass } from "@/app/utils/font";

const DataScienceTemplate = ({ coverLetterData = {} ,font}) => {
  const {
    profile = {},
    recipient = {},
    introduction = {},
    body = "",
    closing = "",
    date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  } = coverLetterData;


  const styles = {
    container: {
      fontFamily: "'Source Code Pro', 'Roboto Mono', monospace",
      maxWidth: "8.5in",
      margin: "0 auto",
      padding: "0.75in",
      lineHeight: "1.6",
      color: "#2c3e50",
      backgroundColor: "#ffffff",
      minHeight: "11in",
      boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      position: "relative"
    },
    letterhead: {
      textAlign: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "25px",
      marginBottom: "30px",
      borderRadius: "10px",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)"
    },
    name: {
      fontSize: "28px",
      fontWeight: "700",
      marginBottom: "8px",
      letterSpacing: "1px"
    },
    title: {
      fontSize: "16px",
      fontWeight: "500",
      marginBottom: "15px",
      opacity: "0.9"
    },
    contactInfo: {
      fontSize: "13px",
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      flexWrap: "wrap",
      opacity: "0.95"
    },
    profileLinks: {
      fontSize: "12px",
      marginTop: "10px",
      opacity: "0.9"
    },
    date: {
      textAlign: "right",
      fontSize: "14px",
      color: "#7f8c8d",
      marginBottom: "30px",
      fontWeight: "500",
      fontFamily: "'Open Sans', sans-serif"
    },
    recipientSection: {
      marginBottom: "30px",
      lineHeight: "1.5",
      padding: "20px",
      backgroundColor: "#f8f9fa",
      borderLeft: "4px solid #667eea",
      borderRadius: "0 8px 8px 0"
    },
    recipientInfo: {
      fontSize: "15px",
      color: "#2c3e50",
      fontWeight: "600",
      fontFamily: "'Open Sans', sans-serif"
    },
    salutation: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#2c3e50",
      marginBottom: "25px",
      fontFamily: "'Open Sans', sans-serif"
    },
    introduction: {
      fontSize: "16px",
      color: "#2c3e50",
      marginBottom: "25px",
      textAlign: "justify",
      lineHeight: "1.7",
      fontWeight: "500",
      padding: "20px",
      backgroundColor: "#f0f3ff",
      border: "1px solid #e3e8ff",
      borderRadius: "8px",
      borderLeft: "4px solid #667eea",
      fontFamily: "'Open Sans', sans-serif"
    },
    bodyText: {
      fontSize: "15px",
      color: "#2c3e50",
      marginBottom: "25px",
      textAlign: "justify",
      lineHeight: "1.7",
      fontFamily: "'Open Sans', sans-serif"
    },
    highlights: {
      fontSize: "14px",
      color: "#2c3e50",
      marginBottom: "25px",
      lineHeight: "1.8",
      whiteSpace: "pre-line",
      backgroundColor: "#fafbfc",
      padding: "25px",
      border: "1px solid #e1e8ed",
      borderRadius: "8px",
      fontFamily: "'Open Sans', sans-serif"
    },
    closing: {
      fontSize: "15px",
      color: "#2c3e50",
      marginBottom: "40px",
      textAlign: "justify",
      lineHeight: "1.7",
      fontWeight: "500",
      fontFamily: "'Open Sans', sans-serif"
    },
    signature: {
      marginTop: "40px",
      textAlign: "left"
    },
    signatureLine: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#667eea",
      marginBottom: "5px",
      fontFamily: "'Open Sans', sans-serif"
    },
    signatureTitle: {
      fontSize: "14px",
      color: "#7f8c8d",
      fontWeight: "600",
      fontFamily: "'Open Sans', sans-serif"
    },
    techBox: {
      backgroundColor: "#e8f4fd",
      border: "2px solid #3498db",
      borderRadius: "8px",
      padding: "15px",
      margin: "20px 0",
      textAlign: "center"
    },
    techText: {
      color: "#2980b9",
      fontWeight: "700",
      fontSize: "14px",
      fontFamily: "'Source Code Pro', monospace"
    },
    skillsBadges: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginTop: "10px",
      justifyContent: "center"
    },
    badge: {
      backgroundColor: "#667eea",
      color: "white",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600"
    },
    watermark: {
      position: "absolute",
      bottom: "30px",
      right: "40px",
      fontSize: "10px",
      color: "#667eea",
      opacity: "0.3",
      transform: "rotate(-45deg)",
      fontWeight: "700"
    }
  };

  const selectedFont = getFontClass(font);
  return (
    <div style={styles.container} className={`${selectedFont}`}>
      {/* Data Science Letterhead */}
      <div style={styles.letterhead}>
        <div style={styles.name}>
          {profile.full_name} 
        </div>
        <div style={styles.title}>
          {recipient.job_title}
        </div>
        <div style={styles.contactInfo}>
          <span>{profile.phone}</span>
          <span>•</span>
          <span>{profile.email}</span>
        </div>
      {profile.github && profile.linkedin &&  <div style={styles.profileLinks}>
          GitHub: {profile.github} • LinkedIn: {profile.linkedin}
        </div>}
      </div>

      {/* Date */}
      <div style={styles.date}>
        {date}
      </div>

      {/* Recipient */}
      <div style={styles.recipientSection}>
        <div style={styles.recipientInfo}>
          {recipient.hiring_manager_name}<br/>
          {recipient.company_name}
        </div>
      </div>

      {/* Salutation */}
      <div style={styles.salutation}>
        Dear {recipient.hiring_manager_name},
      </div>

      {/* Introduction */}
      <div style={styles.introduction}>
        {introduction.intro_para}
      </div>

     

      {/* Body - Technical Experience and Achievements */}
      <div style={styles.highlights}>
        {body.replace(/\\n/g, "\n")}
      </div>

      {/* Closing */}
      <div style={styles.closing}>
        {closing.text}
      </div>

      {/* Signature */}
      <div style={styles.signature}>
        <div style={styles.signatureLine}>
          Best regards,
        </div>
        <div style={styles.signatureLine}>
          {profile.full_name}
        </div>
        <div style={styles.signatureTitle}>
          {recipient.job_title}
        </div>
      </div>
    </div>
  );
};

export default DataScienceTemplate;
