import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  Globe,
  Save,
  Flag,
  Share2,
  CheckSquare,
  Square,
  History,
} from 'lucide-react';
import { Application, ApplicationStatus } from '../../types';

interface ApplicationDetailModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onToggleFollowUpCompleted?: (id: string) => void;
}

const STATUS_TAGS: Record<ApplicationStatus, { text: string; bg: string }> = {
  Interested: { text: 'text-[#687879]', bg: 'bg-[#F5F8F8]' },
  Applied: { text: 'text-[#155456]', bg: 'bg-[#E1F0EF]' },
  Interview: { text: 'text-[#C28A35]', bg: 'bg-[#FDF5E8]' },
  Offered: { text: 'text-[#278567]', bg: 'bg-[#E7F3EF]' },
  Rejected: { text: 'text-[#C64D4D]', bg: 'bg-[#FBECEC]' },
};

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onUpdateNotes,
  onToggleFollowUpCompleted,
}) => {
  if (!isOpen || !application) return null;

  const [notes, setNotes] = useState(application.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedAlert, setNotesSavedAlert] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details');

  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    onUpdateNotes(application.id, notes);
    setTimeout(() => {
      setIsSavingNotes(false);
      setNotesSavedAlert(true);
      setTimeout(() => setNotesSavedAlert(false), 2000);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#DCE6E6] my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#DCE6E6] bg-[#F5F8F8]">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#155456] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-xs">
              {application.company.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-[#155456] tracking-tight truncate">
                  {application.company}
                </h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    STATUS_TAGS[application.status].bg
                  } ${STATUS_TAGS[application.status].text}`}
                >
                  {application.status}
                </span>
                <span className="text-xs text-[#687879] font-medium px-2.5 py-0.5 rounded-md bg-[#DCE6E6]">
                  {application.workMode}
                </span>
                {application.priority && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      application.priority === 'High'
                        ? 'bg-[#E1F0EF] text-[#087E83]'
                        : 'bg-[#F5F8F8] text-[#687879]'
                    }`}
                  >
                    {application.priority} Priority
                  </span>
                )}
              </div>
              <p className="text-sm text-[#202729] font-semibold mt-1">
                {application.jobTitle || application.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(application)}
              className="p-2 text-[#687879] hover:text-[#087E83] hover:bg-[#E1F0EF] rounded-xl transition-colors"
              title="Edit application"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(application)}
              className="p-2 text-[#687879] hover:text-[#C64D4D] hover:bg-[#FBECEC] rounded-xl transition-colors"
              title="Delete application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#687879] hover:text-[#202729] hover:bg-[#DCE6E6] rounded-xl transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (Details vs Activity Timeline) */}
        <div className="flex items-center px-6 border-b border-[#DCE6E6] bg-white gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-[#087E83] text-[#087E83]'
                : 'border-transparent text-[#687879] hover:text-[#202729]'
            }`}
          >
            Application Overview
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-[#087E83] text-[#087E83]'
                : 'border-transparent text-[#687879] hover:text-[#202729]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Activity Timeline</span>
            {application.timeline && application.timeline.length > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-[#E1F0EF] text-[#087E83] font-bold">
                {application.timeline.length}
              </span>
            )}
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {activeTab === 'details' ? (
            <>
              {/* Status Quick Switcher Strip */}
              <div className="p-3.5 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl flex items-center justify-between gap-3 flex-wrap">
                <span className="text-sm font-semibold text-[#155456]">
                  Update Pipeline Stage:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['Interested', 'Applied', 'Interview', 'Offered', 'Rejected'] as ApplicationStatus[]).map(st => {
                    const isCurrent = application.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => onStatusChange(application.id, st)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          isCurrent
                            ? 'bg-[#155456] text-white shadow-xs font-bold'
                            : 'bg-white border border-[#DCE6E6] text-[#687879] hover:border-[#087E83] hover:text-[#087E83]'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white border border-[#DCE6E6] rounded-xl">
                  <span className="text-xs text-[#687879] block mb-1">Location</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#202729]">
                    <MapPin className="w-4 h-4 text-[#687879] shrink-0" />
                    <span className="truncate">{application.location}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-[#DCE6E6] rounded-xl">
                  <span className="text-xs text-[#687879] block mb-1">Compensation</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#278567]">
                    <DollarSign className="w-4 h-4 shrink-0" />
                    <span className="truncate">{application.salary || 'Unspecified'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-[#DCE6E6] rounded-xl">
                  <span className="text-xs text-[#687879] block mb-1">Date Applied</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#202729] font-mono">
                    <Calendar className="w-4 h-4 text-[#687879] shrink-0" />
                    <span>{application.applicationDate}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-[#DCE6E6] rounded-xl">
                  <span className="text-xs text-[#687879] block mb-1">Deadline</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#C28A35] font-mono">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{application.deadline}</span>
                  </div>
                </div>
              </div>

              {/* Follow-up reminder banner */}
              {application.followUpDate && (
                <div className="p-4 bg-[#E1F0EF] border border-[#087E83]/30 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleFollowUpCompleted && onToggleFollowUpCompleted(application.id)}
                      className="text-[#087E83] hover:text-[#155456] transition-colors"
                      title={application.followUpCompleted ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      {application.followUpCompleted ? (
                        <CheckSquare className="w-5 h-5 text-[#278567]" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="text-sm font-bold text-[#155456]">
                        Follow-up Scheduled: <span className="font-mono">{application.followUpDate}</span>
                      </div>
                      <p className="text-xs text-[#687879]">
                        {application.followUpCompleted
                          ? 'Follow-up marked as completed.'
                          : 'Reach out to recruiter or check status portal.'}
                      </p>
                    </div>
                  </div>
                  {application.followUpCompleted ? (
                    <span className="text-xs font-bold text-[#278567] bg-[#E7F3EF] px-2.5 py-1 rounded-md">
                      Completed
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-[#087E83] bg-white px-2.5 py-1 rounded-md shadow-xs">
                      Pending
                    </span>
                  )}
                </div>
              )}

              {/* Interview scheduled banner if present */}
              {application.interviewDate && (
                <div className="p-4 bg-[#FDF5E8] border border-[#C28A35]/30 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-5 h-5 text-[#C28A35] shrink-0" />
                    <div className="text-sm">
                      <span className="font-bold text-[#155456]">Upcoming Interview: </span>
                      <span className="text-[#202729] font-mono font-semibold">
                        {application.interviewDate}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#C28A35] uppercase tracking-wider">
                    Confirmed Round
                  </span>
                </div>
              )}

              {/* Links Strip */}
              <div className="flex items-center gap-3 flex-wrap">
                {application.applicationUrl && (
                  <a
                    href={application.applicationUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#087E83] hover:bg-[#155456] rounded-xl transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Application Portal</span>
                  </a>
                )}
                {application.companyWebsite && (
                  <a
                    href={application.companyWebsite}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#202729] bg-[#F5F8F8] hover:bg-[#DCE6E6] border border-[#DCE6E6] rounded-xl transition-colors"
                  >
                    <Globe className="w-4 h-4 text-[#687879]" />
                    <span>Company Website</span>
                  </a>
                )}
                {application.source && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#687879] bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl">
                    <Share2 className="w-3.5 h-3.5 text-[#087E83]" />
                    <span>Source: {application.source}</span>
                  </span>
                )}
              </div>

              {/* Job Description */}
              {application.jobDescription && (
                <div>
                  <h3 className="text-xs font-bold text-[#155456] uppercase tracking-wider mb-2">
                    Job Overview & Core Requirements
                  </h3>
                  <div className="p-4 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-sm text-[#202729] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {application.jobDescription}
                  </div>
                </div>
              )}

              {/* Personal Strategy Notes with inline save */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-[#155456] uppercase tracking-wider">
                    Personal Strategy & Interview Notes
                  </h3>
                  {notesSavedAlert && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#278567]">
                      <CheckCircle2 className="w-4 h-4" /> Notes saved
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Record interviewer names, questions asked, team culture notes, follow-up timelines..."
                  className="w-full p-3.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes || notes === application.notes}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                      notes === application.notes
                        ? 'text-[#687879] bg-[#F5F8F8] border border-[#DCE6E6] cursor-not-allowed'
                        : 'text-white bg-[#087E83] hover:bg-[#155456]'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Timeline Tab */
            <div className="space-y-4">
              <div className="pb-3 border-b border-[#DCE6E6]">
                <h3 className="text-sm font-bold text-[#155456]">
                  Application Activity Log
                </h3>
                <p className="text-xs text-[#687879] mt-0.5">
                  Chronological progression of submissions, status changes, and interview events.
                </p>
              </div>

              {!application.timeline || application.timeline.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#687879]">
                  No historical activity events recorded yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DCE6E6]">
                  {application.timeline.map((evt, idx) => (
                    <div key={evt.id || idx} className="relative">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#087E83] ring-4 ring-white" />
                      <div className="p-3.5 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#155456] text-sm">{evt.title}</span>
                          <span className="text-[#687879] font-mono">
                            {new Date(evt.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {evt.description && (
                          <p className="text-xs text-[#202729] leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#DCE6E6] bg-[#F5F8F8]">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-[#202729] hover:bg-[#DCE6E6] rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
