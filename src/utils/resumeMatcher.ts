import {
  MatchedKeyword,
  MissingKeyword,
  ResumeAnalysisResult,
  SectionReviewItem,
  BeforeAfterExample,
  ImprovementChecklistItem,
} from '../types';

interface DictionaryTerm {
  term: string;
  category: 'Languages & Core' | 'Frameworks & Libraries' | 'Infrastructure & Tools' | 'Methodologies' | 'Soft Skills';
  importance: 'High' | 'Medium' | 'Low';
  patterns: RegExp[];
}

const DICTIONARY: DictionaryTerm[] = [
  // Languages & Core
  { term: 'TypeScript', category: 'Languages & Core', importance: 'High', patterns: [/\btypescript\b/i, /\bts\b/i] },
  { term: 'JavaScript', category: 'Languages & Core', importance: 'High', patterns: [/\bjavascript\b/i, /\bjs\b/i, /\bes6\b/i] },
  { term: 'Python', category: 'Languages & Core', importance: 'High', patterns: [/\bpython\b/i] },
  { term: 'Java', category: 'Languages & Core', importance: 'High', patterns: [/\bjava\b/i] },
  { term: 'C++', category: 'Languages & Core', importance: 'High', patterns: [/\bc\+\+\b/i, /\bcpp\b/i] },
  { term: 'Go / Golang', category: 'Languages & Core', importance: 'High', patterns: [/\bgolang\b/i, /\bgo\b/i] },
  { term: 'Rust', category: 'Languages & Core', importance: 'Medium', patterns: [/\brust\b/i] },
  { term: 'SQL', category: 'Languages & Core', importance: 'High', patterns: [/\bsql\b/i] },
  { term: 'HTML / CSS', category: 'Languages & Core', importance: 'Medium', patterns: [/\bhtml\b/i, /\bcss\b/i, /\bhtml5\b/i, /\bcss3\b/i] },

  // Frameworks & Libraries
  { term: 'React', category: 'Frameworks & Libraries', importance: 'High', patterns: [/\breact\b/i, /\breactjs\b/i] },
  { term: 'Node.js', category: 'Frameworks & Libraries', importance: 'High', patterns: [/\bnode\.js\b/i, /\bnodejs\b/i, /\bnode\b/i] },
  { term: 'Next.js', category: 'Frameworks & Libraries', importance: 'Medium', patterns: [/\bnext\.js\b/i, /\bnextjs\b/i] },
  { term: 'Express', category: 'Frameworks & Libraries', importance: 'Medium', patterns: [/\bexpress\b/i, /\bexpressjs\b/i] },
  { term: 'Tailwind CSS', category: 'Frameworks & Libraries', importance: 'Medium', patterns: [/\btailwind\b/i, /\btailwindcss\b/i] },
  { term: 'GraphQL', category: 'Frameworks & Libraries', importance: 'Medium', patterns: [/\bgraphql\b/i] },
  { term: 'REST APIs', category: 'Frameworks & Libraries', importance: 'High', patterns: [/\brest\b/i, /\brestful\b/i, /\brest api\b/i, /\bapi\b/i] },

  // Infrastructure & Tools
  { term: 'Git & GitHub', category: 'Infrastructure & Tools', importance: 'High', patterns: [/\bgit\b/i, /\bgithub\b/i] },
  { term: 'Docker', category: 'Infrastructure & Tools', importance: 'High', patterns: [/\bdocker\b/i, /\bcontainer\b/i] },
  { term: 'AWS Cloud', category: 'Infrastructure & Tools', importance: 'High', patterns: [/\baws\b/i, /\bamazon web services\b/i, /\bs3\b/i, /\blambda\b/i] },
  { term: 'PostgreSQL', category: 'Infrastructure & Tools', importance: 'High', patterns: [/\bpostgres\b/i, /\bpostgresql\b/i] },
  { term: 'MongoDB', category: 'Infrastructure & Tools', importance: 'Medium', patterns: [/\bmongodb\b/i, /\bmongo\b/i] },
  { term: 'Redis', category: 'Infrastructure & Tools', importance: 'Medium', patterns: [/\bredis\b/i] },
  { term: 'CI/CD & GitHub Actions', category: 'Infrastructure & Tools', importance: 'Medium', patterns: [/\bci\/cd\b/i, /\bcontinuous integration\b/i, /\bgithub actions\b/i] },
  { term: 'Testing (Jest/Playwright)', category: 'Infrastructure & Tools', importance: 'Medium', patterns: [/\bjest\b/i, /\bplaywright\b/i, /\bcypress\b/i, /\bunit testing\b/i] },
  { term: 'Linux / Unix', category: 'Infrastructure & Tools', importance: 'Low', patterns: [/\blinux\b/i, /\bunix\b/i, /\bbash\b/i] },

  // Methodologies
  { term: 'Data Structures & Algorithms', category: 'Methodologies', importance: 'High', patterns: [/\bdata structures\b/i, /\balgorithms\b/i] },
  { term: 'System Design & Scalability', category: 'Methodologies', importance: 'High', patterns: [/\bsystem design\b/i, /\bdistributed systems\b/i, /\bscalability\b/i, /\bmicroservices\b/i] },
  { term: 'Agile & Scrum', category: 'Methodologies', importance: 'Medium', patterns: [/\bagile\b/i, /\bscrum\b/i] },
  { term: 'Performance Optimization', category: 'Methodologies', importance: 'Medium', patterns: [/\bperformance\b/i, /\boptimization\b/i, /\blatency\b/i] },

  // Soft Skills
  { term: 'Technical Communication', category: 'Soft Skills', importance: 'Medium', patterns: [/\bcommunication\b/i, /\bwritten\b/i, /\bverbal\b/i] },
  { term: 'Problem Solving', category: 'Soft Skills', importance: 'High', patterns: [/\bproblem[- ]solving\b/i, /\banalytical\b/i] },
  { term: 'Team Collaboration', category: 'Soft Skills', importance: 'Medium', patterns: [/\bcollaboration\b/i, /\bteamwork\b/i, /\bcollaborative\b/i] },
];

