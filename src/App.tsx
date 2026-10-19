/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { ApplicationsPage } from './components/applications/ApplicationsPage';
import { ResumeCheckerPage } from './components/resume/ResumeCheckerPage';
import { InterviewPrepPage } from './components/interview/InterviewPrepPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ApplicationModal } from './components/modals/ApplicationModal';
import { ApplicationDetailModal } from './components/modals/ApplicationDetailModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { LogoutModal } from './components/modals/LogoutModal';
import { SignInView } from './components/auth/SignInView';
import { CreateAccountView } from './components/auth/CreateAccountView';
import { ForgotPasswordModal } from './components/modals/ForgotPasswordModal';
import { ProfilePhotoModal } from './components/modals/ProfilePhotoModal';
import { Logo } from './components/common/Logo';
import { authService } from './services/authService';
import { ApplicationService } from './services/applicationService';
import { ProfileService } from './services/profileService';
import { PhotoStorageService } from './services/photoStorageService';
import { useInterviewData } from './hooks/useInterviewData';
import { Application, UserProfile, ApplicationStatus, AuthUser } from './types';

const VALID_TABS: NavTab[] = [
  'dashboard',
  'applications',
  'resume-checker',
  'interview-prep',
  'analytics',
  'profile',
  'settings',
];

// Tabs whose content depends on the applications list
const TABS_NEEDING_APPLICATIONS: NavTab[] = [
  'dashboard',
  'applications',
  'analytics',
  'resume-checker',
];

// Blank profile used before login and right after sign-out
const EMPTY_PROFILE: UserProfile = {
  name: '',
  email: '',
  degree: '',
  preferredRoles: [],
  preferredLocations: [],
  preferredWorkMode: 'Any',
  themePreference: 'Light',
  notificationsEnabled: true,
};

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

