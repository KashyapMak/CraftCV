import { CVData, SectionTitles } from '../types/cv';

export const DEFAULT_SECTION_TITLES: Required<SectionTitles> = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Key Skills',
  projects: 'Key Projects',
  certifications: 'Certifications',
  languages: 'Languages'
};

export const SECTION_TITLE_SUGGESTIONS: Record<keyof SectionTitles, string[]> = {
  summary: [
    'Professional Summary',
    'Executive Summary',
    'Executive Profile',
    'Profile',
    'About Me',
    'Career Summary',
    'Professional Objective'
  ],
  experience: [
    'Work Experience',
    'Professional Experience',
    'Relevant Experience',
    'Employment History',
    'Career History',
    'Career Experience',
    'Work History'
  ],
  education: [
    'Education',
    'Education & Qualifications',
    'Academic Background',
    'Academic History',
    'Education & Training',
    'Degrees & Qualifications'
  ],
  skills: [
    'Key Skills',
    'Technical Skills',
    'Core Competencies',
    'Areas of Expertise',
    'Skills & Capabilities',
    'Skills & Technologies',
    'Skills'
  ],
  projects: [
    'Key Projects',
    'Notable Projects',
    'Projects & Portfolio',
    'Selected Projects',
    'Technical Projects',
    'Open Source & Projects',
    'Projects'
  ],
  certifications: [
    'Certifications',
    'Licenses & Certifications',
    'Professional Credentials',
    'Certificates & Training',
    'Accreditations',
    'Certificates'
  ],
  languages: [
    'Languages',
    'Languages & Dialects',
    'Language Proficiency',
    'Languages Known',
    'Linguistic Proficiencies'
  ]
};

/**
 * Returns the effective section title for a given section,
 * respecting user customization if set, or falling back to a template-specific title or global default.
 */
export const getSectionTitle = (
  cv: CVData,
  section: keyof SectionTitles,
  templateFallback?: string
): string => {
  const custom = cv.sectionTitles?.[section]?.trim();
  if (custom) return custom;
  if (templateFallback) return templateFallback;
  return DEFAULT_SECTION_TITLES[section];
};
