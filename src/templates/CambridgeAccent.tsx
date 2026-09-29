import React from 'react';
import { CVData } from '../types/cv';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Sparkles } from 'lucide-react';

interface Props {
  cv: CVData;
}

/**
 * Cambridge Accent Template
 * Features a modern color accent block, monogram initials avatar, pill tags for skills, and clean section dividers.
 */
export const CambridgeAccentTemplate: React.FC<Props> = ({ cv }) => {
  const p = cv.personalDetails;
  const theme = cv.themeColor || '#0d9488';

  // Get initials for monogram
  const initials = (p.fullName || 'CV')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div className="w-full bg-white text-slate-800 p-8 sm:p-9 font-sans text-xs leading-relaxed select-text">
      {/* Top Modern Header Banner */}
      <header className="rounded-xl p-6 text-white mb-6 shadow-xs relative overflow-hidden" style={{ backgroundColor: theme }}>
        {/* Subtle geometric circle decoration in background */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-16 -top-10 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex justify-between items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Monogram or Photo */}
            {cv.showPhoto && p.photoUrl ? (
              <img
                src={p.photoUrl}
                alt={p.fullName}
                className="w-18 h-18 rounded-xl object-cover border-2 border-white shadow"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center font-black text-2xl tracking-wider text-white shadow-xs shrink-0">
                {initials}
              </div>
            )}

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {p.fullName || 'Candidate Name'}
              </h1>
              <p className="text-sm font-semibold tracking-wide text-white/90 mt-0.5">
                {p.jobTitle || 'Executive Professional'}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/90 font-medium">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.location && <span>• {p.location}</span>}
          {p.linkedin && <span>• {p.linkedin}</span>}
          {p.github && <span>• {p.github}</span>}
          {p.website && <span>• {p.website}</span>}
        </div>
      </header>

      {/* Main Body */}
      <div className="space-y-6">
        {/* Summary Card */}
        {cv.summary && (
          <section className="break-inside-avoid">
            <h2 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: theme }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme }} />
              Professional Overview
            </h2>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-[11px] text-slate-700 leading-relaxed text-justify">
              {cv.summary}
            </div>
          </section>
        )}

        {/* Skills Cards & Chips */}
        {cv.skills.length > 0 && (
          <section className="break-inside-avoid">
            <h2 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: theme }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme }} />
              Core Competencies & Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {cv.skills.map((cat) => (
                <div key={cat.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-800 mb-1.5">
                    {cat.category}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cat.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ backgroundColor: `${theme}15`, color: theme }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience Section */}
        {cv.experiences.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: theme }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme }} />
              Experience & Career History
            </h2>
            <div className="space-y-4">
              {cv.experiences.map((exp) => (
                <div key={exp.id} className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs break-inside-avoid">
                  <div className="flex justify-between items-baseline flex-wrap gap-1">
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {exp.jobTitle}
                      </span>
                      <span className="text-slate-400 mx-1.5">|</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {exp.employer}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>

                  {exp.location && (
                    <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{exp.location}</div>
                  )}

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
                      {exp.highlights
                        .filter((h) => h.trim().length > 0)
                        .map((h, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-snug">
                            <span className="font-bold text-xs shrink-0" style={{ color: theme }}>›</span>
                            <span>{h}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Credentials */}
        {cv.educations.length > 0 && (
          <section className="break-inside-avoid">
            <h2 className="text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: theme }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme }} />
              Education & Academic Background
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cv.educations.map((edu) => (
                <div key={edu.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-xs text-slate-900">
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                    {edu.school}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>{edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}</span>
                    {edu.grade && <span className="font-bold text-slate-700">{edu.grade}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Languages Bottom Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cv.certifications && cv.certifications.length > 0 && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs break-inside-avoid">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-100 pb-1">
                Certifications
              </h3>
              <div className="space-y-1.5">
                {cv.certifications.map((c) => (
                  <div key={c.id} className="text-[10px]">
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <span className="text-slate-400 ml-1">({c.issuer})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cv.languages && cv.languages.length > 0 && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs break-inside-avoid">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-100 pb-1">
                Languages
              </h3>
              <div className="flex flex-wrap gap-2 text-[10px]">
                {cv.languages.map((l) => (
                  <span key={l.id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                    {l.language}: <strong className="text-slate-900">{l.proficiency}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
