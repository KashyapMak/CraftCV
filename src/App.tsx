/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CVData, AppSettings } from './types/cv';
import {
  getAllCVs,
  getActiveCvId,
  setActiveCvId,
  saveCV,
  duplicateCV,
  deleteCV,
  createNewCV,
  getAppSettings,
  exportSingleCvJson
} from './utils/storage';
import { Header } from './components/Header';
import { CvEditor } from './components/CvEditor';

export type ExportFormatType = 'pdf' | 'docx' | 'doc' | 'html' | 'json';
import { CvPreview } from './components/CvPreview';
import { AtsStrengthMeter } from './components/AtsStrengthMeter';
import { TemplatePickerModal } from './components/TemplatePickerModal';
import { PhrasesLibraryModal } from './components/PhrasesLibraryModal';
import { AiRefineModal } from './components/AiRefineModal';
import { SettingsModal } from './components/SettingsModal';
import { CvDashboardModal } from './components/CvDashboardModal';
import { HomePage } from './components/HomePage';
import { TemplateRenderer } from './templates/TemplateRenderer';
import { ALEXANDER_WRIGHT_SAMPLE_CV } from './data/sampleCV';
import { exportDirectPdf, exportToDocx, exportWordHtmlDocument, exportStandaloneHtml, normalizeTemplateId, renderTemplateToWordHtml } from './utils/exportCv';
import {
  Eye,
  Edit3,
  Columns,
  Square,
  File,
  ChevronDown,
  Download,
  FileDown,
  Code,
  Loader2
} from 'lucide-react';

