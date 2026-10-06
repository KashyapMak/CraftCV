import React from 'react';
import { CVData } from '../types/cv';
import { getSectionTitle } from '../utils/sectionTitles';
import { getOrderedSections } from '../utils/sectionOrder';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, Briefcase, GraduationCap, FolderPlus } from 'lucide-react';

interface Props {
  cv: CVData;
}

/**
 * Edinburgh Timeline Template
 * Features an unbroken vertical timeline rail with node bullets connecting work experience & education.
 */
export const EdinburghTimelineTemplate: React.FC<Props> = ({ cv }) => {
  const p = cv.personalDetails;
  const theme = cv.themeColor || '#1e293b';

  const leftSections = getOrderedSections(cv, ['skills', 'certifications', 'languages', 'customSections']);
  const rightSections = getOrderedSections(cv, ['experience', 'education', 'projects']);

  const renderSkills = () => {
    if (!cv.skills || cv.skills.length === 0) return null;
    return (
      <section className="break-inside-avoid">
        <h2
          className="text-xs font-black uppercase tracking-wider pb-1 mb-2 border-b"
          style={{ color: theme, borderColor: theme }}
        >
          {getSectionTitle(cv, 'skills', 'Key Competencies')}
        </h2>
        <div className="space-y-3">
          {cv.skills.map((cat) => (
            <div key={cat.id}>
              <div className="text-[11px] font-bold text-slate-800 mb-1">
                {cat.category}
              </div>
              <div className="flex flex-wrap gap-1">
                {cat.items.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
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
        <h2
          className="text-xs font-black uppercase tracking-wider pb-1 mb-2 border-b flex items-center gap-1.5"
          style={{ color: theme, borderColor: theme }}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{getSectionTitle(cv, 'certifications', 'Certifications')}</span>
        </h2>
        <div className="space-y-2">
          {cv.certifications.map((cert) => (
            <div key={cert.id} className="text-[11px]">
              <div className="font-bold text-slate-900">{cert.name}</div>
              <div className="text-slate-500 text-[10px]">
                {cert.issuer} {cert.issueDate ? `· ${cert.issueDate}` : ''}
              </div>
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
        <h2
          className="text-xs font-black uppercase tracking-wider pb-1 mb-2 border-b"
          style={{ color: theme, borderColor: theme }}
        >
          {getSectionTitle(cv, 'languages', 'Languages')}
        </h2>
        <div className="space-y-1">
          {cv.languages.map((l) => (
            <div key={l.id} className="flex justify-between items-center text-[11px]">
              <span className="font-semibold text-slate-700">{l.language}</span>
              <span className="text-slate-400 text-[10px]">{l.proficiency}</span>
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
              className="text-xs font-black uppercase tracking-wider pb-1 mb-2 border-b flex items-center gap-1.5"
              style={{ color: theme, borderColor: theme }}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{sec.sectionTitle}</span>
            </h2>
            <div className="space-y-2.5">
              {sec.items.map((item) => (
                <div key={item.id} className="text-[11px]">
                  <div className="font-bold text-slate-800">{item.title}</div>
                  {item.subtitle && <div className="text-slate-500 text-[10px] italic">{item.subtitle}</div>}
                  {item.date && <div className="text-slate-400 text-[10px]">{item.date}</div>}
                  {item.description && <p className="text-slate-600 text-[10px] mt-0.5">{item.description}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  const renderExperience = () => {
    if (!cv.experiences || cv.experiences.length === 0) return null;
    return (
      <section>
        <h2
          className="text-xs font-black uppercase tracking-wider pb-1 mb-4 border-b flex items-center gap-1.5"
          style={{ color: theme, borderColor: theme }}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>{getSectionTitle(cv, 'experience', 'Work History & Timeline')}</span>
        </h2>

        <div className="relative pl-5 border-l-2 space-y-5" style={{ borderColor: `${theme}40` }}>
          {cv.experiences.map((exp) => (
            <div key={exp.id} className="relative break-inside-avoid group">
              {/* Timeline Node Bullet */}
              <div
                className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2"
                style={{ borderColor: theme }}
              />

              <div>
                <div className="flex justify-between items-baseline flex-wrap gap-1">
                  <span className="font-bold text-slate-900 text-xs">
                    {exp.jobTitle}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.2 rounded">
                    {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mb-1">
                  {exp.employer} {exp.location ? `· ${exp.location}` : ''}
                </div>

                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="mt-1.5 space-y-1 text-[11px] text-slate-700">
                    {exp.highlights
                      .filter((h) => h.trim().length > 0)
                      .map((h, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-slate-400 mt-0.5 shrink-0">•</span>
                          <span>{h}</span>
                        </li>
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
      <section className="break-inside-avoid">
        <h2
          className="text-xs font-black uppercase tracking-wider pb-1 mb-4 border-b flex items-center gap-1.5"
          style={{ color: theme, borderColor: theme }}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{getSectionTitle(cv, 'education', 'Education & Qualifications')}</span>
        </h2>

        <div className="relative pl-5 border-l-2 space-y-4" style={{ borderColor: `${theme}40` }}>
          {cv.educations.map((edu) => (
            <div key={edu.id} className="relative">
              <div
                className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2"
                style={{ borderColor: theme }}
              />
              <div>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-xs">
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  {edu.school} {edu.location ? `· ${edu.location}` : ''}
                </div>
                {edu.grade && (
                  <div className="text-[10px] font-semibold text-indigo-700 mt-0.5">
                    Grade / Honors: {edu.grade}
                  </div>
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
      <section className="break-inside-avoid">
        <h2
          className="text-xs font-black uppercase tracking-wider pb-1 mb-3 border-b"
          style={{ color: theme, borderColor: theme }}
        >
          {getSectionTitle(cv, 'projects', 'Notable Key Projects')}
        </h2>
        <div className="space-y-3">
          {cv.projects.map((proj) => (
            <div key={proj.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-[11px]">{proj.title}</span>
                {proj.subtitle && <span className="text-[10px] text-slate-500">{proj.subtitle}</span>}
              </div>
              {proj.link && <div className="text-indigo-600 text-[10px] font-medium mt-0.5">{proj.link}</div>}
              {proj.description && (
                <p className="mt-1 text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
                  {proj.description}
                </p>
              )}
              {proj.highlights && proj.highlights.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-[10px] text-slate-600">
                  {proj.highlights.map((h, i) => (
                    <li key={i}>• {h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="w-full bg-white text-slate-800 p-8 sm:p-9 font-sans text-xs leading-relaxed select-text">
      {/* Top Header Card */}
      <header className="pb-5 mb-6 border-b-2" style={{ borderColor: theme }}>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
              {p.fullName || 'Candidate Name'}
            </h1>
            <p className="text-sm font-bold tracking-wide uppercase" style={{ color: theme }}>
              {p.jobTitle || 'Professional Role Title'}
            </p>
          </div>

          {cv.showPhoto && p.photoUrl && (
            <img
              src={p.photoUrl}
              alt={p.fullName}
              className="w-18 h-18 rounded-xl object-cover border-2 shadow-xs shrink-0"
              style={{ borderColor: theme }}
            />
          )}
        </div>

        {/* Contact Badges Row */}
        <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-600 font-medium">
          {p.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{p.email}</span>
            </div>
          )}
          {p.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{p.phone}</span>
            </div>
          )}
          {p.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{p.location}</span>
            </div>
          )}
          {p.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin className="w-3 h-3 text-slate-400" />
              <span>{p.linkedin}</span>
            </div>
          )}
          {p.github && (
            <div className="flex items-center gap-1">
              <Github className="w-3 h-3 text-slate-400" />
              <span>{p.github}</span>
            </div>
          )}
          {p.website && (
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{p.website}</span>
            </div>
          )}
        </div>
      </header>

      {/* Two Column Layout: Left Details Rail & Right Main Timeline */}
      <div className="grid grid-cols-12 gap-7">
        {/* Left Sidebar (Core Skills, Certifications, Languages, Custom Sections) */}
        <div className="col-span-4 space-y-6">
          {/* Professional Summary */}
          {cv.summary && (
            <section className="break-inside-avoid">
              <h2
                className="text-xs font-black uppercase tracking-wider pb-1 mb-2 border-b"
                style={{ color: theme, borderColor: theme }}
              >
                {getSectionTitle(cv, 'summary', 'Executive Profile')}
              </h2>
              <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
                {cv.summary}
              </p>
            </section>
          )}

          {leftSections.map((key) => (
            <React.Fragment key={key}>
              {key === 'skills' && renderSkills()}
              {key === 'certifications' && renderCertifications()}
              {key === 'languages' && renderLanguages()}
              {key === 'customSections' && renderCustomSections()}
            </React.Fragment>
          ))}
        </div>

        {/* Right Main Rail: Vertical Timeline for Experience & Education */}
        <div className="col-span-8 space-y-6">
          {rightSections.map((key) => (
            <React.Fragment key={key}>
              {key === 'experience' && renderExperience()}
              {key === 'education' && renderEducation()}
              {key === 'projects' && renderProjects()}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
