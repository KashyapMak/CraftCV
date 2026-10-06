import React, { useState } from 'react';
import {
  CVData,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  ProjectItem,
  CertificationItem,
  LanguageItem,
  CustomSection,
  CustomSectionItem,
  SectionTitles,
  CVSectionKey,
  FontFamilyType,
  FontSizeType,
  SpacingType
} from '../types/cv';
import { COLOR_PRESETS, FONT_OPTIONS, TEMPLATES } from '../templates/templatesRegistry';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  BookOpen,
  Palette,
  ChevronDown,
  ChevronUp,
  Image,
  Layers,
  Award,
  Globe,
  PlusCircle,
  Wand2,
  FolderPlus,
  RotateCcw,
  Type,
  ListPlus,
  ArrowUp,
  ArrowDown,
  ListOrdered,
  SlidersHorizontal
} from 'lucide-react';
import { isCvEmpty } from '../data/sampleCV';
import { SectionTitleField } from './SectionTitleField';
import { SectionReorderModal } from './SectionReorderModal';
import { DEFAULT_SECTION_TITLES } from '../utils/sectionTitles';
import {
  getEffectiveSectionOrder,
  moveSectionInOrder,
  SECTION_METADATA,
  SECTION_ORDER_PRESETS,
  DEFAULT_SECTION_ORDER
} from '../utils/sectionOrder';

interface Props {
  cv: CVData;
  onChange: (updatedCv: CVData) => void;
  onOpenPhrases: () => void;
  onOpenAi: () => void;
  onOpenTemplates: () => void;
  onLoadSample?: () => void;
}

type EditorTab = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'extras' | 'design';

