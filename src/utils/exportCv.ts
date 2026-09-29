import { CVData } from '../types/cv';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
} from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * Checks if running inside an iframe or sandboxed environment
 */
export const isSandboxedIframe = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    return (
      window.self !== window.top ||
      Boolean(window.frameElement) ||
      window.location !== window.parent.location
    );
  } catch {
    // Cross-origin exception guarantees sandboxed/iframe context
    return true;
  }
};

/**
 * Native Print Trigger
 * Opens native browser print dialog, or directly downloads PDF in sandboxed environments
 */
export const triggerPrint = (fallbackCv?: CVData): void => {
  if (isSandboxedIframe()) {
    // In sandboxed iframes, window.print() is blocked with:
    // "Ignored call to 'print()'. The document is sandboxed, and the 'allow-modals' keyword is not set."
    // Seamlessly trigger direct PDF generation instead without touching window.print()
    if (fallbackCv) {
      exportDirectPdf(fallbackCv);
    }
    return;
  }

  try {
    window.focus();
    window.print();
  } catch (err) {
    console.warn('Print not supported in this environment, falling back to direct PDF download:', err);
    if (fallbackCv) {
      exportDirectPdf(fallbackCv);
    }
  }
};

/**
 * Direct PDF Download
 * Captures the exact rendered HTML layout matching the selected template and downloads high-res PDF file
 */
export const exportDirectPdf = async (cv: CVData): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Look for dedicated clean, unscaled export sheets first
    let pageSheets = Array.from(
      document.querySelectorAll<HTMLElement>('#cv-pdf-clean-export-container .cv-export-page-sheet')
    );

    // 2. Fallback to visible page sheets in preview
    if (pageSheets.length === 0) {
      pageSheets = Array.from(document.querySelectorAll<HTMLElement>('.cv-a4-page-sheet'));
    }

    if (pageSheets.length > 0) {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pageSheets.length; i++) {
        const sheet = pageSheets[i];

        // Clone offscreen to eliminate any scale transforms or parent constraints
        const clone = sheet.cloneNode(true) as HTMLElement;
        clone.style.transform = 'none';
        clone.style.position = 'fixed';
        clone.style.left = '-9999px';
        clone.style.top = '0px';
        clone.style.width = '210mm';
        clone.style.height = pageSheets.length === 1 ? 'auto' : '297mm';
        clone.style.minHeight = '297mm';
        clone.style.zIndex = '-9999';
        clone.style.margin = '0';
        clone.style.display = 'flex';
        clone.style.visibility = 'visible';
        clone.style.opacity = '1';
        document.body.appendChild(clone);

        try {
          // Allow layout to settle
          await new Promise((resolve) => setTimeout(resolve, 80));

          const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          if (i > 0) {
            pdf.addPage();
          }
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        } finally {
          if (clone.parentNode) {
            clone.parentNode.removeChild(clone);
          }
        }
      }

      const safeName = (cv.personalDetails.fullName || cv.title || 'CV')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
      const templateTag = (cv.templateId || 'modern').toLowerCase();
      pdf.save(`${safeName}_${templateTag}_resume.pdf`);
      return { success: true };
    }

    // 3. Fallback to printable document container
    const el = document.getElementById('cv-printable-document');
    if (!el) {
      return { success: false, error: 'Document element not found' };
    }

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    const safeName = (cv.personalDetails.fullName || cv.title || 'CV')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    const templateTag = (cv.templateId || 'modern').toLowerCase();
    pdf.save(`${safeName}_${templateTag}_resume.pdf`);
    return { success: true };
  } catch (err: any) {
    console.error('Direct PDF export error:', err);
    return { success: false, error: err?.message };
  }
};

/**
 * Escapes characters for HTML output
 */
const escapeHtml = (text?: string): string => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Returns CSS font family string corresponding to selected CV font
 */
const getHtmlFontFamily = (fontFamily?: string, templateId?: string): string => {
  if (templateId === 'academic') return "'EB Garamond', Georgia, serif";
  if (templateId === 'tech') return "Consolas, 'Courier New', monospace";

  switch (fontFamily) {
    case 'garamond':
      return "'EB Garamond', Georgia, serif";
    case 'cinzel':
      return "Cinzel, 'Palatino Linotype', serif";
    case 'mono':
      return "Consolas, 'Courier New', monospace";
    case 'jakarta':
      return "'Plus Jakarta Sans', Arial, sans-serif";
    case 'inter':
    default:
      return "Calibri, Arial, sans-serif";
  }
};

/**
 * Builds rich, template-faithful HTML representing what is rendered in the live preview
 * with inline styles optimized for Word OpenXML conversion via html-to-docx
 */
