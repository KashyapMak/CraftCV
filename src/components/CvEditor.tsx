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
  Wand2
} from 'lucide-react';

interface Props {
  cv: CVData;
  onChange: (updatedCv: CVData) => void;
  onOpenPhrases: () => void;
  onOpenAi: () => void;
  onOpenTemplates: () => void;
}

type EditorTab = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'extras' | 'design';

export const CvEditor: React.FC<Props> = ({
  cv,
  onChange,
  onOpenPhrases,
  onOpenAi,
  onOpenTemplates
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('personal');
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});

  // Helper updater
  const updateCv = (patch: Partial<CVData>) => {
    onChange({ ...cv, ...patch, updatedAt: Date.now() });
  };

  const updatePersonal = (field: string, value: any) => {
    updateCv({
      personalDetails: { ...cv.personalDetails, [field]: value }
    });
  };

  // Work experience helpers
  const handleAddExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp_${Date.now()}`,
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
  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: `edu_${Date.now()}`,
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
  const handleAddSkillCategory = () => {
    const newCat: SkillCategory = {
      id: `cat_${Date.now()}`,
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
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj_${Date.now()}`,
      title: '',
      subtitle: '',
      link: '',
      startDate: '',
      endDate: '',
      highlights: ['']
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

  // Certifications helpers
  const handleAddCert = () => {
    const newCert: CertificationItem = {
      id: `cert_${Date.now()}`,
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
  const handleAddLanguage = () => {
    const newLang: LanguageItem = {
      id: `lang_${Date.now()}`,
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
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ml-auto ${
            activeTab === 'design'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Theme & Style</span>
        </button>
      </div>

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
                <span className="font-bold">MyPerfectCV Tip:</span> Avoid buzzwords like "hard worker" or "guru". Instead, state your key specialty, total years in the field, and a measurable highlight (e.g. "scaled revenue by 40%").
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Employment History</h3>
                <p className="text-xs text-slate-500">
                  List your past roles in reverse chronological order (most recent first).
                </p>
              </div>

              <div className="flex items-center gap-2">
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
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>
            </div>

            {cv.experiences.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No work experience added yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Role" above to add your first position</p>
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
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(expIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                        title="Remove position"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Education & Academic Background</h3>
                <p className="text-xs text-slate-500">Degrees, colleges, universities, or training courses.</p>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            {cv.educations.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No education entries yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Education" to list your qualifications</p>
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
                      <button
                        type="button"
                        onClick={() => handleDeleteEducation(eduIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                        title="Remove education"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Core Skills & Competencies</h3>
                <p className="text-xs text-slate-500">Group your skills into categories (e.g. Frameworks, Tools, Soft Skills).</p>
              </div>
              <button
                type="button"
                onClick={handleAddSkillCategory}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="space-y-4">
              {cv.skills.map((cat, catIdx) => (
                <div
                  key={cat.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={cat.category}
                      onChange={(e) => handleUpdateSkillCategoryName(catIdx, e.target.value)}
                      placeholder="Category Name (e.g. Technical Skills)"
                      className="font-bold text-xs text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-hidden pb-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSkillCategory(catIdx)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white rounded-lg border border-slate-200">
                    {cat.items.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-md text-xs font-medium border border-indigo-100"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillTag(catIdx, sIdx)}
                          className="text-indigo-400 hover:text-rose-600 ml-0.5 cursor-pointer"
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Key Projects & Portfolio
                  </h4>
                  <p className="text-[11px] text-slate-500">Showcase open source, case studies, or freelance projects.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Project
                </button>
              </div>

              {cv.projects?.map((proj, pIdx) => (
                <div key={proj.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Project #{pIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(pIdx)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => handleUpdateProject(pIdx, { title: e.target.value })}
                      placeholder="Project Title"
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={proj.link || ''}
                      onChange={(e) => handleUpdateProject(pIdx, { link: e.target.value })}
                      placeholder="Project URL (e.g. github.com/...)"
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    value={proj.subtitle || ''}
                    onChange={(e) => handleUpdateProject(pIdx, { subtitle: e.target.value })}
                    placeholder="Technologies / Subtitle (e.g. React, Next.js, Node)"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Certifications & Licenses
                  </h4>
                  <p className="text-[11px] text-slate-500">AWS, ScrumMaster, PMP, CPA, etc.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCert}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Certificate
                </button>
              </div>

              {cv.certifications?.map((c, cIdx) => (
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
                </div>
              ))}
            </div>

            {/* Languages */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Languages
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Language
                </button>
              </div>

              {cv.languages?.map((l, lIdx) => (
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
              ))}
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
                Browse All 6 Templates
              </button>
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
          </div>
        )}
      </div>
    </div>
  );
};
