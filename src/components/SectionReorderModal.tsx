import React from 'react';
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  Layers,
  Award,
  Globe,
  FolderPlus,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  X,
  ListOrdered,
  Sparkle
} from 'lucide-react';
import { CVData, CVSectionKey } from '../types/cv';
import {
  getEffectiveSectionOrder,
  moveSectionInOrder,
  SECTION_METADATA,
  SECTION_ORDER_PRESETS,
  DEFAULT_SECTION_ORDER
} from '../utils/sectionOrder';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cv: CVData;
  onUpdateSectionOrder: (newOrder: CVSectionKey[]) => void;
}

const SECTION_ICONS: Record<CVSectionKey, React.ComponentType<{ className?: string }>> = {
  experience: Briefcase,
  education: GraduationCap,
  skills: Sparkles,
  projects: Layers,
  certifications: Award,
  languages: Globe,
  customSections: FolderPlus
};

export const SectionReorderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cv,
  onUpdateSectionOrder
}) => {
  if (!isOpen) return null;

  const currentOrder = getEffectiveSectionOrder(cv);

  const getItemCount = (key: CVSectionKey): string => {
    switch (key) {
      case 'experience':
        return `${cv.experiences?.length || 0} ${cv.experiences?.length === 1 ? 'role' : 'roles'}`;
      case 'education':
        return `${cv.educations?.length || 0} ${cv.educations?.length === 1 ? 'degree' : 'degrees'}`;
      case 'skills':
        return `${cv.skills?.length || 0} categories`;
      case 'projects':
        return `${cv.projects?.length || 0} ${cv.projects?.length === 1 ? 'project' : 'projects'}`;
      case 'certifications':
        return `${cv.certifications?.length || 0} certs`;
      case 'languages':
        return `${cv.languages?.length || 0} langs`;
      case 'customSections':
        return `${cv.customSections?.length || 0} custom`;
      default:
        return '';
    }
  };

  const handleMove = (key: CVSectionKey, direction: 'up' | 'down') => {
    const updated = moveSectionInOrder(currentOrder, key, direction);
    onUpdateSectionOrder(updated);
  };

  const handleApplyPreset = (order: CVSectionKey[]) => {
    onUpdateSectionOrder(order);
  };

  const handleReset = () => {
    onUpdateSectionOrder([...DEFAULT_SECTION_ORDER]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Reorder CV Sections</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  Live Preview
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Move Education, Experience, Skills, or Projects to reorder how they appear on your CV.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Quick Layout Presets</span>
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SECTION_ORDER_PRESETS.map((preset) => {
                const isSelected =
                  JSON.stringify(currentOrder.slice(0, 4)) === JSON.stringify(preset.order.slice(0, 4));
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.order)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Draggable / Movable List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Current Section Order on CV ({currentOrder.length} Sections)
              </span>
              <span className="text-[11px] text-slate-400">
                Use ▲ and ▼ to reposition sections
              </span>
            </div>

            <div className="space-y-2">
              {currentOrder.map((key, index) => {
                const meta = SECTION_METADATA[key];
                const IconComponent = SECTION_ICONS[key] || Layers;
                const isFirst = index === 0;
                const isLast = index === currentOrder.length - 1;
                const countLabel = getItemCount(key);
                const customTitle = cv.sectionTitles?.[key as keyof typeof cv.sectionTitles];

                return (
                  <div
                    key={key}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-200 flex items-center justify-between gap-3 transition"
                  >
                    {/* Left: Index badge and icon and title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 border border-slate-200">
                        {index + 1}
                      </span>
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {meta?.label || key}
                          </span>
                          {customTitle && customTitle !== meta?.label && (
                            <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 truncate">
                              "{customTitle}"
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            ({countLabel})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {meta?.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Up / Down move controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMove(key, 'up')}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                        title="Move Up"
                        aria-label={`Move ${meta?.label} up`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMove(key, 'down')}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                        title="Move Down"
                        aria-label={`Move ${meta?.label} down`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Changes are saved automatically and rendered instantly in the CV preview.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
