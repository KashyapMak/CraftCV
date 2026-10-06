import { CVData } from '../types/cv';
import sampleCvJson from './sampleCV.json';

/**
 * Alexander Wright's complete, recruiter-approved sample CV profile
 * loaded directly from the system JSON specification.
 */
export const ALEXANDER_WRIGHT_SAMPLE_CV: CVData = sampleCvJson as CVData;

export const SAMPLE_CV: CVData = ALEXANDER_WRIGHT_SAMPLE_CV;

/**
 * Checks whether a candidate CV is empty / untouched / unpopulated.
 * Returns true if the user has not entered their own candidate name yet.
 */
export const isCvEmpty = (cv?: CVData | null): boolean => {
  if (!cv) return true;
  const fullName = cv.personalDetails?.fullName?.trim() || '';
  return !fullName;
};

/**
 * Returns the effective CV to preview for templates.
 * If the user has not entered or selected their own CV, Alexander Wright's profile is used automatically.
 */
export const getPreviewCvWithFallback = (
  cv: CVData | null | undefined,
  templateId?: string,
  themeColor?: string,
  forceSample = false
): { previewCv: CVData; isUsingSample: boolean } => {
  const empty = isCvEmpty(cv);
  const useSample = forceSample || empty;

  const base = useSample ? ALEXANDER_WRIGHT_SAMPLE_CV : (cv as CVData);
  const previewCv: CVData = {
    ...base,
    templateId: templateId || base.templateId || 'modern-executive',
    themeColor: themeColor || base.themeColor || '#2563eb'
  };

  return {
    previewCv,
    isUsingSample: useSample
  };
};

/**
 * Creates a blank CV with structured items and sample guides in every section
 * (including Custom Sections, Projects, Certifications, Languages, Skills, and Section Titles)
 * so the user immediately gets a clear blueprint of how to populate each section.
 */
export const createBlankCV = (indexNumber = 1): CVData => {
  const now = Date.now();
  return {
    id: `cv_${now}_${Math.random().toString(36).substring(2, 7)}`,
    title: `Untitled CV ${indexNumber}`,
    createdAt: now,
    updatedAt: now,
    templateId: 'modern-executive',
    themeColor: '#2563eb',
    fontFamily: 'inter',
    fontSize: 'base',
    lineSpacing: 'normal',
    pageMargin: 20,
    showPhoto: false,
    sectionTitles: {
      summary: 'Professional Summary',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Key Skills',
      projects: 'Key Projects',
      certifications: 'Certifications',
      languages: 'Languages'
    },
    personalDetails: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      github: ''
    },
    summary: '',
    experiences: [
      {
        id: `exp_${now}`,
        jobTitle: '',
        employer: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: true,
        highlights: [
          'Led key strategic initiatives delivering measurable performance improvements.',
          'Collaborated with cross-functional teams to engineer and deploy core features.'
        ]
      }
    ],
    educations: [
      {
        id: `edu_${now}`,
        school: '',
        degree: '',
        fieldOfStudy: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        grade: '',
        details: [
          'Relevant coursework or notable academic achievements'
        ]
      }
    ],
    skills: [
      {
        id: `cat_${now}_1`,
        category: 'Core Competencies',
        items: ['System Architecture', 'Problem Solving', 'Team Leadership', 'Project Delivery']
      },
      {
        id: `cat_${now}_2`,
        category: 'Technical & Tools',
        items: ['TypeScript / JavaScript', 'React & Modern Web', 'API Design & Integration', 'Cloud Platforms']
      }
    ],
    projects: [
      {
        id: `proj_${now}`,
        title: 'Featured Project Name',
        subtitle: 'React, TypeScript, Cloud Architecture',
        link: 'project-link.dev',
        startDate: '2023',
        endDate: 'Present',
        description: 'High-impact overview of the project scope, technical solutions engineered, and delivered business or performance metrics.',
        highlights: [
          'Key technical milestone, architectural decision, or measurable improvement'
        ]
      }
    ],
    certifications: [
      {
        id: `cert_${now}`,
        name: 'Certification Title (e.g. AWS Solutions Architect)',
        issuer: 'Issuing Organization (e.g. Amazon Web Services)',
        issueDate: '2024',
        credentialUrl: 'credential.net/verify'
      }
    ],
    languages: [
      {
        id: `lang_${now}_1`,
        language: 'English',
        proficiency: 'Native'
      },
      {
        id: `lang_${now}_2`,
        language: 'Second Language (e.g. French / Spanish / German)',
        proficiency: 'Intermediate'
      }
    ],
    customSections: [
      {
        id: `custom_${now}`,
        sectionTitle: 'Key Achievements & Awards',
        items: [
          {
            id: `item_${now}`,
            title: 'Award / Publication / Key Honor',
            subtitle: 'Issuing Organization / Institution',
            date: '2024',
            description: 'Description of the notable achievement, recognition, key project result, or milestone.'
          }
        ]
      }
    ]
  };
};
