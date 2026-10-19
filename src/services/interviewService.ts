import {
  DayStudyPlan,
  InterviewQuestion,
  LearningResource,
  PracticeSession,
  QuestionCategory,
  QuestionDifficulty,
} from '../types';
import { api } from './apiClient';
import {
  SEED_INTERVIEW_QUESTIONS,
  SEED_LEARNING_RESOURCES,
  SEED_STUDY_PLAN,
} from '../data/seedData';

// What the server sends back for each question you have touched
export type ServerQuestion = Partial<InterviewQuestion> & { id: string };

export interface ServerInterviewState {
  questions: ServerQuestion[];
  resources: Record<string, { bookmarked?: boolean; completed?: boolean }>;
  studyDays: Record<string, boolean>;
  sessions: PracticeSession[];
}

// Personal progress that can be saved on any question
export type QuestionProgress = Partial<
  Pick<InterviewQuestion, 'status' | 'saved' | 'notes' | 'userPracticeAnswer' | 'confidenceRating'>
>;

// Content of a custom question
export interface CustomQuestionInput {
  question: string;
  category: QuestionCategory;
  topic: string;
  subCategory: string;
  difficulty: QuestionDifficulty;
  assessing: string;
  conceptRefresher: string;
  exampleAnswer: string;
  preparationTips: string[];
}

/** Puts your saved progress on top of a question (library or custom). */
export function applyProgress(base: InterviewQuestion, p?: ServerQuestion): InterviewQuestion {
  return {
    ...base,
    status: p?.status ?? 'Not Started',
    saved: p?.saved ?? false,
    notes: p?.notes ?? '',
    userPracticeAnswer: p?.userPracticeAnswer ?? '',
    confidenceRating: p?.confidenceRating,
    updatedAt: p?.updatedAt ?? base.updatedAt,
  };
}

export function mergeQuestions(server: ServerQuestion[]): InterviewQuestion[] {
  const progressById = new Map(server.map(q => [q.id, q]));
  const library = SEED_INTERVIEW_QUESTIONS.map(q => applyProgress(q, progressById.get(q.id)));
  const custom = server.filter(q => q.isCustom) as InterviewQuestion[];
  return [...custom, ...library];
}

export function mergeResources(saved: ServerInterviewState['resources']): LearningResource[] {
  return SEED_LEARNING_RESOURCES.map(r => ({
    ...r,
    bookmarked: Boolean(saved[r.id]?.bookmarked),
    completed: Boolean(saved[r.id]?.completed),
  }));
}

export function mergeStudyPlan(days: ServerInterviewState['studyDays']): DayStudyPlan[] {
  return SEED_STUDY_PLAN.map(d => ({ ...d, completed: Boolean(days[String(d.day)]) }));
}

const q = (id: string) => encodeURIComponent(id);

export const InterviewService = {
  getState(): Promise<ServerInterviewState> {
    return api<ServerInterviewState>('/interview');
  },

  async saveProgress(id: string, changes: QuestionProgress): Promise<ServerQuestion> {
    const { question } = await api<{ question: ServerQuestion }>(`/interview/questions/${q(id)}`, {
      method: 'PUT',
      body: changes,
    });
    return question;
  },

  async createCustom(input: CustomQuestionInput): Promise<InterviewQuestion> {
    const { question } = await api<{ question: InterviewQuestion }>('/interview/custom', {
      method: 'POST',
      body: input,
    });
    return question;
  },

  async updateCustom(id: string, input: CustomQuestionInput): Promise<InterviewQuestion> {
    const { question } = await api<{ question: InterviewQuestion }>(`/interview/custom/${q(id)}`, {
      method: 'PUT',
      body: input,
    });
    return question;
  },

  async deleteCustom(id: string): Promise<void> {
    await api(`/interview/custom/${q(id)}`, { method: 'DELETE' });
  },

  async setResource(id: string, changes: { bookmarked?: boolean; completed?: boolean }): Promise<void> {
    await api(`/interview/resources/${q(id)}`, { method: 'PUT', body: changes });
  },

  async setStudyDay(day: number, completed: boolean): Promise<void> {
    await api(`/interview/study-days/${day}`, { method: 'PUT', body: { completed } });
  },

  async createSession(session: Omit<PracticeSession, 'id'>): Promise<PracticeSession> {
    const { session: saved } = await api<{ session: PracticeSession }>('/interview/sessions', {
      method: 'POST',
      body: session,
    });
    return saved;
  },
};