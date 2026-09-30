import React, { useState, useRef } from 'react';
import { CVData } from '../types/cv';
import { TEMPLATES } from '../templates/templatesRegistry';
import { exportSingleCvJson, saveCV, setActiveCvId, getAllCVs } from '../utils/storage';
import { calculateProfileScore } from '../utils/scoreCalculator';
import { SAMPLE_CV } from '../data/sampleCV';
import {
  X,
  Plus,
  Copy,
  Trash2,
  Download,
  Upload,
  Check,
  FileText,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  FileCode
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cvs: CVData[];
  activeCvId: string;
  maxLimit: number;
  onSelectCv: (id: string) => void;
  onCreateNew: (fromSample?: boolean) => void;
  onDuplicateCv: (id: string) => void;
  onDeleteCv: (id: string) => void;
  onOpenSettings: () => void;
  onCvImported?: () => void;
}

export const CvDashboardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cvs,
  activeCvId,
  maxLimit,
  onSelectCv,
  onCreateNew,
  onDuplicateCv,
  onDeleteCv,
  onOpenSettings,
  onCvImported
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLimitReached = cvs.length >= maxLimit;

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicateCv(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleConfirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteCv(id);
    setDeleteConfirmId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  const handleExportJson = (cv: CVData, e: React.MouseEvent) => {
    e.stopPropagation();
    exportSingleCvJson(cv);
  };

  // Download a clean blank template JSON file
  const handleDownloadTemplateJson = () => {
    const templateData = {
      title: "My Professional CV",
      templateId: "minimalist-clean",
      themeColor: "#0f172a",
      fontFamily: "inter",
      fontSize: "base",
      lineSpacing: "normal",
      showPhoto: false,
      personalDetails: {
        fullName: "Firstname Lastname",
        jobTitle: "Senior Role / Specialization",
        email: "yourname@example.com",
        phone: "+44 7700 900123",
        location: "London, United Kingdom",
        linkedin: "linkedin.com/in/yourprofile",
        website: "https://yourportfolio.com",
        github: "github.com/yourhandle"
      },
      summary: "High-impact summary outlining your experience, key strengths, leadership background, and notable career accomplishments.",
      experiences: [
        {
          id: "exp_1",
          jobTitle: "Senior Software Engineer",
          employer: "Tech Corp Inc.",
          location: "London, UK",
          startDate: "2022",
          endDate: "Present",
          isCurrent: true,
          highlights: [
            "Architected scalable cloud services reducing latency by 35% across 2M active users.",
            "Led a cross-functional team of 6 engineers delivering key platform capabilities on time.",
            "Implemented automated CI/CD deployment pipelines reducing release turnaround to under 10 minutes."
          ]
        }
      ],
      educations: [
        {
          id: "edu_1",
          school: "University of London",
          degree: "B.Sc.",
          fieldOfStudy: "Computer Science",
          location: "London, UK",
          startDate: "2018",
          endDate: "2021",
          isCurrent: false,
          grade: "First Class Honours"
        }
      ],
      skills: [
        {
          id: "skill_1",
          category: "Core Technical",
          items: ["TypeScript", "React", "Node.js", "Python", "PostgreSQL", "AWS"]
        },
        {
          id: "skill_2",
          category: "Leadership & Practices",
          items: ["System Design", "Agile / Scrum", "Code Review", "Mentoring"]
        }
      ],
      projects: [
        {
          id: "proj_1",
          title: "Real-time Analytics Dashboard",
          subtitle: "React, TypeScript, Tailwind CSS, WebSockets",
          description: "Built performant analytics visualizer processing 50k events/sec.",
          link: "https://github.com/example/analytics",
          startDate: "2023",
          endDate: "Present",
          highlights: [
            "Engineered low-latency WebSockets pipeline rendering real-time streaming data updates.",
            "Reduced bundle size by 40% using code splitting and lazy component loading."
          ]
        }
      ],
      certifications: [
        {
          id: "cert_1",
          name: "AWS Certified Solutions Architect",
          issuer: "Amazon Web Services",
          issueDate: "2023",
          credentialUrl: "https://aws.amazon.com/verification"
        }
      ],
      languages: [
        {
          id: "lang_1",
          language: "English",
          proficiency: "Native / Bilingual"
        }
      ],
      sectionTitles: {
        summary: "Professional Summary",
        experience: "Work Experience",
        education: "Education",
        skills: "Key Skills",
        projects: "Key Projects",
        certifications: "Certifications",
        languages: "Languages"
      },
      customSections: [
        {
          id: "custom_1",
          sectionTitle: "Key Achievements & Awards",
          items: [
            {
              id: "item_1",
              title: "Global Innovation Award",
              subtitle: "Apex Technology Summit",
              date: "2024",
              description: "Awarded 1st place among 150+ international teams for lowest-latency routing architecture."
            }
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cv_template_schema.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download Alexander Wright sample profile JSON
  const handleDownloadAlexanderWrightJson = () => {
    const blob = new Blob([JSON.stringify(SAMPLE_CV, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alexander_wright_sample_cv.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Upload/Load JSON File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Handle single CV object or exported backup wrapper
        let candidateCv: any = parsed;
        if (parsed.cv) candidateCv = parsed.cv;
        if (Array.isArray(parsed) && parsed.length > 0) candidateCv = parsed[0];
        if (parsed.cvs && Array.isArray(parsed.cvs) && parsed.cvs.length > 0) candidateCv = parsed.cvs[0];

        if (!candidateCv.personalDetails && !candidateCv.title) {
          throw new Error('Invalid JSON format: missing personalDetails or title.');
        }

        const newId = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const importedCv: CVData = {
          ...candidateCv,
          id: newId,
          title: candidateCv.title || `${candidateCv.personalDetails?.fullName || 'Imported'} CV`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          templateId: candidateCv.templateId || 'minimalist-clean',
          personalDetails: candidateCv.personalDetails || {},
          summary: candidateCv.summary || '',
          experiences: candidateCv.experiences || [],
          educations: candidateCv.educations || [],
          skills: candidateCv.skills || [],
          projects: candidateCv.projects || [],
          certifications: candidateCv.certifications || [],
          languages: candidateCv.languages || [],
          customSections: candidateCv.customSections || []
        };

        saveCV(importedCv);
        setActiveCvId(importedCv.id);
        onSelectCv(importedCv.id);
        if (onCvImported) onCvImported();

        setImportStatus(`Successfully loaded "${importedCv.title}"!`);
        setTimeout(() => setImportStatus(null), 3500);
      } catch (err: any) {
        setImportStatus(`Failed to load JSON: ${err.message || 'Invalid file format'}`);
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs modal-backdrop">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>My CV Documents</span>
                <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold border border-indigo-200">
                  {cvs.length} / {maxLimit} Created
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Manage, duplicate, and import CV records stored safely in your browser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast / Alert */}
        {importStatus && (
          <div className="px-6 py-2.5 bg-indigo-50 border-b border-indigo-200 flex items-center gap-2 text-xs font-semibold text-indigo-800 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Limit Warning if near limit */}
        {isLimitReached && (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Maximum CV limit of {maxLimit} reached. Delete existing CVs or increase the limit in Settings.
            </div>
            <button
              onClick={onOpenSettings}
              className="text-amber-900 underline font-bold cursor-pointer"
            >
              Adjust Limit →
            </button>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            {/* Load JSON Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Load / Import a CV from a JSON file"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Load CV (Upload JSON)</span>
            </button>

            {/* Download Template JSON Schema */}
            <button
              type="button"
              onClick={handleDownloadTemplateJson}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Download standard CV JSON template schema to fill or edit offline"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Schema JSON</span>
            </button>

            {/* Download Alexander Wright Profile JSON */}
            <button
              type="button"
              onClick={handleDownloadAlexanderWrightJson}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Download Alexander Wright's complete sample JSON profile"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Alexander Wright Sample (JSON)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLimitReached}
              onClick={() => onCreateNew(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Load Sample CV
            </button>

            <button
              type="button"
              disabled={isLimitReached}
              onClick={() => onCreateNew(false)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Blank CV
            </button>
          </div>
        </div>

        {/* CV Grid */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/50">
          {cvs.map((cv) => {
            const isActive = cv.id === activeCvId;
            const template = TEMPLATES.find((t) => t.id === cv.templateId) || TEMPLATES[0];
            const updatedDate = new Date(cv.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            const scoreInfo = calculateProfileScore(cv);
            const isConfirmingDelete = deleteConfirmId === cv.id;

            return (
              <div
                key={cv.id}
                onClick={() => {
                  onSelectCv(cv.id);
                  onClose();
                }}
                className={`relative p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {cv.title || 'Untitled CV'}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        {cv.personalDetails.fullName || 'No name set'} · {cv.personalDetails.jobTitle || 'No title set'}
                      </p>
                    </div>
                    {isActive && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Profile Score Badge */}
                  <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Profile Score:</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${scoreInfo.badgeBg} ${scoreInfo.color} ${scoreInfo.badgeBorder}`}>
                      {scoreInfo.score}% · {scoreInfo.rating}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">Layout: {template.name}</span>
                    <span className="shrink-0">{updatedDate}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  {isConfirmingDelete ? (
                    <div className="w-full flex items-center justify-between p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs animate-in fade-in">
                      <span className="font-bold text-rose-700 text-[11px]">Delete CV?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleConfirmDelete(cv.id, e)}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px] cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelDelete}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded font-semibold text-[10px] border border-slate-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(cv.id, e)}
                        disabled={isLimitReached}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition text-xs font-medium flex items-center gap-1 cursor-pointer disabled:opacity-40"
                        title="Duplicate CV"
                      >
                        {copiedId === cv.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Duplicate</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleExportJson(cv, e)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition text-xs font-medium flex items-center gap-1 cursor-pointer"
                        title="Export JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>JSON</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(cv.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete CV"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
          <div>Tip: Duplicating a CV allows you to tailor keywords for each job post while keeping your base master CV intact.</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
