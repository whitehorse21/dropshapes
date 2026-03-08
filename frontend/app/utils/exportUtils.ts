/**
 * Export utilities: HTML and DOCX for resume and cover letter.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import type { ResumeData } from "@/app/utils/resumeService";
import type { CoverLetterData } from "@/app/utils/coverLetterService";

const HTML_BASE_STYLE = `
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; font-family: system-ui, sans-serif; font-size: 11pt; line-height: 1.4; color: #1a1a1a; background: #fff; }
  @media print { body { padding: 12mm; } }
`;

/** Resume template CSS – matches preview (globals.css .resume-tpl-*) */
const RESUME_PREVIEW_CSS = `
.resume-tpl-container{max-width:800px;min-width:280px;min-height:400px;margin:0 auto;padding:20px;line-height:1.4;background:#fff;box-shadow:0 0 10px rgba(0,0,0,0.1);-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.resume-tpl-content-with-sidebar{display:flex;gap:16px;width:100%;}
.resume-tpl-sidebar{width:30%;min-width:0;padding:12px;border-radius:6px;}
.resume-tpl-main{flex:1;min-width:0;padding:0;}
.resume-tpl-single-column{max-width:100%;}
.resume-tpl-header-info h1{margin:0;font-size:24pt;font-weight:700;}
.resume-tpl-header-info div{margin-top:4px;font-size:16pt;}
.resume-tpl-section-title{font-weight:700;font-size:14pt;border-bottom:1px solid #d9d9d9;padding-bottom:4px;margin:0 0 8px;}
.resume-tpl-body{margin:4px 0 0;font-size:12pt;line-height:1.45;}
.resume-tpl-section{margin-bottom:16px;}
.resume-tpl-section:last-child{margin-bottom:0;}
.resume-tpl-item{margin-top:8px;}
.resume-tpl-item:first-child{margin-top:0;}
.resume-tpl-dates{font-size:0.9em;color:#555;}
.resume-tpl-contact-inline{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;margin-top:4px;}
.resume-tpl-contact-inline-inner{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;}
.resume-tpl-contact-section{display:flex;flex-direction:column;gap:4px;padding:4px 0;}
.resume-tpl-contact-section a{color:inherit;text-decoration:underline;}
.resume-tpl-skills-list,.resume-tpl-languages-list{display:flex;flex-direction:column;gap:6px;}
.resume-tpl-skill-bar,.resume-tpl-language-bar{background:#f1f3f5;border-radius:4px;height:8px;margin-top:2px;overflow:hidden;}
.resume-tpl-tags{display:flex;flex-wrap:wrap;gap:6px;}
.resume-tpl-tag{padding:2px 8px;border-radius:10px;font-size:0.9em;}
.resume-tpl-list{margin:4px 0 0;padding-left:18px;}
.resume-tpl-list li{margin:4px 0;}
@media print{.resume-tpl-container{box-shadow:none;max-width:100%;width:8.27in;min-height:11.7in;padding:0.5in;}.resume-tpl-content-with-sidebar{display:flex!important;flex-direction:row!important;gap:16px!important;width:100%!important;}.resume-tpl-sidebar{width:30%!important;min-width:30%!important;flex-shrink:0!important;}.resume-tpl-main{flex:1!important;min-width:0!important;}}
`;

