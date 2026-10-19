import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  FileText,
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  CheckSquare,
  Square,
  Flag,
  Share2,
  ChevronDown,
} from 'lucide-react';
import { Application, ApplicationStatus, WorkMode, ApplicationPriority } from '../../types';

type SortOption = 'newest' | 'oldest' | 'deadline' | 'company' | 'role' | 'priority';

interface ApplicationsPageProps {
  applications: Application[];
  onOpenNewApplicationModal: () => void;
  onSelectApplication: (app: Application) => void;
  onEditApplication: (app: Application) => void;
  onDeleteApplication: (app: Application) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onToggleFollowUpCompleted?: (id: string) => void;
  initialSearchQuery?: string;
  defaultViewMode?: 'table' | 'board';
  defaultSortBy?: SortOption;
}

const STATUS_TAGS: Record<ApplicationStatus, { label: string; text: string; bg: string; dot: string }> = {
  Interested: { label: 'Interested', text: 'text-[#687879]', bg: 'bg-[#F5F8F8]', dot: 'bg-[#687879]' },
  Applied: { label: 'Applied', text: 'text-[#155456]', bg: 'bg-[#E1F0EF]', dot: 'bg-[#087E83]' },
  Interview: { label: 'Interview', text: 'text-[#C28A35]', bg: 'bg-[#FDF5E8]', dot: 'bg-[#C28A35]' },
  Offered: { label: 'Offered', text: 'text-[#278567]', bg: 'bg-[#E7F3EF]', dot: 'bg-[#278567]' },
  Rejected: { label: 'Rejected', text: 'text-[#C64D4D]', bg: 'bg-[#FBECEC]', dot: 'bg-[#C64D4D]' },
};

const KANBAN_COLUMNS: { id: ApplicationStatus; label: string; dot: string }[] = [
  { id: 'Interested', label: 'Interested', dot: 'bg-[#687879]' },
  { id: 'Applied', label: 'Applied', dot: 'bg-[#087E83]' },
  { id: 'Interview', label: 'Interview', dot: 'bg-[#C28A35]' },
  { id: 'Offered', label: 'Offered', dot: 'bg-[#278567]' },
  { id: 'Rejected', label: 'Rejected', dot: 'bg-[#C64D4D]' },
];

