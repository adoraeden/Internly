import React from 'react';
import {
  Plus,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck2,
  HelpCircle,
  BarChart3,
  Briefcase,
  ChevronRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Users,
  Award,
} from 'lucide-react';
import { Application, ApplicationStatus, UserProfile } from '../../types';
import { NavTab } from '../layout/Sidebar';
import { daysUntil } from '../../utils/dates';

interface DashboardPageProps {
  applications: Application[];
  profile: UserProfile;
  onOpenNewApplicationModal: () => void;
  onSelectApplication: (app: Application) => void;
  onNavigateTab: (tab: NavTab) => void;
}

const STATUS_TAGS: Record<ApplicationStatus, { label: string; text: string; bg: string }> = {
  Interested: { label: 'Interested', text: 'text-[#687879]', bg: 'bg-[#F5F8F8]' },
  Applied: { label: 'Applied', text: 'text-[#155456]', bg: 'bg-[#E1F0EF]' },
  Interview: { label: 'Interview', text: 'text-[#C28A35]', bg: 'bg-[#FDF5E8]' },
  Offered: { label: 'Offered', text: 'text-[#278567]', bg: 'bg-[#E7F3EF]' },
  Rejected: { label: 'Rejected', text: 'text-[#C64D4D]', bg: 'bg-[#FBECEC]' },
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  applications,
  profile,
  onOpenNewApplicationModal,
  onSelectApplication,
  onNavigateTab,
}) => {
  // Metrics calculated directly from the application dataset
  const total = applications.length;
  const interviewsCount = applications.filter(a => a.status === 'Interview').length;
  const offersCount = applications.filter(a => a.status === 'Offered').length;
  const rejectionsCount = applications.filter(a => a.status === 'Rejected').length;
  const appliedCount = applications.filter(a => a.status === 'Applied').length;

  const interviewOrOfferCount = interviewsCount + offersCount;
  const interviewRate = total > 0 ? Math.round((interviewOrOfferCount / total) * 100) : 0;

  // Upcoming deadlines (days counted from the real current date)
  const upcomingDeadlines = applications
    .filter(a => a.status !== 'Rejected')
    .map(app => {
      const targetDateStr = app.interviewDate || app.deadline;
      const isInterview = Boolean(app.interviewDate);
      const days = daysUntil(targetDateStr);
      return {
        app,
        days,
        isInterview,
        isOverdue: days < 0,
        formattedDate: targetDateStr,
      };
    })
    .sort((a, b) => a.days - b.days)
    .slice(0, 4);

  // Recent applications (sorted by applicationDate descending)
  const recentApplications = [...applications]
    .sort((a, b) => {
      const dateA = new Date(a.applicationDate || a.createdAt).getTime();
      const dateB = new Date(b.applicationDate || b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 4.1 Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DCE6E6]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest text-[#087E83] uppercase">
              YOUR CAREER WORKSPACE
            </span>
            <span className="text-[11px] text-[#687879]">·</span>
            <span className="text-xs text-[#687879]">
              Candidate: <strong className="text-[#202729]">{profile.name}</strong>
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display text-[#155456] tracking-tight leading-tight">
            Make your next move.
          </h2>

          <p className="text-xs sm:text-sm text-[#687879] mt-2 max-w-2xl leading-relaxed">
            Your career journey, thoughtfully organized.
          </p>
        </div>

        <button
          onClick={onOpenNewApplicationModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#087E83] hover:bg-[#076B70] active:bg-[#06595D] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add application</span>
        </button>
      </div>

      {/* 4.2 Summary Metrics: 4 Distinct Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="p-5 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#687879] uppercase tracking-wider">
              Total Applications
            </span>
            <div className="p-2 rounded-xl bg-[#E1F0EF] text-[#087E83]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-serif-display text-[#155456] tabular-nums">
              {total}
            </div>
            <div className="text-[11px] text-[#687879] mt-1">
              {total > 0 ? `${appliedCount} actively under review` : 'Add your first application'}
            </div>
          </div>
        </div>

        {/* Interviews */}
        <div className="p-5 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#C28A35] uppercase tracking-wider">
              Interviews
            </span>
            <div className="p-2 rounded-xl bg-[#FDF5E8] text-[#C28A35]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-serif-display text-[#C28A35] tabular-nums">
              {interviewsCount}
            </div>
            <div className="text-[11px] text-[#687879] mt-1">
              {interviewRate}% pipeline advancement
            </div>
          </div>
        </div>

        {/* Offers */}
        <div className="p-5 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#278567] uppercase tracking-wider">
              Offers
            </span>
            <div className="p-2 rounded-xl bg-[#E7F3EF] text-[#278567]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-serif-display text-[#278567] tabular-nums">
              {offersCount}
            </div>
            <div className="text-[11px] text-[#687879] mt-1">
              {offersCount > 0 ? 'Review your offer details' : 'Awaiting offer decisions'}
            </div>
          </div>
        </div>

        {/* Rejections */}
        <div className="p-5 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#C64D4D] uppercase tracking-wider">
              Rejections
            </span>
            <div className="p-2 rounded-xl bg-[#FBECEC] text-[#C64D4D]">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-serif-display text-[#155456] tabular-nums">
              {rejectionsCount}
            </div>
            <div className="text-[11px] text-[#687879] mt-1">
              {rejectionsCount > 0 ? 'Note what you learned and keep going' : 'None so far'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Applications & Sidebar Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Applications (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE6E6] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#155456]">
                  Recent applications
                </h3>
                <p className="text-xs text-[#687879] mt-0.5">
                  Your active opportunities and progression updates
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('applications')}
                className="flex items-center gap-1 text-xs font-semibold text-[#087E83] hover:text-[#076B70] transition-colors"
              >
                <span>View all ({total})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentApplications.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#687879]">
                No applications yet.{' '}
                <button
                  onClick={onOpenNewApplicationModal}
                  className="text-[#087E83] font-semibold hover:underline"
                >
                  Add your first application.
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#DCE6E6]">
                {recentApplications.map(app => (
                  <div
                    key={app.id}
                    onClick={() => onSelectApplication(app)}
                    className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-[#F5F8F8] rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#155456] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                        {app.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#202729] group-hover:text-[#087E83] transition-colors truncate">
                            {app.company}
                          </span>
                          <span className="text-[11px] text-[#687879]">
                            · {app.workMode}
                          </span>
                        </div>
                        <p className="text-xs text-[#687879] truncate mt-0.5">
                          {app.jobTitle || app.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          STATUS_TAGS[app.status].bg
                        } ${STATUS_TAGS[app.status].text}`}
                      >
                        {app.status}
                      </span>

                      <span className="text-[11px] text-[#687879] font-mono hidden sm:block">
                        {app.applicationDate}
                      </span>

                      <ChevronRight className="w-4 h-4 text-[#687879] group-hover:text-[#087E83] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Shortcuts */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#687879] px-1 block mb-3">
              Quick Actions
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={onOpenNewApplicationModal}
                className="p-4 bg-white border border-[#DCE6E6] hover:border-[#087E83] rounded-2xl shadow-xs cursor-pointer transition-all group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-[#E1F0EF] text-[#087E83] group-hover:bg-[#087E83] group-hover:text-white transition-colors shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#155456] group-hover:text-[#087E83] transition-colors">
                    Add application
                  </h4>
                  <p className="text-[11px] text-[#687879] mt-0.5 leading-snug">
                    Save a new target role, requirements, and deadline.
                  </p>
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('resume-checker')}
                className="p-4 bg-white border border-[#DCE6E6] hover:border-[#087E83] rounded-2xl shadow-xs cursor-pointer transition-all group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-[#E1F0EF] text-[#087E83] group-hover:bg-[#087E83] group-hover:text-white transition-colors shrink-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#155456] group-hover:text-[#087E83] transition-colors">
                    Check resume
                  </h4>
                  <p className="text-[11px] text-[#687879] mt-0.5 leading-snug">
                    Compare resume keywords against job requirements.
                  </p>
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('interview-prep')}
                className="p-4 bg-white border border-[#DCE6E6] hover:border-[#087E83] rounded-2xl shadow-xs cursor-pointer transition-all group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-[#FDF5E8] text-[#C28A35] group-hover:bg-[#C28A35] group-hover:text-white transition-colors shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#155456] group-hover:text-[#C28A35] transition-colors">
                    Practice interview
                  </h4>
                  <p className="text-[11px] text-[#687879] mt-0.5 leading-snug">
                    Study technical talking points and STAR behavioral scenarios.
                  </p>
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('analytics')}
                className="p-4 bg-white border border-[#DCE6E6] hover:border-[#087E83] rounded-2xl shadow-xs cursor-pointer transition-all group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-[#E1F0EF] text-[#087E83] group-hover:bg-[#087E83] group-hover:text-white transition-colors shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#155456] group-hover:text-[#087E83] transition-colors">
                    View analytics
                  </h4>
                  <p className="text-[11px] text-[#687879] mt-0.5 leading-snug">
                    Inspect conversion funnels and submission timeline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines & Progress Momentum Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E6] mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#087E83]" />
                <h3 className="text-xs font-bold text-[#155456] uppercase tracking-wider">
                  Upcoming deadlines
                </h3>
              </div>
              <span className="text-[11px] text-[#687879]">Next actions</span>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#687879]">
                No upcoming deadlines on your schedule.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectApplication(item.app)}
                    className="p-3 rounded-xl border border-[#DCE6E6] hover:border-[#087E83] hover:bg-[#F5F8F8] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#202729] group-hover:text-[#087E83] transition-colors truncate">
                        {item.app.company}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums ${
                          item.isOverdue
                            ? 'bg-[#FBECEC] text-[#C64D4D]'
                            : item.days <= 3
                            ? 'bg-[#FBECEC] text-[#C64D4D]'
                            : item.days <= 7
                            ? 'bg-[#FDF5E8] text-[#C28A35]'
                            : 'bg-[#E1F0EF] text-[#087E83]'
                        }`}
                      >
                        {item.isOverdue
                          ? 'Past date'
                          : item.days === 0
                          ? 'Due today'
                          : item.days === 1
                          ? 'Tomorrow'
                          : `${item.days}d left`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#687879] mt-1.5">
                      <span className="truncate">
                        {item.isInterview ? 'Interview' : item.app.jobTitle || item.app.role}
                      </span>
                      <span className="tabular-nums font-mono text-[10px]">
                        {item.formattedDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Small Progress Panel: Keep your momentum */}
          <div className="bg-[#E1F0EF] border border-[#087E83]/20 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#087E83]">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Keep your momentum
              </span>
            </div>

            <p className="text-sm font-serif-display text-[#155456] leading-snug">
              {total > 0
                ? `${interviewOrOfferCount} opportunities currently in interview rounds or offers.`
                : 'Your career, in progress.'}
            </p>

            <p className="text-xs text-[#687879] leading-relaxed">
              {offersCount > 0
                ? 'You have an offer. Check the response deadline in your application details.'
                : 'Continue preparing for upcoming technical rounds and expanding your pipeline.'}
            </p>

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('interview-prep')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#087E83] hover:bg-[#076B70] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                <span>Practice interview questions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};