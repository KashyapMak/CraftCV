import React from 'react';
import { CVData } from '../types/cv';
import { getSectionTitle } from '../utils/sectionTitles';
import { getOrderedSections } from '../utils/sectionOrder';
import { Phone, Globe, Mail, MapPin } from 'lucide-react';

interface Props {
  cv: CVData;
}

export const SandstoneExecutiveTemplate: React.FC<Props> = ({ cv }) => {
  const theme = cv.themeColor || '#c4ad94';
  const fullName = cv.personalDetails.fullName || 'Richard Sanchez';
  const jobTitle = cv.personalDetails.jobTitle || 'Accounting Executive';

  const leftSections = getOrderedSections(cv, ['experience', 'projects', 'customSections']);
  const rightSections = getOrderedSections(cv, ['education', 'skills', 'certifications', 'languages']);

  const renderExperience = () => {
    if (!cv.experiences || cv.experiences.length === 0) return null;
    return (
      <section className="break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
          {getSectionTitle(cv, 'experience', 'Experience')}
        </h2>
        <div className="space-y-4">
          {cv.experiences.map((exp) => (
            <div key={exp.id} className="text-xs">
              <div className="flex justify-between items-baseline flex-wrap gap-1 font-bold text-slate-900">
                <span>{exp.jobTitle}</span>
                <span className="font-normal text-slate-500 text-[11px]">
                  {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                </span>
              </div>
              <div className="text-slate-600 font-medium text-[11px] mb-1">
                {exp.employer} {exp.location ? `| ${exp.location}` : ''}
              </div>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 text-[11px] leading-relaxed">
                  {exp.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
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
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
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
      </section>
    );
  };

  const renderCustomSections = () => {
    if (!cv.customSections || cv.customSections.length === 0) return null;
    return (
      <div className="space-y-4">
        {cv.customSections.map((sec) => (
          <section key={sec.id} className="break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
              {sec.sectionTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sec.items.map((item) => (
                <div key={item.id} className="text-xs">
                  <div className="font-bold text-slate-900">{item.title}</div>
                  {item.subtitle && <div className="text-slate-600 text-[11px]">{item.subtitle}</div>}
                  <div className="text-slate-600 text-[11px] mt-0.5 whitespace-pre-line">{item.description}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  const renderEducation = () => {
    if (!cv.educations || cv.educations.length === 0) return null;
    return (
      <section className="break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
          {getSectionTitle(cv, 'education', 'Education')}
        </h2>
        <div className="space-y-3">
          {cv.educations.map((edu) => (
            <div key={edu.id} className="text-xs">
              <div className="font-bold text-slate-900">{edu.degree}</div>
              <div className="text-slate-600 text-[11px]">{edu.school}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}</div>
              <div className="text-slate-500 text-[11px]">
                {edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}
                {edu.grade ? ` · ${edu.grade}` : ''}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (!cv.skills || cv.skills.length === 0) return null;
    return (
      <section className="break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
          {getSectionTitle(cv, 'skills', 'Skills')}
        </h2>
        <div className="space-y-2">
          {cv.skills.map((cat) => (
            <div key={cat.id}>
              <div className="text-[11px] font-bold text-slate-800 mb-1">{cat.category}</div>
              <ul className="space-y-1">
                {cat.items.map((item, i) => (
                  <li key={i} className="text-[11px] text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: theme }} />
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

  const renderCertifications = () => {
    if (!cv.certifications || cv.certifications.length === 0) return null;
    return (
      <section className="break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
          {getSectionTitle(cv, 'certifications', 'Certifications')}
        </h2>
        <div className="space-y-2">
          {cv.certifications.map((c) => (
            <div key={c.id} className="text-[11px]">
              <div className="font-bold text-slate-900">{c.name}</div>
              <div className="text-slate-500">{c.issuer} · {c.issueDate}</div>
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
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
          {getSectionTitle(cv, 'languages', 'Language')}
        </h2>
        <ul className="space-y-1 text-[11px] text-slate-700">
          {cv.languages.map((l) => (
            <li key={l.id} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: theme }} />
              <span>{l.language} ({l.proficiency})</span>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div className="w-full bg-white text-slate-800 relative flex flex-col justify-between min-h-full">
      <div className="p-8 sm:p-10 space-y-6">
        {/* Top Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex-1 space-y-3">
            {/* Decorative Warm Sand Accent Block */}
            <div
              className="w-14 h-14 rounded-xs shadow-xs"
              style={{ backgroundColor: theme }}
            />

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900 leading-tight">
                {fullName}
              </h1>
              <p className="text-xs sm:text-sm font-semibold tracking-widest text-slate-600 uppercase mt-0.5">
                {jobTitle}
              </p>
            </div>

            {/* Thin Divider */}
            <div className="w-full h-px bg-slate-200 my-2" />

            {/* 4-Item Contact Grid with Circular Badge Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-slate-600">
              {cv.personalDetails.phone && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: theme }}
                  >
                    <Phone className="w-2.5 h-2.5" />
                  </div>
                  <span>{cv.personalDetails.phone}</span>
                </div>
              )}
              {cv.personalDetails.website && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: theme }}
                  >
                    <Globe className="w-2.5 h-2.5" />
                  </div>
                  <span className="truncate">{cv.personalDetails.website}</span>
                </div>
              )}
              {cv.personalDetails.email && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: theme }}
                  >
                    <Mail className="w-2.5 h-2.5" />
                  </div>
                  <span className="truncate">{cv.personalDetails.email}</span>
                </div>
              )}
              {cv.personalDetails.location && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: theme }}
                  >
                    <MapPin className="w-2.5 h-2.5" />
                  </div>
                  <span>{cv.personalDetails.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Top-Right Portrait Photo */}
          {cv.showPhoto && cv.personalDetails.photoUrl && (
            <div className="shrink-0">
              <img
                src={cv.personalDetails.photoUrl}
                alt={fullName}
                className="w-32 h-40 sm:w-36 sm:h-44 object-cover rounded-xs border border-slate-200 shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Dual-Column Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
          {/* Left Column (Wider ~ 60%): Ordered Experience, Projects, References */}
          <div className="md:col-span-7 space-y-6">
            {leftSections.map((key) => (
              <React.Fragment key={key}>
                {key === 'experience' && renderExperience()}
                {key === 'projects' && renderProjects()}
                {key === 'customSections' && renderCustomSections()}
              </React.Fragment>
            ))}
          </div>

          {/* Right Column (~ 40%): Summary, Ordered Education, Skills, Languages, Certifications */}
          <div className="md:col-span-5 space-y-6">
            {/* Summary */}
            {cv.summary && (
              <section className="break-inside-avoid">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  {getSectionTitle(cv, 'summary', 'Summary')}
                </h2>
                <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
                  {cv.summary}
                </p>
              </section>
            )}

            {rightSections.map((key) => (
              <React.Fragment key={key}>
                {key === 'education' && renderEducation()}
                {key === 'skills' && renderSkills()}
                {key === 'certifications' && renderCertifications()}
                {key === 'languages' && renderLanguages()}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Solid Bottom Sandstone Accent Strip */}
      <div
        className="w-full h-5 mt-6"
        style={{ backgroundColor: theme }}
      />
    </div>
  );
};
