import React from 'react';
import { SectionTitles } from '../types/cv';
import { SECTION_TITLE_SUGGESTIONS, DEFAULT_SECTION_TITLES } from '../utils/sectionTitles';
import { Type, RotateCcw } from 'lucide-react';

interface Props {
  sectionKey: keyof SectionTitles;
  currentTitle?: string;
  onChangeTitle: (newTitle: string) => void;
  label?: string;
  compact?: boolean;
}

export const SectionTitleField: React.FC<Props> = ({
  sectionKey,
  currentTitle,
  onChangeTitle,
  label = 'Section Heading Title on CV',
  compact = false
}) => {
  const defaultTitle = DEFAULT_SECTION_TITLES[sectionKey];
  const value = currentTitle !== undefined ? currentTitle : defaultTitle;
  const isCustomized = currentTitle !== undefined && currentTitle.trim() !== defaultTitle;
  const suggestions = SECTION_TITLE_SUGGESTIONS[sectionKey] || [];

  return (
    <div className={`bg-slate-50 border border-slate-200/90 rounded-xl ${compact ? 'p-2.5 mb-3' : 'p-3 mb-4'} shadow-2xs`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-indigo-600" />
          <span>{label}</span>
          {isCustomized && (
            <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded border border-indigo-200">
              Customized
            </span>
          )}
        </label>
        {isCustomized && (
          <button
            type="button"
            onClick={() => onChangeTitle(defaultTitle)}
            className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition cursor-pointer"
            title="Reset back to default section heading"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset ({defaultTitle})</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder={`Default: ${defaultTitle}`}
          className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Quick Suggestions Chips */}
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-slate-400 font-medium">Quick options:</span>
        {suggestions.map((sug) => {
          const isSelected = value.trim().toLowerCase() === sug.toLowerCase();
          return (
            <button
              key={sug}
              type="button"
              onClick={() => onChangeTitle(sug)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {sug}
            </button>
          );
        })}
      </div>
    </div>
  );
};
