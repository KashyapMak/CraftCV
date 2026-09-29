import React from 'react';
import { CVData } from '../types/cv';

interface Props {
  cv: CVData;
}

export const AcademicClassicTemplate: React.FC<Props> = ({ cv }) => {
  const p = cv.personalDetails;
  const theme = cv.themeColor || '#1c1917';

  return (
    <div className="w-full bg-white text-stone-900 p-9 sm:p-12 leading-relaxed" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
      {/* Centered Academic Header */}
      <header className="text-center pb-4 mb-6 border-b border-stone-400">
        <h1 className="text-3xl sm:text-4xl tracking-wide uppercase font-serif text-stone-900">
          {p.fullName || 'Candidate Name'}
        </h1>
        <p className="text-base text-stone-700 italic mt-1 font-serif">
          {p.jobTitle || 'Curriculum Vitae'}
        </p>

        {/* Contact links centered */}
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-stone-600 font-sans">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>· {p.phone}</span>}
          {p.location && <span>· {p.location}</span>}
          {p.linkedin && <span>· {p.linkedin}</span>}
          {p.website && <span>· {p.website}</span>}
        </div>
      </header>

      {/* Summary */}
      {cv.summary && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-0.5 mb-2 font-serif">
            Profile & Research Statement
          </h2>
          <p className="text-sm text-stone-800 leading-relaxed text-justify">
            {cv.summary}
          </p>
        </section>
      )}

      {/* Education */}
      {cv.educations.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-0.5 mb-3 font-serif">
            Education
          </h2>
          <div className="space-y-3">
            {cv.educations.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-sm text-stone-950 font-serif">
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                  </span>
                  <span className="text-xs text-stone-600 font-sans">
                    {edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}
                  </span>
                </div>
                <div className="text-xs text-stone-700 italic">
                  {edu.school}, {edu.location}
                </div>
                {edu.grade && <div className="text-xs text-stone-600 font-sans">Honours / Grade: {edu.grade}</div>}
                {edu.details && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-xs text-stone-700">
                    {edu.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Professional & Academic Experience */}
      {cv.experiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-0.5 mb-3 font-serif">
            Appointments & Experience
          </h2>
          <div className="space-y-4">
            {cv.experiences.map((exp) => (
              <div key={exp.id} className="break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-sm text-stone-950 font-serif">
                    {exp.jobTitle}
                  </span>
                  <span className="text-xs text-stone-600 font-sans">
                    {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-xs text-stone-700 italic mb-1">
                  {exp.employer}, {exp.location}
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-stone-800 leading-normal">
                    {exp.highlights
                      .filter((h) => h.trim().length > 0)
                      .map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Publications / Projects */}
      {cv.projects && cv.projects.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-0.5 mb-3 font-serif">
            Publications, Projects & Grants
          </h2>
          <div className="space-y-2.5">
            {cv.projects.map((proj) => (
              <div key={proj.id} className="text-xs">
                <div className="flex justify-between font-bold text-stone-900 font-serif">
                  <span>{proj.title}</span>
                  {proj.startDate && <span className="font-sans font-normal text-stone-500">{proj.startDate}</span>}
                </div>
                {proj.subtitle && <div className="italic text-stone-600">{proj.subtitle}</div>}
                {proj.highlights && (
                  <ul className="list-disc list-outside ml-4 mt-1 text-stone-700 space-y-0.5">
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

      {/* Skills & Competencies */}
      {cv.skills.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-0.5 mb-2 font-serif">
            Areas of Expertise
          </h2>
          <div className="space-y-1 text-xs text-stone-800">
            {cv.skills.map((s) => (
              <div key={s.id}>
                <span className="font-bold text-stone-900 font-serif">{s.category}: </span>
                <span>{s.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages & Certifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {cv.languages && cv.languages.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-0.5 mb-1.5 font-serif">
              Languages
            </h2>
            <div className="space-y-0.5 text-stone-700">
              {cv.languages.map((l) => (
                <div key={l.id}>
                  {l.language} — <span className="italic">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cv.certifications && cv.certifications.length > 0 && (
          <div className="break-inside-avoid">
            <h2 className="text-sm font-bold uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-0.5 mb-1.5 font-serif">
              Affiliations & Certifications
            </h2>
            <ul className="space-y-0.5 text-stone-700">
              {cv.certifications.map((c) => (
                <li key={c.id}>
                  {c.name}, {c.issuer} ({c.issueDate})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
