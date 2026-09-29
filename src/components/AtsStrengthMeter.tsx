import React, { useState } from 'react';
import { CVData } from '../types/cv';
import { calculateProfileScore } from '../utils/scoreCalculator';
import { ShieldCheck, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  cv: CVData;
  onOpenPhrases: () => void;
  onOpenAi: () => void;
}

export const AtsStrengthMeter: React.FC<Props> = ({ cv, onOpenPhrases, onOpenAi }) => {
  const [expanded, setExpanded] = useState(false);

  const { score, rating, color, badgeBg, badgeBorder, checks } = calculateProfileScore(cv);

  const getBarColor = () => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="ats-meter-container bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
              <span>Profile Completion & ATS Score:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${badgeBg} ${color} ${badgeBorder}`}>
                {score}% · {rating}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">
              {score >= 85
                ? 'High ATS visibility — fully optimized for recruiter screening.'
                : score >= 70
                ? 'Strong foundation! Add quantifiable metrics to reach All-Star status.'
                : 'Follow the checklist below to improve candidate visibility.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAi}
            className="text-[11px] px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:text-indigo-800 border border-indigo-200 rounded-md font-medium transition cursor-pointer"
          >
            Refine with AI
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
            title="Toggle checklist"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${getBarColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Expandable Checklist */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
            Optimization Checklist:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {checks.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                {c.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold ${c.passed ? 'text-slate-800' : 'text-slate-900'}`}>
                    {c.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{c.tip}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onOpenPhrases}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline cursor-pointer"
            >
              Browse pre-written bullet library →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