export default function App() {
  const [cvs, setCvs] = useState<CVData[]>(() => getAllCVs());
  const [activeCvId, setActiveId] = useState<string>(() => getActiveCvId());
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());

  // Page routing: 'home' or 'builder' - Default to 'home' so app loads with home page
  const [currentPage, setCurrentPage] = useState<'home' | 'builder'>('home');

  // Layout mode inside builder: 'split' (side by side), 'editor' (editor only), 'preview' (preview only)
  const [layoutMode, setLayoutMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

  // Export selection state (Default to high-resolution direct PDF)
  const [exportFormat, setExportFormat] = useState<ExportFormatType>('pdf');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // PDF Header & Footer on/off toggle (Default to true, persisted in localStorage)
  const [showPdfHeaderFooter, setShowPdfHeaderFooter] = useState<boolean>(() => {
    try {
      const stored =
        localStorage.getItem('craftcv_show_pdf_header_footer') ??
        localStorage.getItem('craftcv_show_pdf_footer');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const handleTogglePdfHeaderFooter = (val: boolean) => {
    setShowPdfHeaderFooter(val);
    try {
      localStorage.setItem('craftcv_show_pdf_header_footer', String(val));
      localStorage.setItem('craftcv_show_pdf_footer', String(val));
    } catch {}
  };

  // Mobile view toggle (small screens)
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  // Modal open states
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isPhrasesOpen, setIsPhrasesOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Active CV reference
  const activeCv = cvs.find((c) => c.id === activeCvId) || cvs[0];

  // Auto-save on CV change
  const handleUpdateCv = (updated: CVData) => {
    saveCV(updated);
    setCvs((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleUpdateTitle = (title: string) => {
    if (!activeCv) return;
    handleUpdateCv({ ...activeCv, title });
  };

  const handleSelectCv = (id: string) => {
    setActiveId(id);
    setActiveCvId(id);
    setCurrentPage('builder');
  };

  const handleDuplicate = (idToDuplicate?: string) => {
    const targetId = idToDuplicate || activeCv?.id;
    if (!targetId) return;
    try {
      const cloned = duplicateCV(targetId);
      const all = getAllCVs();
      setCvs(all);
      setActiveId(cloned.id);
      setCurrentPage('builder');
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate CV');
    }
  };

  const handleDelete = (idToDelete: string) => {
    const { remainingCVs, activeId } = deleteCV(idToDelete);
    setCvs(remainingCVs);
    setActiveId(activeId);
  };

  const handleCreateNew = (fromSample = false) => {
    try {
      const { cv } = createNewCV(fromSample);
      setCvs(getAllCVs());
      setActiveId(cv.id);
      setIsDashboardOpen(false);
      setCurrentPage('builder');
    } catch (err: any) {
      alert(err.message || 'Failed to create new CV');
    }
  };

  const handleCreateFromTemplate = (templateId: string) => {
    try {
      const { cv } = createNewCV(true);
      cv.templateId = templateId;
      saveCV(cv);
      setCvs(getAllCVs());
      setActiveId(cv.id);
      setCurrentPage('builder');
    } catch (err: any) {
      alert(err.message || 'Failed to create new CV');
    }
  };

  const handleLoadAlexanderWrightSample = () => {
    if (!activeCv) return;
    const updated: CVData = {
      ...ALEXANDER_WRIGHT_SAMPLE_CV,
      id: activeCv.id,
      templateId: activeCv.templateId || 'modern-executive',
      themeColor: activeCv.themeColor || '#2563eb',
      title: activeCv.title || 'Alexander Wright (Sample CV)',
      updatedAt: Date.now()
    };
    handleUpdateCv(updated);
  };

  const handlePreviewTemplateFromHome = (templateId: string) => {
    if (activeCv) {
      handleUpdateCv({ ...activeCv, templateId });
    }
    setIsTemplatesOpen(true);
  };

  const handleReloadCVs = () => {
    const all = getAllCVs();
    setCvs(all);
    const currId = getActiveCvId();
    setActiveId(currId);
  };

  // Phrases insertion handlers
  const handleInsertBullet = (bullet: string) => {
    if (!activeCv) return;
    const experiences = [...activeCv.experiences];
    if (experiences.length === 0) {
      experiences.push({
        id: crypto.randomUUID(),
        jobTitle: activeCv.personalDetails.jobTitle || 'Role',
        employer: 'Company',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: true,
        highlights: [bullet]
      });
    } else {
      experiences[0] = {
        ...experiences[0],
        highlights: [...experiences[0].highlights, bullet]
      };
    }
    handleUpdateCv({ ...activeCv, experiences });
  };

  const handleInsertSummary = (text: string) => {
    if (!activeCv) return;
    handleUpdateCv({ ...activeCv, summary: text });
  };

  // AI Refine Apply Handlers
  const handleApplyAiSummary = (newSummary: string) => {
    if (!activeCv) return;
    handleUpdateCv({ ...activeCv, summary: newSummary });
  };

  const handleApplyAiBullet = (newBullet: string) => {
    if (!activeCv) return;
    handleInsertBullet(newBullet);
  };

  // Export handlers
  const handleExecuteExport = async (format: ExportFormatType) => {
    setIsExportDropdownOpen(false);
    if (!activeCv) return;

    if (format === 'pdf') {
      setIsExporting('pdf');
      await exportDirectPdf(activeCv, {
        showHeaderFooter: showPdfHeaderFooter,
        showFooter: showPdfHeaderFooter,
        pageMargin: activeCv.pageMargin || 20
      });
      setIsExporting(null);
    } else if (format === 'docx') {
      setIsExporting('docx');
      await exportToDocx(activeCv);
      setIsExporting(null);
    } else if (format === 'doc') {
      setIsExporting('doc');
      const safeName = (activeCv.personalDetails.fullName || 'cv').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const templateTag = normalizeTemplateId(activeCv.templateId);
      exportWordHtmlDocument(activeCv, `${safeName}_${templateTag}_resume.doc`);
      setIsExporting(null);
    } else if (format === 'html') {
      const el = document.getElementById('cv-printable-document');
      const renderedHtml = el?.innerHTML && el.innerHTML.trim().length > 50
        ? el.innerHTML
        : renderTemplateToWordHtml(activeCv);
      exportStandaloneHtml(activeCv, renderedHtml);
    } else if (format === 'json') {
      exportSingleCvJson(activeCv);
    }
  };

  const handleSelectAndExport = (format: ExportFormatType) => {
    setExportFormat(format);
    handleExecuteExport(format);
  };

  const getFormatLabel = (fmt: ExportFormatType) => {
    switch (fmt) {
      case 'pdf':
        return 'PDF Document (.pdf)';
      case 'docx':
        return 'Microsoft Word (.docx)';
      case 'doc':
        return 'Word Office Document (.doc)';
      case 'html':
        return 'Web Page (.html)';
      case 'json':
        return 'JSON Backup (.json)';
      default:
        return 'PDF Document (.pdf)';
    }
  };

  const getFormatIcon = (fmt: ExportFormatType) => {
    if (isExporting) {
      return <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />;
    }
    switch (fmt) {
      case 'pdf':
        return <Download className="w-3.5 h-3.5 text-rose-600" />;
      case 'docx':
        return <FileDown className="w-3.5 h-3.5 text-blue-600" />;
      case 'doc':
        return <FileDown className="w-3.5 h-3.5 text-cyan-600" />;
      case 'html':
        return <Code className="w-3.5 h-3.5 text-emerald-600" />;
      case 'json':
        return <Download className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <Download className="w-3.5 h-3.5 text-rose-600" />;
    }
  };

  // If currently on Landing / Home page
  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <HomePage
          totalExistingCvs={cvs.length}
          maxLimit={settings.maxCvLimit}
          onStartBlank={() => handleCreateNew(false)}
          onStartSample={() => handleCreateNew(true)}
          onResumeActiveCv={() => setCurrentPage('builder')}
          onOpenDashboard={() => setIsDashboardOpen(true)}
          onSelectTemplateToStart={(tplId: string) => handleCreateFromTemplate(tplId)}
          onPreviewTemplate={handlePreviewTemplateFromHome}
        />

        {/* Modals accessible from Home */}
        <TemplatePickerModal
          isOpen={isTemplatesOpen}
          onClose={() => setIsTemplatesOpen(false)}
          cv={activeCv}
          onLoadSampleProfile={handleLoadAlexanderWrightSample}
          onSelectTemplate={(templateId, themeColor) =>
            handleUpdateCv({
              ...activeCv,
              templateId,
              ...(themeColor ? { themeColor } : {})
            })
          }
        />

        <CvDashboardModal
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          cvs={cvs}
          activeCvId={activeCvId}
          maxLimit={settings.maxCvLimit}
          onSelectCv={handleSelectCv}
          onCreateNew={handleCreateNew}
          onDuplicateCv={(id) => handleDuplicate(id)}
          onDeleteCv={handleDelete}
          onCvImported={handleReloadCVs}
          onOpenSettings={() => {
            setIsDashboardOpen(false);
            setIsSettingsOpen(true);
          }}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={setSettings}
          currentCvCount={cvs.length}
          onReloadCVs={handleReloadCVs}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Application Header */}
      <Header
        cv={activeCv}
        cvsCount={cvs.length}
        maxLimit={settings.maxCvLimit}
        onUpdateTitle={handleUpdateTitle}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGoHome={() => setCurrentPage('home')}
      />

      {/* Mobile Tab Switcher (Visible only on small viewports) */}
      <div className="no-print lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mobileView === 'editor'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor & Input</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mobileView === 'preview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live CV Preview</span>
        </button>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Real-time ATS & Profile Completion Meter */}
        <div className="no-print">
          <AtsStrengthMeter
            cv={activeCv}
            onOpenPhrases={() => setIsPhrasesOpen(true)}
            onOpenAi={() => setIsAiOpen(true)}
          />
        </div>

        {/* Dynamic Workspace Container */}
        <div className="flex-1 min-h-[750px] flex flex-col">
          {/* Subheader: View Switcher and Current View-like Download Selection */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-3 text-xs">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {/* Current View Selector */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">Current View:</span>

                {/* View Selection Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsViewDropdownOpen(!isViewDropdownOpen);
                      setIsExportDropdownOpen(false);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    {layoutMode === 'split' && <Columns className="w-3.5 h-3.5 text-indigo-600" />}
                    {layoutMode === 'editor' && <Square className="w-3.5 h-3.5 text-indigo-600" />}
                    {layoutMode === 'preview' && <File className="w-3.5 h-3.5 text-indigo-600" />}

                    <span>
                      {layoutMode === 'split'
                        ? 'Side by Side (Editor + Live Preview)'
                        : layoutMode === 'editor'
                        ? 'Editor Only (Focused Edit)'
                        : 'Live Preview Only (Full Document)'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isViewDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsViewDropdownOpen(false)}
                      />
                      <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Select Workspace View
                        </div>

                        <button
                          onClick={() => {
                            setLayoutMode('split');
                            setIsViewDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition cursor-pointer ${
                            layoutMode === 'split'
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Columns className="w-4 h-4 text-indigo-600" />
                          <div>
                            <div>Side by Side</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Editor on the left, live preview on the right
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setLayoutMode('editor');
                            setIsViewDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition cursor-pointer ${
                            layoutMode === 'editor'
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Square className="w-4 h-4 text-indigo-600" />
                          <div>
                            <div>Editor Only</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Full-width focused input without preview distraction
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setLayoutMode('preview');
                            setIsViewDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition cursor-pointer ${
                            layoutMode === 'preview'
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <File className="w-4 h-4 text-indigo-600" />
                          <div>
                            <div>Live Preview Only</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Spacious full A4 presentation view
                            </div>
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="h-4 w-px bg-slate-300 hidden sm:block" />

              {/* Current View-style Selection for Print, PDF, and Word */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">Download:</span>

                {/* Export Dropdown in identical Current View style */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportDropdownOpen(!isExportDropdownOpen);
                      setIsViewDropdownOpen(false);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    {getFormatIcon(exportFormat)}
                    <span>{getFormatLabel(exportFormat)}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isExportDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsExportDropdownOpen(false)}
                      />
                      <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Select Download Format
                        </div>

                        {/* PDF */}
                        <button
                          onClick={() => handleSelectAndExport('pdf')}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition cursor-pointer ${
                            exportFormat === 'pdf'
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Download className="w-4 h-4 text-rose-600 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold">PDF Document (.pdf)</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded font-semibold">
                                Default
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Direct A4 PDF download matching current layout
                            </div>
                          </div>
                        </button>

                        {/* Word docx */}
                        <button
                          onClick={() => handleSelectAndExport('docx')}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition cursor-pointer ${
                            exportFormat === 'docx'
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <FileDown className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="flex-1">
                            <div className="font-bold">Microsoft Word (.docx)</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Real OpenXML .docx matching selected template layout
                            </div>
                          </div>
                        </button>

                        {/* Word doc */}
                        <button
                          onClick={() => handleSelectAndExport('doc')}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition cursor-pointer ${
                            exportFormat === 'doc'
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <FileDown className="w-4 h-4 text-cyan-600 shrink-0" />
                          <div className="flex-1">
                            <div className="font-bold">Word Document (.doc)</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Word Office HTML format (100% styled for Word, Pages, Docs)
                            </div>
                          </div>
                        </button>

                        {/* Standalone HTML */}
                        <button
                          onClick={() => handleSelectAndExport('html')}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition cursor-pointer ${
                            exportFormat === 'html'
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Code className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="flex-1">
                            <div>Standalone Web Page (.html)</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Self-contained offline webpage with CSS
                            </div>
                          </div>
                        </button>

                        {/* JSON Backup */}
                        <button
                          onClick={() => handleSelectAndExport('json')}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition cursor-pointer ${
                            exportFormat === 'json'
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Download className="w-4 h-4 text-slate-500 shrink-0" />
                          <div className="flex-1">
                            <div>JSON Backup (.json)</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Raw structured data file to backup/restore
                            </div>
                          </div>
                        </button>

                        {/* PDF Header & Footer Toggle Option */}
                        <div className="pt-2 mt-1 border-t border-slate-100 px-3 py-2 flex items-center justify-between bg-slate-50/50 rounded-b-xl">
                          <div>
                            <div className="text-xs font-semibold text-slate-700">Header &amp; Footer on PDF</div>
                            <div className="text-[10px] text-slate-400">Page headers, numbers &amp; candidate name</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTogglePdfHeaderFooter(!showPdfHeaderFooter)}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer border ${
                              showPdfHeaderFooter
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                            }`}
                            title="Toggle header & footer on downloaded PDF"
                          >
                            {showPdfHeaderFooter ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* PDF Header & Footer Quick Toggle */}
                <button
                  type="button"
                  onClick={() => handleTogglePdfHeaderFooter(!showPdfHeaderFooter)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                    showPdfHeaderFooter
                      ? 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 shadow-2xs'
                      : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200/70'
                  }`}
                  title={`PDF Header & Footer is currently ${showPdfHeaderFooter ? 'ON' : 'OFF'}. Click to toggle.`}
                >
                  <span className={`w-2 h-2 rounded-full ${showPdfHeaderFooter ? 'bg-indigo-600' : 'bg-slate-400'}`} />
                  <span className="hidden sm:inline">Header &amp; Footer:</span>
                  <span className="sm:hidden">H&amp;F:</span>
                  <strong>{showPdfHeaderFooter ? 'ON' : 'OFF'}</strong>
                </button>

                {/* Direct Trigger Action Button */}
                <button
                  type="button"
                  disabled={!!isExporting}
                  onClick={() => handleExecuteExport(exportFormat)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  title={`Trigger ${exportFormat.toUpperCase()}`}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : exportFormat === 'pdf' ? (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </>
                  ) : exportFormat === 'docx' ? (
                    <>
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download Word (.docx)</span>
                    </>
                  ) : exportFormat === 'doc' ? (
                    <>
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download Word (.doc)</span>
                    </>
                  ) : exportFormat === 'html' ? (
                    <>
                      <Code className="w-3.5 h-3.5" />
                      <span>Download HTML</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JSON</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick action buttons according to mode */}
            <div className="flex items-center gap-2">
              {layoutMode === 'editor' && (
                <button
                  onClick={() => setLayoutMode('preview')}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Switch to Preview</span>
                </button>
              )}
              {layoutMode === 'preview' && (
                <button
                  onClick={() => setLayoutMode('editor')}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Switch to Editor</span>
                </button>
              )}
              {layoutMode !== 'split' && (
                <button
                  onClick={() => setLayoutMode('split')}
                  className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Restore Side by Side</span>
                </button>
              )}
            </div>
          </div>

          {/* Conditional Layout Rendering */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Form Editor */}
            {(layoutMode === 'split' || layoutMode === 'editor') && (
              <div
                className={`flex flex-col ${
                  layoutMode === 'editor'
                    ? 'lg:col-span-12 max-w-4xl mx-auto w-full'
                    : 'lg:col-span-6'
                } ${mobileView === 'editor' ? 'block' : 'hidden lg:flex'}`}
              >
                <CvEditor
                  cv={activeCv}
                  onChange={handleUpdateCv}
                  onOpenPhrases={() => setIsPhrasesOpen(true)}
                  onOpenAi={() => setIsAiOpen(true)}
                  onOpenTemplates={() => setIsTemplatesOpen(true)}
                  onLoadSample={handleLoadAlexanderWrightSample}
                />
              </div>
            )}

            {/* Right: Live Paper Preview (Always mounted to ensure synchronous PDF and print generation) */}
            <div
              className={`flex flex-col ${
                layoutMode === 'preview'
                  ? 'lg:col-span-12 max-w-5xl mx-auto w-full'
                  : layoutMode === 'split'
                  ? 'lg:col-span-6'
                  : 'fixed -left-[9999px] top-0 w-[210mm] opacity-100 pointer-events-none'
              } ${mobileView === 'preview' ? 'block' : layoutMode === 'editor' ? 'max-lg:fixed max-lg:-left-[9999px] max-lg:top-0 max-lg:opacity-0 max-lg:pointer-events-none lg:block' : 'max-lg:fixed max-lg:-left-[9999px] max-lg:top-0 max-lg:opacity-0 max-lg:pointer-events-none lg:flex'}`}
            >
              <CvPreview
                cv={activeCv}
                onOpenTemplates={() => setIsTemplatesOpen(true)}
                onSwitchToEditor={() => setLayoutMode('editor')}
                onUpdateThemeColor={(color) => handleUpdateCv({ ...activeCv, themeColor: color })}
                showPdfHeaderFooter={showPdfHeaderFooter}
                onTogglePdfHeaderFooter={handleTogglePdfHeaderFooter}
                showPdfFooter={showPdfHeaderFooter}
                onTogglePdfFooter={handleTogglePdfHeaderFooter}
                onLoadSample={handleLoadAlexanderWrightSample}
                onUpdatePageMargin={(margin) => handleUpdateCv({ ...activeCv, pageMargin: margin })}
                onUpdateCv={handleUpdateCv}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Workspace Footer */}
      <footer className="no-print mt-auto py-3.5 border-t border-slate-200/80 bg-white/80 backdrop-blur-xs text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <p>CraftCV Pro • 100% Free Forever • Zero Subscriptions • Complete Client-Side Privacy</p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/kashyapMak"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition hover:underline"
            >
              Explore more projects
            </a>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Alpha v0.1.0
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TemplatePickerModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        cv={activeCv}
        onLoadSampleProfile={handleLoadAlexanderWrightSample}
        onSelectTemplate={(templateId, themeColor) =>
          handleUpdateCv({
            ...activeCv,
            templateId,
            ...(themeColor ? { themeColor } : {})
          })
        }
      />

      <PhrasesLibraryModal
        isOpen={isPhrasesOpen}
        onClose={() => setIsPhrasesOpen(false)}
        onInsertBullet={handleInsertBullet}
        onInsertSummary={handleInsertSummary}
        currentRole={activeCv.personalDetails.jobTitle}
      />

      <AiRefineModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        cv={activeCv}
        settings={settings}
        onUpdateSettings={setSettings}
        onApplySummary={handleApplyAiSummary}
        onApplyBullet={handleApplyAiBullet}
      />

      <CvDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        cvs={cvs}
        activeCvId={activeCvId}
        maxLimit={settings.maxCvLimit}
        onSelectCv={handleSelectCv}
        onCreateNew={handleCreateNew}
        onDuplicateCv={(id) => handleDuplicate(id)}
        onDeleteCv={handleDelete}
        onCvImported={handleReloadCVs}
        onOpenSettings={() => {
          setIsDashboardOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        currentCvCount={cvs.length}
        onReloadCVs={handleReloadCVs}
      />
    </div>
  );
}
