import React from 'react';
import { CVData } from '../types/cv';
import { getSectionTitle } from '../utils/sectionTitles';
import { getOrderedSections } from '../utils/sectionOrder';

interface Props {
  cv: CVData;
}

export const GenevaGridTemplate: React.FC<Props> = ({ cv }) => {
  const theme = cv.themeColor || '#bfa37e';
  const fullName = cv.personalDetails.fullName || 'Emaa Warner';
  const jobTitle = cv.personalDetails.jobTitle || 'Accounting Executive';

  // Split name for two-tone typography (First name dark, Last name in accent color)
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : fullName;
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  const leftSections = getOrderedSections(cv, ['education', 'skills']);
  const rightSections = getOrderedSections(cv, ['experience', 'projects']);
  const bottomSections = getOrderedSections(cv, ['certifications', 'languages', 'customSections']);

  const renderEducation = () => {
    if (!cv.educations || cv.educations.length === 0) return null;
    return (
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
          {getSectionTitle(cv, 'education', 'Education')}
        </h2>
        <div className="space-y-3">
          {cv.educations.map((edu) => (
            <div key={edu.id} className="text-xs">
              <div className="font-bold text-slate-900">{edu.degree}</div>
              <div className="text-slate-600">{edu.school}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}</div>
              <div className="text-slate-500">
                {edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (!cv.skills || cv.skills.length === 0) return null;
    return (
      <div className="pt-4 border-t border-slate-200">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
          {getSectionTitle(cv, 'skills', 'Skills')}
        </h2>
        <div className="space-y-2">
          {cv.skills.map((cat) => (
            <div key={cat.id}>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {cat.category}
              </div>
              <ul className="space-y-1">
                {cat.items.map((item, i) => (
                  <li key={i} className="text-[11px] text-slate-700 flex items-center gap-1.5">
                    <span className="text-slate-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    if (!cv.experiences || cv.experiences.length === 0) return null;
    return (
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          {getSectionTitle(cv, 'experience', 'Work Experience')}
        </h2>
        <div className="space-y-4">
          {cv.experiences.map((exp) => (
            <div key={exp.id} className="text-xs">
              <div className="font-bold text-slate-900">
                {exp.jobTitle}, {exp.employer}
              </div>
              <div className="text-slate-500 text-[11px] mb-1">
                {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                {exp.location ? ` | ${exp.location}` : ''}
              </div>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="space-y-1 text-slate-700 text-[11px] leading-relaxed">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (!cv.projects || cv.projects.length === 0) return null;
    return (
      <div className="pt-4 border-t border-slate-200">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          {getSectionTitle(cv, 'projects', 'Key Projects')}
        </h2>
        <div className="space-y-4">
          {cv.projects.map((proj) => (
            <div key={proj.id} className="text-xs">
              <div className="flex justify-between items-baseline font-bold text-slate-900">
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
                <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-slate-700 text-[11px]">
                  {proj.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    if (!cv.certifications || cv.certifications.length === 0) return null;
    return (
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
          {getSectionTitle(cv, 'certifications', 'Certifications')}
        </h2>
        <div className="space-y-1.5 text-xs text-slate-700">
          {cv.certifications.map((c) => (
            <div key={c.id}>
              <span className="font-semibold">{c.name}</span> · {c.issuer} ({c.issueDate})
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLanguages = () => {
    if (!cv.languages || cv.languages.length === 0) return null;
    return (
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
          {getSectionTitle(cv, 'languages', 'Languages')}
        </h2>
        <div className="space-y-1 text-xs text-slate-700">
          {cv.languages.map((l) => (
            <div key={l.id} className="flex justify-between max-w-[200px]">
              <span>{l.language}</span>
              <span className="text-slate-500">{l.proficiency}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomSections = () => {
    if (!cv.customSections || cv.customSections.length === 0) return null;
    return (
      <div className="space-y-3">
        {cv.customSections.map((sec) => (
          <div key={sec.id}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              {sec.sectionTitle}
            </h2>
            <div className="space-y-2">
              {sec.items.map((item) => (
                <div key={item.id} className="text-xs">
                  <div className="font-bold text-slate-900">{item.title}</div>
                  {item.subtitle && <div className="text-slate-500 text-[11px]">{item.subtitle}</div>}
                  <div className="text-slate-600 text-[11px] mt-0.5">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-white text-slate-800 p-8 sm:p-10 space-y-6">
      {/* Top Header: Circular Avatar & Two-Tone Title */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-8 pb-4">
        {cv.showPhoto && cv.personalDetails.photoUrl ? (
          <div className="shrink-0 p-1.5 rounded-full border border-slate-300 shadow-xs">
            <img
              src={cv.personalDetails.photoUrl}
              alt={fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover grayscale"
            />
          </div>
        ) : (
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 flex items-center justify-center text-xl font-bold tracking-widest uppercase shrink-0"
            style={{ borderColor: theme, color: theme }}
          >
            {fullName.slice(0, 2)}
          </div>
        )}

        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900 leading-tight">
            <span>{firstName} </span>
            <span style={{ color: theme }}>{lastName}</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-slate-500 uppercase mt-0.5">
            {jobTitle}
          </p>
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="border-t-2 border-slate-900">
        {/* Row 1: Contact (Left) & Summary (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-200">
          <div className="md:col-span-4 p-4 md:pr-6 border-b md:border-b-0 md:border-r border-slate-200 space-y-2 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
              Contact
            </h2>
            {cv.personalDetails.phone && <div>{cv.personalDetails.phone}</div>}
            {cv.personalDetails.email && <div>{cv.personalDetails.email}</div>}
            {cv.personalDetails.location && <div>{cv.personalDetails.location}</div>}
            {cv.personalDetails.website && <div>{cv.personalDetails.website}</div>}
            {cv.personalDetails.linkedin && <div>{cv.personalDetails.linkedin}</div>}
          </div>

          <div className="md:col-span-8 p-4 md:pl-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              {getSectionTitle(cv, 'summary', 'Summary')}
            </h2>
            <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
              {cv.summary || 'Detail-oriented professional with extensive domain expertise, rigorous organizational standards, and high analytical precision.'}
            </p>
          </div>
        </div>

        {/* Row 2: Education & Skills (Left) | Experience & Projects (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-200">
          {/* Left Column: Ordered Education & Skills */}
          <div className="md:col-span-4 p-4 md:pr-6 border-b md:border-b-0 md:border-r border-slate-200 space-y-4">
            {leftSections.map((key) => (
              <React.Fragment key={key}>
                {key === 'education' && renderEducation()}
                {key === 'skills' && renderSkills()}
              </React.Fragment>
            ))}
          </div>

          {/* Right Column: Ordered Work Experience & Projects */}
          <div className="md:col-span-8 p-4 md:pl-6 space-y-5">
            {rightSections.map((key) => (
              <React.Fragment key={key}>
                {key === 'experience' && renderExperience()}
                {key === 'projects' && renderProjects()}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Row 3: Ordered Certifications, Languages, Custom Sections */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bottomSections.map((key) => (
              <React.Fragment key={key}>
                {key === 'certifications' && renderCertifications()}
                {key === 'languages' && renderLanguages()}
                {key === 'customSections' && renderCustomSections()}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
