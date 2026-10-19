import React, { useState } from 'react';
import {
  Save,
  CheckCircle2,
  Download,
  ShieldCheck,
  Layout,
  Clock,
  Database,
  AlertCircle,
} from 'lucide-react';
import { Application, UserProfile } from '../../types';

interface SettingsPageProps {
  profile: UserProfile;
  applications: Application[];
  onUpdateProfile: (updated: UserProfile) => void | Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  profile,
  applications,
  onUpdateProfile,
}) => {
  const [defaultView, setDefaultView] = useState<'table' | 'kanban'>(
    profile.defaultApplicationView || 'table'
  );
  const [defaultSort, setDefaultSort] = useState<
    'newest' | 'oldest' | 'deadline' | 'company' | 'role' | 'priority'
  >(profile.defaultSortBy || 'newest');
  const [reminderDays, setReminderDays] = useState<number>(profile.followUpReminderDays ?? 3);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    profile.notificationsEnabled ?? true
  );

  const [savedAlert, setSavedAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setIsSaving(true);

    try {
      await onUpdateProfile({
        ...profile,
        defaultApplicationView: defaultView,
        defaultSortBy: defaultSort,
        followUpReminderDays: reminderDays,
        notificationsEnabled,
      });
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 2500);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Could not save your settings. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = () => {
    try {
      const { avatarUrl, ...profileWithoutPhoto } = profile;
      const backup = {
        version: 'internly-v4',
        exportDate: new Date().toISOString(),
        profile: profileWithoutPhoto,
        applications,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `internly_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export backup JSON', err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DCE6E6]">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#087E83] uppercase block mb-1">
            PLATFORM PREFERENCES & WORKSPACE CONFIGURATION
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-display text-[#155456] tracking-tight">
            Workspace Settings
          </h2>
          <p className="text-base text-[#687879] mt-1.5 max-w-2xl leading-relaxed">
            Customize application view preferences, follow-up deadlines, and export your data.
          </p>
        </div>

        {savedAlert && (
          <span className="flex items-center gap-1.5 px-4 py-2 bg-[#E7F3EF] text-[#278567] text-sm font-semibold rounded-xl animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {saveError && (
          <div className="flex items-start gap-2.5 p-3.5 bg-[#FBECEC] text-[#C64D4D] text-sm font-medium rounded-xl border border-[#C64D4D]/20">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Tracker defaults */}
        <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-[#DCE6E6]">
            <h3 className="text-xl font-bold text-[#155456] flex items-center gap-2">
              <Layout className="w-5 h-5 text-[#087E83]" />
              <span>1. Application Tracker Defaults</span>
            </h3>
            <p className="text-sm text-[#687879] mt-0.5">
              Choose your preferred view and default sorting order when opening the application tracker.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                Default View Mode
              </label>
              <select
                value={defaultView}
                onChange={e => setDefaultView(e.target.value as 'table' | 'kanban')}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] font-medium focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20"
              >
                <option value="table">Full Table View (Recommended for scanning)</option>
                <option value="kanban">Kanban Board (Stage columns)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                Default Sort Order
              </label>
              <select
                value={defaultSort}
                onChange={e => setDefaultSort(e.target.value as typeof defaultSort)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] font-medium focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20"
              >
                <option value="newest">Newest Application First</option>
                <option value="oldest">Oldest Application First</option>
                <option value="deadline">Soonest Deadline First</option>
                <option value="priority">High Priority First</option>
                <option value="company">Company Name (A–Z)</option>
                <option value="role">Role (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-[#DCE6E6]">
            <h3 className="text-xl font-bold text-[#155456] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#087E83]" />
              <span>2. Follow-Up Reminders & Deadline Alerts</span>
            </h3>
            <p className="text-sm text-[#687879] mt-0.5">
              Your preferred follow-up timing. These are saved to your account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                Follow-Up Threshold (Days after application)
              </label>
              <select
                value={reminderDays}
                onChange={e => setReminderDays(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] font-medium focus:outline-none focus:border-[#087E83]"
              >
                <option value={3}>3 days</option>
                <option value={5}>5 days</option>
                <option value={7}>7 days (1 week)</option>
                <option value={10}>10 days</option>
                <option value={14}>14 days (2 weeks)</option>
              </select>
            </div>

            <div className="flex items-center justify-between sm:pt-6">
              <div>
                <span className="block text-sm font-semibold text-[#202729]">
                  Urgent Deadline Badges
                </span>
                <span className="text-xs text-[#687879]">
                  Show warning alerts for dates within 7 days
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={e => setNotificationsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#087E83]"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#087E83] hover:bg-[#155456] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Workspace Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Data export */}
      <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-5">
        <div className="pb-3 border-b border-[#DCE6E6]">
          <h3 className="text-xl font-bold text-[#155456] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#087E83]" />
            <span>3. Your Data</span>
          </h3>
          <p className="text-sm text-[#687879] mt-0.5">
            Download a copy of your profile and applications as a JSON file.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#155456]">
              Export backup ({applications.length} application{applications.length === 1 ? '' : 's'})
            </h4>
            <p className="text-xs text-[#687879]">
              Includes your profile details and every application you've tracked.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#E1F0EF] hover:bg-[#D4E8E7] text-[#087E83] text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Privacy note */}
      <div className="p-5 bg-[#E1F0EF]/60 border border-[#087E83]/20 rounded-2xl flex items-start gap-3.5 text-[#155456]">
        <ShieldCheck className="w-5 h-5 text-[#087E83] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-sm">How your data is stored</p>
          <p className="text-[#687879] leading-relaxed">
            Your account, applications, and profile are stored securely in Internly's database and
            are only accessible when you're signed in. Passwords are stored as one-way hashes.
            Resume keyword matching runs in your browser.
          </p>
        </div>
      </div>
    </div>
  );
};