import React from 'react';
import { CVData } from '../types/cv';

interface Props {
  cv: CVData;
}

export const LondonCorporateTemplate: React.FC<Props> = ({ cv }) => {
  const p = cv.personalDetails;
  const theme = cv.themeColor || '#1e3a8a';

  return (
    <div className="w-full bg-white text-slate-800 font-sans">
      {/* UK Corporate Banner */}
      <div className="p-8 text-white" style={{ backgroundColor: theme }}>
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide uppercase">
              {p.fullName || 'Candidate Name'}
            </h1>
            <p className="text-base text-slate-200 font-medium tracking-wider mt-0.5">
              {p.jobTitle || 'Executive Professional'}
            </p>
          </div>
          {cv.showPhoto && p.photoUrl && (
            <img
              src={p.photoUrl}
              alt={p.fullName}
              className="w-20 h-20 rounded-sm object-cover border-2 border-white shadow"
            />
          )}
        </div>

        {/* Contact Badges */}
        <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-100">
          {p.email && <span>Email: {p.email}</span>}
          {p.phone && <span>Tel: {p.phone}</span>}
          {p.location && <span>Location: {p.location}</span>}
          {p.linkedin && <span>LinkedIn: {p.linkedin}</span>}
          {p.website && <span>Web: {p.website}</span>}
          {p.github && <span>GitHub: {p.github}</span>}
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Executive Summary */}
        {cv.summary && (
          <section className="break-inside-avoid">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b-2"
              style={{ color: theme, borderColor: theme }}
            >
              Executive Summary
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              {cv.summary}
            </p>
          </section>
        )}

        {/* Professional Experience */}
        {cv.experiences.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-3 border-b-2"
              style={{ color: theme, borderColor: theme }}
            >
              Employment History
            </h2>
            <div className="space-y-4">
              {cv.experiences.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-900">
                      {exp.jobTitle}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-600 mb-1">
                    {exp.employer} {exp.location ? `· ${exp.location}` : ''}
                  </div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700">
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

        {/* Education & Qualifications */}
        {cv.educations.length > 0 && (
          <section className="break-inside-avoid">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b-2"
              style={{ color: theme, borderColor: theme }}
            >
              Education & Professional Qualifications
            </h2>
            <div className="space-y-2.5">
              {cv.educations.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-900">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {edu.school} {edu.location ? `· ${edu.location}` : ''}
                  </div>
                  {edu.grade && (
                    <div className="text-[11px] text-slate-500 italic">Classification: {edu.grade}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Competencies & Skills */}
        {cv.skills.length > 0 && (
          <section className="break-inside-avoid">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b-2"
              style={{ color: theme, borderColor: theme }}
            >
              Key Competencies & Technical Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {cv.skills.map((sg) => (
                <div key={sg.id} className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">{sg.category}</div>
                  <div className="text-slate-600 leading-normal">{sg.items.join(', ')}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects / Certifications / Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cv.certifications && cv.certifications.length > 0 && (
            <div className="break-inside-avoid">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 mb-1.5 border-b-2"
                style={{ color: theme, borderColor: theme }}
              >
                Accreditations
              </h2>
              <ul className="space-y-1 text-xs text-slate-700">
                {cv.certifications.map((c) => (
                  <li key={c.id}>
                    <strong>{c.name}</strong> – {c.issuer} ({c.issueDate})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cv.languages && cv.languages.length > 0 && (
            <div className="break-inside-avoid">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 mb-1.5 border-b-2"
                style={{ color: theme, borderColor: theme }}
              >
                Languages
              </h2>
              <div className="text-xs text-slate-700 space-y-1">
                {cv.languages.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span>{l.language}</span>
                    <span className="font-semibold text-slate-500">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
