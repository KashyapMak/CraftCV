import React, { useState } from 'react';
import { PHRASES_LIBRARY } from '../data/phrasesLibrary';
import { X, Search, Plus, Check, Sparkles, BookOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertBullet: (text: string) => void;
  onInsertSummary: (text: string) => void;
  currentRole?: string;
}

export const PhrasesLibraryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onInsertBullet,
  onInsertSummary,
  currentRole
}) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(() => {
    if (!currentRole) return 0;
    const lower = currentRole.toLowerCase();
    const idx = PHRASES_LIBRARY.findIndex(
      (p) =>
        lower.includes(p.role.toLowerCase()) ||
        p.role.toLowerCase().includes(lower) ||
        lower.includes(p.category.toLowerCase())
    );
    return idx >= 0 ? idx : 0;
  });
  const [activeTab, setActiveTab] = useState<'bullets' | 'summaries' | 'skills'>('bullets');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const currentCategory = PHRASES_LIBRARY[selectedRoleIndex];

  const filteredBullets = currentCategory.bulletPoints.filter((b) =>
    b.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSummaries = currentCategory.summaryExamples.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs modal-backdrop">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pre-Written Phrases & Examples Library
              </h2>
              <p className="text-xs text-slate-500">
                Recruiter-approved, action-driven bullet points inspired by MyPerfectCV
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

        {/* Search & Role Filters Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phrases or keywords..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('bullets')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'bullets'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Experience Bullets ({filteredBullets.length})
            </button>
            <button
              onClick={() => setActiveTab('summaries')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'summaries'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Summary Statements ({filteredSummaries.length})
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'skills'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Suggested Skills
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Roles Sidebar */}
          <div className="w-full md:w-64 border-r border-slate-100 bg-slate-50/50 p-3 overflow-y-auto shrink-0 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Select Job Role
            </div>
            {PHRASES_LIBRARY.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedRoleIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer flex flex-col ${
                  selectedRoleIndex === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <span className="font-semibold">{item.role}</span>
                <span className={`text-[10px] ${selectedRoleIndex === idx ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {item.category}
                </span>
              </button>
            ))}
          </div>

          {/* Phrases Items List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-white">
            {activeTab === 'bullets' && (
              <>
                <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
                  <span>Showing high-impact accomplishment bullets for <strong>{currentCategory.role}</strong></span>
                  <span className="text-[11px] text-indigo-600 font-semibold">Click "+ Add to CV" to append</span>
                </div>
                {filteredBullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition bg-white flex items-start justify-between gap-3 group"
                  >
                    <p className="text-xs text-slate-800 leading-relaxed flex-1">
                      {bullet}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopy(bullet, `b_${idx}`)}
                        className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md transition cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === `b_${idx}` ? (
                          <span className="flex items-center gap-1 text-emerald-600"><Check className="w-3 h-3" /> Copied</span>
                        ) : (
                          'Copy'
                        )}
                      </button>
                      <button
                        onClick={() => onInsertBullet(bullet)}
                        className="px-2.5 py-1 text-[11px] bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add to CV
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'summaries' && (
              <>
                <div className="text-xs text-slate-500 font-medium">
                  Showing professional summary templates for <strong>{currentCategory.role}</strong>
                </div>
                {filteredSummaries.map((summary, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition bg-white flex flex-col gap-2.5"
                  >
                    <p className="text-xs text-slate-800 leading-relaxed text-justify">
                      {summary}
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleCopy(summary, `s_${idx}`)}
                        className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md transition cursor-pointer"
                      >
                        {copiedIndex === `s_${idx}` ? 'Copied!' : 'Copy Text'}
                      </button>
                      <button
                        onClick={() => onInsertSummary(summary)}
                        className="px-3 py-1 text-[11px] bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" /> Use as Summary
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500 font-medium">
                  Top in-demand industry keywords and core skills for <strong>{currentCategory.role}</strong>:
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentCategory.suggestedSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => handleCopy(skill, `sk_${idx}`)}
                        className="text-slate-400 hover:text-indigo-600 ml-1 cursor-pointer"
                        title="Copy skill"
                      >
                        {copiedIndex === `sk_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : '+'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
          <div>Pro Tip: Mix and match phrases to reflect your genuine personal achievements.</div>
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
