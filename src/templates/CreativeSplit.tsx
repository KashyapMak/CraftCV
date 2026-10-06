import React from 'react';
import { CVData } from '../types/cv';
import { getSectionTitle } from '../utils/sectionTitles';
import { getOrderedSections } from '../utils/sectionOrder';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface Props {
  cv: CVData;
}

export const CreativeSplitTemplate: React.FC<Props> = ({ cv }) => {
  const p = cv.personalDetails;
  const theme = cv.themeColor || '#4f46e5';

  const sidebarSections = getOrderedSections(cv, ['skills', 'certifications', 'languages']);
  const mainSections = getOrderedSections(cv, ['experience', 'education', 'projects', 'customSections']);

  const renderSkills = () => {
    if (!cv.skills || cv.skills.length === 0) return null;
    return (
      <div className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-white/60 border-b border-white/20 pb-1">
          {getSectionTitle(cv, 'skills', 'Expertise')}
        </div>
        {cv.skills.map((sg) => (
          <div key={sg.id} className="text-xs">
            <div className="font-semibold text-white/95 mb-1">{sg.category}</div>
            <div className="flex flex-wrap gap-1">
              {sg.items.map((item, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-black/20 text-white rounded text-[11px]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCertifications = () => {
    if (!cv.certifications || cv.certifications.length === 0) return null;
    return (
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-white/60 border-b border-white/20 pb-1 mb-2">
          {getSectionTitle(cv, 'certifications', 'Certifications')}
        </div>
        <div className="space-y-1.5 text-xs text-white/90">
          {cv.certifications.map((c) => (
            <div key={c.id}>
              <div className="font-bold text-white">{c.name}</div>
              <div className="text-[10px] text-white/70">{c.issuer} ({c.issueDate})</div>
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
        <div className="text-[11px] font-bold uppercase tracking-wider text-white/60 border-b border-white/20 pb-1 mb-2">
          {getSectionTitle(cv, 'languages', 'Languages')}
        </div>
        <div className="space-y-1 text-xs text-white/90">
          {cv.languages.map((l) => (
            <div key={l.id} className="flex justify-between">
              <span>{l.language}</span>
              <span className="text-white/70 text-[11px]">{l.proficiency}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    if (!cv.experiences || cv.experiences.length === 0) return null;
    return (
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          {getSectionTitle(cv, 'experience', 'Experience')}
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
              <div className="text-xs font-semibold text-indigo-600 mb-1">
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
    );
  };

  const renderEducation = () => {
    if (!cv.educations || cv.educations.length === 0) return null;
    return (
      <section className="break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          {getSectionTitle(cv, 'education', 'Education')}
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
              <div className="text-xs text-slate-600 font-medium">{edu.school}</div>
              {edu.grade && (
                <div className="text-[11px] text-slate-500 italic">Grade: {edu.grade}</div>
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
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          {getSectionTitle(cv, 'projects', 'Projects & Portfolios')}
        </h2>
        <div className="space-y-2.5">
          {cv.projects.map((proj) => (
            <div key={proj.id} className="text-xs">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{proj.title}</span>
                {proj.link && <span className="text-indigo-600 font-medium">{proj.link}</span>}
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
    );
  };

  const renderCustomSections = () => {
    if (!cv.customSections || cv.customSections.length === 0) return null;
    return (
      <div className="space-y-6">
        {cv.customSections.map((sec) => (
          <section key={sec.id} className="break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {sec.sectionTitle}
            </h2>
            <div className="space-y-2.5">
              {sec.items.map((item) => (
                <div key={item.id} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{item.title}</span>
                    {item.date && <span className="text-[11px] text-slate-500">{item.date}</span>}
                  </div>
                  {item.subtitle && <div className="text-slate-500 italic">{item.subtitle}</div>}
                  {item.description && (
                    <p className="mt-0.5 text-slate-700 leading-relaxed">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-white flex flex-row min-h-full font-sans">
      {/* Left Sidebar */}
      <div
        className="w-64 p-6 text-white shrink-0 flex flex-col justify-between"
        style={{ backgroundColor: theme }}
      >
        <div className="space-y-6">
          {/* Profile Photo */}
          {cv.showPhoto && p.photoUrl && (
            <div className="flex justify-center">
              <img
                src={p.photoUrl}
                alt={p.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-md"
              />
            </div>
          )}

          {/* Name & Title in sidebar */}
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tight leading-tight">
              {p.fullName || 'Candidate Name'}
            </h1>
            <p className="text-xs uppercase tracking-widest text-white/80 font-semibold mt-1">
              {p.jobTitle || 'Creative Specialist'}
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 text-xs text-white/90">
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2 border-b border-white/20 pb-1">
              Contact Info
            </div>
            {p.email && (
              <div className="flex items-center gap-2 break-all">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>{p.email}</span>
              </div>
            )}
            {p.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{p.phone}</span>
              </div>
            )}
            {p.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{p.location}</span>
              </div>
            )}
            {p.linkedin && (
              <div className="flex items-center gap-2 break-all">
                <Linkedin className="w-3.5 h-3.5 shrink-0" />
                <span>{p.linkedin}</span>
              </div>
            )}
            {p.website && (
              <div className="flex items-center gap-2 break-all">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span>{p.website}</span>
              </div>
            )}
            {p.github && (
              <div className="flex items-center gap-2 break-all">
                <Github className="w-3.5 h-3.5 shrink-0" />
                <span>{p.github}</span>
              </div>
            )}
          </div>

          {/* Ordered Sidebar Sections */}
          {sidebarSections.map((key) => (
            <React.Fragment key={key}>
              {key === 'skills' && renderSkills()}
              {key === 'certifications' && renderCertifications()}
              {key === 'languages' && renderLanguages()}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-7 space-y-6 text-slate-800">
        {/* Profile Summary */}
        {cv.summary && (
          <section className="break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {getSectionTitle(cv, 'summary', 'About Me')}
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              {cv.summary}
            </p>
          </section>
        )}

        {/* Ordered Main Content Sections */}
        {mainSections.map((key) => (
          <React.Fragment key={key}>
            {key === 'experience' && renderExperience()}
            {key === 'education' && renderEducation()}
            {key === 'projects' && renderProjects()}
            {key === 'customSections' && renderCustomSections()}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
