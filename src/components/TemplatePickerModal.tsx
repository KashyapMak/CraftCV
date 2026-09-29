import React, { useState, useEffect, useRef } from 'react';
import { CVData, TemplateConfig } from '../types/cv';
import { TEMPLATES, COLOR_PRESETS } from '../templates/templatesRegistry';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import {
  X,
  Check,
  LayoutTemplate,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Palette
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cv: CVData;
  onSelectTemplate: (templateId: string, themeColor?: string) => void;
}

export const TemplatePickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cv,
  onSelectTemplate
}) => {
  if (!isOpen) return null;

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(cv.templateId || 'modern-executive');
  const currentTmpl = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  const [selectedThemeColor, setSelectedThemeColor] = useState<string>(
    cv.themeColor || currentTmpl.defaultColor || '#2563eb'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(true);
  const [previewZoom, setPreviewZoom] = useState<number>(90);
  const [totalPages, setTotalPages] = useState<number>(1);
  const previewMeasureRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Modern', 'Corporate', 'Minimalist', 'Creative', 'Tech', 'Academic'];

  const filtered = selectedCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === selectedCategory);

  // Preview CV state with selected template and selected theme color
  const previewCv: CVData = {
    ...cv,
    templateId: selectedTemplateId,
    themeColor: selectedThemeColor
  };

  // Measure content height against A4 physical dimensions (210mm x 297mm)
  useEffect(() => {
    const calculatePages = () => {
      if (previewMeasureRef.current) {
        const height = previewMeasureRef.current.scrollHeight;
        const a4PageHeightPx = 1123;
        const pages = Math.max(1, Math.ceil((height - 20) / a4PageHeightPx));
        setTotalPages(Math.min(pages, 3));
      }
    };

    calculatePages();
    const timer = setTimeout(calculatePages, 150);
    return () => clearTimeout(timer);
  }, [selectedTemplateId, selectedThemeColor, cv]);

  // Auto-fit zoom on mount or resize
  useEffect(() => {
    const adjustScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth;
        const a4WidthPx = 794;
        const availableWidth = containerWidth - 48;
        const scale = Math.min(1.05, Math.max(0.6, availableWidth / a4WidthPx));
        setPreviewZoom(Math.round(scale * 100));
      }
    };

    adjustScale();
    window.addEventListener('resize', adjustScale);
    return () => window.removeEventListener('resize', adjustScale);
  }, [isAccordionOpen]);

  const handleApply = () => {
    onSelectTemplate(selectedTemplateId, selectedThemeColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs modal-backdrop">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shadow-xs">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Choose CV Template & Color Theme</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {TEMPLATES.length} ATS Layouts
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Select a layout & click any color dot to customize the full-width A4 presentation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Apply Button on top */}
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply "{currentTmpl.name}"</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= TOP SECTION: ACCORDION TEMPLATE SELECTOR ================= */}
        <div className="border-b border-slate-200 bg-white shadow-2xs shrink-0">
          {/* Accordion Toggle Header Bar */}
          <div className="px-6 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                Categories:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Accordion Expand/Collapse Button */}
            <button
              type="button"
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title={isAccordionOpen ? "Collapse template tiles to give full space to preview" : "Expand template selection tiles"}
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isAccordionOpen ? 'Collapse Templates' : 'Change Template'}</span>
              {isAccordionOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </div>

          {/* Accordion Content: Template Tiles Ribbon */}
          {isAccordionOpen ? (
            <div className="p-4 overflow-x-auto bg-slate-100/50">
              <div className="flex gap-3.5 min-w-max pb-1">
                {filtered.map((tmpl: TemplateConfig) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  const isCurrentlySaved = cv.templateId === tmpl.id;

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        setSelectedTemplateId(tmpl.id);
                        if (!tmpl.accentColors.some((c) => c.toLowerCase() === selectedThemeColor.toLowerCase())) {
                          setSelectedThemeColor(tmpl.defaultColor || tmpl.accentColors[0] || '#2563eb');
                        }
                      }}
                      className={`w-68 p-3.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between select-none relative ${
                        isSelected
                          ? 'bg-white border-indigo-600 shadow-lg ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Title & Badge */}
                        <div className="flex items-start justify-between gap-1.5 mb-1">
                          <h3 className="text-xs font-bold text-slate-900 truncate">
                            {tmpl.name}
                          </h3>
                          {tmpl.badge && (
                            <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded-full border border-indigo-100 shrink-0">
                              {tmpl.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                          {tmpl.description}
                        </p>

                        <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-md mb-2">
                          <span className="font-semibold text-slate-700">Best for: </span>
                          <span className="line-clamp-1">{tmpl.recommendedFor}</span>
                        </div>
                      </div>

                      {/* Bottom Footer: Interactive Palette & Status */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          {/* Color dots for selecting color theme */}
                          <div className="flex items-center gap-1.5" title="Click a color dot to select this theme color">
                            <span className="text-[10px] font-bold text-slate-500">Color:</span>
                            {tmpl.accentColors.map((c, i) => {
                              const isColorActive = isSelected && selectedThemeColor.toLowerCase() === c.toLowerCase();
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTemplateId(tmpl.id);
                                    setSelectedThemeColor(c);
                                  }}
                                  className={`w-4 h-4 rounded-full border transition cursor-pointer flex items-center justify-center ${
                                    isColorActive
                                      ? 'ring-2 ring-indigo-600 scale-125 border-white shadow-xs'
                                      : 'border-black/20 hover:scale-120'
                                  }`}
                                  style={{ backgroundColor: c }}
                                  title={`Choose color theme: ${c}`}
                                >
                                  {isColorActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                </button>
                              );
                            })}
                          </div>

                          {isSelected ? (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                              <Check className="w-2.5 h-2.5" /> Active
                            </span>
                          ) : isCurrentlySaved ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                              Saved
                            </span>
                          ) : (
                            <span className="text-[10px] text-indigo-600 font-semibold hover:underline">
                              Preview
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Collapsed Ribbon Bar */
            <div className="px-6 py-2 flex items-center justify-between bg-indigo-50/40 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedThemeColor }} />
                  Previewing: <span className="text-indigo-700 font-extrabold">{currentTmpl.name}</span>
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600 hidden sm:inline">{currentTmpl.description}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAccordionOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
              >
                Change Layout ({filtered.length} available) ↓
              </button>
            </div>
          )}
        </div>

        {/* Hidden Canonical Measurement Container */}
        <div
          ref={previewMeasureRef}
          className="fixed -left-[9999px] top-0 w-[210mm] bg-white pointer-events-none opacity-0"
          aria-hidden="true"
        >
          <TemplateRenderer cv={previewCv} containerId={undefined} />
        </div>

        {/* ================= BOTTOM SECTION: FULL-WIDTH LIVE PREVIEW ================= */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-200/70">
          {/* Preview Toolbar with Interactive Theme Color Selector */}
          <div className="px-6 py-2 bg-white/95 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Previewing:
              </span>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md font-semibold text-slate-700">
                {currentTmpl.name} ({currentTmpl.category})
              </span>
              <span className="text-slate-400 text-[11px] hidden md:inline">
                · {totalPages} {totalPages === 1 ? 'Page' : 'Pages'} Standard A4
              </span>
            </div>

            {/* Interactive Theme Color Palette Bar */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
              <span className="font-bold text-[11px] text-slate-600 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>Theme Color:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {/* Template Recommended Accents */}
                {currentTmpl.accentColors.map((c, i) => {
                  const isColorActive = selectedThemeColor.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={`accent-${i}`}
                      type="button"
                      onClick={() => setSelectedThemeColor(c)}
                      className={`w-4 h-4 rounded-full border transition cursor-pointer flex items-center justify-center ${
                        isColorActive
                          ? 'ring-2 ring-indigo-600 scale-125 border-white shadow-xs'
                          : 'border-black/20 hover:scale-120'
                      }`}
                      style={{ backgroundColor: c }}
                      title={`Recommended Theme Color: ${c}`}
                    >
                      {isColorActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}

                <div className="h-3.5 w-px bg-slate-200 mx-0.5" />

                {/* Popular Palette Presets */}
                {COLOR_PRESETS.slice(0, 5).map((cp) => {
                  const isColorActive = selectedThemeColor.toLowerCase() === cp.hex.toLowerCase();
                  return (
                    <button
                      key={cp.hex}
                      type="button"
                      onClick={() => setSelectedThemeColor(cp.hex)}
                      className={`w-4 h-4 rounded-full border transition cursor-pointer flex items-center justify-center ${
                        isColorActive
                          ? 'ring-2 ring-indigo-600 scale-125 border-white shadow-xs'
                          : 'border-black/20 hover:scale-120'
                      }`}
                      style={{ backgroundColor: cp.hex }}
                      title={cp.name}
                    >
                      {isColorActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}

                {/* Custom Color Input */}
                <div className="relative flex items-center ml-1">
                  <input
                    type="color"
                    value={selectedThemeColor}
                    onChange={(e) => setSelectedThemeColor(e.target.value)}
                    className="w-5 h-5 rounded-md cursor-pointer border border-slate-300 p-0 overflow-hidden"
                    title="Pick custom hex theme color"
                  />
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5 text-xs text-slate-600">
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.max(50, z - 10))}
                className="p-1 hover:text-slate-900 rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono text-[11px] font-semibold text-slate-800">
                {previewZoom}%
              </span>
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.min(130, z + 10))}
                className="p-1 hover:text-slate-900 rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewZoom(90)}
                className="p-1 hover:text-slate-900 rounded cursor-pointer ml-0.5 border-l border-slate-200"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scrollable Canvas displaying Full-Width A4 Pages */}
          <div
            ref={previewContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 flex flex-col items-center"
          >
            <div
              className="transition-transform duration-150 origin-top flex flex-col items-center"
              style={{
                transform: `scale(${previewZoom / 100})`,
                width: '210mm',
                marginBottom: `${Math.max(30, (1 - previewZoom / 100) * 400)}px`
              }}
            >
              {/* ================= PAGE 1 ================= */}
              <div className="flex flex-col items-center w-[210mm] mb-4">
                <div className="w-full flex items-center justify-between pb-1.5 px-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedThemeColor }} />
                    Page 1 of {totalPages}
                  </span>
                  <span className="font-mono text-slate-400 font-normal">A4 · 210 × 297 mm</span>
                </div>

                <div
                  className={`w-[210mm] ${
                    totalPages === 1 ? 'min-h-[297mm]' : 'h-[297mm]'
                  } bg-white shadow-2xl rounded-xs ring-1 ring-slate-300 relative flex flex-col justify-between overflow-hidden select-text`}
                >
                  {/* Content Window */}
                  <div
                    className="w-full relative overflow-hidden"
                    style={{
                      height: totalPages === 1 ? 'auto' : '277mm',
                      maxHeight: totalPages === 1 ? 'none' : '277mm'
                    }}
                  >
                    <TemplateRenderer cv={previewCv} containerId={undefined} />
                  </div>

                  {/* Bottom Margin (20mm) */}
                  <div className="w-full h-[20mm] flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 border-t border-slate-100">
                    <span className="font-sans font-semibold text-slate-500">{previewCv.personalDetails.fullName || 'Candidate'}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-sans font-bold">20mm Bottom Margin</span>
                    <span>Page 1 of {totalPages}</span>
                  </div>
                </div>
              </div>

              {/* ================= PAGE BREAK (if multi-page) ================= */}
              {totalPages > 1 && (
                <div className="w-[210mm] my-6 flex flex-col items-center gap-2 select-none">
                  <div className="w-full flex items-center justify-center gap-3">
                    <div className="h-px bg-slate-300 flex-1 border-dashed border-t border-slate-400" />
                    <div className="px-4 py-1.5 bg-white border border-slate-300 rounded-full shadow-xs flex items-center gap-2 text-xs font-bold text-slate-700">
                      <span>✂</span>
                      <span>A4 Standard Fold (297 mm)</span>
                      <span className="text-slate-400 font-normal">|</span>
                      <span className="text-indigo-600 font-medium">20mm Margins Applied</span>
                    </div>
                    <div className="h-px bg-slate-300 flex-1 border-dashed border-t border-slate-400" />
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 bg-white/70 px-3 py-0.5 rounded-md border border-slate-200">
                    <span>Page 1 Bottom Margin: 20mm</span>
                    <span>•</span>
                    <span>Page 2 Top Margin: 20mm</span>
                  </div>
                </div>
              )}

              {/* ================= PAGE 2 ================= */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center w-[210mm] mb-8">
                  <div className="w-full flex items-center justify-between pb-1.5 px-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedThemeColor }} />
                      Page 2 of {totalPages}
                    </span>
                    <span className="font-mono text-slate-400 font-normal">A4 · 210 × 297 mm</span>
                  </div>

                  <div className="w-[210mm] h-[297mm] bg-white shadow-2xl rounded-xs ring-1 ring-slate-300 relative flex flex-col justify-between overflow-hidden select-text">
                    {/* Top Margin (20mm) */}
                    <div className="w-full h-[20mm] flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 border-b border-slate-100">
                      <span className="font-sans font-semibold text-slate-500">{previewCv.personalDetails.fullName || 'Candidate'} · CV</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-sans font-bold">20mm Top Margin</span>
                      <span>Page 2</span>
                    </div>

                    {/* Content Window */}
                    <div className="w-full relative overflow-hidden" style={{ height: '257mm', maxHeight: '257mm' }}>
                      <div style={{ marginTop: '-277mm' }}>
                        <TemplateRenderer cv={previewCv} containerId={undefined} />
                      </div>
                    </div>

                    {/* Bottom Margin (20mm) */}
                    <div className="w-full h-[20mm] flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono select-none bg-white z-10 border-t border-slate-100">
                      <span className="text-slate-400">CV: {previewCv.personalDetails.fullName || 'Candidate'}</span>
                      <span>Page 2 of {totalPages}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Sticky Action Bar */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: selectedThemeColor }} />
              <span className="font-bold text-slate-900">{currentTmpl.name}</span>
            </div>
            <span>—</span>
            <span className="text-slate-500">{currentTmpl.recommendedFor}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Apply "{currentTmpl.name}" with Selected Color</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