/** Cover letter template CSS – matches preview (globals.css .cover-letter-render*) */
const COVER_LETTER_PREVIEW_CSS = `
.cover-letter-render{min-height:200px;}
.cover-letter-render--document .cover-letter-render__paper{padding:clamp(28px,5vw,48px);}
.cover-letter-render--document .cover-letter-render__inner{max-width:680px;margin:0 auto;}
.cover-letter-render__letterhead{margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid rgba(0,0,0,0.1);}
.cover-letter-render__letterhead-name{font-size:1.1rem;font-weight:700;margin-bottom:6px;}
.cover-letter-render__letterhead-contact{font-size:0.9rem;color:#555;display:flex;flex-wrap:wrap;gap:8px 16px;}
.cover-letter-render__letterhead-contact a{color:inherit;text-decoration:none;}
.cover-letter-render__title{font-size:1.35rem;font-weight:700;margin:0 0 20px 0;line-height:1.3;}
.cover-letter-render__recipient{font-size:0.95rem;margin-bottom:24px;line-height:1.5;color:#444;}
.cover-letter-render__recipient div{margin-bottom:2px;}
.cover-letter-render__address{white-space:pre-wrap;margin-top:4px;}
.cover-letter-render__body{font-size:11pt;line-height:1.65;}
.cover-letter-render__greeting{margin:0 0 14px 0;}
.cover-letter-render__intro{margin:0 0 18px 0;}
.cover-letter-render__main{margin-bottom:18px;white-space:pre-wrap;}
.cover-letter-render__main p{margin:0 0 12px 0;}
.cover-letter-render__main p:last-child{margin-bottom:0;}
.cover-letter-render__closing{margin:24px 0 8px 0;}
.cover-letter-render__signature{margin:16px 0 0 0;font-weight:600;font-size:1rem;}
.cover-letter-preview-document,.cover-letter-print-area{margin:0;padding:0;width:100%;max-width:100%;background:#fff;color:#1a1a1a;}
.cover-letter-tpl{max-width:8.5in;margin:0 auto;padding:0.75in;line-height:1.6;background:#fff;}
.cover-letter-tpl h1{margin:0 0 0.5rem 0;font-size:1.5rem;font-weight:700;}
.cover-letter-tpl p{margin:0 0 0.5rem 0;}
`;

export type ExportPreviewType = "resume" | "cover-letter";

/**
 * Export the content of an element as a standalone HTML file (download).
 * When type is provided, embeds the same CSS as the preview so the file looks like the app preview.
 */
export function exportAsHtml(
  element: HTMLElement | null,
  filename: string,
  type?: ExportPreviewType
): void {
  if (!element) return;
  const title = filename.replace(/\.html$/i, "").trim();
  const fullHtml =
    type === "resume" || type === "cover-letter"
      ? buildFullHtmlForExport(element, type, title || (type === "resume" ? "Resume" : "Cover-Letter"))
      : (() => {
          const content = element.innerHTML;
          return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title || "Export")}</title>
  <style>${HTML_BASE_STYLE}</style>
</head>
<body>
${content}
</body>
</html>`;
        })();
  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  downloadBlob(blob, filename.endsWith(".html") ? filename : `${filename}.html`);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build full HTML string with base + preview CSS (same as used for HTML export).
 * Used for both HTML download and DOCX-from-HTML so DOCX keeps preview style.
 */
function buildFullHtmlForExport(
  element: HTMLElement,
  type: ExportPreviewType,
  title: string
): string {
  const content = element.innerHTML;
  const previewCss =
    type === "resume" ? RESUME_PREVIEW_CSS : COVER_LETTER_PREVIEW_CSS;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title.replace(/\.(html|docx)$/i, ""))}</title>
  <style>${HTML_BASE_STYLE}${previewCss}</style>
</head>
<body>
${content}
</body>
</html>`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export resume data as a .docx file (download).
 */
export async function exportResumeAsDocx(
  data: ResumeData,
  filename: string
): Promise<void> {
  const pi = data.personalInfo || {};
  const name = [pi.firstName, pi.lastName].filter(Boolean).join(" ") || "Resume";
  const title = data.resume_title || name;

  const children: Paragraph[] = [];

  // Title / name
  children.push(
    new Paragraph({
      children: [new TextRun({ text: name, bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    })
  );

  // Contact line
  const contactParts = [
    pi.email,
    pi.phone,
    pi.location,
    pi.linkedin,
    pi.website,
  ].filter(Boolean);
  if (contactParts.length) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join(" • "),
            size: 22,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  if (data.profession) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.profession, italics: true })],
        spacing: { after: 120 },
      })
    );
  }

  if (data.summary) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Summary", bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: data.summary })],
        spacing: { after: 120 },
      })
    );
  }

  if (data.experience?.length) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Experience", bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
      })
    );
    for (const exp of data.experience) {
      const roleCompany = [exp.role, exp.company].filter(Boolean).join(" at ");
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(" – ");
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: roleCompany || "Experience", bold: true }),
          ],
          spacing: { before: 100, after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: [dates, exp.location].filter(Boolean).join(" • "),
              italics: true,
            }),
          ],
          spacing: { after: 40 },
        })
      );
      if (exp.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: exp.description })],
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  if (data.education?.length) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Education", bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
      })
    );
    for (const edu of data.education) {
      const line = [edu.degree, edu.field, edu.institution]
        .filter(Boolean)
        .join(", ");
      const dates = [edu.startDate, edu.endDate].filter(Boolean).join(" – ");
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line || "Education", bold: true })],
          spacing: { before: 100, after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: dates, italics: true })],
          spacing: { after: 80 },
        })
      );
    }
  }

  if (data.skills?.length) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Skills", bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: data.skills.map((s) => s.name).join(", "),
          }),
        ],
        spacing: { after: 120 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(
    blob,
    filename.endsWith(".docx") ? filename : `${filename}.docx`
  );
}