export const ApplicationsPage: React.FC<ApplicationsPageProps> = ({
  applications,
  onOpenNewApplicationModal,
  onSelectApplication,
  onEditApplication,
  onDeleteApplication,
  onStatusChange,
  onToggleFollowUpCompleted,
  initialSearchQuery = '',
  defaultViewMode = 'table',
  defaultSortBy = 'newest',
}) => {
  // Starts from the defaults saved in Settings
  const [viewMode, setViewMode] = useState<'table' | 'board'>(defaultViewMode);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeShortcut, setActiveShortcut] = useState<'all' | 'active' | 'interview' | 'offer' | 'high_priority'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [workModeFilter, setWorkModeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>(defaultSortBy);

  // If the saved defaults change (profile finishes loading, or Settings is saved), follow them
  useEffect(() => {
    setViewMode(defaultViewMode);
  }, [defaultViewMode]);

  useEffect(() => {
    setSortBy(defaultSortBy);
  }, [defaultSortBy]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    // Shortcuts
    if (activeShortcut === 'active') {
      result = result.filter(a => a.status === 'Applied' || a.status === 'Interview');
    } else if (activeShortcut === 'interview') {
      result = result.filter(a => a.status === 'Interview');
    } else if (activeShortcut === 'offer') {
      result = result.filter(a => a.status === 'Offered');
    } else if (activeShortcut === 'high_priority') {
      result = result.filter(a => a.priority === 'High');
    }

    // Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        a =>
          a.company.toLowerCase().includes(q) ||
          (a.jobTitle && a.jobTitle.toLowerCase().includes(q)) ||
          (a.role && a.role.toLowerCase().includes(q)) ||
          a.location.toLowerCase().includes(q) ||
          a.notes.toLowerCase().includes(q)
      );
    }

    // Dropdown filters
    if (statusFilter !== 'All') {
      result = result.filter(a => a.status === statusFilter);
    }
    if (workModeFilter !== 'All') {
      result = result.filter(a => a.workMode === workModeFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.applicationDate || b.createdAt).getTime() - new Date(a.applicationDate || a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.applicationDate || a.createdAt).getTime() - new Date(b.applicationDate || b.createdAt).getTime();
      }
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      if (sortBy === 'role') {
        return (a.jobTitle || a.role).localeCompare(b.jobTitle || b.role);
      }
      if (sortBy === 'priority') {
        const pOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        return (pOrder[b.priority || 'Medium'] || 0) - (pOrder[a.priority || 'Medium'] || 0);
      }
      return 0;
    });

    return result;
  }, [applications, searchQuery, activeShortcut, statusFilter, workModeFilter, sortBy]);

  // Grouped for Kanban
  const groupedByStatus = useMemo(() => {
    const map: Record<ApplicationStatus, Application[]> = {
      Interested: [],
      Applied: [],
      Interview: [],
      Offered: [],
      Rejected: [],
    };
    filteredApplications.forEach(app => {
      if (map[app.status]) {
        map[app.status].push(app);
      }
    });
    return map;
  }, [filteredApplications]);

  const hasActiveFilters =
    searchQuery !== '' || statusFilter !== 'All' || workModeFilter !== 'All' || activeShortcut !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setActiveShortcut('all');
    setStatusFilter('All');
    setWorkModeFilter('All');
    setSortBy(defaultSortBy);
  };

  const exportToCSV = () => {
    if (applications.length === 0) return;
    const headers = ['Company', 'Job Title', 'Status', 'Priority', 'Work Mode', 'Location', 'Applied Date', 'Deadline', 'Salary', 'Notes'];
    const rows = applications.map(a => [
      `"${a.company.replace(/"/g, '""')}"`,
      `"${(a.jobTitle || a.role).replace(/"/g, '""')}"`,
      a.status,
      a.priority || 'Medium',
      a.workMode,
      `"${a.location.replace(/"/g, '""')}"`,
      a.applicationDate,
      a.deadline,
      `"${(a.salary || '').replace(/"/g, '""')}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `internly_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DCE6E6]">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#087E83] uppercase block mb-1">
            APPLICATION TRACKER
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-display text-[#155456] tracking-tight">
            Applications
          </h2>
          <p className="text-base text-[#687879] mt-1.5 max-w-2xl leading-relaxed">
            Every opportunity, organized in one place.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F5F8F8] text-[#202729] border border-[#DCE6E6] text-sm font-semibold rounded-xl shadow-xs transition-colors"
            title="Export applications to CSV"
          >
            <Download className="w-4 h-4 text-[#687879]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onOpenNewApplicationModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#087E83] hover:bg-[#155456] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add application</span>
          </button>
        </div>
      </div>

      {/* Filter Shortcuts & Quick Chips */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all' as const, label: 'All Opportunities', count: applications.length },
            {
              id: 'active' as const,
              label: 'Active Pipeline',
              count: applications.filter(a => a.status === 'Applied' || a.status === 'Interview').length,
            },
            {
              id: 'interview' as const,
              label: 'Interviews',
              count: applications.filter(a => a.status === 'Interview').length,
            },
            {
              id: 'offer' as const,
              label: 'Offers',
              count: applications.filter(a => a.status === 'Offered').length,
            },
            {
              id: 'high_priority' as const,
              label: 'High Priority',
              count: applications.filter(a => a.priority === 'High').length,
            },
          ].map(chip => {
            const isActive = activeShortcut === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveShortcut(chip.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#155456] text-white border-[#155456] shadow-xs'
                    : 'bg-white text-[#687879] border-[#DCE6E6] hover:bg-[#F5F8F8] hover:text-[#202729]'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full tabular-nums font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#E1F0EF] text-[#087E83]'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-white rounded-xl border border-[#DCE6E6] shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-[#087E83] text-white shadow-xs font-bold'
                : 'text-[#687879] hover:text-[#202729]'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Table View</span>
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'board'
                ? 'bg-[#087E83] text-white shadow-xs font-bold'
                : 'text-[#687879] hover:text-[#202729]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Kanban Board</span>
          </button>
        </div>
      </div>

      {/* Search & Granular Filter Bar */}
      <div className="p-4 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Search input */}
        <div className="relative min-w-[260px] sm:min-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687879]" />
          <input
            type="text"
            placeholder="Search company, job title, or personal notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-sm bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-[#202729] placeholder-[#687879] focus:bg-white focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687879] hover:text-[#202729]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#687879]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-[#202729] font-medium focus:outline-none focus:border-[#087E83]"
            >
              <option value="All">All Statuses</option>
              <option value="Interested">Interested</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#687879]">Mode:</span>
            <select
              value={workModeFilter}
              onChange={e => setWorkModeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-[#202729] font-medium focus:outline-none focus:border-[#087E83]"
            >
              <option value="All">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-4 h-4 text-[#687879]" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 text-xs bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-[#202729] font-medium focus:outline-none focus:border-[#087E83]"
            >
              <option value="newest">Newest Applied</option>
              <option value="oldest">Oldest Applied</option>
              <option value="deadline">Soonest Deadline</option>
              <option value="priority">Highest Priority</option>
              <option value="company">Company (A-Z)</option>
              <option value="role">Role (A-Z)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-xs text-[#087E83] hover:bg-[#E1F0EF] rounded-lg transition-colors font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content View (Table is DEFAULT; Kanban is alternative) */}
      {viewMode === 'table' ? (
        /* Full-Width Spacious Table: Expands naturally with no small scrollbox trap */
        <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F8F8] border-b border-[#DCE6E6] text-[11px] font-bold text-[#687879] uppercase tracking-wider">
                  <th className="py-4 px-5">Organization & Role</th>
                  <th className="py-4 px-4">Stage</th>
                  <th className="py-4 px-3">Priority</th>
                  <th className="py-4 px-4">Work Mode</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Date Applied</th>
                  <th className="py-4 px-4">Next Deadline / Follow-up</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6E6] text-sm">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-[#687879]">
                      <div className="max-w-md mx-auto space-y-3">
                        <FileText className="w-10 h-10 text-[#687879]/40 mx-auto" />
                        <h4 className="text-base font-bold text-[#155456]">No applications found</h4>
                        <p className="text-sm text-[#687879]">
                          {hasActiveFilters
                            ? 'No applications match your active filters or search terms.'
                            : 'Start by tracking your first internship application.'}
                        </p>
                        {hasActiveFilters ? (
                          <button
                            onClick={resetFilters}
                            className="px-4 py-2 text-xs font-semibold text-[#087E83] bg-[#E1F0EF] rounded-xl hover:bg-[#D4E8E7]"
                          >
                            Clear all filters
                          </button>
                        ) : (
                          <button
                            onClick={onOpenNewApplicationModal}
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#087E83] rounded-xl hover:bg-[#155456]"
                          >
                            + Add application
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map(app => (
                    <tr
                      key={app.id}
                      onClick={() => onSelectApplication(app)}
                      className="hover:bg-[#F5F8F8]/80 cursor-pointer transition-colors group"
                    >
                      {/* Organization & Role */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-[#155456] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                            {app.company.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[#155456] text-base block group-hover:text-[#087E83] transition-colors truncate">
                              {app.company}
                            </span>
                            <span className="text-sm text-[#687879] truncate block mt-0.5">
                              {app.jobTitle || app.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Stage Dropdown */}
                      <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={app.status}
                            onChange={e => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border border-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#087E83]/30 ${
                              STATUS_TAGS[app.status].bg
                            } ${STATUS_TAGS[app.status].text}`}
                          >
                            <option value="Interested">Interested</option>
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Offered">Offered</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                            app.priority === 'High'
                              ? 'bg-[#E1F0EF] text-[#087E83] font-bold'
                              : app.priority === 'Low'
                              ? 'bg-[#F5F8F8] text-[#687879]'
                              : 'bg-[#F5F8F8] text-[#155456]'
                          }`}
                        >
                          {app.priority || 'Medium'}
                        </span>
                      </td>

                      {/* Work Mode */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-[#F5F8F8] border border-[#DCE6E6] text-xs font-medium text-[#202729]">
                          {app.workMode}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 text-sm text-[#687879] truncate max-w-[160px]">
                        {app.location}
                      </td>

                      {/* Date Applied */}
                      <td className="py-4 px-4 text-sm font-mono text-[#202729] whitespace-nowrap">
                        {app.applicationDate}
                      </td>

                      {/* Next Deadline or Follow-up */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        {app.interviewDate ? (
                          <div className="flex items-center gap-1.5 text-sm text-[#C28A35] font-semibold">
                            <Calendar className="w-4 h-4" />
                            <span>Int: {app.interviewDate}</span>
                          </div>
                        ) : app.followUpDate ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onToggleFollowUpCompleted && onToggleFollowUpCompleted(app.id)}
                              className="text-[#687879] hover:text-[#087E83] transition-colors"
                              title={app.followUpCompleted ? 'Mark uncompleted' : 'Mark follow-up done'}
                            >
                              {app.followUpCompleted ? (
                                <CheckSquare className="w-4 h-4 text-[#278567]" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                            <span
                              className={`text-xs font-mono ${
                                app.followUpCompleted ? 'line-through text-[#687879]' : 'text-[#087E83] font-semibold'
                              }`}
                            >
                              F/U: {app.followUpDate}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#687879] font-mono">
                            Due: {app.deadline}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {app.applicationUrl && (
                            <a
                              href={app.applicationUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="p-2 text-[#687879] hover:text-[#087E83] hover:bg-[#E1F0EF] rounded-lg transition-colors"
                              title="Open career portal"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => onEditApplication(app)}
                            className="p-2 text-[#687879] hover:text-[#087E83] hover:bg-[#E1F0EF] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteApplication(app)}
                            className="p-2 text-[#687879] hover:text-[#C64D4D] hover:bg-[#FBECEC] rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Spacious Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 items-start">
          {KANBAN_COLUMNS.map(col => {
            const items = groupedByStatus[col.id] || [];
            return (
              <div key={col.id} className="bg-[#F5F8F8] border border-[#DCE6E6] rounded-2xl p-4 flex flex-col min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE6E6]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <span className="text-sm font-bold text-[#155456]">{col.label}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-[#687879] border border-[#DCE6E6]">
                    {items.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1">
                  {items.length === 0 ? (
                    <div className="py-10 text-center text-xs text-[#687879]">
                      No opportunities
                    </div>
                  ) : (
                    items.map(app => (
                      <div
                        key={app.id}
                        onClick={() => onSelectApplication(app)}
                        className="p-4 bg-white border border-[#DCE6E6] hover:border-[#087E83] rounded-xl shadow-xs cursor-pointer transition-all hover:-translate-y-0.5 space-y-2.5 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-base font-bold text-[#155456] group-hover:text-[#087E83] transition-colors leading-snug">
                              {app.company}
                            </h4>
                            <p className="text-sm text-[#687879] line-clamp-1 mt-0.5">
                              {app.jobTitle || app.role}
                            </p>
                          </div>
                          {app.priority === 'High' && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#E1F0EF] text-[#087E83] shrink-0">
                              High
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#687879] flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-[#F5F8F8] border border-[#DCE6E6]">
                            {app.workMode}
                          </span>
                          <span className="truncate max-w-[130px]">{app.location}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[#687879] pt-2 border-t border-[#DCE6E6]">
                          <span className="font-mono">
                            {app.interviewDate ? `Int: ${app.interviewDate}` : `Due: ${app.deadline}`}
                          </span>
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => onEditApplication(app)}
                              className="p-1 hover:text-[#087E83]"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteApplication(app)}
                              className="p-1 hover:text-[#C64D4D]"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};