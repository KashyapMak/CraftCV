import React, { useState, useEffect, useRef } from 'react';
import { CVData } from '../types/cv';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import { TEMPLATES } from '../templates/templatesRegistry';
import { ALEXANDER_WRIGHT_SAMPLE_CV, isCvEmpty } from '../data/sampleCV';
import {
  LayoutTemplate,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  SlidersHorizontal,
  Eye,
  Scissors,
  Palette,
  User,
  Sparkles,
  ShieldCheck,
  Info,
  Check,
  CheckCircle2,
  HelpCircle,
  X,
  Minimize2,
  ArrowRight
} from 'lucide-react';
import { calculateSmartPageBreaks, SmartPageBreakResult } from '../utils/pageBreaks';

interface Props {
  cv: CVData;
  onOpenTemplates: () => void;
  onSwitchToEditor?: () => void;
  onUpdateThemeColor?: (color: string) => void;
  showPdfHeaderFooter?: boolean;
  onTogglePdfHeaderFooter?: (show: boolean) => void;
  showPdfFooter?: boolean;
  onTogglePdfFooter?: (show: boolean) => void;
  onLoadSample?: () => void;
  onUpdatePageMargin?: (margin: PageMarginPreset) => void;
  onUpdateCv?: (updated: CVData) => void;
}

export type PageMarginPreset = 14 | 20 | 26; // Compact, Standard, Spacious in mm