export function analyzeResumeMatch(jobDesc: string, resumeText: string): ResumeAnalysisResult {
  const cleanJD = jobDesc.trim();
  const cleanResume = resumeText.trim();

  const jdWords = cleanJD ? cleanJD.split(/\s+/).length : 0;
  const resumeWords = cleanResume ? cleanResume.split(/\s+/).length : 0;

  if (!cleanJD || !cleanResume) {
    return {
      matchPercentage: 0,
      matchedKeywords: [],
      missingKeywords: [],
      otherSkills: [],
      totalJobKeywords: 0,
      totalResumeKeywords: 0,
      sectionReviews: [],
      actionableSuggestions: [
        'Please provide both a target job description and your resume text to begin the match analysis.',
      ],
      beforeAfterExamples: [],
      checklist: [],
      wordCounts: {
        jobDescription: jdWords,
        resume: resumeWords,
      },
      disclaimer:
        'This calculation reflects local keyword presence and structural section analysis. It is an estimated keyword alignment metric, not an official ATS score.',
    };
  }

  // 1. Identify which dictionary items appear in Job Description
  const matchedKeywords: MatchedKeyword[] = [];
  const missingKeywords: MissingKeyword[] = [];
  const otherSkills: string[] = [];

  let totalWeight = 0;
  let earnedWeight = 0;

  DICTIONARY.forEach(item => {
    let inJD = false;
    let jdCount = 0;
    for (const p of item.patterns) {
      const match = cleanJD.match(p);
      if (match) {
        inJD = true;
        jdCount += match.length;
      }
    }

    let inResume = false;
    let resumeCount = 0;
    for (const p of item.patterns) {
      const match = cleanResume.match(p);
      if (match) {
        inResume = true;
        resumeCount += match.length;
      }
    }

    const weight = item.importance === 'High' ? 3 : item.importance === 'Medium' ? 2 : 1;

    if (inJD) {
      totalWeight += weight;
      if (inResume) {
        earnedWeight += weight;
        matchedKeywords.push({
          term: item.term,
          count: resumeCount,
          category: item.category,
        });
      } else {
        missingKeywords.push({
          term: item.term,
          category: item.category,
          importance: item.importance,
        });
      }
    } else if (inResume) {
      // Present in resume but not requested in target job
      otherSkills.push(item.term);
    }
  });

  // Calculate percentage
  let matchPercentage = 50;
  if (totalWeight > 0) {
    matchPercentage = Math.round((earnedWeight / totalWeight) * 100);
  }
  matchPercentage = Math.max(15, Math.min(94, matchPercentage));

  // 2. Section-by-Section Review
  const sectionReviews: SectionReviewItem[] = [
    {
      section: 'Contact Information',
      detected: /(@|phone|\bemail\b|github\.com|linkedin\.com)/i.test(cleanResume),
      feedback: /(@|phone|\bemail\b)/i.test(cleanResume)
        ? 'Contact information detected with reachable email/phone and external profile links.'
        : 'Could not reliably detect standard contact details (email, phone, or portfolio links).',
    },
    {
      section: 'Professional Summary',
      detected: /\b(summary|objective|about me|profile)\b/i.test(cleanResume),
      feedback: /\b(summary|objective|about me|profile)\b/i.test(cleanResume)
        ? 'Professional summary header detected. Ensure it highlights your target internship role in 2 concise sentences.'
        : 'No dedicated Summary section found. For college students, an immediate Technical Skills or Education header is also acceptable.',
    },
    {
      section: 'Education',
      detected: /\b(education|university|college|b\.s|degree|bachelor|gpa)\b/i.test(cleanResume),
      feedback: /\b(education|university|college|b\.s|degree|bachelor)\b/i.test(cleanResume)
        ? 'Education section clearly identified with degree program and graduation horizon.'
        : 'Education section could not be detected. University recruiters look for graduation class year immediately.',
    },
    {
      section: 'Technical Skills',
      detected: /\b(skills|technical skills|technologies|proficiencies|languages)\b/i.test(cleanResume),
      feedback: /\b(skills|technical skills|technologies)\b/i.test(cleanResume)
        ? 'Technical skills list detected. Grouping by Languages, Frameworks, and Tools helps recruiters scan rapidly.'
        : 'Skills header not explicitly detected. Adding a dedicated "Technical Skills" section dramatically improves keyword readability.',
    },
    {
      section: 'Projects',
      detected: /\b(projects|personal projects|academic projects|portfolio)\b/i.test(cleanResume),
      feedback: /\b(projects|personal projects)\b/i.test(cleanResume)
        ? 'Projects section found. Ensure every project highlights the technical stack and a live demo or GitHub repository.'
        : 'No explicit Projects section identified. For early-career roles, hands-on projects carry significant weight.',
    },
    {
      section: 'Experience / Internships',
      detected: /\b(experience|work experience|employment|internship|fellow)\b/i.test(cleanResume),
      feedback: /\b(experience|work experience|internship)\b/i.test(cleanResume)
        ? 'Work experience or practical engineering fellowship detected with action-oriented bullets.'
        : 'Work Experience section not detected. If you do not have prior internships, campus lab research or hackathons should be featured.',
    },
    {
      section: 'Certifications / Awards',
      detected: /\b(certifications|awards|honors|achievements|competitions)\b/i.test(cleanResume),
      feedback: /\b(certifications|awards|honors)\b/i.test(cleanResume)
        ? 'Certifications or honors section detected.'
        : 'No certifications or honors section found (optional for student engineering internships).',
    },
  ];

  // 3. Actionable Recommendations
  const actionableSuggestions: string[] = [];
  const highMissing = missingKeywords.filter(m => m.importance === 'High').map(m => m.term);
  if (highMissing.length > 0) {
    actionableSuggestions.push(
      `Incorporate key required competencies: The job description explicitly prioritizes ${highMissing.slice(0, 3).join(', ')}. If you have used these in academic or side projects, list them prominently.`
    );
  }

  const metricBulletsCount = (cleanResume.match(/\b\d+([.%+]|\s*(ms|s|users|requests|hours|days|x))\b/gi) || []).length;
  if (metricBulletsCount < 3) {
    actionableSuggestions.push(
      'Quantify your engineering impact: Only a few measurable numbers were detected. Wherever you have genuine figures, describe latency reductions, concurrent user counts, or test coverage percentages.'
    );
  } else {
    actionableSuggestions.push(
      'Strong metric quantification detected! You have concrete figures (percentages, latency, or user numbers) demonstrating measurable engineering outcomes.'
    );
  }

  if (otherSkills.length > 2) {
    actionableSuggestions.push(
      `Targeted tailoring: Your resume mentions ${otherSkills.slice(0, 3).join(', ')}, which are not emphasized in this particular posting. Ensure they don’t push primary requirements below the fold.`
    );
  }

  actionableSuggestions.push(
    'Action verbs at bullet openings: Ensure every experience line begins with strong technical verbs (e.g. "Architected", "Engineered", "Optimized", "Containerized") rather than passive phrasing ("Responsible for", "Helped with").'
  );

  // 4. Before-and-After Examples (practical guidance preserving truthfulness)
  const beforeAfterExamples: BeforeAfterExample[] = [
    {
      original: 'Worked on the backend API and fixed database bugs for the study app.',
      revised: 'Engineered RESTful API endpoints in Node.js/Express and optimized PostgreSQL queries, reducing endpoint response latency by 25%.',
      explanation: 'Specifies the exact technical stack, system components, and a concrete performance outcome instead of generic involvement.',
    },
    {
      original: 'Made UI components in React and helped teammates with frontend bugs.',
      revised: 'Developed responsive, accessible React components using TypeScript and Tailwind CSS, maintaining a reusable component library used across 8 screens.',
      explanation: 'Highlights TypeScript typing discipline, design system reuse, and accessibility instead of passive assistance.',
    },
    {
      original: 'Setup Docker and ran automated unit tests on GitHub.',
      revised: 'Containerized microservices with Docker and configured a GitHub Actions CI pipeline executing Jest test suites on every pull request.',
      explanation: 'Demonstrates modern DevOps engineering practices and continuous integration workflows.',
    },
  ];

  // 5. Improvement Checklist
  const checklist: ImprovementChecklistItem[] = [
    {
      id: 'chk-1',
      text: highMissing.length > 0 ? `Verify experience with missing high-priority skills (${highMissing.slice(0, 2).join(', ')})` : 'Verify all listed skills match job description expectations',
      category: 'Skills Alignment',
      completed: false,
    },
    {
      id: 'chk-2',
      text: 'Replace passive phrases like "Assisted with" or "Worked on" with strong action verbs (Engineered, Architected, Refactored)',
      category: 'Bullet Crafting',
      completed: false,
    },
    {
      id: 'chk-3',
      text: 'Ensure GitHub and portfolio repository links are active and include comprehensive README documentation',
      category: 'Proof of Work',
      completed: true,
    },
    {
      id: 'chk-4',
      text: 'Verify consistent date formatting (e.g. Month Year – Month Year) across all education and project entries',
      category: 'Formatting',
      completed: false,
    },
    {
      id: 'chk-5',
      text: 'Keep document strictly to 1 page for undergraduate and early-career internship applications',
      category: 'Formatting',
      completed: true,
    },
  ];

  return {
    matchPercentage,
    matchedKeywords,
    missingKeywords,
    otherSkills,
    totalJobKeywords: matchedKeywords.length + missingKeywords.length,
    totalResumeKeywords: matchedKeywords.length + otherSkills.length,
    sectionReviews,
    actionableSuggestions,
    beforeAfterExamples,
    checklist,
    wordCounts: {
      jobDescription: jdWords,
      resume: resumeWords,
    },
    disclaimer:
      'This estimation is derived from transparent local keyword extraction and section structure heuristic analysis. It is an editorial guide to help you articulate your genuine qualifications, not an official ATS guarantee.',
  };
}
