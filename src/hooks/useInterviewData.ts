import { useEffect, useState } from 'react';
import {
  DayStudyPlan,
  InterviewQuestion,
  LearningResource,
  PracticeSession,
} from '../types';
import {
  CustomQuestionInput,
  InterviewService,
  QuestionProgress,
  applyProgress,
  mergeQuestions,
  mergeResources,
  mergeStudyPlan,
} from '../services/interviewService';

/**
 * Holds this user's interview-prep data. Loads after login, clears on logout.
 * Every save function throws if the server refuses, so the page can show the error.
 */
export function useInterviewData(userId: string | undefined) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [studyPlan, setStudyPlan] = useState<DayStudyPlan[]>([]);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);

  useEffect(() => {
    if (!userId) {
      setQuestions([]);
      setResources([]);
      setStudyPlan([]);
      setSessions([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    InterviewService.getState()
      .then(state => {
        if (cancelled) return;
        setQuestions(mergeQuestions(state.questions));
        setResources(mergeResources(state.resources));
        setStudyPlan(mergeStudyPlan(state.studyDays));
        setSessions(state.sessions);
      })
      .catch(err => {
        if (!cancelled) {
          setError(
            err instanceof Error && err.message
              ? err.message
              : 'Could not load your interview prep data.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, reloadCounter]);

  const reload = () => setReloadCounter(c => c + 1);

  const saveProgress = async (id: string, changes: QuestionProgress) => {
    const saved = await InterviewService.saveProgress(id, changes);
    setQuestions(prev => prev.map(item => (item.id === id ? applyProgress(item, saved) : item)));
  };

  const createCustom = async (input: CustomQuestionInput) => {
    const created = await InterviewService.createCustom(input);
    setQuestions(prev => [created, ...prev]);
    return created;
  };

  const updateCustom = async (id: string, input: CustomQuestionInput) => {
    const updated = await InterviewService.updateCustom(id, input);
    setQuestions(prev => prev.map(item => (item.id === id ? updated : item)));
  };

  const deleteCustom = async (id: string) => {
    await InterviewService.deleteCustom(id);
    setQuestions(prev => prev.filter(item => item.id !== id));
  };

  const toggleResource = async (id: string, field: 'bookmarked' | 'completed') => {
    const current = resources.find(r => r.id === id);
    if (!current) return;
    const value = !current[field];
    const changes = field === 'bookmarked' ? { bookmarked: value } : { completed: value };
    await InterviewService.setResource(id, changes);
    setResources(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const toggleStudyDay = async (day: number) => {
    const current = studyPlan.find(d => d.day === day);
    if (!current) return;
    const completed = !current.completed;
    await InterviewService.setStudyDay(day, completed);
    setStudyPlan(prev => prev.map(d => (d.day === day ? { ...d, completed } : d)));
  };

  const saveSession = async (session: Omit<PracticeSession, 'id'>) => {
    const saved = await InterviewService.createSession(session);
    setSessions(prev => [saved, ...prev]);
  };

  return {
    questions,
    resources,
    studyPlan,
    sessions,
    loading,
    error,
    reload,
    saveProgress,
    createCustom,
    updateCustom,
    deleteCustom,
    toggleResource,
    toggleStudyDay,
    saveSession,
  };
}