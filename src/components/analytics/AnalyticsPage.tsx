import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { CheckCircle2, Info, Download, RotateCcw, BookOpen, Flame } from 'lucide-react';
import { Application, InterviewQuestion, PracticeSession } from '../../types';
import {
  calculateAnalytics,
  calculateInterviewAnalytics,
  filterApplicationsByDate,
  filterSessionsByDate,
  DateFilterRange,
} from '../../utils/analytics';
import { daysUntil } from '../../utils/dates';

interface AnalyticsPageProps {
  applications: Application[];
  questions?: InterviewQuestion[];
  sessions?: PracticeSession[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  applications,
  questions = [],
  sessions = [],
}) => {
  const [dateRange, setDateRange] = useState<DateFilterRange>('all');

  const filteredApps = useMemo(
    () => filterApplicationsByDate(applications, dateRange),
    [applications, dateRange]
  );

  const analytics = useMemo(() => calculateAnalytics(filteredApps), [filteredApps]);

  // Interview prep: sessions follow the date filter; question progress is all-time
  const interviewStats = useMemo(
    () => calculateInterviewAnalytics(questions, filterSessionsByDate(sessions, dateRange)),
    [questions, sessions, dateRange]
  );
  const streakStats = useMemo(() => calculateInterviewAnalytics(questions, sessions), [questions, sessions]);

  // Applications that received any response (Interview, Offered or Rejected)
  const respondedApps = filteredApps.filter(
    a => a.status === 'Interview' || a.status === 'Offered' || a.status === 'Rejected'
  ).length;
  const responseRate =
    filteredApps.length > 0 ? Math.round((respondedApps / filteredApps.length) * 100) : 0;

  const dateFilterOptions: { label: string; value: DateFilterRange }[] = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'All Time', value: 'all' },
  ];

  // Only statuses that have applications, so slices and colours always match
  const donutData = analytics.statusBreakdown.filter(s => s.count > 0);

  const progressionStages = [
    {
      stage: 'Total Opportunities',
      count: analytics.totalApplications,
      percentage: analytics.totalApplications > 0 ? 100 : 0,
      description: 'Total volume of tracked applications in timeframe',
      color: '#155456',
    },
    {
      stage: 'Responses Received',
      count: respondedApps,
      percentage: responseRate,
      description: `${responseRate}% of applications received an update or outcome`,
      color: '#087E83',
    },
    {
      stage: 'Interview Rounds',
      count: analytics.interviewOrOfferCount,
      percentage: analytics.interviewRate,
      description: `${analytics.interviewRate}% reached an interview stage or beyond`,
      color: '#C28A35',
    },
    {
      stage: 'Offers Secured',
      count: analytics.offersCount,
      percentage: analytics.offerRate,
      description: `${analytics.offerRate}% converted into offers`,
      color: '#278567',
    },
  ];

  // Observations that come only from your data
  const keyObservations = useMemo(() => {
    const list: { title: string; detail: string }[] = [];

    if (filteredApps.length === 0) {
      list.push({
        title: 'No data in this window',
        detail: 'No applications were logged in this date range. Switch to "All Time" to see everything.',
      });
      return list;
    }

    const statusCounts: Record<string, number> = {};
    filteredApps.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });
    const topStatus = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0];
    if (topStatus) {
      list.push({
        title: `Most common stage: ${topStatus[0]}`,
        detail: `${topStatus[1]} of ${filteredApps.length} opportunities (${Math.round(
          (topStatus[1] / filteredApps.length) * 100
        )}%) are in the ${topStatus[0]} stage.`,
      });
    }

    const top = [...analytics.workModeBreakdown].sort((a, b) => b.count - a.count)[0];
    if (top && top.count > 0) {
      list.push({
        title: `Mostly ${top.name} roles`,
        detail: `${top.name} roles are ${top.percentage}% of your tracked opportunities.`,
      });
    }

    const urgent = filteredApps.filter(a => {
      if (!a.deadline || a.status === 'Rejected' || a.status === 'Offered') return false;
      const d = daysUntil(a.deadline);
      return d >= 0 && d <= 7;
    });
    if (urgent.length > 0) {
      list.push({
        title: `${urgent.length} deadline${urgent.length > 1 ? 's' : ''} in the next 7 days`,
        detail: `Coming up: ${urgent.map(a => a.company).join(', ')}.`,
      });
    } else {
      list.push({
        title: 'No deadlines this week',
        detail: 'None of your open applications are due in the next 7 days.',
      });
    }

    if (analytics.interviewOrOfferCount > 0) {
      list.push({
        title: `${analytics.interviewRate}% reached interviews`,
        detail: `${analytics.interviewOrOfferCount} application${
          analytics.interviewOrOfferCount > 1 ? 's' : ''
        } reached an interview stage or beyond.`,
      });
    }

    return list;
  }, [filteredApps, analytics]);

  const exportToCSV = () => {
    if (filteredApps.length === 0) return;
    const headers = ['Company', 'Job Title', 'Status', 'Work Mode', 'Location', 'Applied Date', 'Deadline', 'Salary'];
    const rows = filteredApps.map(a => [
      `"${a.company.replace(/"/g, '""')}"`,
      `"${(a.jobTitle || a.role).replace(/"/g, '""')}"`,
      a.status,
      a.workMode,
      `"${a.location.replace(/"/g, '""')}"`,
      a.applicationDate,
      a.deadline,
      `"${(a.salary || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `internly_analytics_report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DCE6E6]">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#087E83] uppercase block mb-1">
            RECRUITMENT PERFORMANCE REPORT
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-display text-[#155456] tracking-tight">
            Analytics
          </h2>
          <p className="text-base text-[#687879] mt-1.5 max-w-2xl leading-relaxed">
            A clearer view of your application progress and interview preparation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center p-1 bg-white border border-[#DCE6E6] rounded-xl shadow-xs">
            {dateFilterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  dateRange === opt.value
                    ? 'bg-[#087E83] text-white shadow-xs font-bold'
                    : 'text-[#687879] hover:text-[#202729]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {dateRange !== 'all' && (
            <button
              onClick={() => setDateRange('all')}
              className="p-2 text-[#687879] hover:text-[#087E83] bg-white border border-[#DCE6E6] rounded-xl transition-colors shadow-xs"
              title="Reset date filter to All Time"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={exportToCSV}
            disabled={filteredApps.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#155456] bg-white hover:bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#087E83]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Brand-new account notice */}
      {applications.length === 0 && (
        <div className="p-5 bg-[#E1F0EF] border border-[#087E83]/20 rounded-2xl text-sm text-[#155456]">
          <strong className="block font-bold mb-0.5">Nothing to chart yet</strong>
          Add your first application and your numbers, funnel and charts will appear here.
        </div>
      )}

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#687879] block mb-2">
              Total Applications
            </span>
            <div className="text-4xl font-serif-display text-[#155456] tabular-nums">
              {analytics.totalApplications}
            </div>
          </div>
          <p className="text-xs text-[#687879] mt-3 pt-3 border-t border-[#DCE6E6]">
            Opportunities recorded in the selected window
          </p>
        </div>

        <div className="p-6 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#087E83]">
                Response Rate
              </span>
              <span className="text-[10px] text-[#087E83] bg-[#E1F0EF] px-2 py-0.5 rounded font-bold">
                {respondedApps}/{analytics.totalApplications}
              </span>
            </div>
            <div className="text-4xl font-serif-display text-[#087E83] tabular-nums">
              {responseRate}%
            </div>
          </div>
          <p className="text-xs text-[#687879] mt-3 pt-3 border-t border-[#DCE6E6]">
            Roles that moved past the initial application
          </p>
        </div>

        <div className="p-6 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C28A35]">
                Interview Rate
              </span>
              <span className="text-[10px] text-[#C28A35] bg-[#FDF5E8] px-2 py-0.5 rounded font-bold">
                {analytics.interviewOrOfferCount}/{analytics.totalApplications}
              </span>
            </div>
            <div className="text-4xl font-serif-display text-[#C28A35] tabular-nums">
              {analytics.interviewRate}%
            </div>
          </div>
          <p className="text-xs text-[#687879] mt-3 pt-3 border-t border-[#DCE6E6]">
            Reached an interview stage or beyond
          </p>
        </div>

        <div className="p-6 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#278567]">
                Offer Rate
              </span>
              <span className="text-[10px] text-[#278567] bg-[#E7F3EF] px-2 py-0.5 rounded font-bold">
                {analytics.offersCount} offer{analytics.offersCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="text-4xl font-serif-display text-[#278567] tabular-nums">
              {analytics.offerRate}%
            </div>
          </div>
          <p className="text-xs text-[#687879] mt-3 pt-3 border-t border-[#DCE6E6]">
            Offers relative to total applications
          </p>
        </div>
      </div>

      {/* Activity & Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="pb-3 border-b border-[#DCE6E6] mb-4">
              <h3 className="text-xl font-bold text-[#155456]">Application Activity Over Time</h3>
              <p className="text-sm text-[#687879] mt-0.5">
                Cumulative applications by the date you applied
              </p>
            </div>

            {analytics.timelineData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-[#687879]">
                No applications in this timeframe.
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#087E83" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#087E83" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCE6E6" />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fill: '#687879', fontSize: 11 }}
                      axisLine={{ stroke: '#DCE6E6' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#687879', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val} applications`, 'Cumulative']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #DCE6E6',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#087E83"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorTeal)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#DCE6E6] flex items-center justify-between text-xs text-[#687879]">
            <span>Based on your recorded application dates</span>
            <span className="font-semibold text-[#155456]">Total: {analytics.totalApplications}</span>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="pb-3 border-b border-[#DCE6E6] mb-4">
              <h3 className="text-xl font-bold text-[#155456]">Application Outcomes</h3>
              <p className="text-sm text-[#687879] mt-0.5">Where your applications stand today</p>
            </div>

            {analytics.totalApplications === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-[#687879]">
                No applications in this time range.
              </div>
            ) : (
              <div className="relative h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={96}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="name"
                    >
                      {donutData.map(entry => (
                        <Cell key={entry.name} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value} applications`, name]}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #DCE6E6',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-serif-display text-[#155456] tabular-nums">
                    {analytics.totalApplications}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-[#687879] font-bold">
                    Opportunities
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-[#DCE6E6]">
            {analytics.statusBreakdown.map(st => (
              <div key={st.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                <span className="text-[#687879] truncate">{st.name}:</span>
                <span className="font-bold text-[#202729] tabular-nums">{st.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funnel, Work Mode, Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-[#DCE6E6]">
            <h3 className="text-xl font-bold text-[#155456]">Application Progression Funnel</h3>
            <p className="text-sm text-[#687879] mt-0.5">
              Based on each application's current status, so these aren't strict sequential steps.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {progressionStages.map(stage => (
              <div key={stage.stage} className="p-4 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="font-bold text-[#202729] text-sm">{stage.stage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#155456] text-sm tabular-nums">
                      {stage.count} role{stage.count === 1 ? '' : 's'}
                    </span>
                    <span className="text-xs text-[#687879] tabular-nums font-semibold">
                      ({stage.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-[#DCE6E6] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${stage.percentage}%`, backgroundColor: stage.color }}
                  />
                </div>

                <p className="text-xs text-[#687879]">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-4">
            <h3 className="text-xl font-bold text-[#155456] pb-2 border-b border-[#DCE6E6]">
              Work Mode Breakdown
            </h3>

            <div className="space-y-3">
              {analytics.workModeBreakdown.map(mode => (
                <div key={mode.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#202729] font-semibold">{mode.name}</span>
                    <span className="text-[#687879] tabular-nums">
                      {mode.count} ({mode.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F5F8F8] rounded-full overflow-hidden border border-[#DCE6E6]/40">
                    <div className="h-full bg-[#087E83] rounded-full" style={{ width: `${mode.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DCE6E6]">
              <Info className="w-5 h-5 text-[#087E83]" />
              <h3 className="text-xl font-bold text-[#155456]">Key Observations</h3>
            </div>

            <div className="space-y-3">
              {keyObservations.map((obs, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl flex items-start gap-3 text-xs leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#087E83] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#155456] mb-0.5 font-bold">{obs.title}</strong>
                    <span className="text-[#202729]">{obs.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interview Preparation */}
      <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E6] gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E1F0EF] text-[#087E83]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#155456]">Interview Preparation</h3>
              <p className="text-sm text-[#687879] mt-0.5">
                Question progress is all-time. Sessions follow the date filter above.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FDF5E8] text-[#C28A35] rounded-xl text-xs font-bold">
            <Flame className="w-4 h-4" />
            <span>
              {streakStats.streakDays} day{streakStats.streakDays === 1 ? '' : 's'} practice streak
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#687879] block">Completed</span>
            <span className="text-2xl font-bold text-[#278567] tabular-nums block mt-1">
              {interviewStats.completed}
            </span>
            <span className="text-xs text-[#687879]">of {interviewStats.totalQuestions} questions</span>
          </div>
          <div className="p-4 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#687879] block">In Progress</span>
            <span className="text-2xl font-bold text-[#C28A35] tabular-nums block mt-1">
              {interviewStats.practicing}
            </span>
            <span className="text-xs text-[#687879]">being practised</span>
          </div>
          <div className="p-4 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#687879] block">Mock Sessions</span>
            <span className="text-2xl font-bold text-[#155456] tabular-nums block mt-1">
              {interviewStats.sessionsCount}
            </span>
            <span className="text-xs text-[#687879]">{interviewStats.totalMinutes} min total</span>
          </div>
          <div className="p-4 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#687879] block">Avg Confidence</span>
            <span className="text-2xl font-bold text-[#087E83] tabular-nums block mt-1">
              {interviewStats.averageConfidence === null ? '—' : `${interviewStats.averageConfidence} / 5`}
            </span>
            <span className="text-xs text-[#687879]">
              {interviewStats.averageConfidence === null ? 'no sessions yet' : 'across sessions'}
            </span>
          </div>
          <div className="col-span-2 lg:col-span-1 p-4 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#687879] block">Saved</span>
            <span className="text-2xl font-bold text-[#087E83] tabular-nums block mt-1">
              {interviewStats.saved}
            </span>
            <span className="text-xs text-[#687879]">bookmarked</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#687879]">
            Completion by track
          </h4>
          {interviewStats.byTrack.map(track => (
            <div key={track.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#202729] font-semibold">{track.name}</span>
                <span className="text-[#687879] tabular-nums">
                  {track.completed}/{track.total} ({track.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#F5F8F8] rounded-full overflow-hidden border border-[#DCE6E6]/40">
                <div className="h-full bg-[#278567] rounded-full" style={{ width: `${track.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};