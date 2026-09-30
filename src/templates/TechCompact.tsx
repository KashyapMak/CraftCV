import React from 'react';
import { CVData } from '../types/cv';
import { getSectionTitle } from '../utils/sectionTitles';
import { Terminal } from 'lucide-react';

interface Props {
  cv: CVData;
}

export const TechCompactTemplate: React.FC<Props> = ({ cv }) => {
  const p = cv.personalDetails;
  const theme = cv.themeColor || '#0284c7';

  return (
    <div className="w-full bg-white text-slate-800 p-7 sm:p-9 font-sans text-xs">
      {/* Terminal-inspired header */}
      <header className="border-b pb-4 mb-4" style={{ borderColor: theme }}>
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="w-4 h-4" style={{ color: theme }} />
          <h1 className="text-2xl font-black tracking-tight text-slate-900 font-mono">
            {p.fullName || 'dev@local'}
          </h1>
          <span className="text-slate-400">/</span>
          <span className="text-sm font-semibold" style={{ color: theme }}>
            {p.jobTitle || 'Full Stack Engineer'}
          </span>
        </div>

        {/* Links row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-slate-600 mt-2">
          {p.email && <span>mailto:{p.email}</span>}
          {p.phone && <span>tel:{p.phone}</span>}
          {p.location && <span>loc:{p.location}</span>}
          {p.github && <span className="font-semibold text-slate-900">{p.github}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.website && <span>{p.website}</span>}
        </div>
      </header>

      {/* Summary */}
      {cv.summary && (
        <section className="mb-4 break-inside-avoid">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: theme }}>
            // {getSectionTitle(cv, 'summary', 'Profile Summary')}
          </div>
          <p className="text-xs text-slate-700 leading-normal text-justify">
            {cv.summary}
          </p>
        </section>
      )}

      {/* Skills Matrix (At the top for tech resumes!) */}
      {cv.skills.length > 0 && (
        <section className="mb-4 bg-slate-50 p-3 rounded border border-slate-200 break-inside-avoid">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            // {getSectionTitle(cv, 'skills', 'Core Technical Stack')}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {cv.skills.map((s) => (
              <div key={s.id}>
                <span className="font-mono font-semibold text-slate-900">{s.category}: </span>
                <span className="text-slate-700">{s.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {cv.experiences.length > 0 && (
        <section className="mb-5">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider mb-2 pb-1 border-b" style={{ color: theme, borderColor: '#e2e8f0' }}>
            // {getSectionTitle(cv, 'experience', 'Work Experience')}
          </div>
          <div className="space-y-3.5">
            {cv.experiences.map((exp) => (
              <div key={exp.id} className="break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-xs">
                    {exp.jobTitle} <span className="text-slate-500 font-normal">@ {exp.employer}</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {exp.startDate} – {exp.isCurrent ? 'Current' : exp.endDate}
                  </span>
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-slate-700 text-[11.5px]">
                    {exp.highlights
                      .filter((h) => h.trim().length > 0)
                      .map((h, i) => (
                        <li key={i} className="leading-snug">{h}</li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {cv.projects && cv.projects.length > 0 && (
        <section className="mb-4 break-inside-avoid">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider mb-2 pb-1 border-b" style={{ color: theme, borderColor: '#e2e8f0' }}>
            // {getSectionTitle(cv, 'projects', 'Featured Projects & Open Source')}
          </div>
          <div className="space-y-2">
            {cv.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{proj.title}</span>
                  {proj.link && <span className="font-mono text-indigo-600 font-normal">{proj.link}</span>}
                </div>
                {proj.subtitle && <div className="text-slate-500 font-mono text-[11px]">{proj.subtitle}</div>}
                {proj.description && (
                  <p className="mt-0.5 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {proj.description}
                  </p>
                )}
                {proj.highlights && (
                  <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-slate-700">
                    {proj.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {cv.customSections && cv.customSections.map((sec) => (
        <section key={sec.id} className="mb-4 break-inside-avoid">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider mb-2 pb-1 border-b" style={{ color: theme, borderColor: '#e2e8f0' }}>
            // {sec.sectionTitle}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {sec.items.map((item) => (
              <div key={item.id} className="p-2 bg-slate-50 rounded border border-slate-200">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{item.title}</span>
                  {item.date && <span className="font-mono text-[10px] text-slate-500">{item.date}</span>}
                </div>
                {item.subtitle && <div className="text-[11px] text-slate-600 font-mono">{item.subtitle}</div>}
                {item.description && <p className="mt-1 text-slate-700">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Education & Certs */}
      <div className="grid grid-cols-2 gap-4">
        {cv.educations.length > 0 && (
          <div className="break-inside-avoid">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5 pb-1 border-b" style={{ color: theme, borderColor: '#e2e8f0' }}>
              // {getSectionTitle(cv, 'education', 'Education')}
            </div>
            {cv.educations.map((edu) => (
              <div key={edu.id} className="mb-1">
                <div className="font-bold text-slate-900">{edu.degree}</div>
                <div className="text-slate-600">{edu.school} ({edu.startDate} – {edu.endDate})</div>
              </div>
            ))}
          </div>
        )}

        {cv.certifications && cv.certifications.length > 0 && (
          <div className="break-inside-avoid">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5 pb-1 border-b" style={{ color: theme, borderColor: '#e2e8f0' }}>
              // {getSectionTitle(cv, 'certifications', 'Certifications')}
            </div>
            <ul className="space-y-0.5 text-slate-700">
              {cv.certifications.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong> - {c.issuer}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Languages */}
      {cv.languages && cv.languages.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-200 break-inside-avoid">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: theme }}>
            // {getSectionTitle(cv, 'languages', 'Languages')}
          </div>
          <div className="flex flex-wrap gap-3 font-mono text-[11px] text-slate-700">
            {cv.languages.map((l) => (
              <span key={l.id}>
                {l.language}: <strong>{l.proficiency}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