export const CvEditor: React.FC<Props> = ({
  cv,
  onChange,
  onOpenPhrases,
  onOpenAi,
  onOpenTemplates,
  onLoadSample
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('personal');
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  // Helper updater
  const updateCv = (patch: Partial<CVData>) => {
    onChange({ ...cv, ...patch, updatedAt: Date.now() });
  };

  const updatePersonal = (field: string, value: any) => {
    updateCv({
      personalDetails: { ...cv.personalDetails, [field]: value }
    });
  };

  // Section Titles updater
  const handleUpdateSectionTitle = (sectionKey: keyof SectionTitles, title: string) => {
    updateCv({
      sectionTitles: {
        ...(cv.sectionTitles || {}),
        [sectionKey]: title
      }
    });
  };

  // Work experience helpers
  const handleAddExperience = (withSample = false) => {
    const now = Date.now();
    const newItem: ExperienceItem = withSample
      ? {
          id: `exp_${now}`,
          jobTitle: 'Senior Software Engineer / Technical Lead',
          employer: 'Enterprise Tech Solutions',
          location: 'London, UK (Hybrid)',
          startDate: '2022',
          endDate: 'Present',
          isCurrent: true,
          highlights: [
            'Architected and deployed high-throughput cloud microservices handling 2M+ daily active transactions.',
            'Spearheaded transition to modern CI/CD pipelines, slashing release turnaround from 2 days to under 15 minutes.'
          ]
        }
      : {
          id: `exp_${now}`,
          jobTitle: '',
          employer: '',
          location: '',
          startDate: '',
          endDate: '',
          isCurrent: true,
          highlights: ['']
        };
    updateCv({ experiences: [newItem, ...cv.experiences] });
  };

  const handleUpdateExperience = (index: number, patch: Partial<ExperienceItem>) => {
    const list = [...cv.experiences];
    list[index] = { ...list[index], ...patch };
    updateCv({ experiences: list });
  };

  const handleDeleteExperience = (index: number) => {
    const list = cv.experiences.filter((_, i) => i !== index);
    updateCv({ experiences: list });
  };

  const handleAddHighlight = (expIndex: number) => {
    const exp = cv.experiences[expIndex];
    const updatedHighlights = [...(exp.highlights || []), ''];
    handleUpdateExperience(expIndex, { highlights: updatedHighlights });
  };

  const handleUpdateHighlight = (expIndex: number, hlIndex: number, val: string) => {
    const exp = cv.experiences[expIndex];
    const updatedHighlights = [...exp.highlights];
    updatedHighlights[hlIndex] = val;
    handleUpdateExperience(expIndex, { highlights: updatedHighlights });
  };

  const handleDeleteHighlight = (expIndex: number, hlIndex: number) => {
    const exp = cv.experiences[expIndex];
    const updatedHighlights = exp.highlights.filter((_, i) => i !== hlIndex);
    handleUpdateExperience(expIndex, { highlights: updatedHighlights });
  };

  // Education helpers
  const handleAddEducation = (withSample = false) => {
    const now = Date.now();
    const newItem: EducationItem = withSample
      ? {
          id: `edu_${now}`,
          school: 'University of London',
          degree: 'B.Sc. (Hons)',
          fieldOfStudy: 'Computer Science & Software Engineering',
          location: 'London, UK',
          startDate: '2018',
          endDate: '2021',
          isCurrent: false,
          grade: 'First Class Honours',
          details: [
            'Graduated in top 5% of class; focused on Distributed Systems & Algorithms.'
          ]
        }
      : {
          id: `edu_${now}`,
          school: '',
          degree: '',
          fieldOfStudy: '',
          location: '',
          startDate: '',
          endDate: '',
          isCurrent: false,
          details: []
        };
    updateCv({ educations: [...cv.educations, newItem] });
  };

  const handleUpdateEducation = (index: number, patch: Partial<EducationItem>) => {
    const list = [...cv.educations];
    list[index] = { ...list[index], ...patch };
    updateCv({ educations: list });
  };

  const handleDeleteEducation = (index: number) => {
    const list = cv.educations.filter((_, i) => i !== index);
    updateCv({ educations: list });
  };

  // Skills helpers
  const handleAddSkillCategory = (withSample = false) => {
    const now = Date.now();
    const newCat: SkillCategory = withSample
      ? {
          id: `cat_${now}`,
          category: 'Core Competencies & Tools',
          items: ['System Architecture', 'TypeScript / React', 'API Engineering', 'Cloud Platforms']
        }
      : {
          id: `cat_${now}`,
          category: 'Specialized Skills',
          items: []
        };
    updateCv({ skills: [...cv.skills, newCat] });
  };

  const handleUpdateSkillCategoryName = (index: number, category: string) => {
    const list = [...cv.skills];
    list[index] = { ...list[index], category };
    updateCv({ skills: list });
  };

  const handleAddSkillTag = (catIndex: number, tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const list = [...cv.skills];
    if (!list[catIndex].items.includes(trimmed)) {
      list[catIndex] = {
        ...list[catIndex],
        items: [...list[catIndex].items, trimmed]
      };
      updateCv({ skills: list });
    }
    setNewSkillInputs((prev) => ({ ...prev, [catIndex]: '' }));
  };

  const handleRemoveSkillTag = (catIndex: number, itemIndex: number) => {
    const list = [...cv.skills];
    list[catIndex] = {
      ...list[catIndex],
      items: list[catIndex].items.filter((_, i) => i !== itemIndex)
    };
    updateCv({ skills: list });
  };

  const handleDeleteSkillCategory = (index: number) => {
    const list = cv.skills.filter((_, i) => i !== index);
    updateCv({ skills: list });
  };

  // Projects helpers
  const handleAddProject = (withSample = false) => {
    const now = Date.now();
    const newProj: ProjectItem = withSample
      ? {
          id: `proj_${now}`,
          title: 'High-Impact Web Platform',
          subtitle: 'React, TypeScript, Cloud Architecture',
          link: 'https://github.com/example/platform',
          startDate: '2023',
          endDate: 'Present',
          description: 'Designed and deployed an enterprise analytics dashboard with real-time streaming charts and sub-second metrics.',
          highlights: [
            'Scaled concurrent capacity to 50,000 requests/sec with 99.99% uptime.',
            'Integrated modern component library reducing frontend delivery cycles by 30%.'
          ]
        }
      : {
          id: `proj_${now}`,
          title: '',
          subtitle: '',
          link: '',
          startDate: '',
          endDate: '',
          description: '',
          highlights: []
        };
    updateCv({ projects: [...(cv.projects || []), newProj] });
  };

  const handleUpdateProject = (index: number, patch: Partial<ProjectItem>) => {
    const list = [...(cv.projects || [])];
    list[index] = { ...list[index], ...patch };
    updateCv({ projects: list });
  };

  const handleDeleteProject = (index: number) => {
    const list = (cv.projects || []).filter((_, i) => i !== index);
    updateCv({ projects: list });
  };

  const handleAddProjectHighlight = (pIdx: number) => {
    const list = [...(cv.projects || [])];
    const project = list[pIdx];
    if (project) {
      project.highlights = [...(project.highlights || []), ''];
      updateCv({ projects: list });
    }
  };

  const handleUpdateProjectHighlight = (pIdx: number, hlIdx: number, text: string) => {
    const list = [...(cv.projects || [])];
    const project = list[pIdx];
    if (project && project.highlights) {
      const hls = [...project.highlights];
      hls[hlIdx] = text;
      project.highlights = hls;
      updateCv({ projects: list });
    }
  };

  const handleDeleteProjectHighlight = (pIdx: number, hlIdx: number) => {
    const list = [...(cv.projects || [])];
    const project = list[pIdx];
    if (project && project.highlights) {
      project.highlights = project.highlights.filter((_, i) => i !== hlIdx);
      updateCv({ projects: list });
    }
  };

  // Certifications helpers
  const handleAddCert = (withSample = false) => {
    const now = Date.now();
    const newCert: CertificationItem = withSample
      ? {
          id: `cert_${now}`,
          name: 'AWS Certified Solutions Architect – Associate',
          issuer: 'Amazon Web Services',
          issueDate: '2024',
          credentialUrl: 'https://aws.amazon.com/verification'
        }
      : {
          id: `cert_${now}`,
          name: '',
          issuer: '',
          issueDate: ''
        };
    updateCv({ certifications: [...(cv.certifications || []), newCert] });
  };

  const handleUpdateCert = (index: number, patch: Partial<CertificationItem>) => {
    const list = [...(cv.certifications || [])];
    list[index] = { ...list[index], ...patch };
    updateCv({ certifications: list });
  };

  const handleDeleteCert = (index: number) => {
    const list = (cv.certifications || []).filter((_, i) => i !== index);
    updateCv({ certifications: list });
  };

  // Languages helpers
  const handleAddLanguage = (withSample = false) => {
    const now = Date.now();
    const newLang: LanguageItem = withSample
      ? {
          id: `lang_${now}`,
          language: 'Spanish',
          proficiency: 'Fluent'
        }
      : {
          id: `lang_${now}`,
          language: '',
          proficiency: 'Fluent'
        };
    updateCv({ languages: [...(cv.languages || []), newLang] });
  };

  const handleUpdateLanguage = (index: number, patch: Partial<LanguageItem>) => {
    const list = [...(cv.languages || [])];
    list[index] = { ...list[index], ...patch };
    updateCv({ languages: list });
  };

  const handleDeleteLanguage = (index: number) => {
    const list = (cv.languages || []).filter((_, i) => i !== index);
    updateCv({ languages: list });
  };

  // Custom Sections helpers
  const handleAddCustomSection = (withSample = true, customTitle?: string) => {
    const now = Date.now();
    const title = customTitle || 'Key Achievements & Awards';
    const newSection: CustomSection = {
      id: `custom_${now}_${Math.random().toString(36).substring(2, 6)}`,
      sectionTitle: title,
      items: withSample
        ? [
            {
              id: `item_${now}_1`,
              title: title.includes('Award') ? 'Engineering Excellence Award' : title.includes('Publication') ? 'Research Paper / Case Study Publication' : 'Notable Project Milestone / Recognition',
              subtitle: 'Apex Global Technology Summit',
              date: '2024',
              description: 'Recognized for lowest latency routing architecture and cross-team execution delivering 40% performance gains.'
            }
          ]
        : [
            {
              id: `item_${now}_1`,
              title: '',
              subtitle: '',
              date: '',
              description: ''
            }
          ]
    };
    updateCv({ customSections: [...(cv.customSections || []), newSection] });
  };

  const handleUpdateCustomSectionTitle = (secIndex: number, title: string) => {
    const list = [...(cv.customSections || [])];
    if (list[secIndex]) {
      list[secIndex] = { ...list[secIndex], sectionTitle: title };
      updateCv({ customSections: list });
    }
  };

  const handleDeleteCustomSection = (secIndex: number) => {
    const list = (cv.customSections || []).filter((_, i) => i !== secIndex);
    updateCv({ customSections: list });
  };

  const handleAddCustomSectionItem = (secIndex: number, withSample = false) => {
    const list = [...(cv.customSections || [])];
    const sec = list[secIndex];
    if (sec) {
      const now = Date.now();
      const newItem: CustomSectionItem = withSample
        ? {
            id: `item_${now}`,
            title: 'Key Recognition / Achievement / Project',
            subtitle: 'Issuing Institution / Organization',
            date: '2024',
            description: 'Quantifiable milestone, award criteria, or notable contribution.'
          }
        : {
            id: `item_${now}`,
            title: '',
            subtitle: '',
            date: '',
            description: ''
          };
      sec.items = [...(sec.items || []), newItem];
      updateCv({ customSections: list });
    }
  };

  const handleUpdateCustomSectionItem = (
    secIndex: number,
    itemIndex: number,
    patch: Partial<CustomSectionItem>
  ) => {
    const list = [...(cv.customSections || [])];
    const sec = list[secIndex];
    if (sec && sec.items[itemIndex]) {
      sec.items[itemIndex] = { ...sec.items[itemIndex], ...patch };
      updateCv({ customSections: list });
    }
  };

  const handleDeleteCustomSectionItem = (secIndex: number, itemIndex: number) => {
    const list = [...(cv.customSections || [])];
    const sec = list[secIndex];
    if (sec && sec.items) {
      sec.items = sec.items.filter((_, i) => i !== itemIndex);
      updateCv({ customSections: list });
    }
  };

  // ================= REORDERING HELPERS =================
  const handleMoveExperience = (index: number, direction: 'up' | 'down') => {
    const list = [...cv.experiences];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    updateCv({ experiences: list });
  };

  const handleMoveEducation = (index: number, direction: 'up' | 'down') => {
    const list = [...cv.educations];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    updateCv({ educations: list });
  };

  const handleMoveSkillCategory = (index: number, direction: 'up' | 'down') => {
    const list = [...cv.skills];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    updateCv({ skills: list });
  };

  const handleMoveSkillTag = (catIndex: number, tagIndex: number, direction: 'left' | 'right') => {
    const list = [...cv.skills];
    const cat = { ...list[catIndex] };
    const items = [...cat.items];
    const targetIdx = direction === 'left' ? tagIndex - 1 : tagIndex + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[tagIndex];
    items[tagIndex] = items[targetIdx];
    items[targetIdx] = temp;
    cat.items = items;
    list[catIndex] = cat;
    updateCv({ skills: list });
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    const list = [...(cv.projects || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    updateCv({ projects: list });
  };

  const handleMoveCert = (index: number, direction: 'up' | 'down') => {
    const list = [...(cv.certifications || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    updateCv({ certifications: list });
  };

  const handleMoveLanguage = (index: number, direction: 'up' | 'down') => {
    const list = [...(cv.languages || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    updateCv({ languages: list });
  };

  const handleMoveCustomSection = (index: number, direction: 'up' | 'down') => {
    const list = [...(cv.customSections || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    updateCv({ customSections: list });
  };

  const handleMoveCustomSectionItem = (secIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const list = [...(cv.customSections || [])];
    const sec = { ...list[secIndex] };
    const items = [...(sec.items || [])];
    const targetIdx = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[itemIndex];
    items[itemIndex] = items[targetIdx];
    items[targetIdx] = temp;
    sec.items = items;
    list[secIndex] = sec;
    updateCv({ customSections: list });
  };

  const handleUpdateSectionOrder = (newOrder: CVSectionKey[]) => {
    updateCv({ sectionOrder: newOrder });
  };

  const currentSectionOrder = getEffectiveSectionOrder(cv);
  const getSectionPosNumber = (key: CVSectionKey): number => {
    const idx = currentSectionOrder.indexOf(key);
    return idx === -1 ? currentSectionOrder.length : idx + 1;
  };

  const handleMoveSection = (key: CVSectionKey, direction: 'up' | 'down') => {
    const updated = moveSectionInOrder(currentSectionOrder, key, direction);
    updateCv({ sectionOrder: updated });
  };

  const isSectionFirst = (key: CVSectionKey): boolean => {
    return currentSectionOrder.indexOf(key) === 0;
  };

  const isSectionLast = (key: CVSectionKey): boolean => {
    return currentSectionOrder.indexOf(key) === currentSectionOrder.length - 1;
  };

  // Handle Photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updatePersonal('photoUrl', event.target.result as string);
          updateCv({ showPhoto: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50/70 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('personal')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'personal'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Personal Info</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'summary'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('experience')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'experience'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Experience ({cv.experiences.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('education')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'education'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Education ({cv.educations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'skills'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Skills</span>
        </button>

        <button
          onClick={() => setActiveTab('extras')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'extras'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Projects & More</span>
        </button>

        <button
          onClick={() => setActiveTab('design')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'design'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Theme & Style</span>
        </button>

        <button
          type="button"
          onClick={() => setIsReorderModalOpen(true)}
          className="pb-2.5 px-3 text-xs font-bold border-b-2 border-transparent text-indigo-600 hover:text-indigo-800 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ml-auto hover:bg-indigo-50/50 rounded-t-lg"
          title="Reorder how sections appear on your CV"
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>Reorder Sections</span>
        </button>
      </div>

      {/* Starting from Scratch / Sample Profile Notice */}
      {isCvEmpty(cv) && (
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <span className="text-slate-700">
              Starting a blank CV. All templates are currently previewing with <strong>Alexander Wright's sample JSON profile</strong>.
            </span>
          </div>
          {onLoadSample && (
            <button
              type="button"
              onClick={onLoadSample}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              title="Populate your CV with Alexander Wright's complete profile"
            >
              <span>Load Alexander Wright to Edit</span>
            </button>
          )}
        </div>
      )}

      {/* Editor Content Area */}
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto">
        {/* ================= TAB 1: PERSONAL INFO ================= */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personal & Contact Details</h3>
                <p className="text-xs text-slate-500">Recruiters will use these details to contact you.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={cv.personalDetails.fullName}
                  onChange={(e) => updatePersonal('fullName', e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={cv.personalDetails.jobTitle}
                  onChange={(e) => updatePersonal('jobTitle', e.target.value)}
                  placeholder="e.g. Senior Project Manager"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={cv.personalDetails.email}
                  onChange={(e) => updatePersonal('email', e.target.value)}
                  placeholder="eleanor@example.co.uk"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={cv.personalDetails.phone}
                  onChange={(e) => updatePersonal('phone', e.target.value)}
                  placeholder="+44 7700 900123"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location (City, Country) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={cv.personalDetails.location}
                  onChange={(e) => updatePersonal('location', e.target.value)}
                  placeholder="London, UK"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={cv.personalDetails.linkedin || ''}
                  onChange={(e) => updatePersonal('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Portfolio / Website
                </label>
                <input
                  type="text"
                  value={cv.personalDetails.website || ''}
                  onChange={(e) => updatePersonal('website', e.target.value)}
                  placeholder="myportfolio.dev"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub / Online Profile
                </label>
                <input
                  type="text"
                  value={cv.personalDetails.github || ''}
                  onChange={(e) => updatePersonal('github', e.target.value)}
                  placeholder="github.com/username"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Photo Option */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showPhoto"
                  checked={cv.showPhoto}
                  onChange={(e) => updateCv({ showPhoto: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="showPhoto" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Display Profile Photo on CV
                </label>
              </div>

              {cv.showPhoto && (
                <div className="flex items-center gap-2">
                  {cv.personalDetails.photoUrl && (
                    <img
                      src={cv.personalDetails.photoUrl}
                      alt="Thumbnail"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  )}
                  <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" />
                    <span>Upload Picture</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {cv.personalDetails.photoUrl && (
                    <button
                      type="button"
                      onClick={() => updatePersonal('photoUrl', '')}
                      className="text-xs text-rose-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Next: Professional Summary →
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PROFESSIONAL SUMMARY ================= */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Professional Summary</h3>
                <p className="text-xs text-slate-500">
                  Write 2-4 sentences highlighting your years of experience, core strengths, and biggest wins.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenPhrases}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Phrases Bank</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAi}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 hover:shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Polish</span>
                </button>
              </div>
            </div>

            {/* Section Heading Customization */}
            <SectionTitleField
              sectionKey="summary"
              currentTitle={cv.sectionTitles?.summary}
              onChangeTitle={(title) => handleUpdateSectionTitle('summary', title)}
              compact
            />

            <div className="relative">
              <textarea
                rows={6}
                value={cv.summary}
                onChange={(e) => updateCv({ summary: e.target.value })}
                placeholder="e.g. Results-driven Senior Software Engineer with 7+ years of experience designing and scaling cloud native distributed systems..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 px-1">
                <span>
                  Word count: <strong>{cv.summary ? cv.summary.trim().split(/\s+/).length : 0}</strong> (Target: 40-75 words)
                </span>
                <span>Plain text only, clean ATS parsing</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Expert CV Tip:</span> Avoid buzzwords like "hard worker" or "guru". Instead, state your key specialty, total years in the field, and a measurable highlight (e.g. "scaled revenue by 40%").
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('experience')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Next: Work Experience →
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: WORK EXPERIENCE ================= */}
        {activeTab === 'experience' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Employment History</h3>
                <p className="text-xs text-slate-500">
                  List your past roles in reverse chronological order (most recent first).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsReorderModalOpen(true)}
                    className="px-2 py-1 hover:bg-slate-50 text-slate-700 hover:text-indigo-700 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    title="Open all section reorder options"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Section #{getSectionPosNumber('experience')}</span>
                  </button>
                  <div className="h-4 w-px bg-slate-200" />
                  <button
                    type="button"
                    disabled={isSectionFirst('experience')}
                    onClick={() => handleMoveSection('experience', 'up')}
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                    title="Move Experience earlier on CV"
                    aria-label="Move Experience earlier on CV"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isSectionLast('experience')}
                    onClick={() => handleMoveSection('experience', 'down')}
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                    title="Move Experience later on CV"
                    aria-label="Move Experience later on CV"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onOpenPhrases}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Browse Bullet Library</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddExperience(false)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>
            </div>

            {/* Section Heading Customization */}
            <SectionTitleField
              sectionKey="experience"
              currentTitle={cv.sectionTitles?.experience}
              onChangeTitle={(title) => handleUpdateSectionTitle('experience', title)}
              compact
            />

            {cv.experiences.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">No work experience added yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Start fresh or insert a structured sample role to see the recommended format</p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAddExperience(false)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Blank Role</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddExperience(true)}
                    className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Insert Sample Role Structure</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cv.experiences.map((exp, expIdx) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center">
                          {expIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {exp.jobTitle || 'New Position'} {exp.employer ? `at ${exp.employer}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={expIdx === 0}
                          onClick={() => handleMoveExperience(expIdx, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                          title="Move role up"
                          aria-label="Move role up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={expIdx === cv.experiences.length - 1}
                          onClick={() => handleMoveExperience(expIdx, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                          title="Move role down"
                          aria-label="Move role down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(expIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer ml-1"
                          title="Remove position"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Job Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => handleUpdateExperience(expIdx, { jobTitle: e.target.value })}
                          placeholder="e.g. Senior Project Manager"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Employer / Company <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={exp.employer}
                          onChange={(e) => handleUpdateExperience(expIdx, { employer: e.target.value })}
                          placeholder="e.g. Acme Corporation"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => handleUpdateExperience(expIdx, { location: e.target.value })}
                          placeholder="e.g. London, UK (or Remote)"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Start Date
                          </label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => handleUpdateExperience(expIdx, { startDate: e.target.value })}
                            placeholder="e.g. 2021-03"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            End Date
                          </label>
                          <input
                            type="text"
                            disabled={exp.isCurrent}
                            value={exp.isCurrent ? 'Present' : exp.endDate}
                            onChange={(e) => handleUpdateExperience(expIdx, { endDate: e.target.value })}
                            placeholder="e.g. 2024-01"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`curr_${exp.id}`}
                        checked={exp.isCurrent}
                        onChange={(e) => handleUpdateExperience(expIdx, { isCurrent: e.target.checked })}
                        className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor={`curr_${exp.id}`} className="text-xs font-medium text-slate-700 cursor-pointer">
                        I currently work in this role
                      </label>
                    </div>

                    {/* Highlights / Accomplishment Bullets */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Key Achievements & Responsibilities
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddHighlight(expIdx)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet
                        </button>
                      </div>

                      {exp.highlights?.map((hl, hlIdx) => (
                        <div key={hlIdx} className="flex items-start gap-1.5">
                          <span className="text-slate-400 mt-2 text-xs">•</span>
                          <textarea
                            rows={2}
                            value={hl}
                            onChange={(e) => handleUpdateHighlight(expIdx, hlIdx, e.target.value)}
                            placeholder="e.g. Accelerated sprint velocity by 25% by implementing automated CI/CD pipeline..."
                            className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteHighlight(expIdx, hlIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer mt-1"
                            title="Delete bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('education')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Next: Education →
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 4: EDUCATION ================= */}
        {activeTab === 'education' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Education & Academic Background</h3>
                <p className="text-xs text-slate-500">Degrees, colleges, universities, or training courses.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsReorderModalOpen(true)}
                    className="px-2 py-1 hover:bg-slate-50 text-slate-700 hover:text-indigo-700 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    title="Open all section reorder options"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Section #{getSectionPosNumber('education')}</span>
                  </button>
                  <div className="h-4 w-px bg-slate-200" />
                  <button
                    type="button"
                    disabled={isSectionFirst('education')}
                    onClick={() => handleMoveSection('education', 'up')}
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                    title="Move Education earlier on CV (e.g. above Experience)"
                    aria-label="Move Education earlier on CV"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isSectionLast('education')}
                    onClick={() => handleMoveSection('education', 'down')}
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                    title="Move Education later on CV"
                    aria-label="Move Education later on CV"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddEducation(false)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>
            </div>

            {/* Section Heading Customization */}
            <SectionTitleField
              sectionKey="education"
              currentTitle={cv.sectionTitles?.education}
              onChangeTitle={(title) => handleUpdateSectionTitle('education', title)}
              compact
            />

            {cv.educations.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">No education entries yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">List your university degrees, colleges, diplomas, or academic qualifications</p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAddEducation(false)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Blank Education</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddEducation(true)}
                    className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Insert Sample Education Structure</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cv.educations.map((edu, eduIdx) => (
                  <div
                    key={edu.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center">
                          {eduIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {edu.degree || 'Degree'} {edu.school ? `· ${edu.school}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={eduIdx === 0}
                          onClick={() => handleMoveEducation(eduIdx, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                          title="Move education up"
                          aria-label="Move education up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={eduIdx === cv.educations.length - 1}
                          onClick={() => handleMoveEducation(eduIdx, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                          title="Move education down"
                          aria-label="Move education down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEducation(eduIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer ml-1"
                          title="Remove education"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Degree / Qualification <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(eduIdx, { degree: e.target.value })}
                          placeholder="e.g. BSc (Hons) Computer Science"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          School / University <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleUpdateEducation(eduIdx, { school: e.target.value })}
                          placeholder="e.g. University of Manchester"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Field of Study / Major
                        </label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => handleUpdateEducation(eduIdx, { fieldOfStudy: e.target.value })}
                          placeholder="e.g. Software Engineering"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Grade / Classification
                        </label>
                        <input
                          type="text"
                          value={edu.grade || ''}
                          onChange={(e) => handleUpdateEducation(eduIdx, { grade: e.target.value })}
                          placeholder="e.g. First Class Honours / 3.8 GPA"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Start Year
                          </label>
                          <input
                            type="text"
                            value={edu.startDate}
                            onChange={(e) => handleUpdateEducation(eduIdx, { startDate: e.target.value })}
                            placeholder="e.g. 2017"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            End Year
                          </label>
                          <input
                            type="text"
                            value={edu.endDate}
                            onChange={(e) => handleUpdateEducation(eduIdx, { endDate: e.target.value })}
                            placeholder="e.g. 2020"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={edu.location}
                          onChange={(e) => handleUpdateEducation(eduIdx, { location: e.target.value })}
                          placeholder="e.g. Manchester, UK"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('experience')}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Next: Core Skills →
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 5: SKILLS ================= */}
        {activeTab === 'skills' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Core Skills & Competencies</h3>
                <p className="text-xs text-slate-500">Group your skills into categories (e.g. Frameworks, Tools, Soft Skills).</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsReorderModalOpen(true)}
                    className="px-2 py-1 hover:bg-slate-50 text-slate-700 hover:text-indigo-700 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    title="Open all section reorder options"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Section #{getSectionPosNumber('skills')}</span>
                  </button>
                  <div className="h-4 w-px bg-slate-200" />
                  <button
                    type="button"
                    disabled={isSectionFirst('skills')}
                    onClick={() => handleMoveSection('skills', 'up')}
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                    title="Move Skills earlier on CV"
                    aria-label="Move Skills earlier on CV"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isSectionLast('skills')}
                    onClick={() => handleMoveSection('skills', 'down')}
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                    title="Move Skills later on CV"
                    aria-label="Move Skills later on CV"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddSkillCategory(false)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            {/* Section Heading Customization */}
            <SectionTitleField
              sectionKey="skills"
              currentTitle={cv.sectionTitles?.skills}
              onChangeTitle={(title) => handleUpdateSectionTitle('skills', title)}
              compact
            />

            {cv.skills.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">No skill categories added yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Group technical proficiencies, tools, or domain competencies</p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAddSkillCategory(false)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Blank Category</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSkillCategory(true)}
                    className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Insert Sample Skills Structure</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cv.skills.map((cat, catIdx) => (
                  <div
                    key={cat.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {catIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={cat.category}
                          onChange={(e) => handleUpdateSkillCategoryName(catIdx, e.target.value)}
                          placeholder="Category Name (e.g. Technical Skills)"
                          className="font-bold text-xs text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-hidden pb-0.5 w-full"
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={catIdx === 0}
                          onClick={() => handleMoveSkillCategory(catIdx, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                          title="Move category up"
                          aria-label="Move category up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={catIdx === cv.skills.length - 1}
                          onClick={() => handleMoveSkillCategory(catIdx, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                          title="Move category down"
                          aria-label="Move category down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSkillCategory(catIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-200/60 transition cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Skill Badges */}
                    <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white rounded-lg border border-slate-200">
                      {cat.items.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-md text-xs font-medium border border-indigo-100 group/tag"
                        >
                          {sIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveSkillTag(catIdx, sIdx, 'left')}
                              className="text-indigo-400 hover:text-indigo-800 cursor-pointer text-[10px] leading-none px-0.5"
                              title="Move left"
                            >
                              ‹
                            </button>
                          )}
                          <span>{skill}</span>
                          {sIdx < cat.items.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveSkillTag(catIdx, sIdx, 'right')}
                              className="text-indigo-400 hover:text-indigo-800 cursor-pointer text-[10px] leading-none px-0.5"
                              title="Move right"
                            >
                              ›
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillTag(catIdx, sIdx)}
                            className="text-indigo-400 hover:text-rose-600 ml-0.5 cursor-pointer font-bold"
                            title="Remove skill"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {cat.items.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No skills added yet. Type below and press Enter.</span>
                      )}
                    </div>

                    {/* Add skill tag input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSkillInputs[catIdx] || ''}
                      onChange={(e) => setNewSkillInputs({ ...newSkillInputs, [catIdx]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkillTag(catIdx, newSkillInputs[catIdx]);
                        }
                      }}
                      placeholder="Type a skill and hit Enter..."
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkillTag(catIdx, newSkillInputs[catIdx])}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('education')}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('extras')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Next: Projects & Extras →
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 6: PROJECTS, CERTS & LANGUAGES ================= */}
        {activeTab === 'extras' && (
          <div className="space-y-6">
            {/* Projects */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Key Projects & Portfolio
                  </h4>
                  <p className="text-[11px] text-slate-500">Showcase open source, case studies, or freelance projects.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setIsReorderModalOpen(true)}
                      className="px-2 py-1 hover:bg-slate-50 text-slate-700 hover:text-indigo-700 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                      title="Open all section reorder options"
                    >
                      <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Section #{getSectionPosNumber('projects')}</span>
                    </button>
                    <div className="h-4 w-px bg-slate-200" />
                    <button
                      type="button"
                      disabled={isSectionFirst('projects')}
                      onClick={() => handleMoveSection('projects', 'up')}
                      className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                      title="Move Projects earlier on CV"
                      aria-label="Move Projects earlier on CV"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isSectionLast('projects')}
                      onClick={() => handleMoveSection('projects', 'down')}
                      className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                      title="Move Projects later on CV"
                      aria-label="Move Projects later on CV"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddProject(false)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Project
                  </button>
                </div>
              </div>

              {/* Section Heading Customization */}
              <SectionTitleField
                sectionKey="projects"
                currentTitle={cv.sectionTitles?.projects}
                onChangeTitle={(title) => handleUpdateSectionTitle('projects', title)}
                compact
              />

              {(!cv.projects || cv.projects.length === 0) ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 space-y-2.5">
                  <Layers className="w-6 h-6 text-slate-300 mx-auto" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">No projects added yet</p>
                    <p className="text-[11px] text-slate-400">Highlight client projects, open source tools, or architectural case studies</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddProject(false)}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Blank Project
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddProject(true)}
                      className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" /> Insert Sample Project
                    </button>
                  </div>
                </div>
              ) : (
                cv.projects.map((proj, pIdx) => (
                  <div key={proj.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center">
                          {pIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {proj.title || `Project #${pIdx + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={pIdx === 0}
                          onClick={() => handleMoveProject(pIdx, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                          title="Move project up"
                          aria-label="Move project up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={pIdx === (cv.projects?.length || 0) - 1}
                          onClick={() => handleMoveProject(pIdx, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                          title="Move project down"
                          aria-label="Move project down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(pIdx)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer p-1 rounded-md hover:bg-slate-200/60 transition"
                          title="Remove Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleUpdateProject(pIdx, { title: e.target.value })}
                        placeholder="Project Title (e.g. E-Commerce Platform)"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={proj.link || ''}
                        onChange={(e) => handleUpdateProject(pIdx, { link: e.target.value })}
                        placeholder="Project URL (e.g. github.com/user/project)"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={proj.subtitle || ''}
                        onChange={(e) => handleUpdateProject(pIdx, { subtitle: e.target.value })}
                        placeholder="Technologies / Subtitle (e.g. React, Next.js, Node)"
                        className="sm:col-span-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={proj.startDate || ''}
                        onChange={(e) => handleUpdateProject(pIdx, { startDate: e.target.value })}
                        placeholder="Timeline (e.g. 2023 – Present)"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Project Description (Multiline)
                      </label>
                      <textarea
                        rows={3}
                        value={proj.description || ''}
                        onChange={(e) => handleUpdateProject(pIdx, { description: e.target.value })}
                        placeholder="Describe the project overview, key features, architecture, and measurable outcomes. Multiple lines & paragraphs supported..."
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Optional Key Highlights / Bullets */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600">
                          Key Highlights / Bullets (Optional)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddProjectHighlight(pIdx)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet
                        </button>
                      </div>

                      {proj.highlights?.map((hl, hlIdx) => (
                        <div key={hlIdx} className="flex items-start gap-1.5">
                          <span className="text-slate-400 mt-2 text-xs">•</span>
                          <input
                            type="text"
                            value={hl}
                            onChange={(e) => handleUpdateProjectHighlight(pIdx, hlIdx, e.target.value)}
                            placeholder="e.g. Achieved 99.9% uptime and reduced latency by 35%..."
                            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteProjectHighlight(pIdx, hlIdx)}
                            className="text-slate-400 hover:text-rose-500 p-1.5 rounded hover:bg-slate-200/50 transition cursor-pointer"
                            title="Remove bullet"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Certifications */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Certifications & Licenses
                  </h4>
                  <p className="text-[11px] text-slate-500">AWS, ScrumMaster, PMP, CPA, etc.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddCert(false)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Certificate
                </button>
              </div>

              {/* Section Heading Customization */}
              <SectionTitleField
                sectionKey="certifications"
                currentTitle={cv.sectionTitles?.certifications}
                onChangeTitle={(title) => handleUpdateSectionTitle('certifications', title)}
                compact
              />

              {(!cv.certifications || cv.certifications.length === 0) ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 space-y-2">
                  <Award className="w-6 h-6 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No certifications added yet</p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddCert(false)}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Blank Certificate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCert(true)}
                      className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" /> Insert Sample Certificate
                    </button>
                  </div>
                </div>
              ) : (
                cv.certifications.map((c, cIdx) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Certificate #{cIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCert(cIdx)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => handleUpdateCert(cIdx, { name: e.target.value })}
                        placeholder="Certificate Name"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={c.issuer}
                        onChange={(e) => handleUpdateCert(cIdx, { issuer: e.target.value })}
                        placeholder="Issuing Body"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={c.issueDate}
                        onChange={(e) => handleUpdateCert(cIdx, { issueDate: e.target.value })}
                        placeholder="Date (e.g. 2023)"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={c.credentialUrl || ''}
                        onChange={(e) => handleUpdateCert(cIdx, { credentialUrl: e.target.value })}
                        placeholder="Verification Link (e.g. credential.net/12345)"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Languages */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Languages
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddLanguage(false)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Language
                </button>
              </div>

              {/* Section Heading Customization */}
              <SectionTitleField
                sectionKey="languages"
                currentTitle={cv.sectionTitles?.languages}
                onChangeTitle={(title) => handleUpdateSectionTitle('languages', title)}
                compact
              />

              {(!cv.languages || cv.languages.length === 0) ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 space-y-2">
                  <Globe className="w-6 h-6 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No languages specified</p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddLanguage(false)}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Blank Language
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLanguage(true)}
                      className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" /> Insert Sample Language
                    </button>
                  </div>
                </div>
              ) : (
                cv.languages.map((l, lIdx) => (
                  <div key={l.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="text"
                      value={l.language}
                      onChange={(e) => handleUpdateLanguage(lIdx, { language: e.target.value })}
                      placeholder="Language (e.g. Spanish)"
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <select
                      value={l.proficiency}
                      onChange={(e) => handleUpdateLanguage(lIdx, { proficiency: e.target.value as any })}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Native">Native</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Basic">Basic</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDeleteLanguage(lIdx)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* ================= CUSTOM SECTIONS MANAGER ================= */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderPlus className="w-4 h-4 text-indigo-600" />
                    <span>Custom Sections</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                      {cv.customSections?.length || 0}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add custom sections for Awards & Honors, Publications, Volunteering, Speaking, or Patents.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAddCustomSection(false)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Blank Section
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddCustomSection(true)}
                    className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-600" /> Add with Sample Structure
                  </button>
                </div>
              </div>

              {/* Quick Starter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Starters:</span>
                {[
                  'Awards & Honors',
                  'Publications & Research',
                  'Volunteering & Community',
                  'Speaking & Conferences',
                  'Patents & Inventions'
                ].map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => handleAddCustomSection(true, title)}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-700 transition cursor-pointer"
                  >
                    + {title}
                  </button>
                ))}
              </div>

              {/* Custom Sections List or Empty State */}
              {(!cv.customSections || cv.customSections.length === 0) ? (
                <div className="p-6 text-center border-2 border-dashed border-indigo-200/80 rounded-xl bg-indigo-50/30 space-y-3">
                  <FolderPlus className="w-7 h-7 text-indigo-400 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">No custom sections added</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-md mx-auto">
                      Include any custom section like Key Achievements, Publications, Volunteering, or Speaking engagements.
                      Click below to insert a pre-structured template!
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddCustomSection(true, 'Key Achievements & Awards')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Add Sample Achievements Section</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCustomSection(false, 'Custom Section')}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
                    >
                      <span>Add Blank Custom Section</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cv.customSections.map((sec, sIdx) => (
                    <div
                      key={sec.id}
                      className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 shadow-2xs space-y-3"
                    >
                      {/* Section Title Header & Delete */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Section Heading Title
                          </label>
                          <input
                            type="text"
                            value={sec.sectionTitle}
                            onChange={(e) => handleUpdateCustomSectionTitle(sIdx, e.target.value)}
                            placeholder="Section Title (e.g. Awards & Honors)"
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomSection(sIdx)}
                          className="mt-4 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Delete entire custom section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Section</span>
                        </button>
                      </div>

                      {/* Title Suggestion Chips */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-slate-400">Suggestions:</span>
                        {[
                          'Key Achievements & Awards',
                          'Publications & Research',
                          'Volunteering & Community',
                          'Speaking & Conferences',
                          'Patents',
                          'Affiliations'
                        ].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleUpdateCustomSectionTitle(sIdx, sug)}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>

                      {/* Items in this custom section */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">
                            Section Items ({sec.items?.length || 0})
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddCustomSectionItem(sIdx, false)}
                              className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Item
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddCustomSectionItem(sIdx, true)}
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" /> Add Sample Item
                            </button>
                          </div>
                        </div>

                        {(!sec.items || sec.items.length === 0) ? (
                          <div className="p-3 bg-white rounded-lg border border-dashed border-slate-300 text-center">
                            <p className="text-xs text-slate-500">No items in this section yet.</p>
                            <button
                              type="button"
                              onClick={() => handleAddCustomSectionItem(sIdx, true)}
                              className="mt-1 text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                            >
                              + Add structured item
                            </button>
                          </div>
                        ) : (
                          sec.items.map((item, iIdx) => (
                            <div
                              key={item.id}
                              className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 relative"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-700">
                                  Entry #{iIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomSectionItem(sIdx, iIdx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                    Item Title / Award / Paper
                                  </label>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) =>
                                      handleUpdateCustomSectionItem(sIdx, iIdx, { title: e.target.value })
                                    }
                                    placeholder="e.g. Engineering Excellence Award"
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                    Date / Year
                                  </label>
                                  <input
                                    type="text"
                                    value={item.date || ''}
                                    onChange={(e) =>
                                      handleUpdateCustomSectionItem(sIdx, iIdx, { date: e.target.value })
                                    }
                                    placeholder="e.g. 2024"
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                  Subtitle / Organization / Publication Venue
                                </label>
                                <input
                                  type="text"
                                  value={item.subtitle || ''}
                                  onChange={(e) =>
                                    handleUpdateCustomSectionItem(sIdx, iIdx, { subtitle: e.target.value })
                                  }
                                  placeholder="e.g. Apex Global Technology Summit"
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                  Description / Key Details (Multiline)
                                </label>
                                <textarea
                                  rows={2}
                                  value={item.description}
                                  onChange={(e) =>
                                    handleUpdateCustomSectionItem(sIdx, iIdx, { description: e.target.value })
                                  }
                                  placeholder="Describe the recognition, contribution, publisher, or impact..."
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs leading-relaxed focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('design')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Next: Theme & Style →
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 7: THEME & STYLE ================= */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">CV Design & Appearance</h3>
              <p className="text-xs text-slate-500">Fine-tune template layout, palette colors, and typography.</p>
            </div>

            {/* Template Selector Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-600">Active Template:</span>
                <div className="text-sm font-bold text-indigo-900">
                  {TEMPLATES.find((t) => t.id === cv.templateId)?.name || 'Modern Executive'}
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenTemplates}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
              >
                Browse All 13 Templates
              </button>
            </div>

            {/* Section Order & Layout Structure */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4 text-indigo-600" />
                    <span>CV Section Order & Layout</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Control the order of Education, Experience, Skills, and Projects on your CV.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReorderModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Customize Order</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SECTION_ORDER_PRESETS.map((preset) => {
                  const isCurrent =
                    JSON.stringify(currentSectionOrder.slice(0, 4)) ===
                    JSON.stringify(preset.order.slice(0, 4));
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleUpdateSectionOrder(preset.order)}
                      className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold ring-1 ring-indigo-500/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight truncate">{preset.name}</div>
                      <div className="text-[9.5px] text-slate-500 truncate mt-0.5">{preset.badge}</div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Move Rows for Core Sections */}
              <div className="space-y-1.5 pt-1">
                {(['experience', 'education', 'skills', 'projects'] as CVSectionKey[]).map((secKey) => {
                  const meta = SECTION_METADATA[secKey];
                  const pos = getSectionPosNumber(secKey);
                  return (
                    <div
                      key={secKey}
                      className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center border border-slate-200">
                          {pos}
                        </span>
                        <span className="font-semibold text-slate-800">{meta?.label || secKey}</span>
                        {cv.sectionTitles?.[secKey as keyof SectionTitles] && (
                          <span className="text-[10px] text-indigo-600 italic">
                            ("{cv.sectionTitles[secKey as keyof SectionTitles]}")
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isSectionFirst(secKey)}
                          onClick={() => handleMoveSection(secKey, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                          title={`Move ${meta?.label || secKey} up`}
                          aria-label={`Move ${meta?.label || secKey} up`}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isSectionLast(secKey)}
                          onClick={() => handleMoveSection(secKey, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                          title={`Move ${meta?.label || secKey} down`}
                          aria-label={`Move ${meta?.label || secKey} down`}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Palette */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Accent Theme Color:
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                {COLOR_PRESETS.map((cp) => (
                  <button
                    key={cp.hex}
                    type="button"
                    onClick={() => updateCv({ themeColor: cp.hex })}
                    className={`w-7 h-7 rounded-full transition cursor-pointer flex items-center justify-center border-2 ${
                      cv.themeColor === cp.hex
                        ? 'border-indigo-600 ring-2 ring-indigo-200 scale-110'
                        : 'border-white hover:scale-105 shadow-xs'
                    }`}
                    style={{ backgroundColor: cp.hex }}
                    title={cp.name}
                  />
                ))}
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs text-slate-400">Custom:</span>
                  <input
                    type="color"
                    value={cv.themeColor || '#2563eb'}
                    onChange={(e) => updateCv({ themeColor: e.target.value })}
                    className="w-7 h-7 rounded-md cursor-pointer border border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Typography Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Font Family:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => updateCv({ fontFamily: f.id as FontFamilyType })}
                    className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition cursor-pointer ${
                      cv.fontFamily === f.id
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size & Spacing Density */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Base Font Size:
                </label>
                <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
                  {(['sm', 'base', 'lg'] as FontSizeType[]).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateCv({ fontSize: sz })}
                      className={`flex-1 py-1 rounded-md transition cursor-pointer capitalize ${
                        cv.fontSize === sz ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {sz === 'sm' ? 'Compact' : sz === 'base' ? 'Standard' : 'Large'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Line Density:
                </label>
                <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
                  {(['compact', 'normal', 'spacious'] as SpacingType[]).map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => updateCv({ lineSpacing: sp })}
                      className={`flex-1 py-1 rounded-md transition cursor-pointer capitalize ${
                        cv.lineSpacing === sp ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Page Margins Preset (A4 PDF & Print) */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Page Margins (A4 PDF & Print):</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  {cv.pageMargin === 14
                    ? '14mm · Compact'
                    : cv.pageMargin === 26
                    ? '26mm · Spacious'
                    : '20mm · Standard (Default)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Applied to all sides on download and print. Guaranteed consistent margins from 2nd page onwards even when Header &amp; Footer is turned off.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                {([
                  { mm: 14 as const, label: '14mm Compact', desc: 'Fits more content per page' },
                  { mm: 20 as const, label: '20mm Standard', desc: 'Recommended default margin' },
                  { mm: 26 as const, label: '26mm Spacious', desc: 'Executive roomy layout' }
                ]).map((preset) => {
                  const isCurrent = (cv.pageMargin || 20) === preset.mm;
                  return (
                    <button
                      key={preset.mm}
                      type="button"
                      onClick={() => updateCv({ pageMargin: preset.mm })}
                      className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{preset.label}</span>
                        {preset.mm === 20 && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{preset.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comprehensive Section Heading Titles Customization */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-indigo-600" />
                    <span>CV Section Heading Titles</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Customize the printed titles for any section across all CV templates.
                  </p>
                </div>
                {cv.sectionTitles && Object.keys(cv.sectionTitles).length > 0 && (
                  <button
                    type="button"
                    onClick={() => updateCv({ sectionTitles: {} })}
                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All to Defaults</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {(
                  [
                    'summary',
                    'experience',
                    'education',
                    'skills',
                    'projects',
                    'certifications',
                    'languages'
                  ] as (keyof SectionTitles)[]
                ).map((sKey) => (
                  <SectionTitleField
                    key={sKey}
                    sectionKey={sKey}
                    currentTitle={cv.sectionTitles?.[sKey]}
                    onChangeTitle={(newTitle) => handleUpdateSectionTitle(sKey, newTitle)}
                    compact
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