export default function App() {
  // Sync tab with URL hash if present
  const getInitialTab = (): NavTab => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    return VALID_TABS.includes(hash as NavTab) ? (hash as NavTab) : 'dashboard';
  };

  const [currentTab, setCurrentTab] = useState<NavTab>(getInitialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (VALID_TABS.includes(hash as NavTab)) {
        setCurrentTab(hash as NavTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    window.location.hash = `#/${tab}`;
  };

  // Applications, profile and interview prep come from the backend (MongoDB).
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);

  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);

  // Modals state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [appToEdit, setAppToEdit] = useState<Application | null>(null);

  const [selectedAppForDetail, setSelectedAppForDetail] = useState<Application | null>(null);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // This user's interview-prep data (loads after login, clears on logout)
  const interview = useInterviewData(currentUser?.id);

  // Restore authenticated session on boot
  useEffect(() => {
    let isMounted = true;
    async function restore() {
      try {
        const user = await authService.restoreSession();
        if (isMounted) {
          if (user) {
            setCurrentUser(user);
            setProfile(prev => ({
              ...prev,
              name: user.name,
              email: user.email,
              avatarUrl: user.avatarUrl,
            }));
          }
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err);
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }
    restore();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load this user's applications and profile after login; clear them when logged out.
  useEffect(() => {
    if (!currentUser) {
      setApplications([]);
      setAppsError(null);
      setAppsLoading(false);
      return;
    }

    let cancelled = false;
    setAppsLoading(true);
    setAppsError(null);

    ApplicationService.getApplications()
      .then(list => {
        if (!cancelled) setApplications(list);
      })
      .catch(err => {
        if (!cancelled) {
          setAppsError(errorMessage(err, 'Could not load your applications.'));
        }
      })
      .finally(() => {
        if (!cancelled) setAppsLoading(false);
      });

    ProfileService.getProfile()
      .then(serverProfile => {
        if (cancelled) return;
        setProfile(serverProfile);
        setCurrentUser(prev =>
          prev ? { ...prev, name: serverProfile.name, avatarUrl: serverProfile.avatarUrl } : prev
        );
      })
      .catch(err => {
        if (!cancelled) {
          setActionError(errorMessage(err, 'Could not load your profile.'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, reloadCounter]);

  // Auto-hide the small error message after a few seconds
  useEffect(() => {
    if (!actionError) return;
    const timer = setTimeout(() => setActionError(null), 6000);
    return () => clearTimeout(timer);
  }, [actionError]);

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setProfile(prev => ({
      ...prev,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    }));
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setApplications([]);
    setProfile(EMPTY_PROFILE);
    setSelectedAppForDetail(null);
    setAppToDelete(null);
    setAppToEdit(null);
    setIsAppModalOpen(false);
    setAuthView('signin');
    setIsLogoutModalOpen(false);
  };

  // Photo is uploaded to the server. These throw on failure so the modal can show the error.
  const handlePhotoSaved = async (file: File) => {
    const dataUrl = await PhotoStorageService.prepareForUpload(file);
    const savedUrl = await ProfileService.uploadAvatar(dataUrl);
    setProfile(prev => ({ ...prev, avatarUrl: savedUrl }));
    setCurrentUser(prev => (prev ? { ...prev, avatarUrl: savedUrl } : prev));
  };

  const handlePhotoRemoved = async () => {
    await ProfileService.removeAvatar();
    setProfile(prev => {
      const updated = { ...prev };
      delete updated.avatarUrl;
      return updated;
    });
    setCurrentUser(prev => {
      if (!prev) return prev;
      const copy = { ...prev };
      delete copy.avatarUrl;
      return copy;
    });
  };

  // ---------- Applications (saved on the server) ----------

  // Used by the add/edit form. If the save fails this throws, so the form
  // stays open and shows the error instead of losing what the user typed.
  const handleSaveApplication = async (app: Application) => {
    const exists = applications.some(a => a.id === app.id);
    const saved = exists
      ? await ApplicationService.updateApplication(app)
      : await ApplicationService.createApplication(app);

    setApplications(prev =>
      exists ? prev.map(a => (a.id === saved.id ? saved : a)) : [saved, ...prev]
    );
    setSelectedAppForDetail(prev => (prev && prev.id === saved.id ? saved : prev));
  };

  const handleDeleteApplication = async (app: Application) => {
    setAppToDelete(null);
    try {
      await ApplicationService.deleteApplication(app.id);
      setApplications(prev => prev.filter(a => a.id !== app.id));
      setSelectedAppForDetail(prev => (prev && prev.id === app.id ? null : prev));
    } catch (err) {
      setActionError(errorMessage(err, 'Could not delete the application.'));
    }
  };

  // Small updates (status, notes, follow-up checkbox) share one helper
  const patchApplication = async (id: string, changes: Partial<Application>) => {
    try {
      const saved = await ApplicationService.patchApplication(id, changes);
      setApplications(prev => prev.map(a => (a.id === id ? saved : a)));
      setSelectedAppForDetail(prev => (prev && prev.id === id ? saved : prev));
    } catch (err) {
      setActionError(errorMessage(err, 'Could not update the application.'));
    }
  };

  const handleStatusChange = (id: string, newStatus: ApplicationStatus) =>
    patchApplication(id, { status: newStatus });

  const handleUpdateNotes = (id: string, notes: string) => patchApplication(id, { notes });

  const handleToggleFollowUp = (id: string) => {
    const app = applications.find(a => a.id === id);
    if (app) patchApplication(id, { followUpCompleted: !app.followUpCompleted });
  };

  // Profile management (saved on the server). Throws on failure so the page can show the error.
  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    const { email, avatarUrl, ...editable } = updatedProfile;
    const saved = await ProfileService.updateProfile(editable);
    setProfile(prev => ({ ...saved, avatarUrl: prev.avatarUrl }));
    setCurrentUser(prev => (prev ? { ...prev, name: saved.name } : prev));
  };

  

  const pageMetadata: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Career pipeline progress, upcoming deadlines, and recent activity',
    },
    applications: {
      title: 'Application Tracker',
      subtitle: 'Kanban board and table view for all internship opportunities',
    },
    'resume-checker': {
      title: 'Resume Checker',
      subtitle: 'Local keyword alignment and actionable resume improvement suggestions',
    },
    'interview-prep': {
      title: 'Interview Preparation',
      subtitle: 'Curated technical, behavioral, and role-specific interview library',
    },
    analytics: {
      title: 'Recruitment Analytics',
      subtitle: 'Data-driven conversion rates, submission velocity, and status breakdown',
    },
    profile: {
      title: 'Candidate Profile',
      subtitle: 'Personal dossier, target internship roles, verified skills, and links',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Candidate profile details, career preferences, and demo data',
    },
  };

  const handleOpenNewAppModal = () => {
    setAppToEdit(null);
    setIsAppModalOpen(true);
  };

  const handleOpenEditAppModal = (app: Application) => {
    setSelectedAppForDetail(null);
    setAppToEdit(app);
    setIsAppModalOpen(true);
  };

  const handlePromptDelete = (app: Application) => {
    setSelectedAppForDetail(null);
    setAppToDelete(app);
  };

  // Authentication Loading State
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F5F8F8] flex flex-col items-center justify-center p-4">
        <div className="p-3 bg-white rounded-2xl border border-[#DCE6E6] shadow-sm animate-pulse mb-4">
          <Logo size="lg" />
        </div>
        <p className="text-sm font-semibold text-[#155456] tracking-tight">
          Restoring workspace session...
        </p>
      </div>
    );
  }

  // Signed-out Authentication Gateway
  if (!currentUser) {
    return (
      <>
        {authView === 'signin' ? (
          <SignInView
            onSuccess={handleAuthSuccess}
            onNavigateToSignUp={() => setAuthView('signup')}
            onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
          />
        ) : (
          <CreateAccountView
            onSuccess={handleAuthSuccess}
            onNavigateToSignIn={() => setAuthView('signin')}
          />
        )}
        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
        />
      </>
    );
  }

  const needsApplications = TABS_NEEDING_APPLICATIONS.includes(currentTab);

  // Authenticated Main Workspace
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F8F8]">
      {/* Desktop Persistent Deep Teal Sidebar (240px) */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          profile={profile}
          onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
          applicationsCount={applications.length}
        />
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        profile={profile}
        onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
        applicationsCount={applications.length}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#F5F8F8]">
        {/* Top Utility Bar */}
        <TopBar
          pageTitle={pageMetadata[currentTab].title}
          pageSubtitle={pageMetadata[currentTab].subtitle}
          onOpenNewApplicationModal={handleOpenNewAppModal}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={query => {
            setSearchQuery(query);
            if (query && currentTab !== 'applications' && currentTab !== 'interview-prep') {
              handleSelectTab('applications');
            }
          }}
          applications={applications}
          onSelectApplication={app => setSelectedAppForDetail(app)}
          onNavigateSettings={() => handleSelectTab('settings')}
          onNavigateProfile={() => handleSelectTab('profile')}
          user={currentUser}
          onSignOut={handleSignOut}
          onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
        />

        {/* Content Viewport with 32-40px padding and max-w-7xl */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto pb-20">
          {needsApplications && appsLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-white rounded-2xl border border-[#DCE6E6] shadow-sm animate-pulse mb-4">
                <Logo size="lg" />
              </div>
              <p className="text-sm font-semibold text-[#155456]">Loading your applications...</p>
            </div>
          ) : needsApplications && appsError ? (
            <div className="max-w-md mx-auto py-20 text-center space-y-3">
              <h3 className="text-lg font-bold text-[#155456]">We couldn't load your applications</h3>
              <p className="text-sm text-[#687879]">{appsError}</p>
              <button
                onClick={() => setReloadCounter(c => c + 1)}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#087E83] hover:bg-[#155456] rounded-xl transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardPage
                  applications={applications}
                  profile={profile}
                  onOpenNewApplicationModal={handleOpenNewAppModal}
                  onSelectApplication={app => setSelectedAppForDetail(app)}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {currentTab === 'applications' && (
                <ApplicationsPage
                  applications={applications}
                  onOpenNewApplicationModal={handleOpenNewAppModal}
                  onSelectApplication={app => setSelectedAppForDetail(app)}
                  onEditApplication={handleOpenEditAppModal}
                  onDeleteApplication={handlePromptDelete}
                  onStatusChange={handleStatusChange}
                  onToggleFollowUpCompleted={handleToggleFollowUp}
                  initialSearchQuery={searchQuery}
                  defaultViewMode={profile.defaultApplicationView === 'kanban' ? 'board' : 'table'}
                  defaultSortBy={profile.defaultSortBy || 'newest'}
                />
              )}

              {currentTab === 'resume-checker' && (
                                <ResumeCheckerPage applications={applications} userId={currentUser.id} />
              )}

              {currentTab === 'analytics' && <AnalyticsPage applications={applications} />}
            </>
          )}

          {currentTab === 'interview-prep' &&
            (interview.loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-white rounded-2xl border border-[#DCE6E6] shadow-sm animate-pulse mb-4">
                  <Logo size="lg" />
                </div>
                <p className="text-sm font-semibold text-[#155456]">Loading your interview prep...</p>
              </div>
            ) : interview.error ? (
              <div className="max-w-md mx-auto py-20 text-center space-y-3">
                <h3 className="text-lg font-bold text-[#155456]">
                  We couldn't load your interview prep
                </h3>
                <p className="text-sm text-[#687879]">{interview.error}</p>
                <button
                  onClick={interview.reload}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#087E83] hover:bg-[#155456] rounded-xl transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : (
              <InterviewPrepPage
                questions={interview.questions}
                resources={interview.resources}
                studyPlan={interview.studyPlan}
                sessions={interview.sessions}
                onSaveProgress={interview.saveProgress}
                onCreateCustom={interview.createCustom}
                onUpdateCustom={interview.updateCustom}
                onDeleteCustom={interview.deleteCustom}
                onToggleResource={interview.toggleResource}
                onToggleStudyDay={interview.toggleStudyDay}
                onSaveSession={interview.saveSession}
              />
            ))}

          {currentTab === 'profile' && (
            <ProfilePage
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onNavigateTab={handleSelectTab}
              applicationsCount={applications.length}
              onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              profile={profile}
              applications={applications}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>

      {/* Application Modals */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSave={handleSaveApplication}
        applicationToEdit={appToEdit}
        existingApplications={applications}
      />

      <ApplicationDetailModal
        application={selectedAppForDetail}
        isOpen={Boolean(selectedAppForDetail)}
        onClose={() => setSelectedAppForDetail(null)}
        onEdit={handleOpenEditAppModal}
        onDelete={handlePromptDelete}
        onStatusChange={handleStatusChange}
        onUpdateNotes={handleUpdateNotes}
        onToggleFollowUpCompleted={handleToggleFollowUp}
      />

      <DeleteConfirmModal
        application={appToDelete}
        isOpen={Boolean(appToDelete)}
        onClose={() => setAppToDelete(null)}
        onConfirm={() => {
          if (appToDelete) handleDeleteApplication(appToDelete);
        }}
      />

            <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onSignOut={handleSignOut}
      />

      {/* Profile Photo Customization Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentPhotoUrl={currentUser.avatarUrl || profile.avatarUrl}
        userName={currentUser.name}
        onPhotoSaved={handlePhotoSaved}
        onPhotoRemoved={handlePhotoRemoved}
      />

      {/* Small error message for failed actions */}
      {actionError && (
        <div className="fixed bottom-5 right-5 z-[60] max-w-sm flex items-start gap-3 p-4 bg-[#FBECEC] text-[#C64D4D] text-sm font-medium rounded-xl border border-[#C64D4D]/20 shadow-lg">
          <span className="flex-1">{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            aria-label="Dismiss message"
            className="font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}