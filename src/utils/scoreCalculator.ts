import { CVData, ATSCheckItem } from '../types/cv';

export interface ScoreBreakdown {
  score: number;
  rating: 'Needs Work' | 'Good' | 'Strong' | 'All-Star';
  color: string;
  badgeBg: string;
  badgeBorder: string;
  checks: ATSCheckItem[];
}

export const calculateProfileScore = (cv: CVData): ScoreBreakdown => {
  const checks: ATSCheckItem[] = [];
  let earned = 0;

  // 1. Personal & Contact (20 pts)
  const hasName = Boolean(cv.personalDetails.fullName?.trim());
  const hasRole = Boolean(cv.personalDetails.jobTitle?.trim());
  const hasEmail = Boolean(cv.personalDetails.email?.includes('@'));
  const hasPhone = Boolean(cv.personalDetails.phone?.trim() && cv.personalDetails.phone.trim().length >= 6);
  const hasLocation = Boolean(cv.personalDetails.location?.trim());

  const personalPassed = hasName && hasRole && hasEmail && hasPhone && hasLocation;
  if (personalPassed) {
    earned += 20;
  } else if (hasName && (hasEmail || hasPhone)) {
    earned += 10;
  }

  checks.push({
    label: 'Contact Info & Target Title',
    passed: personalPassed,
    score: 20,
    tip: personalPassed
      ? 'Full name, job title, email, phone, and location are complete.'
      : 'Include your full name, job title, email, phone number, and city/country.'
  });

  // 2. Professional Summary (15 pts)
  const summaryWords = cv.summary ? cv.summary.trim().split(/\s+/).filter(Boolean).length : 0;
  const summaryPassed = summaryWords >= 30;
  if (summaryPassed) {
    earned += 15;
  } else if (summaryWords > 0) {
    earned += 7;
  }

  checks.push({
    label: 'Professional Summary (> 30 words)',
    passed: summaryPassed,
    score: 15,
    tip: summaryPassed
      ? `Strong executive summary (${summaryWords} words).`
      : 'Craft a 30-75 word summary capturing your main value proposition.'
  });

  // 3. Work Experience (25 pts)
  const expCount = cv.experiences?.length || 0;
  const totalBullets = (cv.experiences || []).reduce(
    (sum, e) => sum + (e.highlights?.filter((h) => h.trim().length > 0).length || 0),
    0
  );
  const hasMetrics = (cv.experiences || []).some((e) =>
    e.highlights?.some((h) => /\d+|%|\$|£|€/.test(h))
  );

  const expPassed = expCount >= 1 && totalBullets >= 3 && hasMetrics;
  if (expPassed) {
    earned += 25;
  } else if (expCount >= 1 && totalBullets >= 1) {
    earned += 15;
  }

  checks.push({
    label: 'Experience with Measurable Metrics (%, numbers)',
    passed: expPassed,
    score: 25,
    tip: expPassed
      ? 'Great work experience highlights with quantifiable results.'
      : 'Add at least 1 role with measurable results (e.g. "+35% revenue", "cut time by 40%").'
  });

  // 4. Skills & Keywords (15 pts)
  const totalSkills = (cv.skills || []).reduce((sum, s) => sum + (s.items?.length || 0), 0);
  const skillsPassed = totalSkills >= 5;
  if (skillsPassed) {
    earned += 15;
  } else if (totalSkills > 0) {
    earned += 8;
  }

  checks.push({
    label: 'Core Skills (5+ skills listed)',
    passed: skillsPassed,
    score: 15,
    tip: skillsPassed
      ? `${totalSkills} skills indexed for recruiter search.`
      : 'List at least 5 industry keywords or hard skills.'
  });

  // 5. Education (15 pts)
  const eduPassed = (cv.educations?.length || 0) >= 1 && Boolean(cv.educations[0].degree?.trim());
  if (eduPassed) {
    earned += 15;
  }

  checks.push({
    label: 'Education & Qualifications',
    passed: eduPassed,
    score: 15,
    tip: eduPassed
      ? 'Education credential documented.'
      : 'Add your highest degree, diploma, or relevant qualification.'
  });

  // 6. Bonus Extras: Projects, Certifications or Languages (10 pts)
  const hasExtras =
    (cv.projects?.length || 0) > 0 ||
    (cv.certifications?.length || 0) > 0 ||
    (cv.languages?.length || 0) > 0 ||
    Boolean(cv.personalDetails.linkedin || cv.personalDetails.github || cv.personalDetails.website);

  if (hasExtras) {
    earned += 10;
  }

  checks.push({
    label: 'Bonus Links / Certs / Projects',
    passed: hasExtras,
    score: 10,
    tip: hasExtras
      ? 'Portfolio, LinkedIn, certifications, or languages included.'
      : 'Add LinkedIn, a portfolio link, certification, or language for top standing.'
  });

  const finalScore = Math.min(100, earned);

  let rating: ScoreBreakdown['rating'] = 'Needs Work';
  let color = 'text-rose-600';
  let badgeBg = 'bg-rose-50';
  let badgeBorder = 'border-rose-200';

  if (finalScore >= 85) {
    rating = 'All-Star';
    color = 'text-emerald-600';
    badgeBg = 'bg-emerald-50';
    badgeBorder = 'border-emerald-200';
  } else if (finalScore >= 70) {
    rating = 'Strong';
    color = 'text-blue-600';
    badgeBg = 'bg-blue-50';
    badgeBorder = 'border-blue-200';
  } else if (finalScore >= 50) {
    rating = 'Good';
    color = 'text-amber-600';
    badgeBg = 'bg-amber-50';
    badgeBorder = 'border-amber-200';
  }

  return {
    score: finalScore,
    rating,
    color,
    badgeBg,
    badgeBorder,
    checks
  };
};
