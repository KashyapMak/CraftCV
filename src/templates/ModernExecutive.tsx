import React from 'react';
import { CVData } from '../types/cv';
import { getSectionTitle } from '../utils/sectionTitles';
import { getOrderedSections } from '../utils/sectionOrder';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface Props {
  cv: CVData;
}

export const ModernExecutiveTemplate: React.FC<Props> = ({ cv }) => {
  const p = cv.personalDetails;
  const theme = cv.themeColor || '#2563eb';

  const mainSections = getOrderedSections(cv, ['experience', 'education', 'projects']);
  const sidebarSections = getOrderedSections(cv, ['skills', 'certifications', 'languages', 'customSections']);

  const renderExperience = () => {
    if (!cv.experiences || cv.experiences.length === 0) return null;
    return (
      <section>
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b"
          style={{ color: theme, borderColor: '#e2e8f0' }}
        >
          {getSectionTitle(cv, 'experience', 'Work Experience')}
        </h2>
        <div className="space-y-4">
          {cv.experiences.map((exp) => (
            <div key={exp.id} className="break-inside-avoid">
              <div className="flex justify-between items-baseline flex-wrap gap-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {exp.jobTitle || 'Role Title'}
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate || 'Present'}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-600 mb-1.5">
                {exp.employer} {exp.location ? `· ${exp.location}` : ''}
              </div>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700">
                  {exp.highlights
                    .filter((h) => h.trim().length > 0)
                    .map((h, idx) => (
                      <li key={idx} className="leading-snug">
                        {h}
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

  const renderEducation = () => {
    if (!cv.educations || cv.educations.length === 0) return null;
    return (
      <section className="break-inside-avoid">
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b"
          style={{ color: theme, borderColor: '#e2e8f0' }}
        >
          {getSectionTitle(cv, 'education', 'Education')}
        </h2>
        <div className="space-y-3">
          {cv.educations.map((edu) => (
            <div key={edu.id}>
              <div className="flex justify-between items-baseline flex-wrap gap-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {edu.startDate} – {edu.isCurrent ? 'Present' : edu.endDate}
                </span>
              </div>
              <div className="text-xs text-slate-600 font-medium">
                {edu.school} {edu.location ? `· ${edu.location}` : ''}
              </div>
              {edu.grade && (
                <div className="text-xs text-slate-500 italic mt-0.5">
                  Grade: {edu.grade}
                </div>
              )}
              {edu.details && edu.details.length > 0 && (
                <ul className="list-disc list-outside ml-4 space-y-0.5 mt-1 text-xs text-slate-600">
                  {edu.details.map((d, idx) => (
                    <li key={idx}>{d}</li>
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
          className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b"
          style={{ color: theme, borderColor: '#e2e8f0' }}
        >
          {getSectionTitle(cv, 'projects', 'Key Projects')}
        </h2>
        <div className="space-y-3">
          {cv.projects.map((proj) => (
            <div key={proj.id}>
              <div className="flex justify-between items-baseline flex-wrap gap-1">
                <span className="text-xs font-bold text-slate-900">
                  {proj.title}
                </span>
                {proj.startDate && (
                  <span className="text-[11px] text-slate-500">
                    {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ''}
                  </span>
                )}
              </div>
              {proj.subtitle && (
                <div className="text-xs text-slate-500 italic">{proj.subtitle}</div>
              )}
              {proj.link && (
                <div className="text-[11px] text-indigo-600 font-medium">{proj.link}</div>
              )}
              {proj.description && (
                <p className="mt-1 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {proj.description}
                </p>
              )}
              {proj.highlights && proj.highlights.length > 0 && (
                <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-xs text-slate-700">
                  {proj.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              )}
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
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b"
          style={{ color: theme, borderColor: '#e2e8f0' }}
        >
          {getSectionTitle(cv, 'skills', 'Key Skills')}
        </h2>
        <div className="space-y-3">
          {cv.skills.map((skillGroup) => (
            <div key={skillGroup.id}>
              <h3 className="text-xs font-semibold text-slate-700 mb-1">
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skillGroup.items.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200"
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
          className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b"
          style={{ color: theme, borderColor: '#e2e8f0' }}
        >
          {getSectionTitle(cv, 'certifications', 'Certifications')}
        </h2>
        <div className="space-y-2">
          {cv.certifications.map((cert) => (
            <div key={cert.id} className="text-xs">
              <div className="font-semibold text-slate-800">{cert.name}</div>
              <div className="text-slate-500">
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
          className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b"
          style={{ color: theme, borderColor: '#e2e8f0' }}
        >
          {getSectionTitle(cv, 'languages', 'Languages')}
        </h2>
        <div className="space-y-1.5">
          {cv.languages.map((l) => (
            <div key={l.id} className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-700">{l.language}</span>
              <span className="text-slate-500 font-semibold">{l.proficiency}</span>
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
              className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b"
              style={{ color: theme, borderColor: '#e2e8f0' }}
            >
              {sec.sectionTitle}
            </h2>
            <div className="space-y-2">
              {sec.items.map((item) => (
                <div key={item.id} className="text-xs">
                  <div className="font-semibold text-slate-800">{item.title}</div>
                  {item.subtitle && <div className="text-slate-500">{item.subtitle}</div>}
                  <div className="text-slate-600 mt-0.5">{item.description}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-white text-slate-800 p-8 leading-relaxed font-sans">
      {/* Header */}
      <header className="border-b-2 pb-6 mb-6" style={{ borderColor: theme }}>
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {p.fullName || 'Your Full Name'}
            </h1>
            <p className="text-lg font-semibold" style={{ color: theme }}>
              {p.jobTitle || 'Your Professional Title'}
            </p>
          </div>

          {cv.showPhoto && p.photoUrl && (
            <img
              src={p.photoUrl}
              alt={p.fullName}
              className="w-20 h-20 rounded-full object-cover border-2 shadow-sm"
              style={{ borderColor: theme }}
            />
          )}
        </div>

        {/* Contact info bar */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600 font-medium">
          {p.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" style={{ color: theme }} />
              <span>{p.email}</span>
            </div>
          )}
          {p.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" style={{ color: theme }} />
              <span>{p.phone}</span>
            </div>
          )}
          {p.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: theme }} />
              <span>{p.location}</span>
            </div>
          )}
          {p.linkedin && (
            <div className="flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5" style={{ color: theme }} />
              <span>{p.linkedin}</span>
            </div>
          )}
          {p.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" style={{ color: theme }} />
              <span>{p.website}</span>
            </div>
          )}
          {p.github && (
            <div className="flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5" style={{ color: theme }} />
              <span>{p.github}</span>
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {cv.summary && (
        <section className="mb-6 break-inside-avoid">
          <h2
            className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b flex items-center gap-2"
            style={{ color: theme, borderColor: '#e2e8f0' }}
          >
            <span>{getSectionTitle(cv, 'summary', 'Professional Summary')}</span>
          </h2>
          <p className="text-sm text-slate-700 leading-normal text-justify">
            {cv.summary}
          </p>
        </section>
      )}

      {/* Dual Column Layout - Fixed 3-column A4 grid preventing merge on print */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Column (2 spans): Ordered Experience, Education, Projects */}
        <div className="col-span-2 space-y-6">
          {mainSections.map((key) => (
            <React.Fragment key={key}>
              {key === 'experience' && renderExperience()}
              {key === 'education' && renderEducation()}
              {key === 'projects' && renderProjects()}
            </React.Fragment>
          ))}
        </div>

        {/* Sidebar Column (1 span): Ordered Skills, Certs, Languages, Custom */}
        <div className="col-span-1 space-y-5">
          {sidebarSections.map((key) => (
            <React.Fragment key={key}>
              {key === 'skills' && renderSkills()}
              {key === 'certifications' && renderCertifications()}
              {key === 'languages' && renderLanguages()}
              {key === 'customSections' && renderCustomSections()}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
