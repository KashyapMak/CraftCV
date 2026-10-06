import React from 'react';
import { CVData } from '../types/cv';
import { getSectionTitle } from '../utils/sectionTitles';
import { getOrderedSections } from '../utils/sectionOrder';

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

  const leftSections = getOrderedSections(cv, ['skills', 'education', 'certifications', 'languages']);
  const rightSections = getOrderedSections(cv, ['experience', 'projects', 'customSections']);

  const renderSkills = () => {
    if (!cv.skills || cv.skills.length === 0) return null;
    return (
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
    );
  };

  const renderEducation = () => {
    if (!cv.educations || cv.educations.length === 0) return null;
    return (
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
              <div className="font-extrabold text-slate-950 text-sm">
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
    );
  };

  const renderCertifications = () => {
    if (!cv.certifications || cv.certifications.length === 0) return null;
    return (
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
    );
  };

  const renderLanguages = () => {
    if (!cv.languages || cv.languages.length === 0) return null;
    return (
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
    );
  };

  const renderExperience = () => {
    if (!cv.experiences || cv.experiences.length === 0) return null;
    return (
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
    );
  };

  const renderProjects = () => {
    if (!cv.projects || cv.projects.length === 0) return null;
    return (
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
    );
  };

  const renderCustomSections = () => {
    if (!cv.customSections || cv.customSections.length === 0) return null;
    return (
      <div className="space-y-4">
        {cv.customSections.map((sec) => (
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
    );
  };

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
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-950">
              {jobTitle}
            </span>
          </div>

          {/* Pipe-Delimited Single-Line Contact Strip */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1 text-[11px] font-medium text-slate-600 pt-1">
            {contactParts.map((part, index) => (
              <React.Fragment key={index}>
                <span>{part}</span>
                {index < contactParts.length - 1 && (
                  <span className="text-slate-300">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      {cv.summary && (
        <div className="border-t border-slate-200 pt-4">
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed text-justify">
            {cv.summary}
          </p>
        </div>
      )}

      {/* Body: 2 Columns (Left ~35%, Right ~65%) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
        {/* Left Column: Ordered Skills, Education Timeline, Certifications, Languages */}
        <div className="md:col-span-4 space-y-6">
          {leftSections.map((key) => (
            <React.Fragment key={key}>
              {key === 'skills' && renderSkills()}
              {key === 'education' && renderEducation()}
              {key === 'certifications' && renderCertifications()}
              {key === 'languages' && renderLanguages()}
            </React.Fragment>
          ))}
        </div>

        {/* Right Column: Ordered Experience, Projects, Custom Sections */}
        <div className="md:col-span-8 space-y-6">
          {rightSections.map((key) => (
            <React.Fragment key={key}>
              {key === 'experience' && renderExperience()}
              {key === 'projects' && renderProjects()}
              {key === 'customSections' && renderCustomSections()}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