export const renderTemplateToWordHtml = (cv: CVData): string => {
  const p = cv.personalDetails;
  const fullName = escapeHtml(p.fullName || 'Candidate Name');
  const role = escapeHtml(p.jobTitle || 'Professional Role');
  const theme = cv.themeColor || '#2563eb';
  const templateId = cv.templateId || 'modern';
  const font = getHtmlFontFamily(cv.fontFamily, templateId);

  const contactList: string[] = [];
  if (p.email) contactList.push(escapeHtml(p.email));
  if (p.phone) contactList.push(escapeHtml(p.phone));
  if (p.location) contactList.push(escapeHtml(p.location));
  if (p.linkedin) contactList.push(escapeHtml(p.linkedin));
  if (p.website) contactList.push(escapeHtml(p.website));
  if (p.github) contactList.push(escapeHtml(p.github));

  // Common Section Renderers
  const renderSummaryHtml = (accentColor: string) => {
    if (!cv.summary) return '';
    return `
      <div style="margin-bottom: 16px;">
        <h2 style="color: ${accentColor}; font-size: 13pt; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase;">
          Professional Summary
        </h2>
        <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0;">
          ${escapeHtml(cv.summary)}
        </p>
      </div>
    `;
  };

  const renderExperienceHtml = (itemStyle = '') => {
    if (!cv.experiences || cv.experiences.length === 0) return '';
    const items = cv.experiences.map((exp) => {
      const dates = `${escapeHtml(exp.startDate)} – ${exp.isCurrent ? 'Present' : escapeHtml(exp.endDate || '')}${exp.location ? ` | ${escapeHtml(exp.location)}` : ''}`;
      const bullets = (exp.highlights || [])
        .filter((h) => h.trim())
        .map((h) => `<li style="font-size: 10pt; color: #334155; margin-bottom: 3px;">${escapeHtml(h)}</li>`)
        .join('');

      return `
        <div style="margin-bottom: 14px; ${itemStyle}">
          <p style="font-size: 11pt; font-weight: bold; color: #0f172a; margin: 0;">
            ${escapeHtml(exp.jobTitle)} — <span style="color: ${theme};">${escapeHtml(exp.employer)}</span>
          </p>
          <p style="font-size: 9.5pt; color: #64748b; margin: 2px 0 6px 0; font-weight: bold;">
            ${dates}
          </p>
          ${bullets ? `<ul style="margin: 0; padding-left: 18px;">${bullets}</ul>` : ''}
        </div>
      `;
    }).join('');

    return items;
  };

  const renderEducationHtml = (itemStyle = '') => {
    if (!cv.educations || cv.educations.length === 0) return '';
    const items = cv.educations.map((edu) => {
      const dates = `${escapeHtml(edu.startDate)} – ${edu.isCurrent ? 'Present' : escapeHtml(edu.endDate || '')}${edu.location ? ` | ${escapeHtml(edu.location)}` : ''}`;
      return `
        <div style="margin-bottom: 12px; ${itemStyle}">
          <p style="font-size: 11pt; font-weight: bold; color: #0f172a; margin: 0;">
            ${escapeHtml(edu.degree)}${edu.fieldOfStudy ? ` in ${escapeHtml(edu.fieldOfStudy)}` : ''} — <span style="color: #475569;">${escapeHtml(edu.school)}</span>
          </p>
          <p style="font-size: 9.5pt; color: #64748b; margin: 2px 0 2px 0;">${dates}</p>
          ${edu.grade ? `<p style="font-size: 9.5pt; color: #64748b; margin: 0;">Grade / Classification: ${escapeHtml(edu.grade)}</p>` : ''}
        </div>
      `;
    }).join('');

    return items;
  };

  const renderProjectsHtml = (itemStyle = '') => {
    if (!cv.projects || cv.projects.length === 0) return '';
    const items = cv.projects.map((proj) => {
      const bullets = (proj.highlights || [])
        .filter((h) => h.trim())
        .map((h) => `<li style="font-size: 10pt; color: #334155; margin-bottom: 3px;">${escapeHtml(h)}</li>`)
        .join('');

      return `
        <div style="margin-bottom: 12px; ${itemStyle}">
          <p style="font-size: 11pt; font-weight: bold; color: #0f172a; margin: 0;">
            ${escapeHtml(proj.title)}${proj.subtitle ? ` — <span style="color: ${theme};">${escapeHtml(proj.subtitle)}</span>` : ''}
          </p>
          ${bullets ? `<ul style="margin: 4px 0 0 0; padding-left: 18px;">${bullets}</ul>` : ''}
        </div>
      `;
    }).join('');

    return items;
  };

  const renderSkillsHtml = () => {
    if (!cv.skills || cv.skills.length === 0) return '';
    const items = cv.skills.map((sk) => `
      <p style="font-size: 10pt; margin: 0 0 4px 0;">
        <strong style="color: #0f172a;">${escapeHtml(sk.category)}:</strong>
        <span style="color: #334155;"> ${escapeHtml(sk.items.join(', '))}</span>
      </p>
    `).join('');
    return items;
  };

  const renderCertificationsHtml = () => {
    if (!cv.certifications || cv.certifications.length === 0) return '';
    const items = cv.certifications.map((cert) => `
      <p style="font-size: 10pt; margin: 0 0 4px 0;">
        <strong style="color: #0f172a;">${escapeHtml(cert.name)}</strong>
        ${cert.issuer ? `<span style="color: #475569;"> — ${escapeHtml(cert.issuer)}</span>` : ''}
        ${cert.issueDate ? `<span style="color: #64748b;"> (${escapeHtml(cert.issueDate)})</span>` : ''}
      </p>
    `).join('');
    return items;
  };

  const renderLanguagesHtml = () => {
    if (!cv.languages || cv.languages.length === 0) return '';
    const text = cv.languages.map((l) => `${escapeHtml(l.language)} (${escapeHtml(l.proficiency)})`).join('   •   ');
    return `<p style="font-size: 10pt; color: #334155; margin: 0;">${text}</p>`;
  };

  const renderCustomSectionsHtml = (accentColor: string) => {
    if (!cv.customSections || cv.customSections.length === 0) return '';
    return cv.customSections.map((sec) => `
      <div style="margin-bottom: 16px;">
        <h2 style="color: ${accentColor}; font-size: 13pt; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase;">
          ${escapeHtml(sec.sectionTitle)}
        </h2>
        ${sec.items.map((item) => `
          <div style="margin-bottom: 8px;">
            <p style="font-size: 10.5pt; font-weight: bold; color: #0f172a; margin: 0;">
              ${escapeHtml(item.title)}${item.subtitle ? ` — ${escapeHtml(item.subtitle)}` : ''}${item.date ? ` (${escapeHtml(item.date)})` : ''}
            </p>
            <p style="font-size: 10pt; color: #334155; margin: 2px 0 0 0;">${escapeHtml(item.description)}</p>
          </div>
        `).join('')}
      </div>
    `).join('');
  };

  // =========================================================================
  // 1. CREATIVE SPLIT TEMPLATE
  // 2-Column table with full colored sidebar on left matching live preview
  // =========================================================================
  if (templateId === 'creative') {
    const sidebarSkills = cv.skills && cv.skills.length > 0 ? `
      <div style="margin-top: 16px;">
        <p style="color: #ffffff; font-size: 11pt; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.4); padding-bottom: 3px; margin: 0 0 8px 0;">
          SKILLS
        </p>
        ${cv.skills.map((s) => `
          <p style="font-size: 9.5pt; margin: 0 0 4px 0;">
            <strong style="color: #ffffff;">${escapeHtml(s.category)}:</strong>
            <span style="color: #f1f5f9;"> ${escapeHtml(s.items.join(', '))}</span>
          </p>
        `).join('')}
      </div>
    ` : '';

    const sidebarLanguages = cv.languages && cv.languages.length > 0 ? `
      <div style="margin-top: 16px;">
        <p style="color: #ffffff; font-size: 11pt; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.4); padding-bottom: 3px; margin: 0 0 8px 0;">
          LANGUAGES
        </p>
        ${cv.languages.map((l) => `<p style="font-size: 9.5pt; color: #f8fafc; margin: 0 0 3px 0;">${escapeHtml(l.language)} (${escapeHtml(l.proficiency)})</p>`).join('')}
      </div>
    ` : '';

    const sidebarCerts = cv.certifications && cv.certifications.length > 0 ? `
      <div style="margin-top: 16px;">
        <p style="color: #ffffff; font-size: 11pt; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.4); padding-bottom: 3px; margin: 0 0 8px 0;">
          CERTIFICATIONS
        </p>
        ${cv.certifications.map((c) => `<p style="font-size: 9.5pt; color: #f8fafc; margin: 0 0 3px 0;"><strong>${escapeHtml(c.name)}</strong>${c.issuer ? ` — ${escapeHtml(c.issuer)}` : ''}</p>`).join('')}
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; }
          table { width: 650px; border-collapse: collapse; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 10pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <!-- Left Sidebar -->
            <td style="width: 210px; background-color: ${theme}; color: #ffffff; padding: 20px 16px; vertical-align: top;">
              <h1 style="color: #ffffff; font-size: 20pt; font-weight: bold; margin: 0 0 4px 0;">
                ${fullName}
              </h1>
              <p style="color: #e0e7ff; font-size: 10pt; font-weight: bold; margin: 0 0 16px 0; text-transform: uppercase;">
                ${role}
              </p>
              
              <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px; margin-bottom: 16px;">
                <p style="color: #ffffff; font-size: 10.5pt; font-weight: bold; margin: 0 0 6px 0;">CONTACT</p>
                ${p.email ? `<p style="font-size: 9pt; color: #f8fafc; margin: 0 0 4px 0;">Email: ${escapeHtml(p.email)}</p>` : ''}
                ${p.phone ? `<p style="font-size: 9pt; color: #f8fafc; margin: 0 0 4px 0;">Tel: ${escapeHtml(p.phone)}</p>` : ''}
                ${p.location ? `<p style="font-size: 9pt; color: #f8fafc; margin: 0 0 4px 0;">Loc: ${escapeHtml(p.location)}</p>` : ''}
                ${p.linkedin ? `<p style="font-size: 9pt; color: #f8fafc; margin: 0 0 4px 0;">LinkedIn: ${escapeHtml(p.linkedin)}</p>` : ''}
                ${p.github ? `<p style="font-size: 9pt; color: #f8fafc; margin: 0 0 4px 0;">GitHub: ${escapeHtml(p.github)}</p>` : ''}
                ${p.website ? `<p style="font-size: 9pt; color: #f8fafc; margin: 0 0 4px 0;">Web: ${escapeHtml(p.website)}</p>` : ''}
              </div>

              ${sidebarSkills}
              ${sidebarLanguages}
              ${sidebarCerts}
            </td>

            <!-- Right Main Area -->
            <td style="width: 440px; background-color: #ffffff; color: #1e293b; padding: 20px; vertical-align: top;">
              ${cv.summary ? `
                <div style="margin-bottom: 16px;">
                  <h2 style="color: ${theme}; border-bottom: 2px solid ${theme}; font-size: 13pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    Professional Summary
                  </h2>
                  <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0;">${escapeHtml(cv.summary)}</p>
                </div>
              ` : ''}

              ${cv.experiences && cv.experiences.length > 0 ? `
                <div style="margin-bottom: 16px;">
                  <h2 style="color: ${theme}; border-bottom: 2px solid ${theme}; font-size: 13pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    Work Experience
                  </h2>
                  ${renderExperienceHtml()}
                </div>
              ` : ''}

              ${cv.projects && cv.projects.length > 0 ? `
                <div style="margin-bottom: 16px;">
                  <h2 style="color: ${theme}; border-bottom: 2px solid ${theme}; font-size: 13pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    Projects
                  </h2>
                  ${renderProjectsHtml()}
                </div>
              ` : ''}

              ${cv.educations && cv.educations.length > 0 ? `
                <div style="margin-bottom: 16px;">
                  <h2 style="color: ${theme}; border-bottom: 2px solid ${theme}; font-size: 13pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    Education
                  </h2>
                  ${renderEducationHtml()}
                </div>
              ` : ''}

              ${renderCustomSectionsHtml(theme)}
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 2. CAMBRIDGE ACCENT TEMPLATE
  // Top colored header banner with monogram/role and framed section titles
  // =========================================================================
  if (templateId === 'cambridge') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; }
          .banner-table { width: 650px; background-color: ${theme}; color: #ffffff; margin-bottom: 16px; border-collapse: collapse; }
          .section-header { border-left: 4px solid ${theme}; padding-left: 10px; color: ${theme}; font-weight: bold; font-size: 12.5pt; text-transform: uppercase; margin: 16px 0 8px 0; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 10pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <table class="banner-table">
          <tr>
            <td style="padding: 22px; color: #ffffff;">
              <h1 style="color: #ffffff; font-size: 22pt; font-weight: bold; margin: 0 0 4px 0;">${fullName}</h1>
              <p style="color: #f1f5f9; font-size: 11pt; font-weight: bold; margin: 0 0 10px 0;">${role}</p>
              <p style="color: #e2e8f0; font-size: 9.5pt; margin: 0;">${contactList.join('   •   ')}</p>
            </td>
          </tr>
        </table>

        ${cv.summary ? `
          <div class="section-header">Professional Profile</div>
          <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0 0 16px 0;">${escapeHtml(cv.summary)}</p>
        ` : ''}

        ${cv.experiences && cv.experiences.length > 0 ? `
          <div class="section-header">Work Experience</div>
          ${renderExperienceHtml()}
        ` : ''}

        ${cv.projects && cv.projects.length > 0 ? `
          <div class="section-header">Key Projects</div>
          ${renderProjectsHtml()}
        ` : ''}

        ${cv.educations && cv.educations.length > 0 ? `
          <div class="section-header">Education</div>
          ${renderEducationHtml()}
        ` : ''}

        ${cv.skills && cv.skills.length > 0 ? `
          <div class="section-header">Skills &amp; Technologies</div>
          ${renderSkillsHtml()}
        ` : ''}

        ${cv.certifications && cv.certifications.length > 0 ? `
          <div class="section-header">Certifications</div>
          ${renderCertificationsHtml()}
        ` : ''}

        ${cv.languages && cv.languages.length > 0 ? `
          <div class="section-header">Languages</div>
          ${renderLanguagesHtml()}
        ` : ''}

        ${renderCustomSectionsHtml(theme)}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 3. EDINBURGH TIMELINE TEMPLATE
  // Continuous left accent rail borders on work experience and education
  // =========================================================================
  if (templateId === 'timeline') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; }
          .header-box { border-bottom: 3px solid ${theme}; padding-bottom: 14px; margin-bottom: 18px; }
          .section-header { border-bottom: 1.5px solid ${theme}; color: ${theme}; font-weight: bold; font-size: 12.5pt; text-transform: uppercase; margin: 18px 0 10px 0; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 10pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h1 style="color: #0f172a; font-size: 24pt; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase;">
            ${fullName}
          </h1>
          <p style="color: ${theme}; font-size: 12pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
            ${role}
          </p>
          <p style="color: #64748b; font-size: 9.5pt; margin: 0;">${contactList.join('   |   ')}</p>
        </div>

        ${cv.summary ? `
          <div class="section-header">Professional Profile</div>
          <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0 0 16px 0;">${escapeHtml(cv.summary)}</p>
        ` : ''}

        ${cv.experiences && cv.experiences.length > 0 ? `
          <div class="section-header">Career Timeline (Work Experience)</div>
          ${renderExperienceHtml(`border-left: 3px solid ${theme}; padding-left: 12px; margin-left: 4px;`)}
        ` : ''}

        ${cv.educations && cv.educations.length > 0 ? `
          <div class="section-header">Education &amp; Credentials</div>
          ${renderEducationHtml(`border-left: 3px solid ${theme}; padding-left: 12px; margin-left: 4px;`)}
        ` : ''}

        ${cv.skills && cv.skills.length > 0 ? `
          <div class="section-header">Skills &amp; Competencies</div>
          ${renderSkillsHtml()}
        ` : ''}

        ${cv.projects && cv.projects.length > 0 ? `
          <div class="section-header">Projects</div>
          ${renderProjectsHtml()}
        ` : ''}

        ${cv.certifications && cv.certifications.length > 0 ? `
          <div class="section-header">Certifications</div>
          ${renderCertificationsHtml()}
        ` : ''}

        ${cv.languages && cv.languages.length > 0 ? `
          <div class="section-header">Languages</div>
          ${renderLanguagesHtml()}
        ` : ''}

        ${renderCustomSectionsHtml(theme)}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 4. LONDON CORPORATE TEMPLATE
  // High-contrast dark navy banner table with gold/theme accent border
  // =========================================================================
  if (templateId === 'corporate') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; }
          .corp-table { width: 650px; background-color: #0f172a; border-bottom: 4px solid ${theme}; color: #ffffff; margin-bottom: 18px; border-collapse: collapse; }
          .section-header { border-bottom: 2px solid ${theme}; color: #0f172a; font-weight: bold; font-size: 12pt; text-transform: uppercase; margin: 18px 0 10px 0; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 10pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <table class="corp-table">
          <tr>
            <td style="padding: 22px; color: #ffffff;">
              <h1 style="color: #ffffff; font-size: 24pt; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase;">
                ${fullName}
              </h1>
              <p style="color: #94a3b8; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                ${role}
              </p>
              <p style="color: #cbd5e1; font-size: 9.5pt; margin: 0;">${contactList.join('   •   ')}</p>
            </td>
          </tr>
        </table>

        ${cv.summary ? `
          <div class="section-header">Executive Summary</div>
          <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0 0 16px 0;">${escapeHtml(cv.summary)}</p>
        ` : ''}

        ${cv.experiences && cv.experiences.length > 0 ? `
          <div class="section-header">Professional Experience</div>
          ${renderExperienceHtml()}
        ` : ''}

        ${cv.educations && cv.educations.length > 0 ? `
          <div class="section-header">Education</div>
          ${renderEducationHtml()}
        ` : ''}

        ${cv.skills && cv.skills.length > 0 ? `
          <div class="section-header">Core Competencies</div>
          ${renderSkillsHtml()}
        ` : ''}

        ${cv.projects && cv.projects.length > 0 ? `
          <div class="section-header">Key Engagements &amp; Projects</div>
          ${renderProjectsHtml()}
        ` : ''}

        ${cv.certifications && cv.certifications.length > 0 ? `
          <div class="section-header">Certifications</div>
          ${renderCertificationsHtml()}
        ` : ''}

        ${cv.languages && cv.languages.length > 0 ? `
          <div class="section-header">Languages</div>
          ${renderLanguagesHtml()}
        ` : ''}

        ${renderCustomSectionsHtml(theme)}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 5. TECH COMPACT TEMPLATE
  // Monospace Consolas terminal header & "// Core Technical Stack" box
  // =========================================================================
  if (templateId === 'tech') {
    const techStackBox = cv.skills && cv.skills.length > 0 ? `
      <table style="width: 650px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid ${theme}; margin-bottom: 14px; font-family: Consolas, monospace; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 14px;">
            <p style="color: ${theme}; font-weight: bold; font-size: 10pt; margin: 0 0 4px 0;">// CORE TECHNICAL STACK</p>
            ${cv.skills.map((s) => `
              <p style="font-size: 9.5pt; margin: 0 0 3px 0;">
                <strong style="color: #0f172a;">${escapeHtml(s.category)}:</strong>
                <span style="color: #334155;"> ${escapeHtml(s.items.join(', '))}</span>
              </p>
            `).join('')}
          </td>
        </tr>
      </table>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Consolas, 'Courier New', monospace; font-size: 9.5pt; color: #1e293b; margin: 0; padding: 0; }
          .term-header { border-bottom: 1px solid ${theme}; padding-bottom: 12px; margin-bottom: 14px; }
          .section-header { border-bottom: 1px solid ${theme}; color: ${theme}; font-weight: bold; font-size: 11pt; text-transform: uppercase; margin: 16px 0 8px 0; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 9.5pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <div class="term-header">
          <h1 style="color: #0f172a; font-size: 20pt; margin: 0 0 4px 0;">
            <span style="color: ${theme};">// dev@local / </span>${fullName}
          </h1>
          <p style="color: ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 6px 0;">&gt; Role: ${role}</p>
          <p style="color: #475569; font-size: 9pt; margin: 0;">&gt; Links: ${contactList.join(' | ')}</p>
        </div>

        ${cv.summary ? `
          <p style="font-size: 9.5pt; color: #334155; line-height: 1.4; margin: 0 0 12px 0;">${escapeHtml(cv.summary)}</p>
        ` : ''}

        ${techStackBox}

        ${cv.experiences && cv.experiences.length > 0 ? `
          <div class="section-header">// Work Experience</div>
          ${renderExperienceHtml()}
        ` : ''}

        ${cv.projects && cv.projects.length > 0 ? `
          <div class="section-header">// Projects</div>
          ${renderProjectsHtml()}
        ` : ''}

        ${cv.educations && cv.educations.length > 0 ? `
          <div class="section-header">// Education</div>
          ${renderEducationHtml()}
        ` : ''}

        ${cv.certifications && cv.certifications.length > 0 ? `
          <div class="section-header">// Certifications</div>
          ${renderCertificationsHtml()}
        ` : ''}

        ${cv.languages && cv.languages.length > 0 ? `
          <div class="section-header">// Languages</div>
          ${renderLanguagesHtml()}
        ` : ''}

        ${renderCustomSectionsHtml(theme)}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 6. ACADEMIC CLASSIC TEMPLATE
  // Serif font, centered academic header, double rule dividers
  // =========================================================================
  if (templateId === 'academic') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'EB Garamond', Georgia, serif; font-size: 11pt; color: #1c1917; margin: 0; padding: 0; line-height: 1.5; }
          .acad-header { text-align: center; border-bottom: 2px solid #78716c; padding-bottom: 14px; margin-bottom: 18px; }
          .section-header { border-bottom: 1px solid #a8a29e; color: #1c1917; font-weight: bold; font-size: 13pt; text-transform: uppercase; margin: 18px 0 8px 0; letter-spacing: 0.5px; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 10.5pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <div class="acad-header">
          <h1 style="color: #1c1917; font-size: 24pt; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">
            ${fullName}
          </h1>
          <p style="color: #44403c; font-style: italic; font-size: 12pt; margin: 0 0 6px 0;">Curriculum Vitae</p>
          <p style="color: #57534e; font-size: 10pt; margin: 0;">${contactList.join('   ·   ')}</p>
        </div>

        ${cv.summary ? `
          <div class="section-header">Profile &amp; Research Statement</div>
          <p style="font-size: 10.5pt; color: #292524; line-height: 1.6; margin: 0 0 16px 0;">${escapeHtml(cv.summary)}</p>
        ` : ''}

        ${cv.educations && cv.educations.length > 0 ? `
          <div class="section-header">Education &amp; Qualifications</div>
          ${renderEducationHtml()}
        ` : ''}

        ${cv.experiences && cv.experiences.length > 0 ? `
          <div class="section-header">Academic &amp; Professional Appointments</div>
          ${renderExperienceHtml()}
        ` : ''}

        ${cv.projects && cv.projects.length > 0 ? `
          <div class="section-header">Research Projects &amp; Publications</div>
          ${renderProjectsHtml()}
        ` : ''}

        ${cv.skills && cv.skills.length > 0 ? `
          <div class="section-header">Areas of Expertise</div>
          ${renderSkillsHtml()}
        ` : ''}

        ${cv.certifications && cv.certifications.length > 0 ? `
          <div class="section-header">Honors &amp; Awards</div>
          ${renderCertificationsHtml()}
        ` : ''}

        ${cv.languages && cv.languages.length > 0 ? `
          <div class="section-header">Languages</div>
          ${renderLanguagesHtml()}
        ` : ''}

        ${renderCustomSectionsHtml('#44403c')}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 7. MINIMALIST CLEAN TEMPLATE
  // High-whitespace, left-aligned, delicate hairline rule
  // =========================================================================
  if (templateId === 'minimalist') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; line-height: 1.5; }
          .min-header { border-bottom: 1px solid #cbd5e1; padding-bottom: 14px; margin-bottom: 18px; }
          .section-header { border-bottom: 1px solid #e2e8f0; color: ${theme}; font-weight: bold; font-size: 11.5pt; text-transform: uppercase; margin: 18px 0 8px 0; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 10pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <div class="min-header">
          <h1 style="color: #0f172a; font-size: 22pt; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase;">
            ${fullName}
          </h1>
          <p style="color: #64748b; font-size: 11pt; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase;">
            ${role}
          </p>
          <p style="color: #64748b; font-size: 9.5pt; margin: 0;">${contactList.join('   •   ')}</p>
        </div>

        ${cv.summary ? `
          <div class="section-header">Profile</div>
          <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0 0 16px 0;">${escapeHtml(cv.summary)}</p>
        ` : ''}

        ${cv.experiences && cv.experiences.length > 0 ? `
          <div class="section-header">Experience</div>
          ${renderExperienceHtml()}
        ` : ''}

        ${cv.educations && cv.educations.length > 0 ? `
          <div class="section-header">Education</div>
          ${renderEducationHtml()}
        ` : ''}

        ${cv.skills && cv.skills.length > 0 ? `
          <div class="section-header">Skills</div>
          ${renderSkillsHtml()}
        ` : ''}

        ${cv.projects && cv.projects.length > 0 ? `
          <div class="section-header">Projects</div>
          ${renderProjectsHtml()}
        ` : ''}

        ${cv.certifications && cv.certifications.length > 0 ? `
          <div class="section-header">Certifications</div>
          ${renderCertificationsHtml()}
        ` : ''}

        ${cv.languages && cv.languages.length > 0 ? `
          <div class="section-header">Languages</div>
          ${renderLanguagesHtml()}
        ` : ''}

        ${renderCustomSectionsHtml(theme)}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 8. MODERN EXECUTIVE (DEFAULT) TEMPLATE
  // Header with colored role and solid bottom accent line
  // =========================================================================
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; line-height: 1.5; }
        .mod-header { border-bottom: 3px solid ${theme}; padding-bottom: 14px; margin-bottom: 18px; }
        .section-header { border-bottom: 1.5px solid ${theme}; color: ${theme}; font-weight: bold; font-size: 12.5pt; text-transform: uppercase; margin: 18px 0 8px 0; }
        ul { margin: 4px 0 8px 0; padding-left: 18px; }
        li { font-size: 10pt; margin-bottom: 3px; }
      </style>
    </head>
    <body>
      <div class="mod-header">
        <h1 style="color: #0f172a; font-size: 24pt; font-weight: bold; margin: 0 0 4px 0;">${fullName}</h1>
        <p style="color: ${theme}; font-size: 12pt; font-weight: bold; margin: 0 0 6px 0;">${role}</p>
        <p style="color: #64748b; font-size: 9.5pt; margin: 0;">${contactList.join('   |   ')}</p>
      </div>

      ${cv.summary ? `
        <div class="section-header">Professional Summary</div>
        <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0 0 16px 0;">${escapeHtml(cv.summary)}</p>
      ` : ''}

      ${cv.experiences && cv.experiences.length > 0 ? `
        <div class="section-header">Work Experience</div>
        ${renderExperienceHtml()}
      ` : ''}

      ${cv.educations && cv.educations.length > 0 ? `
        <div class="section-header">Education</div>
        ${renderEducationHtml()}
      ` : ''}

      ${cv.skills && cv.skills.length > 0 ? `
        <div class="section-header">Skills &amp; Expertise</div>
        ${renderSkillsHtml()}
      ` : ''}

      ${cv.projects && cv.projects.length > 0 ? `
        <div class="section-header">Key Projects</div>
        ${renderProjectsHtml()}
      ` : ''}

      ${cv.certifications && cv.certifications.length > 0 ? `
        <div class="section-header">Certifications</div>
        ${renderCertificationsHtml()}
      ` : ''}

      ${cv.languages && cv.languages.length > 0 ? `
        <div class="section-header">Languages</div>
        ${renderLanguagesHtml()}
      ` : ''}

      ${renderCustomSectionsHtml(theme)}
    </body>
    </html>
  `;
};

/**
 * Downloads a Blob as a file with the specified filename
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Utility to extract clean 6-character hex color for Word OpenXML
 */
export const getCleanHex = (colorStr?: string, defaultHex = '0D9488'): string => {
  if (!colorStr) return defaultHex;
  const cleaned = colorStr.replace('#', '').trim().toUpperCase();
  if (/^[0-9A-F]{6}$/i.test(cleaned)) return cleaned;
  if (/^[0-9A-F]{3}$/i.test(cleaned)) return cleaned.split('').map((c) => c + c).join('');
  return defaultHex;
};

/**
 * Universal Word-friendly font selection based on user's choice
 */
export const getDocxFont = (fontFamily?: string): string => {
  switch (fontFamily) {
    case 'garamond':
      return 'Georgia';
    case 'mono':
      return 'Consolas';
    case 'cinzel':
      return 'Palatino Linotype';
    case 'jakarta':
    case 'inter':
    default:
      return 'Calibri';
  }
};

/**
 * Creates a section heading with authentic Word colored underline border
 */
const createSectionHeader = (title: string, themeHex: string, font: string): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 22, // 11pt
        color: themeHex,
        font,
      }),
    ],
    spacing: { before: 240, after: 100 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 12, // 1.5pt crisp solid line under heading
        color: themeHex,
        space: 4,
      },
    },
  });
};

/**
 * Builds an authentic, beautifully styled Word Document (.docx)
 * matching the executive resume layout with colored headers, underlines, company accents, and crisp typography
 */
export const buildDocxDocument = (cv: CVData): Document => {
  const themeHex = getCleanHex(cv.themeColor, '0D9488');
  const font = getDocxFont(cv.fontFamily);
  const p = cv.personalDetails;
  const fullName = p.fullName || cv.title || 'Candidate Name';

  const children: Paragraph[] = [];

  // 1. Candidate Full Name Header
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: fullName,
          bold: true,
          size: 44, // 22pt
          color: '0F172A',
          font,
        }),
      ],
      spacing: { after: 40 },
    })
  );

  // 2. Professional Job Title
  if (p.jobTitle) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: p.jobTitle,
            bold: true,
            size: 24, // 12pt
            color: themeHex,
            font,
          }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  // 3. Contact Details Line
  const contactParts: string[] = [];
  if (p.email) contactParts.push(p.email);
  if (p.phone) contactParts.push(p.phone);
  if (p.location) contactParts.push(p.location);
  if (p.linkedin) contactParts.push(p.linkedin.replace(/^https?:\/\/(www\.)?/, ''));
  if (p.website) contactParts.push(p.website.replace(/^https?:\/\/(www\.)?/, ''));
  if (p.github) contactParts.push(p.github.replace(/^https?:\/\/(www\.)?/, ''));

  if (contactParts.length > 0) {
    const contactRuns: TextRun[] = [];
    contactParts.forEach((part, index) => {
      contactRuns.push(
        new TextRun({
          text: part,
          size: 18, // 9pt
          color: '475569',
          font,
        })
      );
      if (index < contactParts.length - 1) {
        contactRuns.push(
          new TextRun({
            text: '  |  ',
            size: 18,
            color: '94A3B8',
            font,
          })
        );
      }
    });

    children.push(
      new Paragraph({
        children: contactRuns,
        spacing: { after: 180 },
      })
    );
  }

  // 4. Professional Summary
  if (cv.summary && cv.summary.trim()) {
    children.push(createSectionHeader('Professional Summary', themeHex, font));
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: cv.summary.trim(),
            size: 20, // 10pt
            color: '334155',
            font,
          }),
        ],
        spacing: { after: 140, line: 276 },
      })
    );
  }

  // 5. Work Experience
  if (cv.experiences && cv.experiences.length > 0) {
    children.push(createSectionHeader('Work Experience', themeHex, font));
    cv.experiences.forEach((exp) => {
      const roleRuns: TextRun[] = [
        new TextRun({
          text: exp.jobTitle || 'Role',
          bold: true,
          size: 21, // 10.5pt
          color: '0F172A',
          font,
        }),
      ];

      if (exp.employer) {
        roleRuns.push(
          new TextRun({
            text: ' — ',
            bold: true,
            size: 21,
            color: '64748B',
            font,
          }),
          new TextRun({
            text: exp.employer,
            bold: true,
            size: 21,
            color: themeHex, // Employer highlighted in theme accent color
            font,
          })
        );
      }

      children.push(
        new Paragraph({
          children: roleRuns,
          spacing: { before: 130, after: 30 },
        })
      );

      const dates = `${exp.startDate || ''} — ${exp.isCurrent ? 'Present' : (exp.endDate || '')}${exp.location ? ` | ${exp.location}` : ''}`;
      if (dates.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: dates,
                size: 18, // 9pt
                color: '64748B',
                font,
              }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      (exp.highlights || [])
        .filter((h) => h && h.trim())
        .forEach((hl) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({
                  text: hl.trim(),
                  size: 19, // 9.5pt
                  color: '334155',
                  font,
                }),
              ],
              spacing: { after: 35 },
            })
          );
        });
    });
  }

  // 6. Key Projects
  if (cv.projects && cv.projects.length > 0) {
    children.push(createSectionHeader('Key Projects', themeHex, font));
    cv.projects.forEach((proj) => {
      const projRuns: TextRun[] = [
        new TextRun({
          text: proj.title || 'Project',
          bold: true,
          size: 21,
          color: '0F172A',
          font,
        }),
      ];

      if (proj.subtitle) {
        projRuns.push(
          new TextRun({
            text: ' — ',
            bold: true,
            size: 21,
            color: '64748B',
            font,
          }),
          new TextRun({
            text: proj.subtitle,
            bold: false,
            size: 20,
            color: themeHex, // Subtitle/tech stack in theme color
            font,
          })
        );
      }

      if (proj.link) {
        projRuns.push(
          new TextRun({
            text: ` (${proj.link})`,
            size: 18,
            color: '64748B',
            font,
          })
        );
      }

      children.push(
        new Paragraph({
          children: projRuns,
          spacing: { before: 130, after: 30 },
        })
      );

      if (proj.startDate || proj.endDate) {
        const dates = `${proj.startDate || ''}${proj.endDate ? ` — ${proj.endDate}` : ''}`;
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: dates,
                size: 18,
                color: '64748B',
                font,
              }),
            ],
            spacing: { after: 40 },
          })
        );
      }

      (proj.highlights || [])
        .filter((h) => h && h.trim())
        .forEach((hl) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({
                  text: hl.trim(),
                  size: 19,
                  color: '334155',
                  font,
                }),
              ],
              spacing: { after: 35 },
            })
          );
        });
    });
  }

  // 7. Education
  if (cv.educations && cv.educations.length > 0) {
    children.push(createSectionHeader('Education', themeHex, font));
    cv.educations.forEach((edu) => {
      const degreeText = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');
      const eduRuns: TextRun[] = [
        new TextRun({
          text: degreeText || edu.degree || 'Degree',
          bold: true,
          size: 21,
          color: '0F172A',
          font,
        }),
      ];

      if (edu.school) {
        eduRuns.push(
          new TextRun({
            text: ' — ',
            bold: true,
            size: 21,
            color: '64748B',
            font,
          }),
          new TextRun({
            text: edu.school,
            bold: false,
            size: 20,
            color: '475569',
            font,
          })
        );
      }

      children.push(
        new Paragraph({
          children: eduRuns,
          spacing: { before: 130, after: 30 },
        })
      );

      const dates = `${edu.startDate || ''} — ${edu.isCurrent ? 'Present' : (edu.endDate || '')}${edu.location ? ` | ${edu.location}` : ''}`;
      if (dates.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: dates,
                size: 18,
                color: '64748B',
                font,
              }),
            ],
            spacing: { after: 30 },
          })
        );
      }

      if (edu.grade) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Grade / Classification: ${edu.grade}`,
                size: 19,
                color: '475569',
                font,
              }),
            ],
            spacing: { after: 30 },
          })
        );
      }

      (edu.details || [])
        .filter((d) => d && d.trim())
        .forEach((dt) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({
                  text: dt.trim(),
                  size: 19,
                  color: '334155',
                  font,
                }),
              ],
              spacing: { after: 30 },
            })
          );
        });
    });
  }

  // 8. Skills & Competencies
  if (cv.skills && cv.skills.length > 0) {
    children.push(createSectionHeader('Skills & Competencies', themeHex, font));
    cv.skills.forEach((cat) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${cat.category}: `,
              bold: true,
              size: 20,
              color: '0F172A',
              font,
            }),
            new TextRun({
              text: (cat.items || []).join(', '),
              size: 19,
              color: '334155',
              font,
            }),
          ],
          spacing: { after: 50 },
        })
      );
    });
  }

  // 9. Certifications & Licenses
  if (cv.certifications && cv.certifications.length > 0) {
    children.push(createSectionHeader('Certifications & Licenses', themeHex, font));
    cv.certifications.forEach((cert) => {
      const certRuns: TextRun[] = [
        new TextRun({
          text: cert.name,
          bold: true,
          size: 20,
          color: '0F172A',
          font,
        }),
      ];

      if (cert.issuer) {
        certRuns.push(
          new TextRun({
            text: ` — ${cert.issuer}`,
            size: 19,
            color: '334155',
            font,
          })
        );
      }

      if (cert.issueDate) {
        certRuns.push(
          new TextRun({
            text: ` (${cert.issueDate})`,
            size: 18,
            color: '64748B',
            font,
          })
        );
      }

      children.push(
        new Paragraph({
          children: certRuns,
          spacing: { after: 40 },
        })
      );
    });
  }

  // 10. Languages
  if (cv.languages && cv.languages.length > 0) {
    children.push(createSectionHeader('Languages', themeHex, font));
    const langRuns: TextRun[] = [];
    cv.languages.forEach((lang, idx) => {
      langRuns.push(
        new TextRun({
          text: lang.language,
          bold: true,
          size: 19,
          color: '0F172A',
          font,
        }),
        new TextRun({
          text: ` (${lang.proficiency})`,
          size: 19,
          color: '475569',
          font,
        })
      );
      if (idx < cv.languages.length - 1) {
        langRuns.push(
          new TextRun({
            text: '   •   ',
            size: 18,
            color: '94A3B8',
            font,
          })
        );
      }
    });

    children.push(
      new Paragraph({
        children: langRuns,
        spacing: { after: 50 },
      })
    );
  }

  // 11. Custom Sections
  if (cv.customSections && cv.customSections.length > 0) {
    cv.customSections.forEach((sec) => {
      children.push(createSectionHeader(sec.sectionTitle || 'Additional Information', themeHex, font));
      (sec.items || []).forEach((item) => {
        const itemRuns: TextRun[] = [
          new TextRun({
            text: item.title,
            bold: true,
            size: 20,
            color: '0F172A',
            font,
          }),
        ];

        if (item.subtitle) {
          itemRuns.push(
            new TextRun({
              text: ' — ',
              bold: true,
              size: 20,
              color: '64748B',
              font,
            }),
            new TextRun({
              text: item.subtitle,
              size: 19,
              color: themeHex,
              font,
            })
          );
        }

        if (item.date) {
          itemRuns.push(
            new TextRun({
              text: ` (${item.date})`,
              size: 18,
              color: '64748B',
              font,
            })
          );
        }

        children.push(
          new Paragraph({
            children: itemRuns,
            spacing: { before: 100, after: 30 },
          })
        );

        if (item.description) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: item.description,
                  size: 19,
                  color: '334155',
                  font,
                }),
              ],
              spacing: { after: 40 },
            })
          );
        }
      });
    });
  }

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 900, // ~0.625 in
              bottom: 900,
              left: 1080, // 0.75 in
              right: 1080,
            },
          },
        },
        children,
      },
    ],
  });
};

/**
 * Word (.docx) Generator
 * Generates an authentic Microsoft Word document preserving full layout,
 * custom theme accent colors, colored section header underlines, company accents, and bulleted lists
 */
export const exportToDocx = async (cv: CVData): Promise<void> => {
  const fullName = cv.personalDetails.fullName || cv.title || 'CV';
  const safeName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const templateTag = (cv.templateId || 'modern').toLowerCase();
  const filename = `${safeName}_${templateTag}_resume.docx`;

  try {
    const doc = buildDocxDocument(cv);
    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, filename);
  } catch (err) {
    console.warn('Direct docx generation encountered an issue, falling back to Word template document:', err);
    exportWordHtmlDocument(cv, filename);
  }
};

/**
 * Word Office-HTML Document Generator
 * Generates an authentic Microsoft Word document preserving 100% of the preview layout,
 * colors, multi-column tables, fonts, sidebars, and styled sections using Office OpenXML HTML
 */
export const exportWordHtmlDocument = (cv: CVData, filename: string): void => {
  const htmlContent = renderTemplateToWordHtml(cv);
  const fullName = cv.personalDetails.fullName || cv.title || 'CV';

  // Microsoft Word Office HTML format: natively opens in Word, LibreOffice, Apple Pages, Google Docs
  const wordDocumentHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(fullName)} - Resume</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 21.0cm 29.7cm;
      margin: 1.5cm 1.5cm 1.5cm 1.5cm;
      mso-header-margin: 1.0cm;
      mso-footer-margin: 1.0cm;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      vertical-align: top;
    }
  </style>
</head>
<body>
  <div class="Section1">
    ${htmlContent}
  </div>
</body>
</html>`;

  const blob = new Blob(['\ufeff', wordDocumentHtml], {
    type: 'application/msword;charset=utf-8'
  });

  const wordFilename = filename.endsWith('.docx') ? filename.replace(/\.docx$/, '.doc') : filename;
  downloadBlob(blob, wordFilename);
};

/**
 * Standalone HTML Export
 */
export const exportStandaloneHtml = (cv: CVData, renderedTemplateHtml: string): void => {
  const p = cv.personalDetails;
  const fullName = p.fullName || 'Candidate';

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(fullName)} - CV</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    @media print {
      body {
        background: white !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .cv-container {
        box-shadow: none !important;
        margin: 0 !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body class="bg-slate-100 min-h-screen py-8 text-slate-800 antialiased">
  <div class="no-print max-w-4xl mx-auto mb-4 flex items-center justify-between px-4">
    <div class="text-sm font-medium text-slate-600">Generated with CraftCV Pro</div>
    <div class="flex gap-2">
      <button onclick="window.print()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow hover:bg-indigo-700 transition cursor-pointer">
        Print or Save as PDF
      </button>
    </div>
  </div>
  <div class="cv-container max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl rounded-sm overflow-hidden">
    ${renderedTemplateHtml}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const safeName = (fullName || 'CV').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const templateTag = (cv.templateId || 'modern').toLowerCase();
  downloadBlob(blob, `${safeName}_${templateTag}_cv.html`);
};
