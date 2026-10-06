import { CVData, CVSectionKey } from '../types/cv';

export const DEFAULT_SECTION_ORDER: CVSectionKey[] = [
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'customSections'
];

export interface SectionMeta {
  key: CVSectionKey;
  label: string;
  defaultTitle: string;
  description: string;
  category: 'core' | 'additional';
}

export const SECTION_METADATA: Record<CVSectionKey, SectionMeta> = {
  experience: {
    key: 'experience',
    label: 'Work Experience',
    defaultTitle: 'Work Experience',
    description: 'Employment history, roles, companies, achievements',
    category: 'core'
  },
  education: {
    key: 'education',
    label: 'Education',
    defaultTitle: 'Education',
    description: 'Degrees, universities, diplomas, academic background',
    category: 'core'
  },
  skills: {
    key: 'skills',
    label: 'Core Skills',
    defaultTitle: 'Skills & Competencies',
    description: 'Technical stack, tools, domain competencies, frameworks',
    category: 'core'
  },
  projects: {
    key: 'projects',
    label: 'Projects',
    defaultTitle: 'Key Projects',
    description: 'Notable case studies, open source, apps, freelance work',
    category: 'core'
  },
  certifications: {
    key: 'certifications',
    label: 'Certifications',
    defaultTitle: 'Certifications & Licenses',
    description: 'Industry credentials, certificates, accreditations',
    category: 'additional'
  },
  languages: {
    key: 'languages',
    label: 'Languages',
    defaultTitle: 'Languages',
    description: 'Language proficiencies and spoken tongues',
    category: 'additional'
  },
  customSections: {
    key: 'customSections',
    label: 'Custom Sections',
    defaultTitle: 'Additional Information',
    description: 'Awards & honors, publications, volunteering, patents',
    category: 'additional'
  }
};

export interface SectionOrderPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  order: CVSectionKey[];
}

export const SECTION_ORDER_PRESETS: SectionOrderPreset[] = [
  {
    id: 'standard',
    name: 'Experience First',
    badge: 'Most Popular',
    description: 'Standard layout for established professionals: Experience → Education → Skills → Projects',
    order: ['experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'customSections']
  },
  {
    id: 'graduate',
    name: 'Education First',
    badge: 'Students & Grads',
    description: 'Highlights academic qualifications first: Education → Projects → Skills → Experience',
    order: ['education', 'projects', 'skills', 'experience', 'certifications', 'languages', 'customSections']
  },
  {
    id: 'technical',
    name: 'Skills & Projects First',
    badge: 'Tech & Devs',
    description: 'Spotlights technical stack and portfolio up front: Skills → Projects → Experience → Education',
    order: ['skills', 'projects', 'experience', 'education', 'certifications', 'languages', 'customSections']
  },
  {
    id: 'portfolio',
    name: 'Projects First',
    badge: 'Creative & Freelance',
    description: 'Places real-world portfolio front and center: Projects → Experience → Skills → Education',
    order: ['projects', 'experience', 'skills', 'education', 'certifications', 'languages', 'customSections']
  }
];

/**
 * Returns a normalized, validated array of section keys for the CV.
 * Guarantees all valid sections are present and no duplicates.
 */
export const getEffectiveSectionOrder = (cv?: Partial<CVData> | null): CVSectionKey[] => {
  if (!cv || !cv.sectionOrder || !Array.isArray(cv.sectionOrder) || cv.sectionOrder.length === 0) {
    return [...DEFAULT_SECTION_ORDER];
  }

  const validKeys: CVSectionKey[] = [
    'experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'languages',
    'customSections'
  ];

  // Keep existing valid keys in their chosen order
  const filtered = cv.sectionOrder.filter((k): k is CVSectionKey => validKeys.includes(k));
  const uniqueOrdered = Array.from(new Set(filtered));

  // Append any missing keys at the end
  validKeys.forEach((key) => {
    if (!uniqueOrdered.includes(key)) {
      uniqueOrdered.push(key);
    }
  });

  return uniqueOrdered;
};

/**
 * Move a section up or down in the ordering array.
 */
export const moveSectionInOrder = (
  currentOrder: CVSectionKey[],
  targetKey: CVSectionKey,
  direction: 'up' | 'down'
): CVSectionKey[] => {
  const list = [...currentOrder];
  const index = list.indexOf(targetKey);
  if (index === -1) return list;

  if (direction === 'up' && index > 0) {
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
  } else if (direction === 'down' && index < list.length - 1) {
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
  }

  return list;
};

/**
 * Returns sections in order, optionally filtered to a subset of section keys
 * while strictly maintaining the user's defined relative order.
 */
export const getOrderedSections = (
  cv?: Partial<CVData> | null,
  allowedKeys?: CVSectionKey[]
): CVSectionKey[] => {
  const order = getEffectiveSectionOrder(cv);
  if (!allowedKeys || allowedKeys.length === 0) {
    return order;
  }
  return order.filter((k) => allowedKeys.includes(k));
};
