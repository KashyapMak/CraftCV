import React from 'react';
import { CVData } from '../types/cv';
import { Sparkles } from 'lucide-react';
import { getSectionTitle } from '../utils/sectionTitles';
import { getOrderedSections } from '../utils/sectionOrder';

interface Props {
  cv: CVData;
}

export const BotanicalTerracottaTemplate: React.FC<Props> = ({ cv }) => {
  const theme = cv.themeColor || '#a35638'; // Terracotta
  const fullName = cv.personalDetails.fullName || 'Olivia Wilson';
  const jobTitle = cv.personalDetails.jobTitle || 'Consultant Pharmacist';

  const sidebarSections = getOrderedSections(cv, ['skills', 'education', 'languages', 'certifications']);
  const mainSections = getOrderedSections(cv, ['experience', 'projects', 'customSections']);

  const renderSkills = () => {
    if (!cv.skills || cv.skills.length === 0) return null;
    return (
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-1 mb-2 border-b border-stone-300">
          {getSectionTitle(cv, 'skills', 'Core Skills')}
        </h2>
        <div className="space-y-2">
          {cv.skills.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <div className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">
                {cat.category}
              </div>
              <ul className="space-y-1">
                {cat.items.map((item, i) => (
                  <li key={i} className="text-[11px] text-stone-800">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (!cv.educations || cv.educations.length === 0) return null;
    return (
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-1 mb-2 border-b border-stone-300">
          {getSectionTitle(cv, 'education', 'Education')}
        </h2>
        <div className="space-y-3">
          {cv.educations.map((edu) => (
            <div key={edu.id} className="text-[11px]">
              <div className="font-bold text-stone-900">{edu.school}</div>
              <div className="text-stone-700">{edu.degree}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}</div>
              <div className="font-semibold text-[10px] mt-0.5" style={{ color: theme }}>
                {edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}
              </div>
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
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-1 mb-2 border-b border-stone-300">
          {getSectionTitle(cv, 'languages', 'Languages')}
        </h2>
        <div className="space-y-1 text-[11px] text-stone-800">
          {cv.languages.map((l) => (
            <div key={l.id}>
              {l.language} ({l.proficiency})
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
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-1 mb-2 border-b border-stone-300">
          {getSectionTitle(cv, 'certifications', 'Certifications')}
        </h2>
        <div className="space-y-2 text-[11px]">
          {cv.certifications.map((c) => (
            <div key={c.id}>
              <div className="font-semibold text-stone-900">{c.name}</div>
              <div className="text-stone-600">{c.issuer}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    if (!cv.experiences || cv.experiences.length === 0) return null;
    return (
      <section className="break-inside-avoid">
        <h2
          className="text-xs font-serif font-bold uppercase tracking-wider mb-4"
          style={{ color: theme }}
        >
          {getSectionTitle(cv, 'experience', 'Career Timeline')}
        </h2>

        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-stone-300">
          {cv.experiences.map((exp) => (
            <div key={exp.id} className="relative">
              {/* Node Bullet */}
              <span
                className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#faf8f5]"
                style={{ backgroundColor: theme }}
              />
              <div className="flex justify-between items-baseline font-bold text-stone-900 text-xs">
                <span>{exp.jobTitle}</span>
                <span className="font-normal text-stone-500 text-[10px] tracking-wide uppercase">
                  {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                </span>
              </div>
              <div className="text-[11px] font-medium italic mt-0.5" style={{ color: theme }}>
                {exp.employer} {exp.location ? `· ${exp.location}` : ''}
              </div>

              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="mt-2 space-y-1 text-[11px] text-stone-700 leading-relaxed list-disc list-outside ml-4">
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
        <h2
          className="text-xs font-serif font-bold uppercase tracking-wider mb-4"
          style={{ color: theme }}
        >
          {getSectionTitle(cv, 'projects', 'Key Projects & Initiatives')}
        </h2>

        <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-stone-300">
          {cv.projects.map((proj) => (
            <div key={proj.id} className="relative">
              <span
                className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#faf8f5]"
                style={{ backgroundColor: theme }}
              />
              <div className="flex justify-between items-baseline font-bold text-stone-900 text-xs">
                <span>{proj.title}</span>
                {proj.startDate && (
                  <span className="font-normal text-stone-500 text-[10px] tracking-wide uppercase">
                    {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ''}
                  </span>
                )}
              </div>
              {proj.subtitle && (
                <div className="text-stone-500 italic text-[11px]">{proj.subtitle}</div>
              )}
              {proj.link && (
                <div className="text-indigo-600 font-medium text-[11px]">{proj.link}</div>
              )}
              {proj.description && (
                <p className="mt-1 text-stone-700 leading-relaxed text-[11px] whitespace-pre-line">
                  {proj.description}
                </p>
              )}
              {proj.highlights && proj.highlights.length > 0 && (
                <ul className="mt-1 space-y-1 text-[11px] text-stone-700 list-disc list-outside ml-4">
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
            <h2
              className="text-xs font-serif font-bold uppercase tracking-wider mb-2"
              style={{ color: theme }}
            >
              {sec.sectionTitle}
            </h2>
            <div className="space-y-3">
              {sec.items.map((item) => (
                <div key={item.id} className="text-[11px]">
                  <div className="font-bold text-stone-900">{item.title}</div>
                  {item.subtitle && <div className="text-stone-500">{item.subtitle}</div>}
                  <div className="text-stone-600 mt-0.5 whitespace-pre-line">{item.description}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#faf8f5] text-stone-800 min-h-full">
      {/* Top Header */}
      <div className="px-8 sm:px-10 pt-8 sm:pt-10 pb-6 flex justify-between items-start">
        <div>
          <h1
            className="text-3xl sm:text-4xl font-serif tracking-tight leading-tight"
            style={{ color: theme }}
          >
            {fullName}
          </h1>
          <p className="text-xs font-semibold tracking-widest text-stone-600 uppercase mt-1">
            {jobTitle}
          </p>
        </div>

        {/* Top-Right Emblem / Photo */}
        {cv.showPhoto && cv.personalDetails.photoUrl ? (
          <img
            src={cv.personalDetails.photoUrl}
            alt={fullName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 p-0.5 shadow-xs"
            style={{ borderColor: theme }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#e1e9e2] flex items-center justify-center text-[#4a6350] shadow-xs">
            <Sparkles className="w-5 h-5 text-[#52795d]" />
          </div>
        )}
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 pb-10">
        {/* Left Column (~33%): Sage Pill Sidebar with Curved Bottom-Right Corner */}
        <div className="md:col-span-4 bg-[#e8eee8] rounded-br-[42px] p-6 sm:p-7 space-y-6 text-stone-800">
          {/* Contact */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-1 mb-2 border-b border-stone-300">
              Contact
            </h2>
            <div className="space-y-1.5 text-[11px] text-stone-700">
              {cv.personalDetails.phone && <div>{cv.personalDetails.phone}</div>}
              {cv.personalDetails.email && <div className="truncate">{cv.personalDetails.email}</div>}
              {cv.personalDetails.location && <div>{cv.personalDetails.location}</div>}
              {cv.personalDetails.website && (
                <div className="truncate">{cv.personalDetails.website.replace(/^https?:\/\//, '')}</div>
              )}
              {cv.personalDetails.linkedin && (
                <div className="truncate">{cv.personalDetails.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</div>
              )}
            </div>
          </div>

          {/* Ordered Sidebar Sections */}
          {sidebarSections.map((key) => (
            <React.Fragment key={key}>
              {key === 'skills' && renderSkills()}
              {key === 'education' && renderEducation()}
              {key === 'languages' && renderLanguages()}
              {key === 'certifications' && renderCertifications()}
            </React.Fragment>
          ))}
        </div>

        {/* Right Column (~67%): Professional Overview & Career Timeline */}
        <div className="md:col-span-8 px-6 sm:px-8 pt-2 space-y-6">
          {/* Summary / Professional Overview */}
          {cv.summary && (
            <section className="break-inside-avoid">
              <h2
                className="text-xs font-serif font-bold uppercase tracking-wider mb-2"
                style={{ color: theme }}
              >
                {getSectionTitle(cv, 'summary', 'Professional Overview')}
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-700 leading-relaxed">
                {cv.summary}
              </p>
            </section>
          )}

          {/* Ordered Right Column Sections */}
          {mainSections.map((key) => (
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
