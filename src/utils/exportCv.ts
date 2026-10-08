import { CVData } from '../types/cv';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  AlignmentType,
} from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import HTMLtoDOCX from '@turbodocx/html-to-docx';
import { getSectionTitle } from './sectionTitles';
import { getOrderedSections } from './sectionOrder';

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
export const exportDirectPdf = async (
  cv: CVData,
  options?: { showHeaderFooter?: boolean; showFooter?: boolean; pageMargin?: number }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const selectedMarginMm = options?.pageMargin || cv.pageMargin || 20;

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

        // Clone offscreen behind the document to eliminate any scale transforms or parent constraints
        const clone = sheet.cloneNode(true) as HTMLElement;
        clone.style.transform = 'none';
        clone.style.position = 'fixed';
        clone.style.left = '0px';
        clone.style.top = '0px';
        clone.style.width = '210mm';
        clone.style.height = '297mm';
        clone.style.minHeight = '297mm';
        clone.style.maxHeight = '297mm';
        clone.style.zIndex = '-99999';
        clone.style.pointerEvents = 'none';
        clone.style.margin = '0';
        clone.style.display = 'flex';
        clone.style.flexDirection = 'column';
        clone.style.justifyContent = 'space-between';
        clone.style.visibility = 'visible';
        clone.style.opacity = '1';

        // Strip headers and footers if showHeaderFooter / showFooter option is false
        // CRITICAL: We clear the content and styling while preserving the element's height
        // so that margins are strictly preserved according to selection, preventing content
        // on page 2 onwards from sticking directly to the top edge of the PDF.
        const shouldStripHeaderFooter =
          options?.showHeaderFooter === false || options?.showFooter === false;

        if (shouldStripHeaderFooter) {
          const headersAndFooters = clone.querySelectorAll<HTMLElement>(
            '.cv-pdf-header, .cv-page-header, .cv-pdf-footer, .cv-page-footer'
          );
          headersAndFooters.forEach((el) => {
            el.innerHTML = '';
            el.style.border = 'none';
            el.style.backgroundColor = '#ffffff';
            el.style.boxShadow = 'none';
            el.style.visibility = 'hidden';
            if (!el.style.height || el.style.height === 'auto') {
              el.style.height = `${selectedMarginMm}mm`;
            }
          });
        }

        // Defensive check: Ensure 2nd page onwards (i > 0) ALWAYS has the top margin spacer
        if (i > 0) {
          const hasTopSpacer = clone.querySelector(
            '.cv-pdf-header, .cv-page-header, .cv-pdf-header-spacer, .cv-page-top-margin'
          );
          if (!hasTopSpacer) {
            const topMarginSpacer = document.createElement('div');
            topMarginSpacer.className = 'cv-pdf-header-spacer cv-page-top-margin';
            topMarginSpacer.style.width = '100%';
            topMarginSpacer.style.height = `${selectedMarginMm}mm`;
            topMarginSpacer.style.minHeight = `${selectedMarginMm}mm`;
            topMarginSpacer.style.backgroundColor = '#ffffff';
            topMarginSpacer.style.flexShrink = '0';
            clone.insertBefore(topMarginSpacer, clone.firstChild);
          }
        }

        // Defensive check: Ensure every page ALWAYS has the bottom margin spacer
        const hasBottomSpacer = clone.querySelector(
          '.cv-pdf-footer, .cv-page-footer, .cv-pdf-footer-spacer, .cv-page-bottom-margin'
        );
        if (!hasBottomSpacer) {
          const bottomMarginSpacer = document.createElement('div');
          bottomMarginSpacer.className = 'cv-pdf-footer-spacer cv-page-bottom-margin';
          bottomMarginSpacer.style.width = '100%';
          bottomMarginSpacer.style.height = `${selectedMarginMm}mm`;
          bottomMarginSpacer.style.minHeight = `${selectedMarginMm}mm`;
          bottomMarginSpacer.style.backgroundColor = '#ffffff';
          bottomMarginSpacer.style.flexShrink = '0';
          clone.appendChild(bottomMarginSpacer);
        }

        document.body.appendChild(clone);

        try {
          // Allow layout to settle
          await new Promise((resolve) => setTimeout(resolve, 80));

          const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff',
            windowWidth: 1200,
            windowHeight: 1600,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
            width: clone.offsetWidth || 794,
            height: clone.offsetHeight || 1123
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
/**
 * Normalizes any template ID or alias into a canonical template ID
 */
export const normalizeTemplateId = (templateId?: string): string => {
  const tid = (templateId || 'modern-executive').toLowerCase();
  if (tid.includes('creative')) return 'creative-split';
  if (tid.includes('sandstone')) return 'sandstone-executive';
  if (tid.includes('geneva')) return 'geneva-grid';
  if (tid.includes('botanical')) return 'botanical-terracotta';
  if (tid.includes('nordic')) return 'nordic-contrast';
  if (tid.includes('silicon')) return 'silicon-accent';
  if (tid.includes('edinburgh') || tid.includes('timeline')) return 'edinburgh-timeline';
  if (tid.includes('cambridge')) return 'cambridge-accent';
  if (tid.includes('london') || tid.includes('corporate')) return 'london-corporate';
  if (tid.includes('tech')) return 'tech-compact';
  if (tid.includes('academic')) return 'academic-classic';
  if (tid.includes('minimalist')) return 'minimalist-clean';
  return 'modern-executive';
};

/**
 * Returns CSS font family string corresponding to selected CV font and template
 */
const getHtmlFontFamily = (fontFamily?: string, templateId?: string): string => {
  const norm = normalizeTemplateId(templateId);
  if (norm === 'academic-classic' || norm === 'botanical-terracotta') {
    return "'EB Garamond', Georgia, serif";
  }
  if (norm === 'tech-compact') {
    return "Consolas, 'Courier New', monospace";
  }

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
 * with inline styles optimized for Word OpenXML conversion via html-to-docx and Word Office HTML
 */
export const renderTemplateToWordHtml = (cv: CVData): string => {
  const p = cv.personalDetails;
  const fullName = escapeHtml(p.fullName || 'Candidate Name');
  const role = escapeHtml(p.jobTitle || 'Professional Role');
  const theme = cv.themeColor || '#2563eb';
  const templateId = normalizeTemplateId(cv.templateId);
  const font = getHtmlFontFamily(cv.fontFamily, templateId);

  const contactList: string[] = [];
  if (p.email) contactList.push(escapeHtml(p.email));
  if (p.phone) contactList.push(escapeHtml(p.phone));
  if (p.location) contactList.push(escapeHtml(p.location));
  if (p.linkedin) contactList.push(escapeHtml(p.linkedin));
  if (p.website) contactList.push(escapeHtml(p.website));
  if (p.github) contactList.push(escapeHtml(p.github));

  // Common Section Content Builders
  const renderExperienceHtml = (itemStyle = '', accentColor = theme) => {
    if (!cv.experiences || cv.experiences.length === 0) return '';
    return cv.experiences.map((exp) => {
      const dates = `${escapeHtml(exp.startDate)} – ${exp.isCurrent ? 'Present' : escapeHtml(exp.endDate || '')}${exp.location ? ` | ${escapeHtml(exp.location)}` : ''}`;
      const bullets = (exp.highlights || [])
        .filter((h) => h.trim())
        .map((h) => `<li style="font-size: 10pt; color: #334155; margin-bottom: 3px; line-height: 1.45;">${escapeHtml(h)}</li>`)
        .join('');

      return `
        <div style="margin-bottom: 14px; ${itemStyle}">
          <p style="font-size: 11pt; font-weight: bold; color: #0f172a; margin: 0;">
            ${escapeHtml(exp.jobTitle)} — <span style="color: ${accentColor}; font-weight: bold;">${escapeHtml(exp.employer)}</span>
          </p>
          <p style="font-size: 9.5pt; color: #64748b; margin: 2px 0 6px 0; font-weight: bold;">
            ${dates}
          </p>
          ${bullets ? `<ul style="margin: 0; padding-left: 18px;">${bullets}</ul>` : ''}
        </div>
      `;
    }).join('');
  };

  const renderEducationHtml = (itemStyle = '') => {
    if (!cv.educations || cv.educations.length === 0) return '';
    return cv.educations.map((edu) => {
      const dates = `${escapeHtml(edu.startDate)} – ${edu.isCurrent ? 'Present' : escapeHtml(edu.endDate || '')}${edu.location ? ` | ${escapeHtml(edu.location)}` : ''}`;
      return `
        <div style="margin-bottom: 12px; ${itemStyle}">
          <p style="font-size: 11pt; font-weight: bold; color: #0f172a; margin: 0;">
            ${escapeHtml(edu.degree)}${edu.fieldOfStudy ? ` in ${escapeHtml(edu.fieldOfStudy)}` : ''} — <span style="color: #475569;">${escapeHtml(edu.school)}</span>
          </p>
          <p style="font-size: 9.5pt; color: #64748b; margin: 2px 0 2px 0;">${dates}</p>
          ${edu.grade ? `<p style="font-size: 9.5pt; color: #64748b; margin: 0; font-style: italic;">Grade / Classification: ${escapeHtml(edu.grade)}</p>` : ''}
        </div>
      `;
    }).join('');
  };

  const renderProjectsHtml = (itemStyle = '', accentColor = theme) => {
    if (!cv.projects || cv.projects.length === 0) return '';
    return cv.projects.map((proj) => {
      const bullets = (proj.highlights || [])
        .filter((h) => h.trim())
        .map((h) => `<li style="font-size: 10pt; color: #334155; margin-bottom: 3px;">${escapeHtml(h)}</li>`)
        .join('');

      const descHtml = proj.description
        ? `<div style="font-size: 10pt; color: #334155; margin-top: 4px; white-space: pre-line; line-height: 1.45;">${escapeHtml(proj.description).replace(/\n/g, '<br/>')}</div>`
        : '';

      return `
        <div style="margin-bottom: 12px; ${itemStyle}">
          <p style="font-size: 11pt; font-weight: bold; color: #0f172a; margin: 0;">
            ${escapeHtml(proj.title)}${proj.subtitle ? ` — <span style="color: ${accentColor};">${escapeHtml(proj.subtitle)}</span>` : ''}
          </p>
          ${descHtml}
          ${bullets ? `<ul style="margin: 4px 0 0 0; padding-left: 18px;">${bullets}</ul>` : ''}
        </div>
      `;
    }).join('');
  };

  const renderSkillsHtml = () => {
    if (!cv.skills || cv.skills.length === 0) return '';
    return cv.skills.map((sk) => `
      <p style="font-size: 10pt; margin: 0 0 5px 0;">
        <strong style="color: #0f172a;">${escapeHtml(sk.category)}:</strong>
        <span style="color: #334155;"> ${escapeHtml(sk.items.join(', '))}</span>
      </p>
    `).join('');
  };

  const renderCertificationsHtml = () => {
    if (!cv.certifications || cv.certifications.length === 0) return '';
    return cv.certifications.map((cert) => `
      <p style="font-size: 10pt; margin: 0 0 4px 0;">
        <strong style="color: #0f172a;">${escapeHtml(cert.name)}</strong>
        ${cert.issuer ? `<span style="color: #475569;"> — ${escapeHtml(cert.issuer)}</span>` : ''}
        ${cert.issueDate ? `<span style="color: #64748b;"> (${escapeHtml(cert.issueDate)})</span>` : ''}
      </p>
    `).join('');
  };

  const renderLanguagesHtml = () => {
    if (!cv.languages || cv.languages.length === 0) return '';
    const text = cv.languages.map((l) => `${escapeHtml(l.language)} (${escapeHtml(l.proficiency)})`).join('   •   ');
    return `<p style="font-size: 10pt; color: #334155; margin: 0 0 4px 0;">${text}</p>`;
  };

  const renderCustomSectionsHtml = (accentColor = theme) => {
    if (!cv.customSections || cv.customSections.length === 0) return '';
    return cv.customSections.map((sec) => `
      <div style="margin-bottom: 16px;">
        <h2 style="color: ${accentColor}; font-size: 12.5pt; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase;">
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
  // 1. CREATIVE SPLIT TEMPLATE (2-Column Table, Left Sidebar in Theme Color)
  // =========================================================================
  if (templateId === 'creative-split') {
    const sidebarSkills = cv.skills && cv.skills.length > 0 ? `
      <div style="margin-top: 18px;">
        <p style="color: #ffffff; font-size: 11pt; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.4); padding-bottom: 4px; margin: 0 0 10px 0;">
          ${escapeHtml(getSectionTitle(cv, 'skills', 'Expertise'))}
        </p>
        ${cv.skills.map((s) => `
          <div style="margin-bottom: 8px;">
            <p style="color: #ffffff; font-size: 9.5pt; font-weight: bold; margin: 0 0 2px 0;">${escapeHtml(s.category)}</p>
            <p style="font-size: 9pt; color: #f1f5f9; margin: 0;">${escapeHtml(s.items.join(', '))}</p>
          </div>
        `).join('')}
      </div>
    ` : '';

    const sidebarLanguages = cv.languages && cv.languages.length > 0 ? `
      <div style="margin-top: 16px;">
        <p style="color: #ffffff; font-size: 11pt; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.4); padding-bottom: 4px; margin: 0 0 8px 0;">
          ${escapeHtml(getSectionTitle(cv, 'languages', 'Languages'))}
        </p>
        ${cv.languages.map((l) => `<p style="font-size: 9.5pt; color: #f8fafc; margin: 0 0 3px 0;">${escapeHtml(l.language)} (${escapeHtml(l.proficiency)})</p>`).join('')}
      </div>
    ` : '';

    const sidebarCerts = cv.certifications && cv.certifications.length > 0 ? `
      <div style="margin-top: 16px;">
        <p style="color: #ffffff; font-size: 11pt; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.4); padding-bottom: 4px; margin: 0 0 8px 0;">
          ${escapeHtml(getSectionTitle(cv, 'certifications', 'Certifications'))}
        </p>
        ${cv.certifications.map((c) => `<p style="font-size: 9.5pt; color: #f8fafc; margin: 0 0 4px 0;"><strong>${escapeHtml(c.name)}</strong>${c.issuer ? ` — ${escapeHtml(c.issuer)}` : ''}</p>`).join('')}
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; }
          table { width: 100%; border-collapse: collapse; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 10pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <!-- Left Colored Sidebar -->
            <td style="width: 32%; background-color: ${theme}; color: #ffffff; padding: 22px 18px; vertical-align: top;">
              <h1 style="color: #ffffff; font-size: 22pt; font-weight: bold; margin: 0 0 4px 0; line-height: 1.2;">
                ${fullName}
              </h1>
              <p style="color: #e0e7ff; font-size: 10.5pt; font-weight: bold; margin: 0 0 18px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                ${role}
              </p>
              
              <div style="border-top: 1px solid rgba(255,255,255,0.35); padding-top: 10px; margin-bottom: 16px;">
                <p style="color: #ffffff; font-size: 10.5pt; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase;">CONTACT</p>
                ${p.email ? `<p style="font-size: 9pt; color: #f8fafc; margin: 0 0 4px 0;">Email: ${escapeHtml(p.email)}</p>` : ''}
                ${p.phone ? `<p style="font-size: 9pt; color: #f8fafc; margin: 0 0 4px 0;">Phone: ${escapeHtml(p.phone)}</p>` : ''}
                ${p.location ? `<p style="font-size: 9pt; color: #f8fafc; margin: 0 0 4px 0;">Location: ${escapeHtml(p.location)}</p>` : ''}
                ${p.linkedin ? `<p style="font-size: 9pt; color: #f8fafc; margin: 0 0 4px 0;">LinkedIn: ${escapeHtml(p.linkedin)}</p>` : ''}
                ${p.github ? `<p style="font-size: 9pt; color: #f8fafc; margin: 0 0 4px 0;">GitHub: ${escapeHtml(p.github)}</p>` : ''}
                ${p.website ? `<p style="font-size: 9pt; color: #f8fafc; margin: 0 0 4px 0;">Web: ${escapeHtml(p.website)}</p>` : ''}
              </div>

              ${sidebarSkills}
              ${sidebarLanguages}
              ${sidebarCerts}
            </td>

            <!-- Right Main Area -->
            <td style="width: 68%; background-color: #ffffff; color: #1e293b; padding: 22px 24px; vertical-align: top;">
              ${cv.summary ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: ${theme}; border-bottom: 2px solid ${theme}; font-size: 12.5pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'summary', 'Professional Summary'))}
                  </h2>
                  <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0;">${escapeHtml(cv.summary)}</p>
                </div>
              ` : ''}

              ${cv.experiences && cv.experiences.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: ${theme}; border-bottom: 2px solid ${theme}; font-size: 12.5pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'experience', 'Work Experience'))}
                  </h2>
                  ${renderExperienceHtml('', theme)}
                </div>
              ` : ''}

              ${cv.projects && cv.projects.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: ${theme}; border-bottom: 2px solid ${theme}; font-size: 12.5pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'projects', 'Projects'))}
                  </h2>
                  ${renderProjectsHtml('', theme)}
                </div>
              ` : ''}

              ${cv.educations && cv.educations.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: ${theme}; border-bottom: 2px solid ${theme}; font-size: 12.5pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'education', 'Education'))}
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
  // 2. NORDIC CONTRAST TEMPLATE (Deep Midnight Slate Sidebar, Tabular Timeline)
  // =========================================================================
  if (templateId === 'nordic-contrast') {
    const initials = fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    const sidebarSkills = cv.skills && cv.skills.length > 0 ? `
      <div style="margin-top: 18px;">
        <p style="color: #ffffff; font-size: 10.5pt; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px; margin: 0 0 8px 0;">
          ${escapeHtml(getSectionTitle(cv, 'skills', 'Expertise'))}
        </p>
        ${cv.skills.map((s) => `
          <div style="margin-bottom: 8px;">
            <p style="color: #e2e8f0; font-size: 9pt; font-weight: bold; margin: 0 0 2px 0;">${escapeHtml(s.category)}</p>
            <p style="font-size: 8.5pt; color: #cbd5e1; margin: 0;">${escapeHtml(s.items.join(', '))}</p>
          </div>
        `).join('')}
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; }
          table { width: 100%; border-collapse: collapse; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 10pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <!-- Left Midnight Slate Sidebar -->
            <td style="width: 32%; background-color: #2d3748; color: #ffffff; padding: 24px 18px; vertical-align: top;">
              <div style="text-align: center; margin-bottom: 14px;">
                <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background-color: #4a5568; color: #ffffff; font-weight: bold; font-size: 18pt; border-radius: 24px; text-align: center; border: 2px solid rgba(255,255,255,0.3);">
                  ${initials}
                </div>
              </div>
              <h1 style="color: #ffffff; font-size: 20pt; font-weight: bold; margin: 0 0 4px 0; text-align: center; line-height: 1.2;">
                ${fullName}
              </h1>
              <p style="color: #cbd5e1; font-size: 9.5pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 0 0 16px 0; letter-spacing: 0.5px;">
                ${role}
              </p>

              <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; margin-bottom: 14px;">
                <p style="color: #ffffff; font-size: 10pt; font-weight: bold; margin: 0 0 6px 0;">CONTACT</p>
                ${p.email ? `<p style="font-size: 8.5pt; color: #e2e8f0; margin: 0 0 4px 0;">Email: ${escapeHtml(p.email)}</p>` : ''}
                ${p.phone ? `<p style="font-size: 8.5pt; color: #e2e8f0; margin: 0 0 4px 0;">Phone: ${escapeHtml(p.phone)}</p>` : ''}
                ${p.location ? `<p style="font-size: 8.5pt; color: #e2e8f0; margin: 0 0 4px 0;">Location: ${escapeHtml(p.location)}</p>` : ''}
                ${p.linkedin ? `<p style="font-size: 8.5pt; color: #e2e8f0; margin: 0 0 4px 0;">LinkedIn: ${escapeHtml(p.linkedin)}</p>` : ''}
                ${p.github ? `<p style="font-size: 8.5pt; color: #e2e8f0; margin: 0 0 4px 0;">GitHub: ${escapeHtml(p.github)}</p>` : ''}
                ${p.website ? `<p style="font-size: 8.5pt; color: #e2e8f0; margin: 0 0 4px 0;">Web: ${escapeHtml(p.website)}</p>` : ''}
              </div>

              ${sidebarSkills}
              ${cv.languages && cv.languages.length > 0 ? `
                <div style="margin-top: 16px;">
                  <p style="color: #ffffff; font-size: 10.5pt; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px; margin: 0 0 6px 0;">LANGUAGES</p>
                  ${cv.languages.map((l) => `<p style="font-size: 8.5pt; color: #e2e8f0; margin: 0 0 3px 0;">${escapeHtml(l.language)} (${escapeHtml(l.proficiency)})</p>`).join('')}
                </div>
              ` : ''}
            </td>

            <!-- Right Tabular Main Area -->
            <td style="width: 68%; background-color: #ffffff; color: #1e293b; padding: 24px; vertical-align: top;">
              ${cv.summary ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #2d3748; border-bottom: 2px solid #2d3748; font-size: 12pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'summary', 'Professional Summary'))}
                  </h2>
                  <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0;">${escapeHtml(cv.summary)}</p>
                </div>
              ` : ''}

              ${cv.experiences && cv.experiences.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #2d3748; border-bottom: 2px solid #2d3748; font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'experience', 'Experience'))}
                  </h2>
                  ${cv.experiences.map((exp) => `
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
                      <tr>
                        <td style="width: 25%; font-size: 9pt; font-weight: bold; color: #64748b; vertical-align: top; padding-right: 8px;">
                          ${escapeHtml(exp.startDate)} –<br/>${exp.isCurrent ? 'Present' : escapeHtml(exp.endDate || '')}
                        </td>
                        <td style="width: 75%; vertical-align: top;">
                          <p style="font-size: 10.5pt; font-weight: bold; color: #0f172a; margin: 0;">
                            ${escapeHtml(exp.jobTitle)} — <span style="color: #2d3748;">${escapeHtml(exp.employer)}</span>
                          </p>
                          ${(exp.highlights && exp.highlights.length > 0) ? `
                            <ul style="margin: 4px 0 0 0; padding-left: 16px;">
                              ${exp.highlights.filter((h) => h.trim()).map((h) => `<li style="font-size: 9.5pt; color: #334155; margin-bottom: 2px;">${escapeHtml(h)}</li>`).join('')}
                            </ul>
                          ` : ''}
                        </td>
                      </tr>
                    </table>
                  `).join('')}
                </div>
              ` : ''}

              ${cv.educations && cv.educations.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #2d3748; border-bottom: 2px solid #2d3748; font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'education', 'Education'))}
                  </h2>
                  ${renderEducationHtml()}
                </div>
              ` : ''}

              ${cv.projects && cv.projects.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #2d3748; border-bottom: 2px solid #2d3748; font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'projects', 'Projects'))}
                  </h2>
                  ${renderProjectsHtml()}
                </div>
              ` : ''}

              ${renderCustomSectionsHtml('#2d3748')}
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 3. SANDSTONE EXECUTIVE TEMPLATE (Warm Sand Header, 2-Column, Accent Footer)
  // =========================================================================
  if (templateId === 'sandstone-executive') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; }
          table { width: 100%; border-collapse: collapse; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 10pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <!-- Header Banner Block -->
        <table style="width: 100%; background-color: #f7f4ee; border-top: 6px solid ${theme}; border-bottom: 2px solid ${theme}; margin-bottom: 16px; border-collapse: collapse;">
          <tr>
            <td style="padding: 20px 22px;">
              <h1 style="color: #1e293b; font-size: 24pt; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase;">
                ${fullName}
              </h1>
              <p style="color: ${theme}; font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: 0.5px;">
                ${role}
              </p>
              <p style="color: #64748b; font-size: 9.5pt; margin: 0;">${contactList.join('   •   ')}</p>
            </td>
          </tr>
        </table>

        <!-- 2-Column Body -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <!-- Left Column: Education & Skills -->
            <td style="width: 35%; padding-right: 18px; vertical-align: top; border-right: 1px solid #e2e8f0;">
              ${cv.educations && cv.educations.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #1e293b; border-bottom: 1.5px solid ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'education', 'Education'))}
                  </h2>
                  ${renderEducationHtml()}
                </div>
              ` : ''}

              ${cv.skills && cv.skills.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #1e293b; border-bottom: 1.5px solid ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'skills', 'Key Skills'))}
                  </h2>
                  ${renderSkillsHtml()}
                </div>
              ` : ''}

              ${cv.certifications && cv.certifications.length > 0 ? `
                <div style="margin-bottom: 16px;">
                  <h2 style="color: #1e293b; border-bottom: 1.5px solid ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'certifications', 'Certifications'))}
                  </h2>
                  ${renderCertificationsHtml()}
                </div>
              ` : ''}

              ${cv.languages && cv.languages.length > 0 ? `
                <div style="margin-bottom: 16px;">
                  <h2 style="color: #1e293b; border-bottom: 1.5px solid ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'languages', 'Languages'))}
                  </h2>
                  ${renderLanguagesHtml()}
                </div>
              ` : ''}
            </td>

            <!-- Right Column: Summary, Experience, Projects -->
            <td style="width: 65%; padding-left: 20px; vertical-align: top;">
              ${cv.summary ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #1e293b; border-bottom: 1.5px solid ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'summary', 'Executive Profile'))}
                  </h2>
                  <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0;">${escapeHtml(cv.summary)}</p>
                </div>
              ` : ''}

              ${cv.experiences && cv.experiences.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #1e293b; border-bottom: 1.5px solid ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'experience', 'Experience'))}
                  </h2>
                  ${renderExperienceHtml('', theme)}
                </div>
              ` : ''}

              ${cv.projects && cv.projects.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #1e293b; border-bottom: 1.5px solid ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'projects', 'Projects'))}
                  </h2>
                  ${renderProjectsHtml('', theme)}
                </div>
              ` : ''}

              ${renderCustomSectionsHtml(theme)}
            </td>
          </tr>
        </table>

        <!-- Grounded Accent Footer -->
        <table style="width: 100%; height: 6px; background-color: ${theme}; border-collapse: collapse; margin-top: 10px;">
          <tr><td></td></tr>
        </table>
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 4. GENEVA GRID TEMPLATE (Architectural Grid, Two-Tone Header, Boxed Modules)
  // =========================================================================
  if (templateId === 'geneva-grid') {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : fullName;
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; }
          table { width: 100%; border-collapse: collapse; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 10pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 16px;">
          <h1 style="margin: 0; font-size: 24pt; font-weight: 800; line-height: 1.2;">
            <span style="color: #0f172a;">${firstName} </span>
            <span style="color: ${theme};">${lastName}</span>
          </h1>
          <p style="color: #64748b; font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 4px 0 8px 0;">
            ${role}
          </p>
          <p style="color: #475569; font-size: 9.5pt; margin: 0;">${contactList.join('   ·   ')}</p>
        </div>

        ${cv.summary ? `
          <table style="width: 100%; border: 1px solid #e2e8f0; border-top: 3.5px solid ${theme}; background-color: #ffffff; margin-bottom: 16px; border-collapse: collapse;">
            <tr>
              <td style="padding: 14px 16px;">
                <p style="color: ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase;">
                  ${escapeHtml(getSectionTitle(cv, 'summary', 'Profile'))}
                </p>
                <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0;">${escapeHtml(cv.summary)}</p>
              </td>
            </tr>
          </table>
        ` : ''}

        <!-- 2-Column Grid -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <!-- Left Grid (38%) -->
            <td style="width: 38%; padding-right: 12px; vertical-align: top;">
              ${cv.educations && cv.educations.length > 0 ? `
                <table style="width: 100%; border: 1px solid #e2e8f0; border-top: 3.5px solid ${theme}; margin-bottom: 14px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 14px;">
                      <p style="color: ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                        ${escapeHtml(getSectionTitle(cv, 'education', 'Education'))}
                      </p>
                      ${renderEducationHtml()}
                    </td>
                  </tr>
                </table>
              ` : ''}

              ${cv.skills && cv.skills.length > 0 ? `
                <table style="width: 100%; border: 1px solid #e2e8f0; border-top: 3.5px solid ${theme}; margin-bottom: 14px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 14px;">
                      <p style="color: ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                        ${escapeHtml(getSectionTitle(cv, 'skills', 'Skills'))}
                      </p>
                      ${renderSkillsHtml()}
                    </td>
                  </tr>
                </table>
              ` : ''}
            </td>

            <!-- Right Grid (62%) -->
            <td style="width: 62%; padding-left: 12px; vertical-align: top;">
              ${cv.experiences && cv.experiences.length > 0 ? `
                <table style="width: 100%; border: 1px solid #e2e8f0; border-top: 3.5px solid ${theme}; margin-bottom: 14px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <p style="color: ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase;">
                        ${escapeHtml(getSectionTitle(cv, 'experience', 'Experience'))}
                      </p>
                      ${renderExperienceHtml('', theme)}
                    </td>
                  </tr>
                </table>
              ` : ''}

              ${cv.projects && cv.projects.length > 0 ? `
                <table style="width: 100%; border: 1px solid #e2e8f0; border-top: 3.5px solid ${theme}; margin-bottom: 14px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <p style="color: ${theme}; font-size: 11pt; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase;">
                        ${escapeHtml(getSectionTitle(cv, 'projects', 'Projects'))}
                      </p>
                      ${renderProjectsHtml('', theme)}
                    </td>
                  </tr>
                </table>
              ` : ''}
            </td>
          </tr>
        </table>

        ${(cv.certifications?.length || cv.languages?.length) ? `
          <table style="width: 100%; border: 1px solid #e2e8f0; border-top: 3.5px solid ${theme}; margin-bottom: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 16px;">
                ${renderCertificationsHtml()}
                ${renderLanguagesHtml()}
              </td>
            </tr>
          </table>
        ` : ''}

        ${renderCustomSectionsHtml(theme)}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 5. BOTANICAL TERRACOTTA TEMPLATE (Cream / Terracotta Palette, Soft Panel)
  // =========================================================================
  if (templateId === 'botanical-terracotta') {
    const terracotta = cv.themeColor || '#a35638';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'EB Garamond', Georgia, serif; font-size: 10.5pt; color: #292524; margin: 0; padding: 0; background-color: #fcfaf6; }
          table { width: 100%; border-collapse: collapse; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 10pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <table style="width: 100%; border-collapse: collapse; background-color: #fcfaf6;">
          <tr>
            <!-- Left Soft Sage / Earthy Panel -->
            <td style="width: 32%; background-color: #f3eee7; padding: 22px 16px; vertical-align: top; border-radius: 6px;">
              <p style="color: ${terracotta}; font-size: 11pt; font-weight: bold; margin: 0 0 6px 0; text-transform: uppercase;">
                CONTACT
              </p>
              ${p.email ? `<p style="font-size: 9pt; color: #44403c; margin: 0 0 4px 0;">${escapeHtml(p.email)}</p>` : ''}
              ${p.phone ? `<p style="font-size: 9pt; color: #44403c; margin: 0 0 4px 0;">${escapeHtml(p.phone)}</p>` : ''}
              ${p.location ? `<p style="font-size: 9pt; color: #44403c; margin: 0 0 4px 0;">${escapeHtml(p.location)}</p>` : ''}
              ${p.linkedin ? `<p style="font-size: 9pt; color: #44403c; margin: 0 0 4px 0;">${escapeHtml(p.linkedin)}</p>` : ''}
              ${p.website ? `<p style="font-size: 9pt; color: #44403c; margin: 0 0 4px 0;">${escapeHtml(p.website)}</p>` : ''}

              ${cv.skills && cv.skills.length > 0 ? `
                <div style="margin-top: 18px;">
                  <p style="color: ${terracotta}; font-size: 11pt; font-weight: bold; border-bottom: 1px solid #d6d3d1; padding-bottom: 3px; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'skills', 'Core Skills'))}
                  </p>
                  ${cv.skills.map((s) => `
                    <div style="margin-bottom: 8px;">
                      <p style="color: #292524; font-size: 9.5pt; font-weight: bold; margin: 0 0 2px 0;">${escapeHtml(s.category)}</p>
                      <p style="font-size: 9pt; color: #57534e; margin: 0;">${escapeHtml(s.items.join(', '))}</p>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              ${cv.educations && cv.educations.length > 0 ? `
                <div style="margin-top: 18px;">
                  <p style="color: ${terracotta}; font-size: 11pt; font-weight: bold; border-bottom: 1px solid #d6d3d1; padding-bottom: 3px; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'education', 'Education'))}
                  </p>
                  ${renderEducationHtml()}
                </div>
              ` : ''}

              ${cv.languages && cv.languages.length > 0 ? `
                <div style="margin-top: 16px;">
                  <p style="color: ${terracotta}; font-size: 11pt; font-weight: bold; border-bottom: 1px solid #d6d3d1; padding-bottom: 3px; margin: 0 0 6px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'languages', 'Languages'))}
                  </p>
                  ${renderLanguagesHtml()}
                </div>
              ` : ''}
            </td>

            <!-- Right Main Area -->
            <td style="width: 68%; padding: 22px 24px; vertical-align: top;">
              <h1 style="color: #292524; font-size: 26pt; font-weight: bold; margin: 0 0 2px 0; font-family: 'EB Garamond', Georgia, serif;">
                ${fullName}
              </h1>
              <p style="color: ${terracotta}; font-size: 12pt; font-style: italic; margin: 0 0 16px 0;">
                ${role}
              </p>

              ${cv.summary ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: ${terracotta}; border-bottom: 1px solid #d6d3d1; font-size: 12pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'summary', 'Professional Profile'))}
                  </h2>
                  <p style="font-size: 10.5pt; color: #44403c; line-height: 1.6; margin: 0;">${escapeHtml(cv.summary)}</p>
                </div>
              ` : ''}

              ${cv.experiences && cv.experiences.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: ${terracotta}; border-bottom: 1px solid #d6d3d1; font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'experience', 'Experience'))}
                  </h2>
                  ${renderExperienceHtml('', terracotta)}
                </div>
              ` : ''}

              ${cv.projects && cv.projects.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: ${terracotta}; border-bottom: 1px solid #d6d3d1; font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase;">
                    ${escapeHtml(getSectionTitle(cv, 'projects', 'Projects'))}
                  </h2>
                  ${renderProjectsHtml('', terracotta)}
                </div>
              ` : ''}

              ${renderCustomSectionsHtml(terracotta)}
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 6. SILICON ACCENT TEMPLATE (Developer Layout, Vibrant Badge, Callout Bar)
  // =========================================================================
  if (templateId === 'silicon-accent') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; }
          table { width: 100%; border-collapse: collapse; }
          ul { margin: 4px 0 8px 0; padding-left: 18px; }
          li { font-size: 10pt; margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div style="border-bottom: 1.5px solid #cbd5e1; padding-bottom: 14px; margin-bottom: 16px;">
          <h1 style="color: #0f172a; font-size: 24pt; font-weight: bold; margin: 0 0 4px 0;">
            ${fullName}
          </h1>
          <div style="margin: 4px 0 8px 0;">
            <span style="background-color: ${theme}; color: #0f172a; font-weight: bold; font-size: 10pt; padding: 3px 10px; border-radius: 4px; display: inline-block;">
              ${role}
            </span>
          </div>
          <p style="color: #64748b; font-size: 9.5pt; margin: 0;">${contactList.join('   |   ')}</p>
        </div>

        ${cv.summary ? `
          <div style="border-left: 4px solid ${theme}; background-color: #f8fafc; padding: 12px 16px; margin-bottom: 18px;">
            <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0;">${escapeHtml(cv.summary)}</p>
          </div>
        ` : ''}

        <!-- 2-Column Structure -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <!-- Left (35%): Skills & Education -->
            <td style="width: 35%; padding-right: 18px; vertical-align: top; border-right: 1px solid #e2e8f0;">
              ${cv.skills && cv.skills.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #0f172a; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    // ${escapeHtml(getSectionTitle(cv, 'skills', 'Technical Skills'))}
                  </h2>
                  ${renderSkillsHtml()}
                </div>
              ` : ''}

              ${cv.educations && cv.educations.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #0f172a; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    // ${escapeHtml(getSectionTitle(cv, 'education', 'Education'))}
                  </h2>
                  ${renderEducationHtml()}
                </div>
              ` : ''}

              ${cv.certifications && cv.certifications.length > 0 ? `
                <div style="margin-bottom: 16px;">
                  <h2 style="color: #0f172a; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    // ${escapeHtml(getSectionTitle(cv, 'certifications', 'Certifications'))}
                  </h2>
                  ${renderCertificationsHtml()}
                </div>
              ` : ''}
            </td>

            <!-- Right (65%): Experience & Projects -->
            <td style="width: 65%; padding-left: 20px; vertical-align: top;">
              ${cv.experiences && cv.experiences.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #0f172a; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    // ${escapeHtml(getSectionTitle(cv, 'experience', 'Experience'))}
                  </h2>
                  ${renderExperienceHtml('', theme)}
                </div>
              ` : ''}

              ${cv.projects && cv.projects.length > 0 ? `
                <div style="margin-bottom: 18px;">
                  <h2 style="color: #0f172a; font-size: 11pt; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">
                    // ${escapeHtml(getSectionTitle(cv, 'projects', 'Projects'))}
                  </h2>
                  ${renderProjectsHtml('', theme)}
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
  // 7. EDINBURGH TIMELINE TEMPLATE (Continuous Vertical Timeline Rail)
  // =========================================================================
  if (templateId === 'edinburgh-timeline') {
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
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'summary', 'Professional Profile'))}</div>
          <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0 0 16px 0;">${escapeHtml(cv.summary)}</p>
        ` : ''}

        ${cv.experiences && cv.experiences.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'experience', 'Career Timeline (Work Experience)'))}</div>
          ${renderExperienceHtml(`border-left: 3px solid ${theme}; padding-left: 14px; margin-left: 4px;`)}
        ` : ''}

        ${cv.educations && cv.educations.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'education', 'Education & Credentials'))}</div>
          ${renderEducationHtml(`border-left: 3px solid ${theme}; padding-left: 14px; margin-left: 4px;`)}
        ` : ''}

        ${cv.skills && cv.skills.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'skills', 'Skills & Competencies'))}</div>
          ${renderSkillsHtml()}
        ` : ''}

        ${cv.projects && cv.projects.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'projects', 'Projects'))}</div>
          ${renderProjectsHtml()}
        ` : ''}

        ${cv.certifications && cv.certifications.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'certifications', 'Certifications'))}</div>
          ${renderCertificationsHtml()}
        ` : ''}

        ${cv.languages && cv.languages.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'languages', 'Languages'))}</div>
          ${renderLanguagesHtml()}
        ` : ''}

        ${renderCustomSectionsHtml(theme)}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 8. CAMBRIDGE ACCENT TEMPLATE (Top Colored Banner, Left Accent Border Heads)
  // =========================================================================
  if (templateId === 'cambridge-accent') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; }
          .banner-table { width: 100%; background-color: ${theme}; color: #ffffff; margin-bottom: 16px; border-collapse: collapse; }
          .section-header { border-left: 5px solid ${theme}; padding-left: 10px; color: ${theme}; font-weight: bold; font-size: 12.5pt; text-transform: uppercase; margin: 18px 0 8px 0; }
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
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'summary', 'Professional Profile'))}</div>
          <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0 0 16px 0;">${escapeHtml(cv.summary)}</p>
        ` : ''}

        ${cv.experiences && cv.experiences.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'experience', 'Work Experience'))}</div>
          ${renderExperienceHtml()}
        ` : ''}

        ${cv.projects && cv.projects.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'projects', 'Key Projects'))}</div>
          ${renderProjectsHtml()}
        ` : ''}

        ${cv.educations && cv.educations.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'education', 'Education'))}</div>
          ${renderEducationHtml()}
        ` : ''}

        ${cv.skills && cv.skills.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'skills', 'Skills & Technologies'))}</div>
          ${renderSkillsHtml()}
        ` : ''}

        ${cv.certifications && cv.certifications.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'certifications', 'Certifications'))}</div>
          ${renderCertificationsHtml()}
        ` : ''}

        ${cv.languages && cv.languages.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'languages', 'Languages'))}</div>
          ${renderLanguagesHtml()}
        ` : ''}

        ${renderCustomSectionsHtml(theme)}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 9. LONDON CORPORATE TEMPLATE (Dark Navy Header Banner, Double Accent Line)
  // =========================================================================
  if (templateId === 'london-corporate') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; }
          .corp-table { width: 100%; background-color: #0f172a; border-bottom: 4px solid ${theme}; color: #ffffff; margin-bottom: 18px; border-collapse: collapse; }
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
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'summary', 'Executive Summary'))}</div>
          <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0 0 16px 0;">${escapeHtml(cv.summary)}</p>
        ` : ''}

        ${cv.experiences && cv.experiences.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'experience', 'Professional Experience'))}</div>
          ${renderExperienceHtml()}
        ` : ''}

        ${cv.educations && cv.educations.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'education', 'Education'))}</div>
          ${renderEducationHtml()}
        ` : ''}

        ${cv.skills && cv.skills.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'skills', 'Core Competencies'))}</div>
          ${renderSkillsHtml()}
        ` : ''}

        ${cv.projects && cv.projects.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'projects', 'Key Projects'))}</div>
          ${renderProjectsHtml()}
        ` : ''}

        ${cv.certifications && cv.certifications.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'certifications', 'Certifications'))}</div>
          ${renderCertificationsHtml()}
        ` : ''}

        ${cv.languages && cv.languages.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'languages', 'Languages'))}</div>
          ${renderLanguagesHtml()}
        ` : ''}

        ${renderCustomSectionsHtml(theme)}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 10. TECH COMPACT TEMPLATE (Monospaced Consolas, Terminal Header, Code Box)
  // =========================================================================
  if (templateId === 'tech-compact') {
    const techStackBox = cv.skills && cv.skills.length > 0 ? `
      <table style="width: 100%; background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid ${theme}; margin-bottom: 14px; font-family: Consolas, monospace; border-collapse: collapse;">
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
          <div class="section-header">// ${escapeHtml(getSectionTitle(cv, 'experience', 'Work Experience'))}</div>
          ${renderExperienceHtml()}
        ` : ''}

        ${cv.projects && cv.projects.length > 0 ? `
          <div class="section-header">// ${escapeHtml(getSectionTitle(cv, 'projects', 'Projects'))}</div>
          ${renderProjectsHtml()}
        ` : ''}

        ${cv.educations && cv.educations.length > 0 ? `
          <div class="section-header">// ${escapeHtml(getSectionTitle(cv, 'education', 'Education'))}</div>
          ${renderEducationHtml()}
        ` : ''}

        ${cv.certifications && cv.certifications.length > 0 ? `
          <div class="section-header">// ${escapeHtml(getSectionTitle(cv, 'certifications', 'Certifications'))}</div>
          ${renderCertificationsHtml()}
        ` : ''}

        ${cv.languages && cv.languages.length > 0 ? `
          <div class="section-header">// ${escapeHtml(getSectionTitle(cv, 'languages', 'Languages'))}</div>
          ${renderLanguagesHtml()}
        ` : ''}

        ${renderCustomSectionsHtml(theme)}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 11. ACADEMIC CLASSIC TEMPLATE (Serif EB Garamond, Centered Academic Header)
  // =========================================================================
  if (templateId === 'academic-classic') {
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
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'summary', 'Profile & Research Statement'))}</div>
          <p style="font-size: 10.5pt; color: #292524; line-height: 1.6; margin: 0 0 16px 0;">${escapeHtml(cv.summary)}</p>
        ` : ''}

        ${cv.educations && cv.educations.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'education', 'Education & Qualifications'))}</div>
          ${renderEducationHtml()}
        ` : ''}

        ${cv.experiences && cv.experiences.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'experience', 'Academic & Professional Appointments'))}</div>
          ${renderExperienceHtml()}
        ` : ''}

        ${cv.projects && cv.projects.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'projects', 'Research Projects & Publications'))}</div>
          ${renderProjectsHtml()}
        ` : ''}

        ${cv.skills && cv.skills.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'skills', 'Areas of Expertise'))}</div>
          ${renderSkillsHtml()}
        ` : ''}

        ${cv.certifications && cv.certifications.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'certifications', 'Honors & Awards'))}</div>
          ${renderCertificationsHtml()}
        ` : ''}

        ${cv.languages && cv.languages.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'languages', 'Languages'))}</div>
          ${renderLanguagesHtml()}
        ` : ''}

        ${renderCustomSectionsHtml('#44403c')}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 12. MINIMALIST CLEAN TEMPLATE (High Whitespace, Hairline Dividers, ATS Clear)
  // =========================================================================
  if (templateId === 'minimalist-clean') {
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
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'summary', 'Profile'))}</div>
          <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0 0 16px 0;">${escapeHtml(cv.summary)}</p>
        ` : ''}

        ${cv.experiences && cv.experiences.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'experience', 'Experience'))}</div>
          ${renderExperienceHtml()}
        ` : ''}

        ${cv.educations && cv.educations.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'education', 'Education'))}</div>
          ${renderEducationHtml()}
        ` : ''}

        ${cv.skills && cv.skills.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'skills', 'Skills'))}</div>
          ${renderSkillsHtml()}
        ` : ''}

        ${cv.projects && cv.projects.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'projects', 'Projects'))}</div>
          ${renderProjectsHtml()}
        ` : ''}

        ${cv.certifications && cv.certifications.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'certifications', 'Certifications'))}</div>
          ${renderCertificationsHtml()}
        ` : ''}

        ${cv.languages && cv.languages.length > 0 ? `
          <div class="section-header">${escapeHtml(getSectionTitle(cv, 'languages', 'Languages'))}</div>
          ${renderLanguagesHtml()}
        ` : ''}

        ${renderCustomSectionsHtml(theme)}
      </body>
      </html>
    `;
  }

  // =========================================================================
  // 13. MODERN EXECUTIVE (DEFAULT) TEMPLATE (Solid Header & Section Accents)
  // =========================================================================
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: ${font}; font-size: 10pt; color: #1e293b; margin: 0; padding: 0; line-height: 1.5; }
        .mod-header { border-bottom: 3.5px solid ${theme}; padding-bottom: 14px; margin-bottom: 18px; }
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
        <div class="section-header">${escapeHtml(getSectionTitle(cv, 'summary', 'Professional Summary'))}</div>
        <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 0 0 16px 0;">${escapeHtml(cv.summary)}</p>
      ` : ''}

      ${cv.experiences && cv.experiences.length > 0 ? `
        <div class="section-header">${escapeHtml(getSectionTitle(cv, 'experience', 'Work Experience'))}</div>
        ${renderExperienceHtml()}
      ` : ''}

      ${cv.educations && cv.educations.length > 0 ? `
        <div class="section-header">${escapeHtml(getSectionTitle(cv, 'education', 'Education'))}</div>
        ${renderEducationHtml()}
      ` : ''}

      ${cv.skills && cv.skills.length > 0 ? `
        <div class="section-header">${escapeHtml(getSectionTitle(cv, 'skills', 'Skills & Expertise'))}</div>
        ${renderSkillsHtml()}
      ` : ''}

      ${cv.projects && cv.projects.length > 0 ? `
        <div class="section-header">${escapeHtml(getSectionTitle(cv, 'projects', 'Key Projects'))}</div>
        ${renderProjectsHtml()}
      ` : ''}

      ${cv.certifications && cv.certifications.length > 0 ? `
        <div class="section-header">${escapeHtml(getSectionTitle(cv, 'certifications', 'Certifications'))}</div>
        ${renderCertificationsHtml()}
      ` : ''}

      ${cv.languages && cv.languages.length > 0 ? `
        <div class="section-header">${escapeHtml(getSectionTitle(cv, 'languages', 'Languages'))}</div>
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
 * Creates empty borders for borderless docx tables
 */
const createDocxBorderNone = () => ({
  top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
});

/**
 * Creates a section heading with authentic Word colored underline border
 */
const createSectionHeader = (
  title: string,
  themeHex: string,
  font: string,
  options?: { isWhite?: boolean; isCentered?: boolean; noBorder?: boolean; size?: number }
): Paragraph => {
  const isWhite = options?.isWhite ?? false;
  const isCentered = options?.isCentered ?? false;
  const noBorder = options?.noBorder ?? false;
  const size = options?.size ?? 22;

  return new Paragraph({
    alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size, // 22 = 11pt
        color: isWhite ? 'FFFFFF' : themeHex,
        font,
      }),
    ],
    spacing: { before: 200, after: 80 },
    ...(!noBorder && !isWhite
      ? {
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 12,
              color: themeHex,
              space: 4,
            },
          },
        }
      : {}),
  });
};

/**
 * Helper generators for DOCX components
 */
const getDocxSummaryParagraphs = (
  cv: CVData,
  font: string,
  themeHex: string,
  isWhite = false,
  isCentered = false
): Paragraph[] => {
  if (!cv.summary || !cv.summary.trim()) return [];
  const paras: Paragraph[] = [];
  paras.push(
    createSectionHeader(
      getSectionTitle(cv, 'summary', 'Professional Summary'),
      themeHex,
      font,
      { isWhite, isCentered }
    )
  );
  paras.push(
    new Paragraph({
      alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [
        new TextRun({
          text: cv.summary.trim(),
          size: 20, // 10pt
          color: isWhite ? 'F8FAFC' : '334155',
          font,
        }),
      ],
      spacing: { after: 140, line: 276 },
    })
  );
  return paras;
};

const getDocxExperienceParagraphs = (
  cv: CVData,
  font: string,
  themeHex: string,
  isWhite = false
): Paragraph[] => {
  if (!cv.experiences || cv.experiences.length === 0) return [];
  const paras: Paragraph[] = [];
  paras.push(
    createSectionHeader(
      getSectionTitle(cv, 'experience', 'Work Experience'),
      themeHex,
      font,
      { isWhite }
    )
  );

  cv.experiences.forEach((exp) => {
    const roleRuns: TextRun[] = [
      new TextRun({
        text: exp.jobTitle || 'Role',
        bold: true,
        size: 21, // 10.5pt
        color: isWhite ? 'FFFFFF' : '0F172A',
        font,
      }),
    ];

    if (exp.employer) {
      roleRuns.push(
        new TextRun({
          text: ' — ',
          bold: true,
          size: 21,
          color: isWhite ? 'CBD5E1' : '64748B',
          font,
        }),
        new TextRun({
          text: exp.employer,
          bold: true,
          size: 21,
          color: isWhite ? 'FFFFFF' : themeHex,
          font,
        })
      );
    }

    paras.push(
      new Paragraph({
        children: roleRuns,
        spacing: { before: 110, after: 30 },
      })
    );

    const dates = `${exp.startDate || ''} — ${exp.isCurrent ? 'Present' : exp.endDate || ''}${
      exp.location ? ` | ${exp.location}` : ''
    }`;
    if (dates.trim()) {
      paras.push(
        new Paragraph({
          children: [
            new TextRun({
              text: dates,
              size: 18, // 9pt
              color: isWhite ? 'E2E8F0' : '64748B',
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
        paras.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: hl.trim(),
                size: 19, // 9.5pt
                color: isWhite ? 'F8FAFC' : '334155',
                font,
              }),
            ],
            spacing: { after: 35 },
          })
        );
      });
  });

  return paras;
};

const getDocxProjectsParagraphs = (
  cv: CVData,
  font: string,
  themeHex: string,
  isWhite = false
): Paragraph[] => {
  if (!cv.projects || cv.projects.length === 0) return [];
  const paras: Paragraph[] = [];
  paras.push(
    createSectionHeader(
      getSectionTitle(cv, 'projects', 'Projects'),
      themeHex,
      font,
      { isWhite }
    )
  );

  cv.projects.forEach((proj) => {
    const projRuns: TextRun[] = [
      new TextRun({
        text: proj.title || 'Project',
        bold: true,
        size: 21,
        color: isWhite ? 'FFFFFF' : '0F172A',
        font,
      }),
    ];

    if (proj.subtitle) {
      projRuns.push(
        new TextRun({
          text: ' — ',
          bold: true,
          size: 21,
          color: isWhite ? 'CBD5E1' : '64748B',
          font,
        }),
        new TextRun({
          text: proj.subtitle,
          bold: false,
          size: 20,
          color: isWhite ? 'FFFFFF' : themeHex,
          font,
        })
      );
    }

    if (proj.link) {
      projRuns.push(
        new TextRun({
          text: ` (${proj.link})`,
          size: 18,
          color: isWhite ? 'E2E8F0' : '64748B',
          font,
        })
      );
    }

    paras.push(
      new Paragraph({
        children: projRuns,
        spacing: { before: 110, after: 30 },
      })
    );

    if (proj.description) {
      proj.description.split('\n').forEach((line) => {
        if (line.trim()) {
          paras.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 19,
                  color: isWhite ? 'F8FAFC' : '334155',
                  font,
                }),
              ],
              spacing: { after: 35 },
            })
          );
        }
      });
    }

    (proj.highlights || [])
      .filter((h) => h && h.trim())
      .forEach((hl) => {
        paras.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: hl.trim(),
                size: 19,
                color: isWhite ? 'F8FAFC' : '334155',
                font,
              }),
            ],
            spacing: { after: 35 },
          })
        );
      });
  });

  return paras;
};

const getDocxEducationParagraphs = (
  cv: CVData,
  font: string,
  themeHex: string,
  isWhite = false
): Paragraph[] => {
  if (!cv.educations || cv.educations.length === 0) return [];
  const paras: Paragraph[] = [];
  paras.push(
    createSectionHeader(
      getSectionTitle(cv, 'education', 'Education'),
      themeHex,
      font,
      { isWhite }
    )
  );

  cv.educations.forEach((edu) => {
    const degreeText = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');
    const eduRuns: TextRun[] = [
      new TextRun({
        text: degreeText || edu.degree || 'Degree',
        bold: true,
        size: 21,
        color: isWhite ? 'FFFFFF' : '0F172A',
        font,
      }),
    ];

    if (edu.school) {
      eduRuns.push(
        new TextRun({
          text: ' — ',
          bold: true,
          size: 21,
          color: isWhite ? 'CBD5E1' : '64748B',
          font,
        }),
        new TextRun({
          text: edu.school,
          bold: false,
          size: 20,
          color: isWhite ? 'FFFFFF' : '475569',
          font,
        })
      );
    }

    paras.push(
      new Paragraph({
        children: eduRuns,
        spacing: { before: 110, after: 30 },
      })
    );

    const dates = `${edu.startDate || ''} — ${edu.isCurrent ? 'Present' : edu.endDate || ''}${
      edu.location ? ` | ${edu.location}` : ''
    }`;
    if (dates.trim()) {
      paras.push(
        new Paragraph({
          children: [
            new TextRun({
              text: dates,
              size: 18,
              color: isWhite ? 'E2E8F0' : '64748B',
              font,
            }),
          ],
          spacing: { after: 30 },
        })
      );
    }

    if (edu.grade) {
      paras.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Grade / Classification: ${edu.grade}`,
              size: 18,
              color: isWhite ? 'CBD5E1' : '64748B',
              font,
            }),
          ],
          spacing: { after: 30 },
        })
      );
    }
  });

  return paras;
};

