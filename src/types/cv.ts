export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  github?: string;
  photoUrl?: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  employer: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  grade?: string;
  details?: string[];
}

export interface SkillCategory {
  id: string;
  category: string;
  items: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  highlights: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description: string;
}

export interface CustomSection {
  id: string;
  sectionTitle: string;
  items: CustomSectionItem[];
}

export type FontFamilyType = 'inter' | 'jakarta' | 'garamond' | 'mono' | 'cinzel';
export type SpacingType = 'compact' | 'normal' | 'spacious';
export type FontSizeType = 'sm' | 'base' | 'lg';

export interface CVData {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  themeColor: string;
  fontFamily: FontFamilyType;
  fontSize: FontSizeType;
  lineSpacing: SpacingType;
  showPhoto: boolean;
  personalDetails: PersonalDetails;
  summary: string;
  experiences: ExperienceItem[];
  educations: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  customSections: CustomSection[];
}

export interface TemplateConfig {
  id: string;
  name: string;
  category: 'Modern' | 'Corporate' | 'Minimalist' | 'Creative' | 'Tech' | 'Academic';
  description: string;
  recommendedFor: string;
  badge?: string;
  defaultColor: string;
  accentColors: string[];
  hasSidebar: boolean;
  supportsPhoto: boolean;
}

export interface AppSettings {
  maxCvLimit: number; // default 99
  defaultTemplateId: string;
  aiProvider: 'gemini' | 'openai';
  geminiApiKey: string;
  geminiModel: string;
  openaiApiKey: string;
  openaiModel: string;
}

export interface ATSCheckItem {
  label: string;
  passed: boolean;
  score: number;
  tip: string;
}
