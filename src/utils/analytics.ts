import {
  Application,
  ApplicationStatus,
  InterviewQuestion,
  PracticeSession,
  WorkMode,
} from '../types';
import { addDaysISO, todayLocalISO } from './dates';

export type DateFilterRange = '7d' | '30d' | '90d' | 'all';

const RANGE_DAYS: Record<Exclude<DateFilterRange, 'all'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export interface AnalyticsSummary {
  totalApplications: number;
  interviewsCount: number;
  offersCount: number;
  rejectionsCount: number;
  interestedCount: number;
  appliedCount: number;
  activeCount: number;
  interviewOrOfferCount: number;
  interviewRate: number;
  offerRate: number;
  offerToInterviewRate: number;
  statusBreakdown: { name: ApplicationStatus; count: number; color: string }[];
  workModeBreakdown: { name: WorkMode; count: number; percentage: number }[];
  timelineData: { date: string; displayDate: string; count: number; cumulative: number }[];
}

export interface InterviewAnalytics {
  totalQuestions: number;
  completed: number;
  practicing: number;
  saved: number;
  completionRate: number;
  sessionsCount: number;
  totalMinutes: number;
  averageConfidence: number | null; // null when there are no sessions
  streakDays: number;
  byTrack: { name: string; total: number; completed: number; percentage: number }[];
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Interested: '#687879',
  Applied: '#087E83',
  Interview: '#C28A35',
  Offered: '#278567',
  Rejected: '#C64D4D',
};

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

// The day an application counts for, as YYYY-MM-DD
const dayOf = (app: Application) => (app.applicationDate || app.createdAt || '').slice(0, 10);

export function filterApplicationsByDate(apps: Application[], range: DateFilterRange): Application[] {
  if (range === 'all') return apps;
  const cutoff = addDaysISO(-RANGE_DAYS[range]); // based on the real current day
  return apps.filter(app => {
    const d = dayOf(app);
    return d !== '' && d >= cutoff;
  });
}

export function filterSessionsByDate(
  sessions: PracticeSession[],
  range: DateFilterRange
): PracticeSession[] {
  if (range === 'all') return sessions;
  const cutoff = addDaysISO(-RANGE_DAYS[range]);
  return sessions.filter(s => s.date >= cutoff);
}

export function calculateAnalytics(apps: Application[]): AnalyticsSummary {
  const total = apps.length;

  const interested = apps.filter(a => a.status === 'Interested').length;
  const applied = apps.filter(a => a.status === 'Applied').length;
  const interview = apps.filter(a => a.status === 'Interview').length;
  const offered = apps.filter(a => a.status === 'Offered').length;
  const rejected = apps.filter(a => a.status === 'Rejected').length;

  const interviewOrOfferCount = interview + offered;

  const statusBreakdown = [
    { name: 'Offered' as ApplicationStatus, count: offered, color: STATUS_COLORS.Offered },
    { name: 'Interview' as ApplicationStatus, count: interview, color: STATUS_COLORS.Interview },
    { name: 'Applied' as ApplicationStatus, count: applied, color: STATUS_COLORS.Applied },
    { name: 'Interested' as ApplicationStatus, count: interested, color: STATUS_COLORS.Interested },
    { name: 'Rejected' as ApplicationStatus, count: rejected, color: STATUS_COLORS.Rejected },
  ];

  const remote = apps.filter(a => a.workMode === 'Remote').length;
  const hybrid = apps.filter(a => a.workMode === 'Hybrid').length;
  const onsite = apps.filter(a => a.workMode === 'On-site').length;

  const workModeBreakdown: { name: WorkMode; count: number; percentage: number }[] = [
    { name: 'Hybrid', count: hybrid, percentage: pct(hybrid, total) },
    { name: 'Remote', count: remote, percentage: pct(remote, total) },
    { name: 'On-site', count: onsite, percentage: pct(onsite, total) },
  ];

  // Applications over time, oldest first
  const dateMap = new Map<string, number>();
  [...apps]
    .map(dayOf)
    .filter(Boolean)
    .sort()
    .forEach(d => dateMap.set(d, (dateMap.get(d) || 0) + 1));

  let running = 0;
  const timelineData: AnalyticsSummary['timelineData'] = [];
  dateMap.forEach((count, date) => {
    running += count;
    const [y, m, d] = date.split('-').map(Number);
    const display = new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    timelineData.push({ date, displayDate: display, count, cumulative: running });
  });

  return {
    totalApplications: total,
    interviewsCount: interview,
    offersCount: offered,
    rejectionsCount: rejected,
    interestedCount: interested,
    appliedCount: applied,
    activeCount: applied + interview,
    interviewOrOfferCount,
    interviewRate: pct(interviewOrOfferCount, total),
    offerRate: pct(offered, total),
    offerToInterviewRate: pct(offered, interviewOrOfferCount),
    statusBreakdown,
    workModeBreakdown,
    timelineData,
  };
}

export function calculateInterviewAnalytics(
  questions: InterviewQuestion[],
  sessions: PracticeSession[]
): InterviewAnalytics {
  const total = questions.length;
  const completed = questions.filter(q => q.status === 'Completed').length;
  const practicing = questions.filter(q => q.status === 'Practicing').length;
  const saved = questions.filter(q => q.saved).length;

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const averageConfidence =
    sessions.length > 0
      ? Math.round((sessions.reduce((sum, s) => sum + s.averageConfidence, 0) / sessions.length) * 10) / 10
      : null;

  // Streak = consecutive days with a practice session, counting back from today
  // (if you haven't practised yet today, yesterday still keeps the streak alive)
  const days = new Set(sessions.map(s => s.date));
  const startOffset = days.has(todayLocalISO()) ? 0 : 1;
  let streakDays = 0;
  while (days.has(addDaysISO(-(startOffset + streakDays)))) streakDays++;

  const tracks = ['Technical', 'HR & Behavioral', 'Role-Specific'] as const;
  const byTrack = tracks.map(name => {
    const inTrack = questions.filter(q => q.category === name);
    const done = inTrack.filter(q => q.status === 'Completed').length;
    return { name, total: inTrack.length, completed: done, percentage: pct(done, inTrack.length) };
  });

  return {
    totalQuestions: total,
    completed,
    practicing,
    saved,
    completionRate: pct(completed, total),
    sessionsCount: sessions.length,
    totalMinutes,
    averageConfidence,
    streakDays,
    byTrack,
  };
}