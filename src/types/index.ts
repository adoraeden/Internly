export type ApplicationStatus = 'Interested' | 'Applied' | 'Interview' | 'Offered' | 'Rejected';

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export type ApplicationPriority = 'High' | 'Medium' | 'Low';

export type ApplicationSource =
  | 'Company Website'
  | 'LinkedIn'
  | 'Job Board'
  | 'Referral'
  | 'University Portal'
  | 'Other';

export interface ApplicationTimelineEvent {
  id: string;
  type: 'created' | 'status_change' | 'interview_scheduled' | 'follow_up_set' | 'follow_up_completed' | 'note_added';
  title: string;
  description?: string;
  timestamp: string; // ISO string
}

export interface Application {
  id: string;
  company: string;
  jobTitle: string;
  role: string;
  jobDescription: string;
  applicationUrl: string;
  companyWebsite?: string;
  location: string;
  workMode: WorkMode;
  applicationDate: string; // YYYY-MM-DD
  deadline: string;        // YYYY-MM-DD
  followUpDate?: string;
  followUpCompleted?: boolean;
  interviewDate?: string;
  status: ApplicationStatus;
  priority?: ApplicationPriority;
  source?: ApplicationSource;
  salary?: string;
  currency?: string;
  notes: string;
  timeline?: ApplicationTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type QuestionCategory = 'Technical' | 'HR & Behavioral' | 'Role-Specific';
export type LearningPath =
  | 'Technical'
  | 'HR & Behavioral'
  | 'Role-Specific'
  | 'Company-Specific'
  | 'Communication & Aptitude';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionStatus = 'Not Started' | 'Practicing' | 'Completed';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  learningPath?: LearningPath;
  topic: string;
  subCategory?: string;
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  saved: boolean;
  notes: string;
  preparationTips: string[];
  suggestedFramework?: string;
  assessing?: string;
  conceptRefresher?: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  answerStructure?: string[];
  exampleAnswer?: string;
  followUpQuestions?: {
    question: string;
    hint: string;
  }[];
  commonMistakes?: string[];
  userPracticeAnswer?: string;
  confidenceRating?: number; // 1 to 5
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'Documentation' | 'Article / Guide' | 'Video Tutorial' | 'Practice Problems';
  url: string;
  topic: string;
  description: string;
  bookmarked?: boolean;
  completed?: boolean;
}

export interface PracticeSession {
  id: string;
  date: string;
  questionIds: string[];
  completedCount: number;
  averageConfidence: number;
  durationMinutes: number;
}

export interface DayStudyPlan {
  day: number;
  title: string;
  focus: string;
  description: string;
  targetTopics: string[];
  recommendedQuestionIds: string[];
  completed: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  rememberMe?: boolean;
  expiresAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  degree: string;
  headline?: string;
  targetRole?: string;
  location?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  preferredRoles: string[];
  preferredIndustries?: string[];
  preferredLocations: string[];
  preferredWorkMode: WorkMode | 'Any';
  employmentType?: 'Internship' | 'Co-op' | 'New Grad';
  preferredDuration?: string;
  technicalSkills?: string[];
  toolsAndTechnologies?: string[];
  areasToLearn?: string[];
  defaultApplicationView?: 'table' | 'kanban';
  defaultSortBy?: 'newest' | 'oldest' | 'deadline' | 'company' | 'role' | 'priority';
  followUpReminderDays?: number;
  themePreference: 'Light' | 'System';
  notificationsEnabled: boolean;
}

export interface MatchedKeyword {
  term: string;
  count: number;
  category: 'Languages & Core' | 'Frameworks & Libraries' | 'Infrastructure & Tools' | 'Methodologies' | 'Soft Skills';
}

export interface MissingKeyword {
  term: string;
  category: 'Languages & Core' | 'Frameworks & Libraries' | 'Infrastructure & Tools' | 'Methodologies' | 'Soft Skills';
  importance: 'High' | 'Medium' | 'Low';
}

export interface SectionReviewItem {
  section: string;
  detected: boolean;
  feedback: string;
}

export interface BeforeAfterExample {
  original: string;
  revised: string;
  explanation: string;
}

export interface ImprovementChecklistItem {
  id: string;
  text: string;
  category: string;
  completed: boolean;
}

export interface ResumeAnalysisResult {
  matchPercentage: number;
  matchedKeywords: MatchedKeyword[];
  missingKeywords: MissingKeyword[];
  otherSkills: string[]; // skills in resume less relevant to role
  totalJobKeywords: number;
  totalResumeKeywords: number;
  sectionReviews: SectionReviewItem[];
  actionableSuggestions: string[];
  beforeAfterExamples: BeforeAfterExample[];
  checklist: ImprovementChecklistItem[];
  wordCounts: {
    jobDescription: number;
    resume: number;
  };
  disclaimer: string;
}

export interface SavedResumeAnalysis {
  id: string;
  name: string;
  date: string;
  jobCompany?: string;
  jobTitle?: string;
  matchPercentage: number;
  matchedCount: number;
  missingCount: number;
  result: ResumeAnalysisResult;
}
