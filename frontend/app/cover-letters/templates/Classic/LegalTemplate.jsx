import React from "react";

const LegalTemplate = ({ coverLetterData = {} ,font}) => {
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

  const styles = {
    container: {
      fontFamily: font,
      maxWidth: "8.5in",
      margin: "0 auto",
      padding: "1in",
      lineHeight: "1.6",
      color: "#1a1a1a",
      backgroundColor: "#ffffff",
      minHeight: "11in",
      boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      position: "relative",
    },
    letterhead: {
      textAlign: "center",
      borderBottom: "3px double #2c3e50",
      paddingBottom: "25px",
      marginBottom: "35px",
      backgroundColor: "#f8f9fa",
    },
    name: {
      fontSize: "26px",
      fontWeight: "700",
      color: "#2c3e50",
      marginBottom: "8px",
      letterSpacing: "0.5px",
    },
    title: {
      fontSize: "16px",
      fontWeight: "500",
      color: "#34495e",
      marginBottom: "15px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    barInfo: {
      fontSize: "13px",
      color: "#5a6c7d",
      marginBottom: "10px",
      fontStyle: "italic",
    },
    contactInfo: {
      fontSize: "14px",
      color: "#5a6c7d",
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      flexWrap: "wrap",
    },
    date: {
      textAlign: "right",
      fontSize: "14px",
      color: "#5a6c7d",
      marginBottom: "30px",
      fontWeight: "500",
    },
    recipientSection: {
      marginBottom: "30px",
      lineHeight: "1.5",
      padding: "20px",
      border: "1px solid #bdc3c7",
      borderRadius: "5px",
      backgroundColor: "#f9f9f9",
    },
    recipientInfo: {
      fontSize: "15px",
      color: "#2c3e50",
      fontWeight: "600",
    },
    salutation: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#2c3e50",
      marginBottom: "25px",
    },
    introduction: {
      fontSize: "15px",
      color: "#2c3e50",
      marginBottom: "25px",
      textAlign: "justify",
      lineHeight: "1.8",
      fontWeight: "400",
      paddingLeft: "20px",
      borderLeft: "4px solid #2c3e50",
      backgroundColor: "#f8f9fa",
      padding: "20px",
      borderRadius: "0 5px 5px 0",
    },
    highlights: {
      fontSize: "14px",
      color: "#2c3e50",
      marginBottom: "25px",
      lineHeight: "1.8",
      whiteSpace: "pre-line",
      backgroundColor: "#fdfdfd",
      padding: "25px",
      border: "1px solid #ddd",
      borderRadius: "5px",
    },
    closing: {
      fontSize: "15px",
      color: "#2c3e50",
      marginBottom: "40px",
      textAlign: "justify",
      lineHeight: "1.7",
    },
    signature: {
      marginTop: "50px",
      textAlign: "left",
    },
    signatureLine: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#2c3e50",
      marginBottom: "5px",
    },
    signatureTitle: {
      fontSize: "13px",
      color: "#5a6c7d",
      fontStyle: "italic",
    },
    legalFooter: {
      marginTop: "40px",
      padding: "15px",
      backgroundColor: "#f8f9fa",
      border: "1px solid #ddd",
      borderRadius: "5px",
      fontSize: "11px",
      color: "#6c757d",
      textAlign: "center",
      fontStyle: "italic",
    },
    barAdmissionBox: {
      backgroundColor: "#e8f4f8",
      border: "1px solid #3498db",
      borderRadius: "5px",
      padding: "12px",
      margin: "20px 0",
      textAlign: "center",
      fontSize: "13px",
      fontWeight: "600",
      color: "#2980b9",
    },
    watermark: {
      position: "absolute",
      bottom: "30px",
      right: "40px",
      fontSize: "10px",
      color: "#ddd",
      opacity: "0.6",
      transform: "rotate(-45deg)",
    },
  };

  return (
    <div style={styles.container}>
      {/* Legal Letterhead */}
      <div style={styles.letterhead}>
        <div style={styles.name}>
          {profile.full_name}, J.D.
        </div>
        <div style={styles.title}>{recipient.job_title}</div>
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
          {recipient.hiring_manager_name && <>{recipient.hiring_manager_name}, Esq.<br/></>}
          {recipient.job_title && <>{recipient.job_title}<br/></>}
          {recipient.company_name && <>{recipient.company_name}</>}
        </div>
      </div>

      {/* Salutation */}
      {recipient.hiring_manager_name && (
        <div style={styles.salutation}>
          Dear {recipient.hiring_manager_name},
        </div>
      )}

      {/* Introduction */}
      {introduction.intro_para && (
        <div style={styles.introduction}>{introduction.intro_para}</div>
      )}

      {/* Bar Admission Highlight */}
      {profile.bar_admission && (
        <div style={styles.barAdmissionBox}>
          {profile.bar_admission}
        </div>
      )}

      {/* Body */}
      {body && <div style={styles.highlights}>{body}</div>}

      {/* Closing */}
      {closing.text && <div style={styles.closing}>{closing.text}</div>}

      {/* Signature */}
      <div style={styles.signature}>
        <div style={styles.signatureLine}>Respectfully submitted,</div>
        <div style={styles.signatureLine}>{profile.full_name}, J.D.</div>
      </div>
    </div>
  );
};

export default LegalTemplate;
