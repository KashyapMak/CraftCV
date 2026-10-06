import React from 'react';
import { CVData } from '../types/cv';
import { getSectionTitle } from '../utils/sectionTitles';
import { getOrderedSections } from '../utils/sectionOrder';

interface Props {
  cv: CVData;
}

export const NordicContrastTemplate: React.FC<Props> = ({ cv }) => {
  const theme = cv.themeColor || '#2d3748'; // Midnight Slate
  const fullName = cv.personalDetails.fullName || 'Isabel Mercado';
  const jobTitle = cv.personalDetails.jobTitle || 'Marketing Manager';

  const sidebarSections = getOrderedSections(cv, ['skills', 'languages', 'certifications']);
  const mainSections = getOrderedSections(cv, ['experience', 'projects', 'education', 'customSections']);

  const renderSkills = () => {
    if (!cv.skills || cv.skills.length === 0) return null;
    return (
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/90 border-b border-white/10 pb-1">
          {getSectionTitle(cv, 'skills', 'Expertise')}
        </h2>
        <div className="space-y-2">
          {cv.skills.map((cat) => (
            <div key={cat.id}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1">
                {cat.category}
              </div>
              <ul className="space-y-1 text-[11px] text-white/80">
                {cat.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLanguages = () => {
    if (!cv.languages || cv.languages.length === 0) return null;
    return (
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/90 border-b border-white/10 pb-1">
          {getSectionTitle(cv, 'languages', 'Language')}
        </h2>
        <div className="space-y-1 text-[11px] text-white/80">
          {cv.languages.map((l) => (
            <div key={l.id} className="flex justify-between items-center">
              <span>{l.language}</span>
              <span className="text-[10px] text-white/60">{l.proficiency}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    if (!cv.certifications || cv.certifications.length === 0) return null;
    return (
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/90 border-b border-white/10 pb-1">
          {getSectionTitle(cv, 'certifications', 'Awards & Certifications')}
        </h2>
        <div className="space-y-2 text-[11px] text-white/80">
          {cv.certifications.map((c) => (
            <div key={c.id}>
              <div className="font-semibold text-white">{c.name}</div>
              <div className="text-[10px] text-white/60">{c.issuer} · {c.issueDate}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    if (!cv.experiences || cv.experiences.length === 0) return null;
    return (
      <section className="break-inside-avoid border-t border-slate-200 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
          {getSectionTitle(cv, 'experience', 'Experience')}
        </h2>
        <div className="space-y-5">
          {cv.experiences.map((exp) => (
            <div key={exp.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
              {/* Left sub-col: Dates and Company */}
              <div className="sm:col-span-4 text-slate-500 text-[11px]">
                <div className="font-semibold text-slate-800">
                  {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                </div>
                <div className="text-slate-500">{exp.employer}</div>
                {exp.location && <div className="text-[10px] text-slate-400">{exp.location}</div>}
              </div>
              {/* Right sub-col: Title and Highlights */}
              <div className="sm:col-span-8">
                <div className="font-bold text-slate-900 text-xs">
                  {exp.jobTitle}
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="mt-1 space-y-1 text-[11px] text-slate-600 list-disc list-outside ml-4">
                    {exp.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!cv.projects || cv.projects.length === 0) return null;
    return (
      <section className="break-inside-avoid border-t border-slate-200 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
          {getSectionTitle(cv, 'projects', 'Key Projects')}
        </h2>
        <div className="space-y-4">
          {cv.projects.map((proj) => (
            <div key={proj.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
              <div className="sm:col-span-4 text-slate-500 text-[11px]">
                {proj.startDate && (
                  <div className="font-semibold text-slate-800">
                    {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ''}
                  </div>
                )}
                {proj.link && (
                  <div className="text-indigo-600 truncate">{proj.link}</div>
                )}
              </div>
              <div className="sm:col-span-8">
                <div className="font-bold text-slate-900 text-xs">
                  {proj.title}
                </div>
                {proj.subtitle && (
                  <div className="text-slate-500 italic text-[11px] mb-1">{proj.subtitle}</div>
                )}
                {proj.description && (
                  <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line mb-1">
                    {proj.description}
                  </p>
                )}
                {proj.highlights && proj.highlights.length > 0 && (
                  <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-outside ml-4">
                    {proj.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderEducation = () => {
    if (!cv.educations || cv.educations.length === 0) return null;
    return (
      <section className="break-inside-avoid border-t border-slate-200 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
          {getSectionTitle(cv, 'education', 'Education')}
        </h2>
        <div className="space-y-4">
          {cv.educations.map((edu) => (
            <div key={edu.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
              <div className="sm:col-span-4 text-[11px]">
                <div className="font-semibold text-slate-800">
                  {edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}
                </div>
                <div className="text-slate-500">{edu.school}</div>
              </div>
              <div className="sm:col-span-8">
                <div className="font-bold text-slate-900 text-xs">
                  {edu.degree}
                </div>
                {edu.grade && <div className="text-[11px] text-slate-500">{edu.grade}</div>}
              </div>
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
          <section key={sec.id} className="break-inside-avoid border-t border-slate-200 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
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
    <div className="w-full bg-white text-slate-800 min-h-full flex flex-col md:flex-row">
      {/* Full-Height Deep Slate Sidebar (~32%) */}
      <div
        className="w-full md:w-[32%] text-white p-7 sm:p-8 space-y-6 shrink-0"
        style={{ backgroundColor: theme }}
      >
        {/* Profile Avatar */}
        {cv.showPhoto && cv.personalDetails.photoUrl ? (
          <div className="flex justify-center">
            <img
              src={cv.personalDetails.photoUrl}
              alt={fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white/20 shadow-md"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center text-xl font-bold uppercase tracking-widest mx-auto">
            {fullName.slice(0, 2)}
          </div>
        )}

        {/* Contact */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/90 border-b border-white/10 pb-1">
            Contact
          </h2>
          <div className="space-y-2 text-[11px] text-white/80">
            {cv.personalDetails.phone && (
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-white/60 font-semibold">Phone</span>
                <span>{cv.personalDetails.phone}</span>
              </div>
            )}
            {cv.personalDetails.email && (
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-white/60 font-semibold">Email</span>
                <span className="break-all">{cv.personalDetails.email}</span>
              </div>
            )}
            {cv.personalDetails.location && (
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-white/60 font-semibold">Location</span>
                <span>{cv.personalDetails.location}</span>
              </div>
            )}
            {cv.personalDetails.linkedin && (
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-white/60 font-semibold">LinkedIn</span>
                <span className="break-all">{cv.personalDetails.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </div>
            )}
            {cv.personalDetails.website && (
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-white/60 font-semibold">Website</span>
                <span className="break-all">{cv.personalDetails.website.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ordered Sidebar Sections */}
        {sidebarSections.map((key) => (
          <React.Fragment key={key}>
            {key === 'skills' && renderSkills()}
            {key === 'languages' && renderLanguages()}
            {key === 'certifications' && renderCertifications()}
          </React.Fragment>
        ))}
      </div>

      {/* Right Content Area (~68%) */}
      <div className="flex-1 p-7 sm:p-10 space-y-6">
        {/* Name & Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {fullName}
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
            {jobTitle}
          </p>
        </div>

        {/* Summary (if present) */}
        {cv.summary && (
          <div className="pt-2 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
            {cv.summary}
          </div>
        )}

        {/* Ordered Main Content Sections */}
        {mainSections.map((key) => (
          <React.Fragment key={key}>
            {key === 'experience' && renderExperience()}
            {key === 'projects' && renderProjects()}
            {key === 'education' && renderEducation()}
            {key === 'customSections' && renderCustomSections()}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