/**
 * Export cover letter data as a .docx file (download).
 */
export async function exportCoverLetterAsDocx(
  data: CoverLetterData,
  filename: string
): Promise<void> {
  const children: Paragraph[] = [];

  const title = data.cover_letter_title || "Cover Letter";
  children.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 28 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  if (data.recipient) {
    const r = data.recipient;
    const recipientLines = [
      r.company_name,
      r.hiring_manager_name ? `Attn: ${r.hiring_manager_name}` : null,
      r.job_title,
      r.company_address,
    ].filter(Boolean);
    if (recipientLines.length) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: recipientLines.join("\n"), size: 22 }),
          ],
          spacing: { after: 200 },
        })
      );
    }
  }

  if (data.introduction?.greet_text) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.introduction.greet_text })],
        spacing: { after: 120 },
      })
    );
  }
  if (data.introduction?.intro_para) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.introduction.intro_para })],
        spacing: { after: 200 },
      })
    );
  }

  if (data.body) {
    const paras = data.body.split(/\n\n+/).filter(Boolean);
    for (const p of paras) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: p.trim() })],
          spacing: { after: 120 },
        })
      );
    }
  }

  if (data.closing?.text) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.closing.text })],
        spacing: { before: 200, after: 400 },
      })
    );
  }

  if (data.profile?.full_name) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.profile.full_name, bold: true })],
        spacing: { after: 80 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(
    blob,
    filename.endsWith(".docx") ? filename : `${filename}.docx`
  );
}

const EXPORT_HTML_TO_DOCX_API = "/api/export-html-to-docx";

/**
 * Export resume as DOCX from the current preview DOM (keeps preview style).
 * Builds full HTML with preview CSS and converts via API.
 */
export async function exportResumeAsDocxFromHtml(
  element: HTMLElement | null,
  filename: string,
  _type: "resume" = "resume"
): Promise<void> {
  if (!element) return;
  const name = filename.replace(/\.(html|docx)$/i, "").trim() || "Resume";
  const html = buildFullHtmlForExport(element, "resume", name);
  const res = await fetch(EXPORT_HTML_TO_DOCX_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html, filename: name }),
  });
  if (!res.ok) throw new Error("Failed to export DOCX");
  const blob = await res.blob();
  downloadBlob(blob, name.endsWith(".docx") ? name : `${name}.docx`);
}

/**
 * Export cover letter as DOCX from the current preview DOM (keeps preview style).
 */
export async function exportCoverLetterAsDocxFromHtml(
  element: HTMLElement | null,
  filename: string,
  _type: "cover-letter" = "cover-letter"
): Promise<void> {
  if (!element) return;
  const name = filename.replace(/\.(html|docx)$/i, "").trim() || "Cover-Letter";
  const html = buildFullHtmlForExport(element, "cover-letter", name);
  const res = await fetch(EXPORT_HTML_TO_DOCX_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html, filename: name }),
  });
  if (!res.ok) throw new Error("Failed to export DOCX");
  const blob = await res.blob();
  downloadBlob(blob, name.endsWith(".docx") ? name : `${name}.docx`);
}
