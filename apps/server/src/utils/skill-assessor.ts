import { logger } from './logger.js';

export interface CodeContribution {
  developer: string;
  filePath: string;
  language: string;
  linesAdded: number;
  complexity: number;
  hasTests: boolean;
  date: Date;
}

export interface SkillAssessment {
  developer: string;
  skills: { name: string; level: number; confidence: number }[];
  overallScore: number;
  strengths: string[];
  growthAreas: string[];
}

export function assessDeveloperSkills(contributions: CodeContribution[]): SkillAssessment[] {
  const devMap = new Map<string, CodeContribution[]>();
  for (const contrib of contributions) {
    const existing = devMap.get(contrib.developer) ?? [];
    existing.push(contrib);
    devMap.set(contrib.developer, existing);
  }

  const results: SkillAssessment[] = [];

  for (const [developer, contribs] of devMap) {
    const langMap = new Map<string, number>();
    for (const c of contribs) {
      langMap.set(c.language, (langMap.get(c.language) ?? 0) + c.linesAdded);
    }

    const skills: SkillAssessment['skills'] = [];
    for (const [lang, lines] of langMap) {
      const level = Math.min(5, Math.round(Math.log2(lines / 100 + 1)) + 1);
      const confidence = Math.min(100, Math.round((contribs.filter(c => c.language === lang).length / 5) * 100));
      skills.push({ name: lang, level, confidence });
    }

    const avgComplexity = contribs.reduce((s, c) => s + c.complexity, 0) / contribs.length;
    const testRatio = contribs.filter(c => c.hasTests).length / contribs.length;

    if (avgComplexity > 15) skills.push({ name: 'complex-systems', level: Math.min(5, Math.round(avgComplexity / 10)), confidence: 70 });
    if (testRatio > 0.5) skills.push({ name: 'testing', level: Math.min(5, Math.round(testRatio * 5)), confidence: 80 });

    skills.sort((a, b) => b.level - a.level);
    const strengths = skills.filter(s => s.level >= 4).map(s => s.name);
    const growthAreas = skills.filter(s => s.level <= 2).map(s => s.name);
    const overallScore = Math.round(skills.reduce((s, sk) => s + sk.level, 0) / Math.max(skills.length, 1) * 20);

    results.push({ developer, skills, overallScore, strengths, growthAreas });
  }

  logger.info({ developers: results.length }, 'Skill assessment complete');
  return results;
}