const getDocxSkillsParagraphs = (
  cv: CVData,
  font: string,
  themeHex: string,
  isWhite = false
): Paragraph[] => {
  if (!cv.skills || cv.skills.length === 0) return [];
  const paras: Paragraph[] = [];
  paras.push(
    createSectionHeader(
      getSectionTitle(cv, 'skills', 'Key Skills'),
      themeHex,
      font,
      { isWhite }
    )
  );

  cv.skills.forEach((skill) => {
    paras.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${skill.category}: `,
            bold: true,
            size: 20,
            color: isWhite ? 'FFFFFF' : '0F172A',
            font,
          }),
          new TextRun({
            text: skill.items.join(', '),
            size: 19,
            color: isWhite ? 'F1F5F9' : '334155',
            font,
          }),
        ],
        spacing: { after: 45 },
      })
    );
  });

  return paras;
};

const getDocxCertificationsParagraphs = (
  cv: CVData,
  font: string,
  themeHex: string,
  isWhite = false
): Paragraph[] => {
  if (!cv.certifications || cv.certifications.length === 0) return [];
  const paras: Paragraph[] = [];
  paras.push(
    createSectionHeader(
      getSectionTitle(cv, 'certifications', 'Certifications'),
      themeHex,
      font,
      { isWhite }
    )
  );

  cv.certifications.forEach((cert) => {
    const certRuns: TextRun[] = [
      new TextRun({
        text: cert.name,
        bold: true,
        size: 20,
        color: isWhite ? 'FFFFFF' : '0F172A',
        font,
      }),
    ];
    if (cert.issuer) {
      certRuns.push(
        new TextRun({
          text: ` — ${cert.issuer}`,
          size: 19,
          color: isWhite ? 'E2E8F0' : '475569',
          font,
        })
      );
    }
    if (cert.issueDate) {
      certRuns.push(
        new TextRun({
          text: ` (${cert.issueDate})`,
          size: 18,
          color: isWhite ? 'CBD5E1' : '64748B',
          font,
        })
      );
    }
    paras.push(
      new Paragraph({
        children: certRuns,
        spacing: { after: 35 },
      })
    );
  });

  return paras;
};

const getDocxLanguagesParagraphs = (
  cv: CVData,
  font: string,
  themeHex: string,
  isWhite = false
): Paragraph[] => {
  if (!cv.languages || cv.languages.length === 0) return [];
  const paras: Paragraph[] = [];
  paras.push(
    createSectionHeader(
      getSectionTitle(cv, 'languages', 'Languages'),
      themeHex,
      font,
      { isWhite }
    )
  );

  cv.languages.forEach((lang) => {
    paras.push(
      new Paragraph({
        children: [
          new TextRun({
            text: lang.language,
            bold: true,
            size: 19,
            color: isWhite ? 'FFFFFF' : '0F172A',
            font,
          }),
          new TextRun({
            text: ` (${lang.proficiency})`,
            size: 18,
            color: isWhite ? 'E2E8F0' : '475569',
            font,
          }),
        ],
        spacing: { after: 30 },
      })
    );
  });

  return paras;
};

const getDocxCustomSectionsParagraphs = (
  cv: CVData,
  font: string,
  themeHex: string,
  isWhite = false
): Paragraph[] => {
  if (!cv.customSections || cv.customSections.length === 0) return [];
  const paras: Paragraph[] = [];

  cv.customSections.forEach((sec) => {
    paras.push(
      createSectionHeader(
        sec.sectionTitle || 'Additional Information',
        themeHex,
        font,
        { isWhite }
      )
    );
    (sec.items || []).forEach((item) => {
      const itemRuns: TextRun[] = [
        new TextRun({
          text: item.title,
          bold: true,
          size: 20,
          color: isWhite ? 'FFFFFF' : '0F172A',
          font,
        }),
      ];
      if (item.subtitle) {
        itemRuns.push(
          new TextRun({
            text: ` — ${item.subtitle}`,
            size: 19,
            color: isWhite ? 'E2E8F0' : themeHex,
            font,
          })
        );
      }
      if (item.date) {
        itemRuns.push(
          new TextRun({
            text: ` (${item.date})`,
            size: 18,
            color: isWhite ? 'CBD5E1' : '64748B',
            font,
          })
        );
      }
      paras.push(
        new Paragraph({
          children: itemRuns,
          spacing: { before: 80, after: 20 },
        })
      );
      if (item.description) {
        paras.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.description,
                size: 19,
                color: isWhite ? 'F8FAFC' : '334155',
                font,
              }),
            ],
            spacing: { after: 35 },
          })
        );
      }
    });
  });

  return paras;
};

const getDocxContactRuns = (
  p: CVData['personalDetails'],
  font: string,
  isWhite = false
): TextRun[] => {
  const parts: string[] = [];
  if (p.email) parts.push(p.email);
  if (p.phone) parts.push(p.phone);
  if (p.location) parts.push(p.location);
  if (p.linkedin) parts.push(p.linkedin.replace(/^https?:\/\/(www\.)?/, ''));
  if (p.website) parts.push(p.website.replace(/^https?:\/\/(www\.)?/, ''));
  if (p.github) parts.push(p.github.replace(/^https?:\/\/(www\.)?/, ''));

  const runs: TextRun[] = [];
  parts.forEach((part, index) => {
    runs.push(
      new TextRun({
        text: part,
        size: 18, // 9pt
        color: isWhite ? 'F1F5F9' : '475569',
        font,
      })
    );
    if (index < parts.length - 1) {
      runs.push(
        new TextRun({
          text: '  |  ',
          size: 18,
          color: isWhite ? 'CBD5E1' : '94A3B8',
          font,
        })
      );
    }
  });
  return runs;
};

/**
 * Builds an authentic, beautifully styled Word Document (.docx)
 * matching the executive resume layout with colored headers, underlines, company accents, and crisp typography
 */
export const buildDocxDocument = (cv: CVData): Document => {
  const templateId = normalizeTemplateId(cv.templateId);
  const themeHex = getCleanHex(cv.themeColor, '0D9488');
  const font = getDocxFont(cv.fontFamily);
  const p = cv.personalDetails;
  const fullName = p.fullName || cv.title || 'Candidate Name';

  // 1. Creative Split Template (2-Column Table, Left Sidebar in Theme Color)
  if (templateId === 'creative-split') {
    const leftCellChildren: Paragraph[] = [
      new Paragraph({
        children: [
          new TextRun({
            text: fullName,
            bold: true,
            size: 40,
            color: 'FFFFFF',
            font,
          }),
        ],
        spacing: { after: 40 },
      }),
    ];

    if (p.jobTitle) {
      leftCellChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: p.jobTitle.toUpperCase(),
              bold: true,
              size: 21,
              color: 'E0E7FF',
              font,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }

    leftCellChildren.push(
      createSectionHeader('Contact', 'FFFFFF', font, { isWhite: true, noBorder: true, size: 20 })
    );
    if (p.email) {
      leftCellChildren.push(
        new Paragraph({
          children: [new TextRun({ text: `Email: ${p.email}`, size: 18, color: 'F8FAFC', font })],
          spacing: { after: 25 },
        })
      );
    }
    if (p.phone) {
      leftCellChildren.push(
        new Paragraph({
          children: [new TextRun({ text: `Phone: ${p.phone}`, size: 18, color: 'F8FAFC', font })],
          spacing: { after: 25 },
        })
      );
    }
    if (p.location) {
      leftCellChildren.push(
        new Paragraph({
          children: [new TextRun({ text: `Location: ${p.location}`, size: 18, color: 'F8FAFC', font })],
          spacing: { after: 25 },
        })
      );
    }
    if (p.linkedin) {
      leftCellChildren.push(
        new Paragraph({
          children: [new TextRun({ text: `LinkedIn: ${p.linkedin.replace(/^https?:\/\/(www\.)?/, '')}`, size: 18, color: 'F8FAFC', font })],
          spacing: { after: 25 },
        })
      );
    }

    leftCellChildren.push(...getDocxSkillsParagraphs(cv, font, themeHex, true));
    leftCellChildren.push(...getDocxLanguagesParagraphs(cv, font, themeHex, true));
    leftCellChildren.push(...getDocxCertificationsParagraphs(cv, font, themeHex, true));

    const rightCellChildren: Paragraph[] = [
      ...getDocxSummaryParagraphs(cv, font, themeHex),
      ...getDocxExperienceParagraphs(cv, font, themeHex),
      ...getDocxProjectsParagraphs(cv, font, themeHex),
      ...getDocxEducationParagraphs(cv, font, themeHex),
      ...getDocxCustomSectionsParagraphs(cv, font, themeHex),
    ];

    return new Document({
      sections: [
        {
          properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: createDocxBorderNone(),
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 32, type: WidthType.PERCENTAGE },
                      shading: { fill: themeHex, type: ShadingType.CLEAR },
                      margins: { top: 200, bottom: 200, left: 200, right: 200 },
                      children: leftCellChildren,
                    }),
                    new TableCell({
                      width: { size: 68, type: WidthType.PERCENTAGE },
                      margins: { top: 200, bottom: 200, left: 240, right: 180 },
                      children: rightCellChildren,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });
  }

  // 2. Nordic Contrast Template (Deep Midnight Slate Sidebar)
  if (templateId === 'nordic-contrast') {
    const leftCellChildren: Paragraph[] = [
      new Paragraph({
        children: [
          new TextRun({
            text: fullName,
            bold: true,
            size: 38,
            color: 'FFFFFF',
            font,
          }),
        ],
        spacing: { after: 40 },
      }),
    ];

    if (p.jobTitle) {
      leftCellChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: p.jobTitle.toUpperCase(),
              bold: true,
              size: 20,
              color: 'CBD5E1',
              font,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }

    leftCellChildren.push(
      createSectionHeader('Contact', 'FFFFFF', font, { isWhite: true, noBorder: true, size: 20 })
    );
    if (p.email) {
      leftCellChildren.push(
        new Paragraph({
          children: [new TextRun({ text: p.email, size: 18, color: 'E2E8F0', font })],
          spacing: { after: 25 },
        })
      );
    }
    if (p.phone) {
      leftCellChildren.push(
        new Paragraph({
          children: [new TextRun({ text: p.phone, size: 18, color: 'E2E8F0', font })],
          spacing: { after: 25 },
        })
      );
    }
    if (p.location) {
      leftCellChildren.push(
        new Paragraph({
          children: [new TextRun({ text: p.location, size: 18, color: 'E2E8F0', font })],
          spacing: { after: 25 },
        })
      );
    }

    leftCellChildren.push(...getDocxSkillsParagraphs(cv, font, '2D3748', true));
    leftCellChildren.push(...getDocxLanguagesParagraphs(cv, font, '2D3748', true));
    leftCellChildren.push(...getDocxEducationParagraphs(cv, font, '2D3748', true));

    const rightCellChildren: Paragraph[] = [
      ...getDocxSummaryParagraphs(cv, font, '2D3748'),
      ...getDocxExperienceParagraphs(cv, font, '2D3748'),
      ...getDocxProjectsParagraphs(cv, font, '2D3748'),
      ...getDocxCertificationsParagraphs(cv, font, '2D3748'),
      ...getDocxCustomSectionsParagraphs(cv, font, '2D3748'),
    ];

    return new Document({
      sections: [
        {
          properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: createDocxBorderNone(),
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 32, type: WidthType.PERCENTAGE },
                      shading: { fill: '2D3748', type: ShadingType.CLEAR },
                      margins: { top: 200, bottom: 200, left: 200, right: 200 },
                      children: leftCellChildren,
                    }),
                    new TableCell({
                      width: { size: 68, type: WidthType.PERCENTAGE },
                      margins: { top: 200, bottom: 200, left: 240, right: 180 },
                      children: rightCellChildren,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });
  }

  // 3. Sandstone Executive Template (Warm Sand Header, 2-Column Body)
  if (templateId === 'sandstone-executive') {
    const headerParas: Paragraph[] = [
      new Paragraph({
        children: [
          new TextRun({
            text: fullName.toUpperCase(),
            bold: true,
            size: 42,
            color: '1E293B',
            font,
          }),
        ],
        spacing: { after: 30 },
      }),
    ];
    if (p.jobTitle) {
      headerParas.push(
        new Paragraph({
          children: [
            new TextRun({
              text: p.jobTitle.toUpperCase(),
              bold: true,
              size: 22,
              color: themeHex,
              font,
            }),
          ],
          spacing: { after: 60 },
        })
      );
    }
    const contactRuns = getDocxContactRuns(p, font);
    if (contactRuns.length > 0) {
      headerParas.push(new Paragraph({ children: contactRuns, spacing: { after: 80 } }));
    }

    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 24, color: themeHex },
        bottom: { style: BorderStyle.SINGLE, size: 12, color: themeHex },
        left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { fill: 'F7F4EE', type: ShadingType.CLEAR },
              margins: { top: 160, bottom: 160, left: 180, right: 180 },
              children: headerParas,
            }),
          ],
        }),
      ],
    });

    const leftCol: Paragraph[] = [
      ...getDocxEducationParagraphs(cv, font, themeHex),
      ...getDocxSkillsParagraphs(cv, font, themeHex),
      ...getDocxCertificationsParagraphs(cv, font, themeHex),
      ...getDocxLanguagesParagraphs(cv, font, themeHex),
    ];
    const rightCol: Paragraph[] = [
      ...getDocxSummaryParagraphs(cv, font, themeHex),
      ...getDocxExperienceParagraphs(cv, font, themeHex),
      ...getDocxProjectsParagraphs(cv, font, themeHex),
      ...getDocxCustomSectionsParagraphs(cv, font, themeHex),
    ];

    const bodyTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: createDocxBorderNone(),
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              margins: { top: 120, bottom: 120, left: 60, right: 180 },
              children: leftCol,
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              margins: { top: 120, bottom: 120, left: 180, right: 60 },
              children: rightCol,
            }),
          ],
        }),
      ],
    });

    return new Document({
      sections: [
        {
          properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
          children: [headerTable, new Paragraph({ spacing: { after: 120 } }), bodyTable],
        },
      ],
    });
  }

  // 4. London Corporate Template (Formal Centered Header)
  if (templateId === 'london-corporate') {
    const corpChildren: Paragraph[] = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: fullName,
            bold: true,
            size: 44,
            color: '0F172A',
            font,
          }),
        ],
        spacing: { after: 40 },
      }),
    ];
    if (p.jobTitle) {
      corpChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: p.jobTitle.toUpperCase(),
              bold: true,
              size: 22,
              color: themeHex,
              font,
            }),
          ],
          spacing: { after: 60 },
        })
      );
    }
    const contactRuns = getDocxContactRuns(p, font);
    if (contactRuns.length > 0) {
      corpChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: contactRuns,
          spacing: { after: 120 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 14, color: themeHex, space: 6 },
          },
        })
      );
    }

    corpChildren.push(
      ...getDocxSummaryParagraphs(cv, font, themeHex),
      ...getDocxExperienceParagraphs(cv, font, themeHex),
      ...getDocxEducationParagraphs(cv, font, themeHex),
      ...getDocxSkillsParagraphs(cv, font, themeHex),
      ...getDocxProjectsParagraphs(cv, font, themeHex),
      ...getDocxCertificationsParagraphs(cv, font, themeHex),
      ...getDocxLanguagesParagraphs(cv, font, themeHex),
      ...getDocxCustomSectionsParagraphs(cv, font, themeHex)
    );

    return new Document({
      sections: [
        {
          properties: { page: { margin: { top: 800, bottom: 800, left: 900, right: 900 } } },
          children: corpChildren,
        },
      ],
    });
  }

  // 5. Academic Classic Template (Prestigious Serif, Formal Centered Titles)
  if (templateId === 'academic-classic') {
    const acadFont = 'Georgia';
    const acadChildren: Paragraph[] = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: fullName.toUpperCase(),
            bold: true,
            size: 42,
            color: '1C1917',
            font: acadFont,
          }),
        ],
        spacing: { after: 30 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'CURRICULUM VITAE',
            italics: true,
            size: 22,
            color: '44403C',
            font: acadFont,
          }),
        ],
        spacing: { after: 50 },
      }),
    ];

    const contactRuns = getDocxContactRuns(p, acadFont);
    if (contactRuns.length > 0) {
      acadChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: contactRuns,
          spacing: { after: 140 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 8, color: '78716C', space: 6 },
          },
        })
      );
    }

    acadChildren.push(
      ...getDocxSummaryParagraphs(cv, acadFont, '44403C', false, true),
      ...getDocxEducationParagraphs(cv, acadFont, '44403C'),
      ...getDocxExperienceParagraphs(cv, acadFont, '44403C'),
      ...getDocxProjectsParagraphs(cv, acadFont, '44403C'),
      ...getDocxSkillsParagraphs(cv, acadFont, '44403C'),
      ...getDocxCertificationsParagraphs(cv, acadFont, '44403C'),
      ...getDocxLanguagesParagraphs(cv, acadFont, '44403C'),
      ...getDocxCustomSectionsParagraphs(cv, acadFont, '44403C')
    );

    return new Document({
      sections: [
        {
          properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
          children: acadChildren,
        },
      ],
    });
  }

  // 6. Tech Compact Template (Monospace Developer Style)
  if (templateId === 'tech-compact') {
    const techFont = 'Consolas';
    const techChildren: Paragraph[] = [
      new Paragraph({
        children: [
          new TextRun({
            text: `// ${fullName}`,
            bold: true,
            size: 38,
            color: '0F172A',
            font: techFont,
          }),
        ],
        spacing: { after: 20 },
      }),
    ];
    if (p.jobTitle) {
      techChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `role: ${p.jobTitle}`,
              size: 20,
              color: themeHex,
              font: techFont,
            }),
          ],
          spacing: { after: 40 },
        })
      );
    }
    const contactRuns = getDocxContactRuns(p, techFont);
    if (contactRuns.length > 0) {
      techChildren.push(
        new Paragraph({
          children: contactRuns,
          spacing: { after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1', space: 4 } },
        })
      );
    }

    techChildren.push(
      ...getDocxSummaryParagraphs(cv, techFont, themeHex),
      ...getDocxSkillsParagraphs(cv, techFont, themeHex),
      ...getDocxExperienceParagraphs(cv, techFont, themeHex),
      ...getDocxProjectsParagraphs(cv, techFont, themeHex),
      ...getDocxEducationParagraphs(cv, techFont, themeHex),
      ...getDocxCertificationsParagraphs(cv, techFont, themeHex),
      ...getDocxLanguagesParagraphs(cv, techFont, themeHex),
      ...getDocxCustomSectionsParagraphs(cv, techFont, themeHex)
    );

    return new Document({
      sections: [
        {
          properties: { page: { margin: { top: 650, bottom: 650, left: 720, right: 720 } } },
          children: techChildren,
        },
      ],
    });
  }

  // 7. Botanical Terracotta Template (Warm Cream & Earthy Palette)
  if (templateId === 'botanical-terracotta') {
    const terraFont = 'Georgia';
    const terraHex = getCleanHex(cv.themeColor, 'A35638');
    const leftCell: Paragraph[] = [
      createSectionHeader('Contact', terraHex, terraFont, { noBorder: true, size: 20 }),
    ];
    if (p.email) leftCell.push(new Paragraph({ children: [new TextRun({ text: p.email, size: 18, color: '44403C', font: terraFont })], spacing: { after: 20 } }));
    if (p.phone) leftCell.push(new Paragraph({ children: [new TextRun({ text: p.phone, size: 18, color: '44403C', font: terraFont })], spacing: { after: 20 } }));
    if (p.location) leftCell.push(new Paragraph({ children: [new TextRun({ text: p.location, size: 18, color: '44403C', font: terraFont })], spacing: { after: 20 } }));
    leftCell.push(...getDocxSkillsParagraphs(cv, terraFont, terraHex));
    leftCell.push(...getDocxLanguagesParagraphs(cv, terraFont, terraHex));
    leftCell.push(...getDocxEducationParagraphs(cv, terraFont, terraHex));

    const rightCell: Paragraph[] = [
      new Paragraph({
        children: [
          new TextRun({ text: fullName, bold: true, size: 40, color: '292524', font: terraFont }),
        ],
        spacing: { after: 30 },
      }),
    ];
    if (p.jobTitle) {
      rightCell.push(
        new Paragraph({
          children: [new TextRun({ text: p.jobTitle.toUpperCase(), bold: true, size: 20, color: terraHex, font: terraFont })],
          spacing: { after: 100 },
        })
      );
    }
    rightCell.push(
      ...getDocxSummaryParagraphs(cv, terraFont, terraHex),
      ...getDocxExperienceParagraphs(cv, terraFont, terraHex),
      ...getDocxProjectsParagraphs(cv, terraFont, terraHex),
      ...getDocxCertificationsParagraphs(cv, terraFont, terraHex),
      ...getDocxCustomSectionsParagraphs(cv, terraFont, terraHex)
    );

    return new Document({
      sections: [
        {
          properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: createDocxBorderNone(),
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 32, type: WidthType.PERCENTAGE },
                      shading: { fill: 'F3EEE7', type: ShadingType.CLEAR },
                      margins: { top: 180, bottom: 180, left: 180, right: 180 },
                      children: leftCell,
                    }),
                    new TableCell({
                      width: { size: 68, type: WidthType.PERCENTAGE },
                      margins: { top: 180, bottom: 180, left: 240, right: 160 },
                      children: rightCell,
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });
  }

  // 8. Default Executive Layout (Modern Executive, Geneva Grid, Silicon Accent, etc.)
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

      if (proj.description) {
        const descLines = proj.description.split('\n');
        descLines.forEach((line) => {
          if (line.trim()) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 19,
                    color: '334155',
                    font,
                  }),
                ],
                spacing: { after: 35 },
              })
            );
          }
        });
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
 * Ensures global polyfills for browser DOCX export
 */
