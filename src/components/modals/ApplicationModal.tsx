import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Link as LinkIcon,
  Check,
  AlertTriangle,
  Flag,
  Share2,
  FileText,
} from 'lucide-react';
import {
  Application,
  ApplicationStatus,
  WorkMode,
  ApplicationPriority,
  ApplicationSource,
} from '../../types';
import { todayLocalISO, addDaysISO } from '../../utils/dates';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: Application) => void | Promise<void>;
  applicationToEdit?: Application | null;
  existingApplications?: Application[];
}

const isHttpUrl = (value: string) => value.startsWith('http://') || value.startsWith('https://');

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  applicationToEdit,
  existingApplications = [],
}) => {
  const isEditing = Boolean(applicationToEdit);

  // Form states
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [priority, setPriority] = useState<ApplicationPriority>('High');
  const [source, setSource] = useState<ApplicationSource>('Company Website');
  const [workMode, setWorkMode] = useState<WorkMode>('Hybrid');
  const [location, setLocation] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [applicationDate, setApplicationDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [salary, setSalary] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [jobDescription, setJobDescription] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (applicationToEdit) {
      setCompany(applicationToEdit.company);
      setJobTitle(applicationToEdit.jobTitle || applicationToEdit.role || '');
      setStatus(applicationToEdit.status);
      setPriority(applicationToEdit.priority || 'Medium');
      setSource(applicationToEdit.source || 'Company Website');
      setWorkMode(applicationToEdit.workMode);
      setLocation(applicationToEdit.location);
      setApplicationUrl(applicationToEdit.applicationUrl || '');
      setCompanyWebsite(applicationToEdit.companyWebsite || '');
      setApplicationDate(applicationToEdit.applicationDate || todayLocalISO());
      setDeadline(applicationToEdit.deadline);
      setFollowUpDate(applicationToEdit.followUpDate || '');
      setInterviewDate(applicationToEdit.interviewDate || '');
      setSalary(applicationToEdit.salary || '');
      setCurrency(applicationToEdit.currency || 'USD');
      setJobDescription(applicationToEdit.jobDescription || '');
      setNotes(applicationToEdit.notes || '');
    } else {
      setCompany('');
      setJobTitle('');
      setStatus('Applied');
      setPriority('High');
      setSource('Company Website');
      setWorkMode('Hybrid');
      setLocation('');
      setApplicationUrl('');
      setCompanyWebsite('');
      setApplicationDate(todayLocalISO());
      setDeadline(addDaysISO(30));
      setFollowUpDate('');
      setInterviewDate('');
      setSalary('');
      setCurrency('USD');
      setJobDescription('');
      setNotes('');
    }
    setErrors({});
    setSubmitError(null);
    setDuplicateWarning(null);
  }, [applicationToEdit, isOpen]);

  // Check for duplicates
  useEffect(() => {
    if (!company.trim() || !jobTitle.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const cleanCo = company.trim().toLowerCase();
    const cleanRole = jobTitle.trim().toLowerCase();
    const isDup = existingApplications.some(
      a =>
        a.id !== applicationToEdit?.id &&
        a.company.trim().toLowerCase() === cleanCo &&
        (a.jobTitle || a.role).trim().toLowerCase().includes(cleanRole)
    );
    if (isDup) {
      setDuplicateWarning(`Notice: An application for ${company} (${jobTitle}) already exists in your tracker.`);
    } else {
      setDuplicateWarning(null);
    }
  }, [company, jobTitle, existingApplications, applicationToEdit]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!company.trim()) {
      errs.company = 'Company name is required';
    }
    if (!jobTitle.trim()) {
      errs.jobTitle = 'Job title is required';
    }
    if (!location.trim()) {
      errs.location = 'Location is required';
    }
    if (!applicationDate) {
      errs.applicationDate = 'Application date is required';
    }
    if (!deadline) {
      errs.deadline = 'Application deadline is required';
    }
    if (applicationUrl.trim() && !isHttpUrl(applicationUrl.trim())) {
      errs.applicationUrl = 'Must start with http:// or https://';
    }
    if (companyWebsite.trim() && !isHttpUrl(companyWebsite.trim())) {
      errs.companyWebsite = 'Must start with http:// or https://';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const existingTimeline = applicationToEdit?.timeline || [];
    const nowIso = new Date().toISOString();

    const timelineEvents = [...existingTimeline];
    if (!isEditing) {
      timelineEvents.push({
        id: `evt-${Date.now()}-1`,
        type: 'created',
        title: 'Application Created',
        description: `Tracked opportunity for ${company} (${jobTitle}).`,
        timestamp: nowIso,
      });
    } else if (applicationToEdit && applicationToEdit.status !== status) {
      timelineEvents.push({
        id: `evt-${Date.now()}-status`,
        type: 'status_change',
        title: `Status Changed to ${status}`,
        description: `Updated status from ${applicationToEdit.status} to ${status}.`,
        timestamp: nowIso,
      });
    }

    if (interviewDate && (!applicationToEdit || applicationToEdit.interviewDate !== interviewDate)) {
      timelineEvents.push({
        id: `evt-${Date.now()}-int`,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        description: `Interview confirmed for ${interviewDate}.`,
        timestamp: nowIso,
      });
    }

    const newApp: Application = {
      id: applicationToEdit ? applicationToEdit.id : `app-${Date.now()}`,
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      role: jobTitle.trim(),
      status,
      priority,
      source,
      workMode,
      location: location.trim(),
      applicationUrl: applicationUrl.trim(),
      companyWebsite: companyWebsite.trim() || undefined,
      applicationDate,
      deadline,
      followUpDate: followUpDate || undefined,
      followUpCompleted: applicationToEdit?.followUpCompleted || false,
      interviewDate: interviewDate || undefined,
      salary: salary.trim() || undefined,
      currency: currency.trim() || 'USD',
      jobDescription: jobDescription.trim(),
      notes: notes.trim(),
      timeline: timelineEvents,
      createdAt: applicationToEdit ? applicationToEdit.createdAt : nowIso,
      updatedAt: nowIso,
    };

    setSubmitError(null);
    setIsSaving(true);
    try {
      await onSave(newApp);
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Could not save the application. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#DCE6E6] my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCE6E6] bg-[#F5F8F8]">
          <div>
            <h2 className="text-xl font-bold text-[#155456] tracking-tight">
              {isEditing ? 'Edit Application Record' : 'Add Internship Opportunity'}
            </h2>
            <p className="text-sm text-[#687879] mt-0.5">
              Record organization details, deadlines, interview milestones, and strategic notes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#687879] hover:text-[#202729] hover:bg-[#DCE6E6] rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate Warning Alert */}
        {duplicateWarning && (
          <div className="mx-6 mt-4 p-3.5 bg-[#FDF5E8] border border-[#C28A35]/30 rounded-xl flex items-center gap-3 text-sm text-[#C28A35]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{duplicateWarning}</span>
          </div>
        )}

        {/* Save error alert */}
        {submitError && (
          <div className="mx-6 mt-4 p-3.5 bg-[#FBECEC] border border-[#C64D4D]/30 rounded-xl flex items-center gap-3 text-sm text-[#C64D4D]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Form Body - Logically Organized Sections */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Section 1: Role & Company */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DCE6E6]">
              <Building2 className="w-4 h-4 text-[#087E83]" />
              <h3 className="text-xs font-bold text-[#155456] uppercase tracking-wider">
                1. Role & Organization
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Company Name <span className="text-[#C64D4D]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stripe, Google, Figma"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-[#202729] focus:outline-none focus:ring-2 focus:ring-[#087E83]/20 transition-all ${
                    errors.company ? 'border-[#C64D4D]' : 'border-[#DCE6E6] focus:border-[#087E83]'
                  }`}
                />
                {errors.company && <p className="text-xs text-[#C64D4D] mt-1">{errors.company}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Job Title <span className="text-[#C64D4D]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineering Intern"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-[#202729] focus:outline-none focus:ring-2 focus:ring-[#087E83]/20 transition-all ${
                    errors.jobTitle ? 'border-[#C64D4D]' : 'border-[#DCE6E6] focus:border-[#087E83]'
                  }`}
                />
                {errors.jobTitle && <p className="text-xs text-[#C64D4D] mt-1">{errors.jobTitle}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Priority Level
                </label>
                <div className="flex gap-2">
                  {(['High', 'Medium', 'Low'] as ApplicationPriority[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        priority === p
                          ? p === 'High'
                            ? 'bg-[#E1F0EF] border-[#087E83] text-[#087E83] font-bold shadow-xs'
                            : 'bg-[#F5F8F8] border-[#155456] text-[#155456] font-bold shadow-xs'
                          : 'bg-white border-[#DCE6E6] text-[#687879] hover:bg-[#F5F8F8]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Source / Channel
                </label>
                <select
                  value={source}
                  onChange={e => setSource(e.target.value as ApplicationSource)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                >
                  <option value="Company Website">Company Website</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Job Board">Job Board (Handshake, Indeed)</option>
                  <option value="Referral">Alumni / Peer Referral</option>
                  <option value="University Portal">University Career Fair</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Current Pipeline Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ApplicationStatus)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] font-medium focus:outline-none focus:border-[#087E83]"
                >
                  <option value="Interested">Interested</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offered">Offered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Location, Work Mode & Links */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DCE6E6]">
              <MapPin className="w-4 h-4 text-[#087E83]" />
              <h3 className="text-xs font-bold text-[#155456] uppercase tracking-wider">
                2. Location, Work Mode & Links
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Location <span className="text-[#C64D4D]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83] ${
                    errors.location ? 'border-[#C64D4D]' : 'border-[#DCE6E6]'
                  }`}
                />
                {errors.location && <p className="text-xs text-[#C64D4D] mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Work Mode
                </label>
                <div className="flex gap-2">
                  {(['Hybrid', 'Remote', 'On-site'] as WorkMode[]).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setWorkMode(mode)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        workMode === mode
                          ? 'bg-[#E1F0EF] border-[#087E83] text-[#087E83] font-bold'
                          : 'bg-white border-[#DCE6E6] text-[#687879] hover:bg-[#F5F8F8]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Compensation / Stipend
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687879]" />
                  <input
                    type="text"
                    placeholder="e.g. $55 / hr + housing"
                    value={salary}
                    onChange={e => setSalary(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Application Portal URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687879]" />
                  <input
                    type="text"
                    placeholder="https://company.com/careers/apply"
                    value={applicationUrl}
                    onChange={e => setApplicationUrl(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83] ${
                      errors.applicationUrl ? 'border-[#C64D4D]' : 'border-[#DCE6E6]'
                    }`}
                  />
                </div>
                {errors.applicationUrl && (
                  <p className="text-xs text-[#C64D4D] mt-1">{errors.applicationUrl}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Company Website (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://company.com"
                  value={companyWebsite}
                  onChange={e => setCompanyWebsite(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83] ${
                    errors.companyWebsite ? 'border-[#C64D4D]' : 'border-[#DCE6E6]'
                  }`}
                />
                {errors.companyWebsite && (
                  <p className="text-xs text-[#C64D4D] mt-1">{errors.companyWebsite}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Key Dates & Milestones */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DCE6E6]">
              <Calendar className="w-4 h-4 text-[#087E83]" />
              <h3 className="text-xs font-bold text-[#155456] uppercase tracking-wider">
                3. Milestones & Timeline Dates
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Date Applied <span className="text-[#C64D4D]">*</span>
                </label>
                <input
                  type="date"
                  value={applicationDate}
                  onChange={e => setApplicationDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
                {errors.applicationDate && (
                  <p className="text-xs text-[#C64D4D] mt-1">{errors.applicationDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Deadline <span className="text-[#C64D4D]">*</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
                {errors.deadline && <p className="text-xs text-[#C64D4D] mt-1">{errors.deadline}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Follow-up Reminder Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Scheduled Interview Date
                </label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Content & Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DCE6E6]">
              <FileText className="w-4 h-4 text-[#087E83]" />
              <h3 className="text-xs font-bold text-[#155456] uppercase tracking-wider">
                4. Job Description & Strategy Notes
              </h3>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-[#202729]">
                  Job Description & Core Requirements
                </label>
                <span className="text-xs text-[#687879] font-mono">
                  {jobDescription.length} characters
                </span>
              </div>
              <textarea
                rows={4}
                placeholder="Paste the role requirements, qualifications, and tech stack bullets here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="w-full p-3.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                Personal Strategy & Recruiter Notes
              </label>
              <textarea
                rows={3}
                placeholder="Recruiter contact info, referral context, portfolio highlights mentioned..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full p-3.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCE6E6]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-[#687879] hover:text-[#202729] hover:bg-[#F5F8F8] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#087E83] hover:bg-[#155456] rounded-xl shadow-xs transition-colors disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>
                {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Application'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};