export const CvPreview: React.FC<Props> = ({
  cv,
  onOpenTemplates,
  onSwitchToEditor,
  onUpdateThemeColor,
  showPdfHeaderFooter,
  onTogglePdfHeaderFooter,
  showPdfFooter,
  onTogglePdfFooter,
  onLoadSample,
  onUpdatePageMargin,
  onUpdateCv
}) => {
  const [localPdfHeaderFooter, setLocalPdfHeaderFooter] = useState<boolean>(true);
  const isPdfHeaderFooterActive =
    showPdfHeaderFooter !== undefined
      ? showPdfHeaderFooter
      : showPdfFooter !== undefined
      ? showPdfFooter
      : localPdfHeaderFooter;

  // Check whether user has populated their CV details
  const userHasCv = !isCvEmpty(cv);
  const [showSamplePreview, setShowSamplePreview] = useState<boolean>(!userHasCv);

  useEffect(() => {
    if (!userHasCv) {
      setShowSamplePreview(true);
    }
  }, [userHasCv]);

  const isUsingSample = showSamplePreview || !userHasCv;

  // Page margins between pages (default 20mm standard A4 margin)
  const [pageMarginMm, setPageMarginMm] = useState<PageMarginPreset>(() => cv.pageMargin || 20);

  useEffect(() => {
    if (cv.pageMargin && cv.pageMargin !== pageMarginMm) {
      setPageMarginMm(cv.pageMargin);
    }
  }, [cv.pageMargin]);

  const handleSelectMargin = (newMargin: PageMarginPreset) => {
    setPageMarginMm(newMargin);
    if (onUpdatePageMargin) {
      onUpdatePageMargin(newMargin);
    }
  };

  // Effective CV rendered in preview: falls back to Alexander Wright's profile if user CV is empty or sample is chosen
  const effectiveCv: CVData = isUsingSample
    ? {
        ...ALEXANDER_WRIGHT_SAMPLE_CV,
        templateId: cv.templateId || 'modern-executive',
        themeColor: cv.themeColor || '#2563eb',
        fontFamily: cv.fontFamily || 'inter',
        fontSize: cv.fontSize || 'base',
        lineSpacing: cv.lineSpacing || 'normal',
        pageMargin: pageMarginMm
      }
    : {
        ...cv,
        pageMargin: pageMarginMm
      };

  // Zoom mode: 'fit' (auto adjusts to container width so user sees complete page) or 'manual' (%)
  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit');
  const [manualZoom, setManualZoom] = useState<number>(100);
  const [fitScale, setFitScale] = useState<number>(0.85);

  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(true);
  const [smartBreaksEnabled, setSmartBreaksEnabled] = useState<boolean>(true);

  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedPageView, setSelectedPageView] = useState<'all' | 1 | 2 | 3>('all');

  const [smartBreaks, setSmartBreaks] = useState<SmartPageBreakResult>(() => ({
    totalPages: 1,
    sliceHeightsMm: [297 - pageMarginMm, 297 - 2 * pageMarginMm, 297 - 2 * pageMarginMm],
    sliceOffsetsMm: [0, 297 - pageMarginMm, (297 - pageMarginMm) + (297 - 2 * pageMarginMm)],
    hasSmartAdjustment: false
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const currentTemplate = TEMPLATES.find((t) => t.id === effectiveCv.templateId) || TEMPLATES[0];

  // Auto-calculate "Fit to Width" scale so user always sees the complete A4 page
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Standard A4 page width is 210mm = 794px at 96 DPI
        const a4WidthPx = 794;
        // Leave 48px padding (24px each side) for clean paper margins
        const availableWidth = containerWidth - 48;
        const scale = Math.min(1.2, Math.max(0.4, availableWidth / a4WidthPx));
        setFitScale(scale);
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Measure content height and compute intelligent non-chopping page breaks
  useEffect(() => {
    const calculatePages = () => {
      if (measureRef.current) {
        const result = calculateSmartPageBreaks(
          measureRef.current,
          pageMarginMm,
          smartBreaksEnabled
        );
        setSmartBreaks(result);
        setTotalPages(result.totalPages);
      }
    };

    calculatePages();
    const timer = setTimeout(calculatePages, 200);
    return () => clearTimeout(timer);
  }, [effectiveCv, pageMarginMm, smartBreaksEnabled]);

  const activeScale = zoomMode === 'fit' ? fitScale : manualZoom / 100;
  const displayZoomPercent = Math.round(activeScale * 100);

  const handleZoomIn = () => {
    setZoomMode('manual');
    setManualZoom((prev) => Math.min(130, (zoomMode === 'fit' ? Math.round(fitScale * 100) : prev) + 10));
  };

  const handleZoomOut = () => {
    setZoomMode('manual');
    setManualZoom((prev) => Math.max(50, (zoomMode === 'fit' ? Math.round(fitScale * 100) : prev) - 10));
  };

  const handleSetFitWidth = () => {
    setZoomMode('fit');
  };

  // Content slice heights and offsets dynamically determined by smart breaks
  const p1HeightMm = smartBreaks.sliceHeightsMm[0] || 297 - pageMarginMm;
  const p2OffsetMm = smartBreaks.sliceOffsetsMm[1] || 297 - pageMarginMm;
  const p2HeightMm = smartBreaks.sliceHeightsMm[1] || 297 - 2 * pageMarginMm;
  const p3OffsetMm = smartBreaks.sliceOffsetsMm[2] || p2OffsetMm + p2HeightMm;
  const p3HeightMm = smartBreaks.sliceHeightsMm[2] || 297 - 2 * pageMarginMm;

  // Aliases for layout compatibility
  const page1ContentHeightMm = p1HeightMm;
  const page2ContentHeightMm = p2HeightMm;

  const candidateName = effectiveCv.personalDetails.fullName || 'Candidate';
  const roleTitle = effectiveCv.personalDetails.jobTitle || 'Curriculum Vitae';

  return (
    <div className="flex flex-col h-full bg-slate-100/90 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Preview Controls Bar */}
      <div className="no-print px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Active Layout Switcher & Profile Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Layout:</span>
            <button
              type="button"
              onClick={onOpenTemplates}
              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
              title="Change CV template layout"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentTemplate.name}</span>
            </button>
          </div>

          {/* Profile Switcher (Sample Profile vs User CV) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setShowSamplePreview(true)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                isUsingSample
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Preview template with Alexander Wright's complete sample JSON profile"
            >
              <User className="w-3 h-3" />
              <span>Alexander Wright (Sample)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (userHasCv) setShowSamplePreview(false);
              }}
              disabled={!userHasCv}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                !isUsingSample
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : !userHasCv
                  ? 'text-slate-400 opacity-60 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={
                userHasCv
                  ? 'Preview template with your own entered CV details'
                  : 'Your CV is empty. Populate your info in the editor to preview with your CV.'
              }
            >
              <FileText className="w-3 h-3" />
              <span>My CV {!userHasCv ? '(Empty)' : ''}</span>
            </button>
          </div>

          {/* Theme Color Selector */}
          {onUpdateThemeColor && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <Palette className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="text-xs font-bold text-slate-500 hidden md:inline">Color:</span>
              <div className="flex items-center gap-1.5">
                {currentTemplate.accentColors.map((c, i) => {
                  const isCurrent = (cv.themeColor || '#2563eb').toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onUpdateThemeColor(c)}
                      className={`w-4 h-4 rounded-full border transition cursor-pointer flex items-center justify-center ${
                        isCurrent
                          ? 'ring-2 ring-indigo-600 scale-125 border-white shadow-xs'
                          : 'border-black/20 hover:scale-120'
                      }`}
                      style={{ backgroundColor: c }}
                      title={`Select theme color: ${c}`}
                    >
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white shadow-2xs" />}
                    </button>
                  );
                })}
                {/* Custom Color Picker */}
                <input
                  type="color"
                  value={cv.themeColor || '#2563eb'}
                  onChange={(e) => onUpdateThemeColor(e.target.value)}
                  className="w-4 h-4 rounded cursor-pointer border border-slate-300 ml-1 p-0 overflow-hidden"
                  title="Choose custom theme color"
                />
              </div>
            </div>
          )}
        </div>

        {/* Middle: Margin Controls & Margin Guides */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Page Margins Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs">
            <span className="px-1.5 text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              <span className="hidden xl:inline">Margins:</span>
            </span>
            <button
              type="button"
              onClick={() => handleSelectMargin(14)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                pageMarginMm === 14
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Compact Margins (14mm) - fits more content"
            >
              14mm
            </button>
            <button
              type="button"
              onClick={() => handleSelectMargin(20)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                pageMarginMm === 20
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Standard Margins (20mm) - professional default"
            >
              20mm
            </button>
            <button
              type="button"
              onClick={() => handleSelectMargin(26)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                pageMarginMm === 26
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Spacious Margins (26mm) - roomy executive layout"
            >
              26mm
            </button>
          </div>

          {/* Toggle Margin Guides */}
          <button
            type="button"
            onClick={() => setShowMarginGuides(!showMarginGuides)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer border ${
              showMarginGuides
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle visible margin guides between pages"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden lg:inline">Guides</span>
          </button>

          {/* Toggle PDF Header & Footer */}
          <button
            type="button"
            onClick={() => {
              if (onTogglePdfHeaderFooter) {
                onTogglePdfHeaderFooter(!isPdfHeaderFooterActive);
              } else if (onTogglePdfFooter) {
                onTogglePdfFooter(!isPdfHeaderFooterActive);
              } else {
                setLocalPdfHeaderFooter(!localPdfHeaderFooter);
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              isPdfHeaderFooterActive
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
            title={
              isPdfHeaderFooterActive
                ? 'Header & Footer is ON (page running headers, numbers & candidate name included). Click to turn OFF.'
                : 'Header & Footer is OFF. Click to turn ON.'
            }
          >
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                isPdfHeaderFooterActive ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            />
            <span>
              Header &amp; Footer: <strong>{isPdfHeaderFooterActive ? 'ON' : 'OFF'}</strong>
            </span>
          </button>

          {/* Smart Page Breaks Toggle */}
          <button
            type="button"
            onClick={() => setSmartBreaksEnabled(!smartBreaksEnabled)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              smartBreaksEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
            title={
              smartBreaksEnabled
                ? 'Smart Page Break Protection is ON: detects sections and entries to prevent cutting lines or cards horizontally across pages. Click to toggle.'
                : 'Smart Page Break Protection is OFF: using fixed geometric page cuts. Click to turn ON.'
            }
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Smart Breaks: <strong>{smartBreaksEnabled ? 'ON' : 'OFF'}</strong>
            </span>
          </button>

          {/* Auto-Fit 1-Page Quick Optimizer */}
          {totalPages === 2 && onUpdateCv && (
            <button
              type="button"
              onClick={() => {
                onUpdateCv({
                  ...cv,
                  fontSize: 'sm',
                  lineSpacing: 'compact',
                  pageMargin: 14
                });
                if (onUpdatePageMargin) onUpdatePageMargin(14);
              }}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Automatically adjust font size, line spacing and margins to 14mm so content cleanly fits onto 1 page without cutting"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Auto-Fit 1-Page</span>
            </button>
          )}
        </div>

        {/* Right: Page Switcher & Adaptive Width / Zoom Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* A4 Page Indicator & Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedPageView('all')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                selectedPageView === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Show all A4 pages stacked with page breaks and margins"
            >
              <FileText className="w-3 h-3 text-indigo-600" />
              <span>All ({totalPages})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPageView(1)}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                selectedPageView === 1
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="View Page 1 only"
            >
              P. 1
            </button>

            {totalPages > 1 && (
              <button
                type="button"
                onClick={() => setSelectedPageView(2)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  selectedPageView === 2
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View Page 2 only"
              >
                P. 2
              </button>
            )}

            {totalPages > 2 && (
              <button
                type="button"
                onClick={() => setSelectedPageView(3)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  selectedPageView === 3
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View Page 3 only"
              >
                P. 3
              </button>
            )}
          </div>

          {/* Auto "Fit to Width" & Zoom controls */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs text-slate-600">
            {/* Fit Width toggle */}
            <button
              type="button"
              onClick={handleSetFitWidth}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                zoomMode === 'fit'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Auto-scale preview to fit width perfectly"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden md:inline">Fit Width</span>
            </button>

            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 hover:text-slate-900 rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="px-1.5 font-mono text-[11px] font-semibold text-slate-700">
              {displayZoomPercent}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 hover:text-slate-900 rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Informational Banner when previewing with Alexander Wright profile because user CV is empty */}
      {!userHasCv && (
        <div className="no-print bg-indigo-50/95 border-b border-indigo-100 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Previewing template with <strong>Alexander Wright's sample JSON profile</strong> (loaded automatically because your CV is empty).
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onLoadSample && (
              <button
                type="button"
                onClick={onLoadSample}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold shadow-2xs transition cursor-pointer"
                title="Populate editor with Alexander Wright's details so you can edit directly"
              >
                Load to My CV
              </button>
            )}
            {onSwitchToEditor && (
              <button
                type="button"
                onClick={onSwitchToEditor}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 rounded text-[11px] font-bold transition cursor-pointer"
              >
                Type My Info
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden Canonical Document for Measurement and Print */}
      <div
        id="cv-printable-document"
        ref={measureRef}
        className="fixed -left-[9999px] top-0 w-[210mm] bg-white pointer-events-none opacity-0"
        aria-hidden="true"
      >
        <TemplateRenderer cv={effectiveCv} containerId={undefined} />
      </div>

      {/* Hidden Canonical Full-Fidelity Export Container (Clean, unscaled, no guides, always all pages for PDF generation) */}
      <div
        id="cv-pdf-clean-export-container"
        className="fixed -left-[9999px] top-0 w-[210mm] bg-white pointer-events-none select-none"
        aria-hidden="true"
        style={{ zIndex: -9999 }}
      >
        {/* Export Page 1 */}
        <div
          id="cv-export-page-1"
          className={`cv-export-page-sheet w-[210mm] ${
            totalPages === 1 ? 'min-h-[297mm]' : 'h-[297mm]'
          } bg-white relative flex flex-col justify-between overflow-hidden`}
        >
          <div
            className="w-full relative overflow-hidden"
            style={{
              height: totalPages === 1 ? 'auto' : `${page1ContentHeightMm}mm`,
              maxHeight: totalPages === 1 ? 'none' : `${page1ContentHeightMm}mm`
            }}
          >
            <TemplateRenderer cv={effectiveCv} containerId={undefined} />
          </div>
          {isPdfHeaderFooterActive ? (
            <div
              className="cv-pdf-footer w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono bg-white border-t border-slate-100 shrink-0"
              style={{ height: `${pageMarginMm}mm` }}
            >
              <div className="flex items-center gap-2">
                <span className="font-sans font-semibold text-slate-500">{candidateName}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-400 truncate max-w-[200px]">{roleTitle}</span>
              </div>
              <span>Page 1 of {totalPages}</span>
            </div>
          ) : (
            <div
              className="cv-pdf-footer-spacer cv-page-bottom-margin w-full bg-white shrink-0"
              style={{ height: `${pageMarginMm}mm`, minHeight: `${pageMarginMm}mm` }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Export Page 2 (if totalPages > 1) */}
        {totalPages > 1 && (
          <div
            id="cv-export-page-2"
            className="cv-export-page-sheet w-[210mm] h-[297mm] bg-white relative flex flex-col justify-between overflow-hidden"
          >
            {isPdfHeaderFooterActive ? (
              <div
                className="cv-pdf-header w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono bg-white border-b border-slate-100 shrink-0"
                style={{ height: `${pageMarginMm}mm` }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-sans font-semibold text-slate-500">{candidateName}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-400">Curriculum Vitae (Continued)</span>
                </div>
                <span>Page 2</span>
              </div>
            ) : (
              <div
                className="cv-pdf-header-spacer cv-page-top-margin w-full bg-white shrink-0"
                style={{ height: `${pageMarginMm}mm`, minHeight: `${pageMarginMm}mm` }}
                aria-hidden="true"
              />
            )}
            <div
              className="w-full relative overflow-hidden"
              style={{
                height: `${page2ContentHeightMm}mm`,
                maxHeight: `${page2ContentHeightMm}mm`
              }}
            >
              <div style={{ marginTop: `-${p2OffsetMm}mm` }}>
                <TemplateRenderer cv={effectiveCv} containerId={undefined} />
              </div>
            </div>
            {isPdfHeaderFooterActive ? (
              <div
                className="cv-pdf-footer w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono bg-white border-t border-slate-100 shrink-0"
                style={{ height: `${pageMarginMm}mm` }}
              >
                <span className="text-slate-400">CV: {candidateName}</span>
                <span>Page 2 of {totalPages}</span>
              </div>
            ) : (
              <div
                className="cv-pdf-footer-spacer cv-page-bottom-margin w-full bg-white shrink-0"
                style={{ height: `${pageMarginMm}mm`, minHeight: `${pageMarginMm}mm` }}
                aria-hidden="true"
              />
            )}
          </div>
        )}

        {/* Export Page 3 (if totalPages > 2) */}
        {totalPages > 2 && (
          <div
            id="cv-export-page-3"
            className="cv-export-page-sheet w-[210mm] h-[297mm] bg-white relative flex flex-col justify-between overflow-hidden"
          >
            {isPdfHeaderFooterActive ? (
              <div
                className="cv-pdf-header w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono bg-white border-b border-slate-100 shrink-0"
                style={{ height: `${pageMarginMm}mm` }}
              >
                <span className="font-sans font-semibold text-slate-500">{candidateName} · CV</span>
                <span>Page 3</span>
              </div>
            ) : (
              <div
                className="cv-pdf-header-spacer cv-page-top-margin w-full bg-white shrink-0"
                style={{ height: `${pageMarginMm}mm`, minHeight: `${pageMarginMm}mm` }}
                aria-hidden="true"
              />
            )}
            <div
              className="w-full relative overflow-hidden"
              style={{
                height: `${page2ContentHeightMm}mm`,
                maxHeight: `${page2ContentHeightMm}mm`
              }}
            >
              <div style={{ marginTop: `-${p3OffsetMm}mm` }}>
                <TemplateRenderer cv={effectiveCv} containerId={undefined} />
              </div>
            </div>
            {isPdfHeaderFooterActive ? (
              <div
                className="cv-pdf-footer w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono bg-white border-t border-slate-100 shrink-0"
                style={{ height: `${pageMarginMm}mm` }}
              >
                <span className="text-slate-400">CV: {candidateName}</span>
                <span>Page 3 of {totalPages}</span>
              </div>
            ) : (
              <div
                className="cv-pdf-footer-spacer cv-page-bottom-margin w-full bg-white shrink-0"
                style={{ height: `${pageMarginMm}mm`, minHeight: `${pageMarginMm}mm` }}
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>

      {/* A4 Sheet Display Area (Auto-fits container width) */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex flex-col items-center bg-slate-200/60"
      >
        <div
          id="cv-preview-wrapper"
          className="transition-transform duration-150 origin-top flex flex-col items-center"
          style={{
            transform: `scale(${activeScale})`,
            width: '210mm',
            marginBottom: `${Math.max(20, (1 - activeScale) * 320)}px`
          }}
        >
          {/* ================= PAGE 1 ================= */}
          {(selectedPageView === 'all' || selectedPageView === 1) && (
            <div className="flex flex-col items-center w-[210mm] mb-4">
              {/* Page 1 Header Tab */}
              <div className="w-full flex items-center justify-between pb-1.5 px-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Page 1 of {totalPages}
                </span>
                <span className="font-mono text-slate-400 font-normal">A4 · 210 × 297 mm</span>
              </div>

              {/* Page 1 A4 Sheet */}
              <div
                id="cv-page-1"
                className={`cv-a4-page-sheet w-[210mm] ${
                  totalPages === 1 ? 'min-h-[297mm]' : 'h-[297mm]'
                } bg-white shadow-2xl rounded-xs ring-1 ring-slate-300 relative flex flex-col justify-between overflow-hidden select-text`}
              >
                {/* Printable Content Slice (from top down to 297mm - bottom margin) */}
                <div
                  className="w-full relative overflow-hidden"
                  style={{
                    height: totalPages === 1 ? 'auto' : `${page1ContentHeightMm}mm`,
                    maxHeight: totalPages === 1 ? 'none' : `${page1ContentHeightMm}mm`
                  }}
                >
                  <TemplateRenderer cv={effectiveCv} containerId={undefined} />
                </div>

                {/* Page 1 Bottom Margin Area ({pageMarginMm}mm) */}
                {isPdfHeaderFooterActive ? (
                  <div
                    className={`cv-pdf-footer w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 transition-colors shrink-0 ${
                      showMarginGuides
                        ? 'border-t border-dashed border-indigo-300/80 bg-indigo-50/20'
                        : 'border-t border-slate-100'
                    }`}
                    style={{ height: `${pageMarginMm}mm` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-semibold text-slate-500">{candidateName}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-400 truncate max-w-[200px]">{roleTitle}</span>
                    </div>

                    {showMarginGuides && (
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-sans font-bold uppercase tracking-wider">
                        ↓ {pageMarginMm}mm Bottom Margin
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <span>Page 1 of {totalPages}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`cv-pdf-footer-spacer cv-page-bottom-margin w-full flex items-center justify-center text-[9px] font-mono text-slate-400 select-none shrink-0 ${
                      showMarginGuides
                        ? 'border-t border-dashed border-slate-200 bg-slate-50/40'
                        : 'bg-white'
                    }`}
                    style={{ height: `${pageMarginMm}mm`, minHeight: `${pageMarginMm}mm` }}
                  >
                    {showMarginGuides && (
                      <span>↓ {pageMarginMm}mm Bottom Margin · Header &amp; Footer OFF</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= PAGE BREAK & MARGINS IN BETWEEN PAGES ================= */}
          {selectedPageView === 'all' && totalPages > 1 && (
            <div className="w-[210mm] my-6 flex flex-col items-center gap-2 select-none">
              <div className="w-full flex items-center justify-center gap-3">
                <div className="h-px bg-slate-300 flex-1 border-dashed border-t border-slate-400" />
                <div className="px-4 py-1.5 bg-white border border-slate-300 rounded-full shadow-xs flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Scissors className="w-3.5 h-3.5 text-indigo-600 rotate-90" />
                  <span>A4 Page Break (297 mm)</span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-indigo-600 font-medium">{pageMarginMm}mm Margins Applied</span>
                </div>
                <div className="h-px bg-slate-300 flex-1 border-dashed border-t border-slate-400" />
              </div>

              {/* Informative Subtitle showing top & bottom margins in between */}
              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 bg-white/70 px-3 py-0.5 rounded-md border border-slate-200">
                <span>Page 1 Bottom Margin: {pageMarginMm}mm</span>
                <span>•</span>
                <span>Page 2 Top Margin: {pageMarginMm}mm</span>
              </div>

              {/* Smart Page-Break Protection Status Badge */}
              {smartBreaks.hasSmartAdjustment && smartBreaks.adjustedElementLabel && (
                <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Smart Break Active: Preserved "{smartBreaks.adjustedElementLabel}" from being sliced</span>
                </div>
              )}
            </div>
          )}

          {/* ================= PAGE 2 ================= */}
          {(selectedPageView === 'all' || selectedPageView === 2) && totalPages > 1 && (
            <div className="flex flex-col items-center w-[210mm] mb-4">
              {/* Page 2 Header Tab */}
              <div className="w-full flex items-center justify-between pb-1.5 px-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Page 2 of {totalPages}
                </span>
                <span className="font-mono text-slate-400 font-normal">A4 · 210 × 297 mm</span>
              </div>

              {/* Page 2 A4 Sheet */}
              <div
                id="cv-page-2"
                className="cv-a4-page-sheet w-[210mm] h-[297mm] bg-white shadow-2xl rounded-xs ring-1 ring-slate-300 relative flex flex-col justify-between overflow-hidden select-text"
              >
                {/* Page 2 Top Margin Area ({pageMarginMm}mm) */}
                {isPdfHeaderFooterActive ? (
                  <div
                    className={`cv-pdf-header w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 transition-colors shrink-0 ${
                      showMarginGuides
                        ? 'border-b border-dashed border-indigo-300/80 bg-indigo-50/20'
                        : 'border-b border-slate-100'
                    }`}
                    style={{ height: `${pageMarginMm}mm` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-semibold text-slate-500">{candidateName}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-400">Curriculum Vitae (Continued)</span>
                    </div>

                    {showMarginGuides && (
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-sans font-bold uppercase tracking-wider">
                        ↑ {pageMarginMm}mm Top Margin
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <span>Page 2</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`cv-pdf-header-spacer cv-page-top-margin w-full flex items-center justify-center text-[9px] font-mono text-slate-400 select-none shrink-0 ${
                      showMarginGuides
                        ? 'border-b border-dashed border-slate-200 bg-slate-50/40'
                        : 'bg-white'
                    }`}
                    style={{ height: `${pageMarginMm}mm`, minHeight: `${pageMarginMm}mm` }}
                  >
                    {showMarginGuides && (
                      <span>↑ {pageMarginMm}mm Top Margin · Header &amp; Footer OFF</span>
                    )}
                  </div>
                )}

                {/* Printable Content Slice (from Page 1 cut-off downwards) */}
                <div
                  className="w-full relative overflow-hidden"
                  style={{
                    height: `${page2ContentHeightMm}mm`,
                    maxHeight: `${page2ContentHeightMm}mm`
                  }}
                >
                  {/* Shift content up by Page 1's content height */}
                  <div style={{ marginTop: `-${p2OffsetMm}mm` }}>
                    <TemplateRenderer cv={effectiveCv} containerId={undefined} />
                  </div>
                </div>

                {/* Page 2 Bottom Margin Area ({pageMarginMm}mm) */}
                {isPdfHeaderFooterActive ? (
                  <div
                    className={`cv-pdf-footer w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 transition-colors shrink-0 ${
                      showMarginGuides
                        ? 'border-t border-dashed border-indigo-300/80 bg-indigo-50/20'
                        : 'border-t border-slate-100'
                    }`}
                    style={{ height: `${pageMarginMm}mm` }}
                  >
                    <span className="text-slate-400">CV: {candidateName}</span>

                    {showMarginGuides && (
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-sans font-bold uppercase tracking-wider">
                        ↓ {pageMarginMm}mm Bottom Margin
                      </span>
                    )}

                    <span>Page 2 of {totalPages}</span>
                  </div>
                ) : (
                  <div
                    className={`cv-pdf-footer-spacer cv-page-bottom-margin w-full flex items-center justify-center text-[9px] font-mono text-slate-400 select-none shrink-0 ${
                      showMarginGuides
                        ? 'border-t border-dashed border-slate-200 bg-slate-50/40'
                        : 'bg-white'
                    }`}
                    style={{ height: `${pageMarginMm}mm`, minHeight: `${pageMarginMm}mm` }}
                  >
                    {showMarginGuides && (
                      <span>↓ {pageMarginMm}mm Bottom Margin · Header &amp; Footer OFF</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= PAGE BREAK BETWEEN PAGE 2 & PAGE 3 ================= */}
          {selectedPageView === 'all' && totalPages > 2 && (
            <div className="w-[210mm] my-6 flex flex-col items-center gap-2 select-none">
              <div className="w-full flex items-center justify-center gap-3">
                <div className="h-px bg-slate-300 flex-1 border-dashed border-t border-slate-400" />
                <div className="px-4 py-1.5 bg-white border border-slate-300 rounded-full shadow-xs flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Scissors className="w-3.5 h-3.5 text-purple-600 rotate-90" />
                  <span>A4 Page Break (Page 2 → Page 3)</span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-purple-600 font-medium">{pageMarginMm}mm Margins Applied</span>
                </div>
                <div className="h-px bg-slate-300 flex-1 border-dashed border-t border-slate-400" />
              </div>
            </div>
          )}

          {/* ================= PAGE 3 ================= */}
          {(selectedPageView === 'all' || selectedPageView === 3) && totalPages > 2 && (
            <div className="flex flex-col items-center w-[210mm] mb-8">
              {/* Page 3 Header Tab */}
              <div className="w-full flex items-center justify-between pb-1.5 px-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Page 3 of {totalPages}
                </span>
                <span className="font-mono text-slate-400 font-normal">A4 · 210 × 297 mm</span>
              </div>

              {/* Page 3 A4 Sheet */}
              <div
                id="cv-page-3"
                className="cv-a4-page-sheet w-[210mm] h-[297mm] bg-white shadow-2xl rounded-xs ring-1 ring-slate-300 relative flex flex-col justify-between overflow-hidden select-text"
              >
                {/* Page 3 Top Margin Area */}
                {isPdfHeaderFooterActive ? (
                  <div
                    className={`cv-pdf-header w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 transition-colors shrink-0 ${
                      showMarginGuides
                        ? 'border-b border-dashed border-indigo-300/80 bg-indigo-50/20'
                        : 'border-b border-slate-100'
                    }`}
                    style={{ height: `${pageMarginMm}mm` }}
                  >
                    <span className="font-sans font-semibold text-slate-500">{candidateName} · CV</span>
                    {showMarginGuides && (
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-sans font-bold uppercase tracking-wider">
                        ↑ {pageMarginMm}mm Top Margin
                      </span>
                    )}
                    <span>Page 3</span>
                  </div>
                ) : (
                  <div
                    className={`cv-pdf-header-spacer cv-page-top-margin w-full flex items-center justify-center text-[9px] font-mono text-slate-400 select-none shrink-0 ${
                      showMarginGuides
                        ? 'border-b border-dashed border-slate-200 bg-slate-50/40'
                        : 'bg-white'
                    }`}
                    style={{ height: `${pageMarginMm}mm`, minHeight: `${pageMarginMm}mm` }}
                  >
                    {showMarginGuides && (
                      <span>↑ {pageMarginMm}mm Top Margin · Header &amp; Footer OFF</span>
                    )}
                  </div>
                )}

                {/* Printable Content Slice (from Page 2 cut-off downwards) */}
                <div
                  className="w-full relative overflow-hidden"
                  style={{
                    height: `${page2ContentHeightMm}mm`,
                    maxHeight: `${page2ContentHeightMm}mm`
                  }}
                >
                  <div style={{ marginTop: `-${p3OffsetMm}mm` }}>
                    <TemplateRenderer cv={effectiveCv} containerId={undefined} />
                  </div>
                </div>

                {/* Page 3 Bottom Margin Area */}
                {isPdfHeaderFooterActive ? (
                  <div
                    className={`cv-pdf-footer w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 transition-colors shrink-0 ${
                      showMarginGuides
                        ? 'border-t border-dashed border-indigo-300/80 bg-indigo-50/20'
                        : 'border-t border-slate-100'
                    }`}
                    style={{ height: `${pageMarginMm}mm` }}
                  >
                    <span className="text-slate-400">CV: {candidateName}</span>
                    {showMarginGuides && (
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-sans font-bold uppercase tracking-wider">
                        ↓ {pageMarginMm}mm Bottom Margin
                      </span>
                    )}
                    <span>Page 3 of {totalPages}</span>
                  </div>
                ) : (
                  <div
                    className={`cv-pdf-footer-spacer cv-page-bottom-margin w-full flex items-center justify-center text-[9px] font-mono text-slate-400 select-none shrink-0 ${
                      showMarginGuides
                        ? 'border-t border-dashed border-slate-200 bg-slate-50/40'
                        : 'bg-white'
                    }`}
                    style={{ height: `${pageMarginMm}mm`, minHeight: `${pageMarginMm}mm` }}
                  >
                    {showMarginGuides && (
                      <span>↓ {pageMarginMm}mm Bottom Margin · Header &amp; Footer OFF</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
