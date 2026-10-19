import {
  Application,
  InterviewQuestion,
  UserProfile,
  LearningResource,
  DayStudyPlan,
  SavedResumeAnalysis,
  PracticeSession,
} from '../types';
import {
  INITIAL_USER_PROFILE,
  SEED_APPLICATIONS,
  SEED_INTERVIEW_QUESTIONS,
  SEED_LEARNING_RESOURCES,
  SEED_STUDY_PLAN,
} from './seedData';

const KEYS = {
  APPLICATIONS: 'internly_applications_v3',
  QUESTIONS: 'internly_questions_v3',
  PROFILE: 'internly_profile_v3',
  RESOURCES: 'internly_resources_v3',
  STUDY_PLAN: 'internly_study_plan_v3',
  SAVED_ANALYSES: 'internly_saved_analyses_v3',
  PRACTICE_SESSIONS: 'internly_practice_sessions_v3',
};

export const StorageService = {
  getApplications(): Application[] {
    try {
      const data = localStorage.getItem(KEYS.APPLICATIONS);
      if (data) {
        const parsed = JSON.parse(data) as Application[];
        return parsed.map(app => ({
          ...app,
          jobTitle: app.jobTitle || app.role || 'Software Engineering Intern',
          role: app.role || app.jobTitle || 'Software Engineering Intern',
          priority: app.priority || 'Medium',
          source: app.source || 'Company Website',
          applicationDate: app.applicationDate || '2026-10-01',
          timeline: app.timeline || [],
        }));
      }
    } catch (e) {
      console.warn('Failed to parse applications from localStorage, using seeds', e);
    }
    this.saveApplications(SEED_APPLICATIONS);
    return SEED_APPLICATIONS;
  },

  saveApplications(apps: Application[]): void {
    try {
      localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
    } catch (e) {
      console.error('Failed to save applications to localStorage', e);
    }
  },

  resetApplications(): Application[] {
    this.saveApplications(SEED_APPLICATIONS);
    return SEED_APPLICATIONS;
  },

  getQuestions(): InterviewQuestion[] {
    try {
      const data = localStorage.getItem(KEYS.QUESTIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse interview questions from localStorage', e);
    }
    this.saveQuestions(SEED_INTERVIEW_QUESTIONS);
    return SEED_INTERVIEW_QUESTIONS;
  },

  saveQuestions(questions: InterviewQuestion[]): void {
    try {
      localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.error('Failed to save interview questions to localStorage', e);
    }
  },

  resetQuestions(): InterviewQuestion[] {
    this.saveQuestions(SEED_INTERVIEW_QUESTIONS);
    return SEED_INTERVIEW_QUESTIONS;
  },

  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      if (data) {
        return {
          ...INITIAL_USER_PROFILE,
          ...JSON.parse(data),
        };
      }
    } catch (e) {
      console.warn('Failed to parse user profile from localStorage', e);
    }
    this.saveProfile(INITIAL_USER_PROFILE);
    return INITIAL_USER_PROFILE;
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  },

  resetProfile(): UserProfile {
    this.saveProfile(INITIAL_USER_PROFILE);
    return INITIAL_USER_PROFILE;
  },

  getResources(): LearningResource[] {
    try {
      const data = localStorage.getItem(KEYS.RESOURCES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse resources from localStorage', e);
    }
    this.saveResources(SEED_LEARNING_RESOURCES);
    return SEED_LEARNING_RESOURCES;
  },

  saveResources(resources: LearningResource[]): void {
    try {
      localStorage.setItem(KEYS.RESOURCES, JSON.stringify(resources));
    } catch (e) {
      console.error('Failed to save resources to localStorage', e);
    }
  },

  resetResources(): LearningResource[] {
    this.saveResources(SEED_LEARNING_RESOURCES);
    return SEED_LEARNING_RESOURCES;
  },

  getStudyPlan(): DayStudyPlan[] {
    try {
      const data = localStorage.getItem(KEYS.STUDY_PLAN);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse study plan from localStorage', e);
    }
    this.saveStudyPlan(SEED_STUDY_PLAN);
    return SEED_STUDY_PLAN;
  },

  saveStudyPlan(plan: DayStudyPlan[]): void {
    try {
      localStorage.setItem(KEYS.STUDY_PLAN, JSON.stringify(plan));
    } catch (e) {
      console.error('Failed to save study plan to localStorage', e);
    }
  },

  resetStudyPlan(): DayStudyPlan[] {
    this.saveStudyPlan(SEED_STUDY_PLAN);
    return SEED_STUDY_PLAN;
  },

  getSavedAnalyses(): SavedResumeAnalysis[] {
    try {
      const data = localStorage.getItem(KEYS.SAVED_ANALYSES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse saved resume analyses from localStorage', e);
    }
    return [];
  },

  saveAnalysis(analysis: SavedResumeAnalysis): SavedResumeAnalysis[] {
    const current = this.getSavedAnalyses();
    const filtered = current.filter(a => a.id !== analysis.id);
    const updated = [analysis, ...filtered];
    try {
      localStorage.setItem(KEYS.SAVED_ANALYSES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save analysis to localStorage', e);
    }
    return updated;
  },

  deleteAnalysis(id: string): SavedResumeAnalysis[] {
    const current = this.getSavedAnalyses();
    const updated = current.filter(a => a.id !== id);
    try {
      localStorage.setItem(KEYS.SAVED_ANALYSES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete analysis from localStorage', e);
    }
    return updated;
  },

  getPracticeSessions(): PracticeSession[] {
    try {
      const data = localStorage.getItem(KEYS.PRACTICE_SESSIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse practice sessions from localStorage', e);
    }
    return [
      {
        id: 'session-demo-1',
        date: '2026-10-14',
        questionIds: ['q-tech-1', 'q-tech-2'],
        completedCount: 2,
        averageConfidence: 4.5,
        durationMinutes: 28,
      },
    ];
  },

  savePracticeSession(session: PracticeSession): PracticeSession[] {
    const current = this.getPracticeSessions();
    const updated = [session, ...current];
    try {
      localStorage.setItem(KEYS.PRACTICE_SESSIONS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save practice session to localStorage', e);
    }
    return updated;
  },

  exportAllData(): string {
    const payload = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      applications: this.getApplications(),
      questions: this.getQuestions(),
      resources: this.getResources(),
      studyPlan: this.getStudyPlan(),
      savedAnalyses: this.getSavedAnalyses(),
      practiceSessions: this.getPracticeSessions(),
    };
    return JSON.stringify(payload, null, 2);
  },

  clearAllLocalData(): void {
    Object.values(KEYS).forEach(k => {
      localStorage.removeItem(k);
    });
  },

  resetAll(): {
    applications: Application[];
    questions: InterviewQuestion[];
    profile: UserProfile;
    resources: LearningResource[];
    studyPlan: DayStudyPlan[];
  } {
    return {
      applications: this.resetApplications(),
      questions: this.resetQuestions(),
      profile: this.resetProfile(),
      resources: this.resetResources(),
      studyPlan: this.resetStudyPlan(),
    };
  },
};
