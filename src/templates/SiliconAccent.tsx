import React from 'react';
import { CVData } from '../types/cv';
import { getSectionTitle } from '../utils/sectionTitles';

interface Props {
  cv: CVData;
}

export const SiliconAccentTemplate: React.FC<Props> = ({ cv }) => {
  const theme = cv.themeColor || '#84cc16'; // Vibrant Lime / Cyber Accent
  const fullName = cv.personalDetails.fullName || 'Aman Sharma';
  const jobTitle = cv.personalDetails.jobTitle || 'Software Engineer';

  // Format single-line contact bar items with pipes
  const contactParts: string[] = [];
  if (cv.personalDetails.email) contactParts.push(`e: ${cv.personalDetails.email}`);
  if (cv.personalDetails.phone) contactParts.push(`p: ${cv.personalDetails.phone}`);
  if (cv.personalDetails.location) contactParts.push(cv.personalDetails.location);
  if (cv.personalDetails.website) contactParts.push(cv.personalDetails.website.replace(/^https?:\/\//, ''));
  if (cv.personalDetails.github) contactParts.push(`github: ${cv.personalDetails.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}`);

  return (
    <div className="w-full bg-white text-slate-800 p-8 sm:p-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Left Square Avatar */}
        {cv.showPhoto && cv.personalDetails.photoUrl ? (
          <img
            src={cv.personalDetails.photoUrl}
            alt={fullName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-md object-cover border border-slate-200 shrink-0 shadow-xs"
          />
        ) : (
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-md flex items-center justify-center text-2xl font-bold uppercase tracking-widest text-slate-900 border border-slate-200 shrink-0 bg-slate-50"
          >
            {fullName.slice(0, 2)}
          </div>
        )}

        <div className="flex-1 w-full text-center sm:text-left space-y-2">
          {/* Full Name */}
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-950">
            {fullName}
          </h1>

          {/* Solid Lime / Accent Bar with Job Title */}
          <div
            className="px-4 py-1 rounded-xs inline-block w-full text-left"
            style={{ backgroundColor: theme }}
          >
            <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-slate-950">
              {jobTitle}
            </span>
          </div>

          {/* Contact Bar with Pipes */}
          {contactParts.length > 0 && (
            <div className="text-[11px] font-medium text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1 justify-center sm:justify-start">
              {contactParts.map((item, idx) => (
                <React.Fragment key={idx}>
                  <span>{item}</span>
                  {idx < contactParts.length - 1 && <span className="text-slate-300">|</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary with Vertical Accent Callout Bar */}
      {cv.summary && (
        <div
          className="border-l-4 pl-3 py-1 text-xs text-slate-700 leading-relaxed break-inside-avoid"
          style={{ borderColor: theme }}
        >
          {cv.summary}
        </div>
      )}

      {/* Body: 2 Columns (Left ~35%, Right ~65%) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
        {/* Left Column: Skills, Education Timeline, Certifications, Languages */}
        <div className="md:col-span-4 space-y-6">
          {/* Skills */}
          {cv.skills && cv.skills.length > 0 && (
            <section className="break-inside-avoid">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                {getSectionTitle(cv, 'skills', 'Skills')}
              </h2>
              <div className="space-y-3">
                {cv.skills.map((cat) => (
                  <div key={cat.id}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1">
                      {cat.category}
                    </div>
                    <ul className="space-y-1">
                      {cat.items.map((item, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                          <span className="text-slate-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education with Accent Node Timeline */}
          {cv.educations && cv.educations.length > 0 && (
            <section className="break-inside-avoid">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                {getSectionTitle(cv, 'education', 'Education')}
              </h2>
              <div className="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
                {cv.educations.map((edu) => (
                  <div key={edu.id} className="relative text-[11px]">
                    {/* Accent Node Bullet */}
                    <span
                      className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white"
                      style={{ backgroundColor: theme }}
                    />
                    <div className="text-slate-500 font-medium">
                      {edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}
                    </div>
                    <div className="font-extrabold text-slate-900 uppercase">
                      {edu.degree}
                    </div>
                    <div className="text-slate-600">
                      {edu.school}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}
                    </div>
                    {edu.grade && <div className="text-slate-500">{edu.grade}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {cv.certifications && cv.certifications.length > 0 && (
            <section className="break-inside-avoid">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                {getSectionTitle(cv, 'certifications', 'Certifications')}
              </h2>
              <div className="space-y-2 text-[11px]">
                {cv.certifications.map((c) => (
                  <div key={c.id}>
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-slate-500">{c.issuer} | {c.issueDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {cv.languages && cv.languages.length > 0 && (
            <section className="break-inside-avoid">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                {getSectionTitle(cv, 'languages', 'Languages')}
              </h2>
              <ul className="space-y-1 text-[11px] text-slate-700">
                {cv.languages.map((l) => (
                  <li key={l.id} className="flex justify-between items-center">
                    <span>{l.language}</span>
                    <span className="text-slate-500">{l.proficiency}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right Column: Experience, Projects, Custom Sections */}
        <div className="md:col-span-8 space-y-6">
          {/* Experience */}
          {cv.experiences && cv.experiences.length > 0 && (
            <section className="break-inside-avoid">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
                {getSectionTitle(cv, 'experience', 'Experience')}
              </h2>
              <div className="space-y-5">
                {cv.experiences.map((exp) => (
                  <div key={exp.id} className="text-xs">
                    <div className="text-slate-500 text-[11px] font-medium">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </div>
                    <div className="font-extrabold text-slate-950 text-sm">
                      {exp.jobTitle}
                    </div>
                    <div className="text-slate-700 font-medium text-[11px] mb-1">
                      {exp.employer} {exp.location ? `| ${exp.location}` : ''}
                    </div>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="space-y-1 text-slate-700 text-[11px] leading-relaxed">
                        {exp.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-slate-400 mt-0.5">•</span>
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

          {/* Projects */}
          {cv.projects && cv.projects.length > 0 && (
            <section className="break-inside-avoid">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
                {getSectionTitle(cv, 'projects', 'Projects')}
              </h2>
              <div className="space-y-5">
                {cv.projects.map((proj) => (
                  <div key={proj.id} className="text-xs">
                    <div className="flex justify-between items-baseline font-extrabold text-slate-950">
                      <span>{proj.title}</span>
                      {proj.startDate && (
                        <span className="font-normal text-slate-500 text-[11px]">
                          {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ''}
                        </span>
                      )}
                    </div>
                    {proj.subtitle && (
                      <div className="text-slate-500 italic text-[11px]">{proj.subtitle}</div>
                    )}
                    {proj.link && (
                      <div className="text-indigo-600 font-medium text-[11px]">{proj.link}</div>
                    )}
                    {proj.description && (
                      <p className="mt-1 text-slate-700 leading-relaxed text-[11px] whitespace-pre-line">
                        {proj.description}
                      </p>
                    )}
                    {proj.highlights && proj.highlights.length > 0 && (
                      <ul className="space-y-1 mt-1 text-slate-700 text-[11px]">
                        {proj.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-slate-400 mt-0.5">•</span>
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

          {/* Custom Sections / References */}
          {cv.customSections && cv.customSections.map((sec) => (
            <section key={sec.id} className="break-inside-avoid">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                {sec.sectionTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {sec.items.map((item) => (
                  <div key={item.id} className="text-[11px]">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    {item.subtitle && <div className="text-slate-500">{item.subtitle}</div>}
                    <div className="text-slate-600 mt-0.5 whitespace-pre-line">{item.description}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