const ensureBrowserDocxEnvironment = () => {
  if (typeof window !== 'undefined') {
    (window as any).global = window;
    try {
      if (!Object.prototype.hasOwnProperty.call(window, 'Blob') && typeof window.Blob !== 'undefined') {
        Object.defineProperty(window, 'Blob', {
          value: window.Blob,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
    } catch {}
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).global = globalThis;
    try {
      if (!Object.prototype.hasOwnProperty.call(globalThis, 'Blob') && typeof globalThis.Blob !== 'undefined') {
        Object.defineProperty(globalThis, 'Blob', {
          value: globalThis.Blob,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
    } catch {}
  }
};

/**
 * Word (.docx) Generator
 * Generates an authentic Microsoft Word document preserving full layout,
 * custom theme accent colors, colored section header underlines, company accents, and bulleted lists
 */
export const exportToDocx = async (cv: CVData): Promise<void> => {
  ensureBrowserDocxEnvironment();
  const fullName = cv.personalDetails.fullName || cv.title || 'CV';
  const safeName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const templateTag = normalizeTemplateId(cv.templateId);
  const filename = `${safeName}_${templateTag}_resume.docx`;

  try {
    // 1. Generate rich template-faithful HTML with full layout, sidebars, tables, and colors
    const htmlContent = renderTemplateToWordHtml(cv);

    // 2. Convert to real OpenXML .docx binary using HTMLtoDOCX
    const docxResult = await HTMLtoDOCX(htmlContent, null, {
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber: false,
      margins: {
        top: 720,
        right: 720,
        bottom: 720,
        left: 720,
      },
    });

    let blob: Blob;
    if (docxResult instanceof Blob) {
      blob = docxResult;
    } else if (docxResult && typeof (docxResult as any).buffer !== 'undefined') {
      const u8 = new Uint8Array(
        (docxResult as any).buffer,
        (docxResult as any).byteOffset || 0,
        (docxResult as any).byteLength || (docxResult as any).length
      );
      blob = new Blob([u8], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    } else {
      blob = new Blob([docxResult as unknown as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    }

    downloadBlob(blob, filename);
  } catch (err) {
    console.warn('HTMLtoDOCX direct generation encountered an issue, trying docx builder:', err);
    try {
      const doc = buildDocxDocument(cv);
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, filename);
    } catch (docxErr) {
      console.warn('Docx Packer encountered an issue, falling back to Word template document:', docxErr);
      exportWordHtmlDocument(cv, filename);
    }
  }
};

/**
 * Extracts inner body and style content from rendered template HTML
 */
const extractBodyAndStyles = (html: string) => {
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const styles = styleMatch ? styleMatch[1] : '';
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  return { styles, bodyContent };
};

/**
 * Word Office-HTML Document Generator
 * Generates an authentic Microsoft Word document preserving 100% of the preview layout,
 * colors, multi-column tables, fonts, sidebars, and styled sections using Office OpenXML HTML
 */
export const exportWordHtmlDocument = (cv: CVData, filename: string): void => {
  const htmlContent = renderTemplateToWordHtml(cv);
  const fullName = cv.personalDetails.fullName || cv.title || 'CV';
  const { styles, bodyContent } = extractBodyAndStyles(htmlContent);

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
      margin: 1.2cm 1.2cm 1.2cm 1.2cm;
      mso-header-margin: 0.8cm;
      mso-footer-margin: 0.8cm;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
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
    ${styles}
  </style>
</head>
<body>
  <div class="Section1">
    ${bodyContent}
  </div>
</body>
</html>`;

  const blob = new Blob(['\ufeff', wordDocumentHtml], {
    type: 'application/msword;charset=utf-8',
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
    *, *::before, *::after {
      box-sizing: border-box;
    }
    .cv-container {
      width: 210mm;
      max-width: 210mm;
      min-height: 297mm;
    }
    /* Fixed column styles to ensure zero layout shift in both screen and print */
    .grid { display: grid; }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
    .col-span-2 { grid-column: span 2 / span 2 !important; }
    .col-span-1 { grid-column: span 1 / span 1 !important; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    @media print {
      html, body {
        background: white !important;
        padding: 0 !important;
        margin: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      .cv-container {
        box-shadow: none !important;
        margin: 0 auto !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      .grid.grid-cols-3, .grid-cols-3 {
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }
      .col-span-2 {
        grid-column: span 2 / span 2 !important;
      }
      .col-span-1 {
        grid-column: span 1 / span 1 !important;
      }
      .grid.grid-cols-2, .grid-cols-2 {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
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
