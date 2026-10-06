import React from 'react';
import { CVData, CVSectionKey } from '../types/cv';
import { getSectionTitle } from '../utils/sectionTitles';
import { getOrderedSections } from '../utils/sectionOrder';

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
  const orderedSections = getOrderedSections(cv);

  // Get initials for monogram
  const initials = (p.fullName || 'CV')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const renderSection = (key: CVSectionKey) => {
    switch (key) {
      case 'skills':
        if (!cv.skills || cv.skills.length === 0) return null;
        return (
          <section className="break-inside-avoid">
            <h2 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: theme }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme }} />
              {getSectionTitle(cv, 'skills', 'Core Competencies & Tools')}
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
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
        );

      case 'experience':
        if (!cv.experiences || cv.experiences.length === 0) return null;
        return (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: theme }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme }} />
              {getSectionTitle(cv, 'experience', 'Experience & Career History')}
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
        );

      case 'education':
        if (!cv.educations || cv.educations.length === 0) return null;
        return (
          <section className="break-inside-avoid">
            <h2 className="text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: theme }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme }} />
              {getSectionTitle(cv, 'education', 'Education & Academic Honors')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cv.educations.map((edu) => (
                <div key={edu.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <div className="font-bold text-xs text-slate-900">{edu.degree}</div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    {edu.fieldOfStudy ? `${edu.fieldOfStudy} · ` : ''}{edu.school}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}
                  </div>
                  {edu.grade && (
                    <div className="text-[10px] font-semibold mt-1" style={{ color: theme }}>
                      Classification: {edu.grade}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'projects':
        if (!cv.projects || cv.projects.length === 0) return null;
        return (
          <section className="break-inside-avoid">
            <h2 className="text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: theme }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme }} />
              {getSectionTitle(cv, 'projects', 'Featured Projects & Open Source')}
            </h2>
            <div className="space-y-3">
              {cv.projects.map((proj) => (
                <div key={proj.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                    <span>{proj.title}</span>
                    {proj.startDate && (
                      <span className="font-normal text-slate-500 text-[10px]">
                        {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ''}
                      </span>
                    )}
                  </div>
                  {proj.subtitle && <div className="text-[11px] text-slate-600 font-medium">{proj.subtitle}</div>}
                  {proj.link && <div className="text-[10px] text-indigo-600 font-medium">{proj.link}</div>}
                  {proj.description && (
                    <p className="mt-1 text-[11px] text-slate-700 leading-relaxed whitespace-pre-line">
                      {proj.description}
                    </p>
                  )}
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-600">
                      {proj.highlights.map((h, i) => (
                        <li key={i}>• {h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (!cv.certifications || cv.certifications.length === 0) return null;
        return (
          <section className="break-inside-avoid">
            <h2 className="text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: theme }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme }} />
              {getSectionTitle(cv, 'certifications', 'Certifications')}
            </h2>
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="space-y-1.5">
                {cv.certifications.map((c) => (
                  <div key={c.id} className="text-[10px]">
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <span className="text-slate-400 ml-1">({c.issuer})</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'languages':
        if (!cv.languages || cv.languages.length === 0) return null;
        return (
          <section className="break-inside-avoid">
            <h2 className="text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: theme }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme }} />
              {getSectionTitle(cv, 'languages', 'Languages')}
            </h2>
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap gap-2 text-[10px]">
                {cv.languages.map((l) => (
                  <span key={l.id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                    {l.language}: <strong className="text-slate-900">{l.proficiency}</strong>
                  </span>
                ))}
              </div>
            </div>
          </section>
        );

      case 'customSections':
        if (!cv.customSections || cv.customSections.length === 0) return null;
        return (
          <div className="space-y-4">
            {cv.customSections.map((sec) => (
              <section key={sec.id} className="break-inside-avoid">
                <h2 className="text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: theme }}>
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme }} />
                  {sec.sectionTitle}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sec.items.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                        <span>{item.title}</span>
                        {item.date && <span className="font-normal text-slate-500 text-[10px]">{item.date}</span>}
                      </div>
                      {item.subtitle && <div className="text-[11px] text-slate-600 italic mt-0.5">{item.subtitle}</div>}
                      {item.description && <p className="mt-1 text-[11px] text-slate-700 leading-relaxed">{item.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

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
              {getSectionTitle(cv, 'summary', 'Professional Overview')}
            </h2>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-[11px] text-slate-700 leading-relaxed text-justify">
              {cv.summary}
            </div>
          </section>
        )}

        {/* Dynamically Ordered CV Sections */}
        {orderedSections.map((key) => (
          <React.Fragment key={key}>
            {renderSection(key)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
