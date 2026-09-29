import React, { useState, useEffect, useRef } from 'react';
import { CVData } from '../types/cv';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import { TEMPLATES } from '../templates/templatesRegistry';
import {
  LayoutTemplate,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  SlidersHorizontal,
  Eye,
  Scissors,
  Palette
} from 'lucide-react';

interface Props {
  cv: CVData;
  onOpenTemplates: () => void;
  onSwitchToEditor?: () => void;
  onUpdateThemeColor?: (color: string) => void;
}

export type PageMarginPreset = 14 | 20 | 26; // Compact, Standard, Spacious in mm

export const CvPreview: React.FC<Props> = ({ cv, onOpenTemplates, onUpdateThemeColor }) => {
  // Zoom mode: 'fit' (auto adjusts to container width so user sees complete page) or 'manual' (%)
  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit');
  const [manualZoom, setManualZoom] = useState<number>(100);
  const [fitScale, setFitScale] = useState<number>(0.85);

  // Page margins between pages (default 20mm standard A4 margin)
  const [pageMarginMm, setPageMarginMm] = useState<PageMarginPreset>(20);
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(true);

  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedPageView, setSelectedPageView] = useState<'all' | 1 | 2 | 3>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const currentTemplate = TEMPLATES.find((t) => t.id === cv.templateId) || TEMPLATES[0];

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

  // Measure content height against physical A4 dimensions taking margins into account
  useEffect(() => {
    const calculatePages = () => {
      if (measureRef.current) {
        const contentHeightPx = measureRef.current.scrollHeight;
        // 1mm = 3.779527559px at standard 96 DPI screen resolution
        const mmToPx = 3.779527559;

        // Page 1 usable content height = (297mm - bottom margin)
        const page1UsableMm = 297 - pageMarginMm;
        const page1UsablePx = page1UsableMm * mmToPx;

        // Page 2 & 3 usable content height = (297mm - top margin - bottom margin)
        const nextPagesUsableMm = 297 - 2 * pageMarginMm;
        const nextPagesUsablePx = nextPagesUsableMm * mmToPx;

        // Threshold buffer: small overflow (under 25px) doesn't warrant a whole second page
        if (contentHeightPx <= page1UsablePx + 25) {
          setTotalPages(1);
        } else {
          const overflowPx = contentHeightPx - page1UsablePx;
          const additional = Math.ceil(overflowPx / nextPagesUsablePx);
          setTotalPages(Math.min(3, 1 + additional));
        }
      }
    };

    calculatePages();
    const timer = setTimeout(calculatePages, 200);
    return () => clearTimeout(timer);
  }, [cv, pageMarginMm]);

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

  // Content slice heights
  const page1ContentHeightMm = 297 - pageMarginMm;
  const page2ContentHeightMm = 297 - 2 * pageMarginMm;

  const candidateName = cv.personalDetails.fullName || 'Candidate';
  const roleTitle = cv.personalDetails.jobTitle || 'Curriculum Vitae';

  return (
    <div className="flex flex-col h-full bg-slate-100/90 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Preview Controls Bar */}
      <div className="no-print px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Active Layout Switcher & Theme Color Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Active Layout:</span>
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
              onClick={() => setPageMarginMm(14)}
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
              onClick={() => setPageMarginMm(20)}
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
              onClick={() => setPageMarginMm(26)}
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

      {/* Hidden Canonical Document for Measurement and High-Res PDF/Print Export */}
      <div
        id="cv-printable-document"
        ref={measureRef}
        className="fixed -left-[9999px] top-0 w-[210mm] bg-white pointer-events-none opacity-0"
        aria-hidden="true"
      >
        <TemplateRenderer cv={cv} containerId={undefined} />
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
                  <TemplateRenderer cv={cv} containerId={undefined} />
                </div>

                {/* Page 1 Bottom Margin Area ({pageMarginMm}mm) */}
                <div
                  className={`w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 transition-colors ${
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
                <div
                  className={`w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 transition-colors ${
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

                {/* Printable Content Slice (from Page 1 cut-off downwards) */}
                <div
                  className="w-full relative overflow-hidden"
                  style={{
                    height: `${page2ContentHeightMm}mm`,
                    maxHeight: `${page2ContentHeightMm}mm`
                  }}
                >
                  {/* Shift content up by Page 1's content height */}
                  <div style={{ marginTop: `-${page1ContentHeightMm}mm` }}>
                    <TemplateRenderer cv={cv} containerId={undefined} />
                  </div>
                </div>

                {/* Page 2 Bottom Margin Area ({pageMarginMm}mm) */}
                <div
                  className={`w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 transition-colors ${
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
                <div
                  className={`w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 transition-colors ${
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

                {/* Printable Content Slice (from Page 2 cut-off downwards) */}
                <div
                  className="w-full relative overflow-hidden"
                  style={{
                    height: `${page2ContentHeightMm}mm`,
                    maxHeight: `${page2ContentHeightMm}mm`
                  }}
                >
                  <div style={{ marginTop: `-${page1ContentHeightMm + page2ContentHeightMm}mm` }}>
                    <TemplateRenderer cv={cv} containerId={undefined} />
                  </div>
                </div>

                {/* Page 3 Bottom Margin Area */}
                <div
                  className={`w-full flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 transition-colors ${
                    showMarginGuides
                      ? 'border-t border-dashed border-indigo-300/80 bg-indigo-50/20'
                      : 'border-t border-slate-100'
                  }`}
                  style={{ height: `${pageMarginMm}mm` }}
                >
                  <span className="text-slate-400">CV: {candidateName}</span>
                  <span>Page 3 of {totalPages}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
