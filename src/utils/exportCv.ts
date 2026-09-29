import { CVData } from '../types/cv';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
  ExternalHyperlink
} from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Native Print Trigger
 * Opens native browser print dialog (supports Save to PDF directly)
 */
export const triggerPrint = (): void => {
  window.focus();
  window.print();
};

/**
 * Direct PDF Download
 * Captures the exact rendered HTML layout and downloads high-res PDF file
 */
export const exportDirectPdf = async (cv: CVData): Promise<{ success: boolean; error?: string }> => {
  try {
    const pageSheets = Array.from(document.querySelectorAll<HTMLElement>('.cv-a4-page-sheet'));

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
        document.body.appendChild(clone);

        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        document.body.removeChild(clone);

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }

      const safeName = (cv.personalDetails.fullName || cv.title || 'CV')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
      pdf.save(`${safeName}_resume.pdf`);
      return { success: true };
    }

    const el = document.getElementById('cv-printable-document');
    if (!el) {
      // Fallback to window.print if document container not found
      window.print();
      return { success: true };
    }

    // Temporarily ensure high-res capture without scale distortion
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
    pdf.save(`${safeName}_resume.pdf`);
    return { success: true };
  } catch (err: any) {
    console.error('Direct PDF export error:', err);
    // Fallback to standard print dialog
    window.print();
    return { success: false, error: err?.message };
  }
};

/**
 * Standard .docx Generator
 * Uses official docx library to produce true OpenXML .docx matching the selected CV template structure
 */
