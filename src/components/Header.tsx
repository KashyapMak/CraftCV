import React from 'react';
import { CVData } from '../types/cv';
import {
  FileText,
  Sparkles,
  Settings,
  LayoutTemplate,
  FolderOpen,
  Home
} from 'lucide-react';

interface Props {
  cv: CVData;
  cvsCount: number;
  maxLimit: number;
  onUpdateTitle: (title: string) => void;
  onOpenDashboard: () => void;
  onOpenTemplates: () => void;
  onOpenAi: () => void;
  onOpenSettings: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<Props> = ({
  cv,
  cvsCount,
  maxLimit,
  onUpdateTitle,
  onOpenDashboard,
  onOpenTemplates,
  onOpenAi,
  onOpenSettings,
  onGoHome
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Title Input */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
            title="Go to Home Page"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition">
              <FileText className="w-5 h-5" />
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1">
                CraftCV <span className="text-indigo-600">Pro</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold block -mt-0.5">
                ● 100% Client-Side
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Home Page & Overview"
          >
            <Home className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0" />

          {/* Editable CV Name */}
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={cv.title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              placeholder="CV Name..."
              className="font-semibold text-slate-800 text-xs sm:text-sm bg-transparent hover:bg-slate-100 focus:bg-white px-2 py-1 rounded-md border border-transparent focus:border-indigo-400 focus:outline-hidden transition max-w-[140px] sm:max-w-xs truncate"
              title="Click to rename this CV"
            />
          </div>
        </div>

        {/* Right: Actions and Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* My CVs Dashboard Button */}
          <button
            type="button"
            onClick={onOpenDashboard}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Manage all CVs & view completion scores"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">My CVs</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
              {cvsCount}/{maxLimit}
            </span>
          </button>

          {/* Template Switcher */}
          <button
            type="button"
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Templates</span>
          </button>

          {/* AI Refine */}
          <button
            type="button"
            onClick={onOpenAi}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Refine</span>
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer ml-1"
            title="Settings (Max CVs, Local Backup)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
