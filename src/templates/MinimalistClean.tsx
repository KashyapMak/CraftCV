import React from 'react';
import { CVData } from '../types/cv';
import { getSectionTitle } from '../utils/sectionTitles';

interface Props {
  cv: CVData;
}

export const MinimalistCleanTemplate: React.FC<Props> = ({ cv }) => {
  const p = cv.personalDetails;
  const theme = cv.themeColor || '#0f172a';

  return (
    <div className="w-full bg-white text-slate-800 p-8 leading-normal font-sans">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 uppercase mb-1">
          {p.fullName || 'Your Full Name'}
        </h1>
        <p className="text-xs font-medium text-slate-600 tracking-wide uppercase mb-3">
          {p.jobTitle || 'Your Job Title'}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.location && <span>• {p.location}</span>}
          {p.linkedin && <span>• {p.linkedin}</span>}
          {p.website && <span>• {p.website}</span>}
          {p.github && <span>• {p.github}</span>}
        </div>
        <hr className="mt-4 border-slate-300" />
      </header>

      {/* Summary */}
      {cv.summary && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5" style={{ color: theme }}>
            {getSectionTitle(cv, 'summary', 'Professional Profile')}
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {cv.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {cv.experiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200" style={{ color: theme }}>
            {getSectionTitle(cv, 'experience', 'Experience')}
          </h2>
          <div className="space-y-4">
            {cv.experiences.map((exp) => (
              <div key={exp.id} className="break-inside-avoid">
                <div className="flex justify-between items-baseline flex-wrap">
                  <span className="text-xs font-bold text-slate-950">
                    {exp.jobTitle} — <span className="font-medium text-slate-700">{exp.employer}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate} {exp.location ? `| ${exp.location}` : ''}
                  </span>
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1 text-xs text-slate-700">
                    {exp.highlights
                      .filter((h) => h.trim().length > 0)
                      .map((h, idx) => (
                        <li key={idx} className="leading-snug">{h}</li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {cv.educations.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200" style={{ color: theme }}>
            {getSectionTitle(cv, 'education', 'Education')}
          </h2>
          <div className="space-y-3">
            {cv.educations.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline flex-wrap">
                  <span className="text-xs font-bold text-slate-950">
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''} — <span className="font-normal text-slate-700">{edu.school}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}
                  </span>
                </div>
                {edu.grade && (
                  <div className="text-[11px] text-slate-600 mt-0.5">Grade: {edu.grade}</div>
                )}
                {edu.details && edu.details.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-xs text-slate-600">
                    {edu.details.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {cv.skills.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200" style={{ color: theme }}>
            {getSectionTitle(cv, 'skills', 'Core Competencies & Technical Skills')}
          </h2>
          <div className="space-y-1 text-xs">
            {cv.skills.map((sg) => (
              <div key={sg.id} className="text-slate-700">
                <strong className="text-slate-900 font-semibold">{sg.category}:</strong>{' '}
                {sg.items.join(', ')}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {cv.projects && cv.projects.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200" style={{ color: theme }}>
            {getSectionTitle(cv, 'projects', 'Selected Projects')}
          </h2>
          <div className="space-y-2.5">
            {cv.projects.map((proj) => (
              <div key={proj.id} className="text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900">{proj.title}</span>
                  {proj.link && <span className="text-slate-500">{proj.link}</span>}
                </div>
                {proj.subtitle && <div className="text-slate-500 italic">{proj.subtitle}</div>}
                {proj.description && (
                  <p className="mt-1 text-slate-700 leading-relaxed whitespace-pre-line">
                    {proj.description}
                  </p>
                )}
                {proj.highlights && (
                  <ul className="list-disc list-outside ml-4 mt-1 text-slate-700 space-y-0.5">
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

      {/* Certifications & Languages */}
      <div className="grid grid-cols-2 gap-4">
        {cv.certifications && cv.certifications.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-1 border-b border-slate-200" style={{ color: theme }}>
              {getSectionTitle(cv, 'certifications', 'Certifications')}
            </h2>
            <ul className="space-y-1 text-xs text-slate-700">
              {cv.certifications.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong> — {c.issuer} ({c.issueDate})
                </li>
              ))}
            </ul>
          </div>
        )}

        {cv.languages && cv.languages.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-1 border-b border-slate-200" style={{ color: theme }}>
              {getSectionTitle(cv, 'languages', 'Languages')}
            </h2>
            <div className="text-xs text-slate-700">
              {cv.languages.map((l) => `${l.language} (${l.proficiency})`).join(' • ')}
            </div>
          </div>
        )}
      </div>

      {/* Custom Sections */}
      {cv.customSections && cv.customSections.length > 0 && (
        <div className="mt-6 space-y-4">
          {cv.customSections.map((cs) => (
            <section key={cs.id} className="break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200" style={{ color: theme }}>
                {cs.sectionTitle}
              </h2>
              <div className="space-y-2">
                {cs.items.map((item) => (
                  <div key={item.id} className="text-xs text-slate-700">
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>{item.title}</span>
                      {item.date && <span className="text-[11px] font-normal text-slate-500">{item.date}</span>}
                    </div>
                    {item.subtitle && <div className="text-[11px] text-slate-500 italic">{item.subtitle}</div>}
                    {item.description && <p className="mt-0.5 text-slate-600 leading-relaxed whitespace-pre-line">{item.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