export const exportToDocx = async (cv: CVData): Promise<void> => {
  const p = cv.personalDetails;
  const fullName = p.fullName || 'Candidate';
  const role = p.jobTitle || 'Resume';

  // Format theme color into hex without #
  const hexColor = (cv.themeColor || '#2563eb').replace('#', '');

  const contactItems: string[] = [];
  if (p.email) contactItems.push(p.email);
  if (p.phone) contactItems.push(p.phone);
  if (p.location) contactItems.push(p.location);
  if (p.linkedin) contactItems.push(p.linkedin);
  if (p.website) contactItems.push(p.website);
  if (p.github) contactItems.push(p.github);

  const children: any[] = [];

  // 1. Header Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: fullName,
          bold: true,
          size: 38,
          color: hexColor,
          font: 'Calibri'
        })
      ]
    })
  );

  // 2. Job Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: role,
          bold: true,
          size: 24,
          color: '475569',
          font: 'Calibri'
        })
      ]
    })
  );

  // 3. Contact Line
  if (contactItems.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 280 },
        border: {
          bottom: {
            color: 'CBD5E1',
            space: 6,
            style: BorderStyle.SINGLE,
            size: 6
          }
        },
        children: [
          new TextRun({
            text: contactItems.join('   |   '),
            size: 19,
            color: '64748B',
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // Helper for Section Titles
  const createSectionHeader = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 100 },
      border: {
        bottom: {
          color: hexColor,
          space: 4,
          style: BorderStyle.SINGLE,
          size: 12
        }
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 22,
          color: hexColor,
          font: 'Calibri'
        })
      ]
    });
  };

  // 4. Professional Summary
  if (cv.summary) {
    children.push(createSectionHeader('Professional Summary'));
    children.push(
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: cv.summary,
            size: 20,
            color: '334155',
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // 5. Work Experience
  if (cv.experiences && cv.experiences.length > 0) {
    children.push(createSectionHeader('Work Experience'));

    for (const exp of cv.experiences) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: exp.jobTitle,
              bold: true,
              size: 21,
              color: '0F172A',
              font: 'Calibri'
            }),
            new TextRun({
              text: ` — ${exp.employer}`,
              bold: false,
              size: 21,
              color: '475569',
              font: 'Calibri'
            }),
            new TextRun({
              text: `\t${exp.startDate} – ${exp.isCurrent ? 'Present' : exp.endDate || ''}${exp.location ? ` | ${exp.location}` : ''}`,
              size: 19,
              color: '64748B',
              font: 'Calibri'
            })
          ]
        })
      );

      if (exp.highlights && exp.highlights.length > 0) {
        for (const hl of exp.highlights) {
          if (!hl.trim()) continue;
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: hl,
                  size: 19.5,
                  color: '334155',
                  font: 'Calibri'
                })
              ]
            })
          );
        }
      }
    }
  }

  // 6. Education
  if (cv.educations && cv.educations.length > 0) {
    children.push(createSectionHeader('Education'));

    for (const edu of cv.educations) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: `${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`,
              bold: true,
              size: 21,
              color: '0F172A',
              font: 'Calibri'
            }),
            new TextRun({
              text: ` — ${edu.school}`,
              size: 21,
              color: '475569',
              font: 'Calibri'
            }),
            new TextRun({
              text: `\t${edu.startDate} – ${edu.isCurrent ? 'Present' : edu.endDate || ''}${edu.location ? ` | ${edu.location}` : ''}`,
              size: 19,
              color: '64748B',
              font: 'Calibri'
            })
          ]
        })
      );

      if (edu.grade) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `Grade / Classification: ${edu.grade}`,
                italics: true,
                size: 19,
                color: '64748B',
                font: 'Calibri'
              })
            ]
          })
        );
      }

      if (edu.details && edu.details.length > 0) {
        for (const d of edu.details) {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: d,
                  size: 19,
                  color: '475569',
                  font: 'Calibri'
                })
              ]
            })
          );
        }
      }
    }
  }

  // 7. Core Skills
  if (cv.skills && cv.skills.length > 0) {
    children.push(createSectionHeader('Core Skills & Competencies'));

    for (const s of cv.skills) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${s.category}: `,
              bold: true,
              size: 20,
              color: '0F172A',
              font: 'Calibri'
            }),
            new TextRun({
              text: s.items.join(', '),
              size: 20,
              color: '334155',
              font: 'Calibri'
            })
          ]
        })
      );
    }
  }

  // 8. Projects
  if (cv.projects && cv.projects.length > 0) {
    children.push(createSectionHeader('Projects & Portfolio'));

    for (const proj of cv.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 30 },
          children: [
            new TextRun({
              text: proj.title,
              bold: true,
              size: 20,
              color: '0F172A',
              font: 'Calibri'
            }),
            new TextRun({
              text: proj.link ? ` (${proj.link})` : '',
              size: 19,
              color: hexColor,
              font: 'Calibri'
            }),
            new TextRun({
              text: `\t${proj.startDate || ''}${proj.endDate ? ` – ${proj.endDate}` : ''}`,
              size: 19,
              color: '64748B',
              font: 'Calibri'
            })
          ]
        })
      );

      if (proj.subtitle) {
        children.push(
          new Paragraph({
            spacing: { after: 30 },
            children: [
              new TextRun({
                text: proj.subtitle,
                italics: true,
                size: 19,
                color: '64748B',
                font: 'Calibri'
              })
            ]
          })
        );
      }

      if (proj.highlights && proj.highlights.length > 0) {
        for (const h of proj.highlights) {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: h,
                  size: 19,
                  color: '334155',
                  font: 'Calibri'
                })
              ]
            })
          );
        }
      }
    }
  }

  // 9. Certifications & Languages
  if (cv.certifications && cv.certifications.length > 0) {
    children.push(createSectionHeader('Certifications & Accreditations'));
    for (const cert of cv.certifications) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: 19.5,
              color: '0F172A',
              font: 'Calibri'
            }),
            new TextRun({
              text: ` — ${cert.issuer} (${cert.issueDate})`,
              size: 19,
              color: '475569',
              font: 'Calibri'
            })
          ]
        })
      );
    }
  }

  if (cv.languages && cv.languages.length > 0) {
    children.push(createSectionHeader('Languages'));
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: cv.languages.map((l) => `${l.language} (${l.proficiency})`).join('   •   '),
            size: 20,
            color: '334155',
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // Generate docx
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1200,
              right: 1200
            }
          }
        },
        children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (fullName || 'CV').toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.download = `${safeName}_resume.docx`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportStandaloneHtml = (cv: CVData, renderedTemplateHtml: string): void => {
  const p = cv.personalDetails;
  const fullName = p.fullName || 'Candidate';

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullName} - CV</title>
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
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (fullName || 'CV').toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.download = `${safeName}_cv.html`;
  a.click();
  URL.revokeObjectURL(url);
};
