import React from 'react';
import { CVData } from '../types/cv';
import { ModernExecutiveTemplate } from './ModernExecutive';
import { MinimalistCleanTemplate } from './MinimalistClean';
import { LondonCorporateTemplate } from './LondonCorporate';
import { CreativeSplitTemplate } from './CreativeSplit';
import { TechCompactTemplate } from './TechCompact';
import { AcademicClassicTemplate } from './AcademicClassic';
import { EdinburghTimelineTemplate } from './EdinburghTimeline';
import { CambridgeAccentTemplate } from './CambridgeAccent';

interface Props {
  cv: CVData;
  containerId?: string;
  className?: string;
}

export const TemplateRenderer: React.FC<Props> = ({
  cv,
  containerId = 'cv-printable-document',
  className = ''
}) => {
  const getFontFamilyStyle = () => {
    switch (cv.fontFamily) {
      case 'jakarta':
        return "'Plus Jakarta Sans', sans-serif";
      case 'garamond':
        return "'EB Garamond', Georgia, serif";
      case 'cinzel':
        return "'Cinzel', serif";
      case 'mono':
        return "'Roboto Mono', monospace";
      case 'inter':
      default:
        return "'Inter', sans-serif";
    }
  };

  const getFontSizeClass = () => {
    switch (cv.fontSize) {
      case 'sm':
        return 'text-[13px]';
      case 'lg':
        return 'text-[15px]';
      case 'base':
      default:
        return 'text-[14px]';
    }
  };

  const getSpacingClass = () => {
    switch (cv.lineSpacing) {
      case 'compact':
        return 'leading-tight';
      case 'spacious':
        return 'leading-loose';
      case 'normal':
      default:
        return 'leading-normal';
    }
  };

  const renderSelectedTemplate = () => {
    switch (cv.templateId) {
      case 'edinburgh-timeline':
        return <EdinburghTimelineTemplate cv={cv} />;
      case 'cambridge-accent':
        return <CambridgeAccentTemplate cv={cv} />;
      case 'minimalist-clean':
        return <MinimalistCleanTemplate cv={cv} />;
      case 'london-corporate':
        return <LondonCorporateTemplate cv={cv} />;
      case 'creative-split':
        return <CreativeSplitTemplate cv={cv} />;
      case 'tech-compact':
        return <TechCompactTemplate cv={cv} />;
      case 'academic-classic':
        return <AcademicClassicTemplate cv={cv} />;
      case 'modern-executive':
      default:
        return <ModernExecutiveTemplate cv={cv} />;
    }
  };

  return (
    <div
      {...(containerId ? { id: containerId } : {})}
      className={`w-full bg-white select-text ${getFontSizeClass()} ${getSpacingClass()} ${className}`}
      style={{
        fontFamily: getFontFamilyStyle()
      }}
    >
      {renderSelectedTemplate()}
    </div>
  );
};
