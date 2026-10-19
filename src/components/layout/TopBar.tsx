import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  Plus,
  Menu,
  Calendar,
  AlertTriangle,
  X,
  ExternalLink,
  Clock,
  User,
  Settings,
  LogOut,
  Camera,
  ChevronDown,
} from 'lucide-react';
import { Application, AuthUser } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { daysUntil } from '../../utils/dates';

interface TopBarProps {
  pageTitle: string;
  pageSubtitle?: string;
  onOpenNewApplicationModal: () => void;
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  applications: Application[];
  onSelectApplication: (app: Application) => void;
  onNavigateSettings?: () => void;
  onNavigateProfile?: () => void;
  user?: AuthUser | null;
  onSignOut?: () => void;
  onOpenPhotoModal?: () => void;
}

interface UpcomingEvent {
  id: string;
  title: string;
  type: 'interview' | 'deadline' | 'offer';
  app: Application;
  daysRemaining: number | null; // null for offers (no real date is tracked)
}

function badgeFor(item: UpcomingEvent): { text: string; className: string } {
  if (item.daysRemaining === null) {
    return { text: 'Review', className: 'bg-[#E7F3EF] text-[#278567]' };
  }
  const d = item.daysRemaining;
  const text = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${d}d left`;
  const className =
    d <= 3
      ? 'bg-[#FBECEC] text-[#C64D4D]'
      : d <= 7
      ? 'bg-[#FDF5E8] text-[#C28A35]'
      : 'bg-[#E1F0EF] text-[#087E83]';
  return { text, className };
}

export const TopBar: React.FC<TopBarProps> = ({
  pageTitle,
  pageSubtitle,
  onOpenNewApplicationModal,
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
  applications,
  onSelectApplication,
  onNavigateSettings,
  onNavigateProfile,
  user,
  onSignOut,
  onOpenPhotoModal,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute urgent deadlines & upcoming interviews (days counted from the real today)
  const upcomingEvents = React.useMemo(() => {
    const list: UpcomingEvent[] = [];

    applications.forEach(app => {
      if (app.interviewDate) {
        const diffDays = daysUntil(app.interviewDate);
        if (diffDays >= 0 && diffDays <= 14) {
          list.push({
            id: `interview-${app.id}`,
            title: `Interview: ${app.company}`,
            type: 'interview',
            app,
            daysRemaining: diffDays,
          });
        }
      }

      if (app.deadline && app.status !== 'Rejected' && app.status !== 'Offered') {
        const diffDays = daysUntil(app.deadline);
        if (diffDays >= 0 && diffDays <= 14) {
          list.push({
            id: `deadline-${app.id}`,
            title: `Deadline: ${app.company}`,
            type: 'deadline',
            app,
            daysRemaining: diffDays,
          });
        }
      }

      if (app.status === 'Offered') {
        list.push({
          id: `offer-${app.id}`,
          title: `Offer Review: ${app.company}`,
          type: 'offer',
          app,
          daysRemaining: null,
        });
      }
    });

    return list.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));
  }, [applications]);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 sm:px-8 py-3 bg-[#FFFFFF] border-b border-[#DCE6E6]">
      {/* Left: Mobile hamburger & Context breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-[#202729] hover:bg-[#F5F8F8] rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm font-bold tracking-tight text-[#155456] truncate">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-[11px] text-[#687879] hidden sm:block truncate mt-0.5">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Search, Notifications, Profile shortcut & Primary CTA */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Contextual Search */}
        <div className="relative hidden md:block w-52 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#687879]" />
          <input
            type="text"
            placeholder="Search records, companies..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-7 py-1.5 text-xs bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-[#202729] placeholder-[#687879] focus:bg-white focus:outline-none focus:border-[#087E83] focus:ring-1 focus:ring-[#087E83] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687879] hover:text-[#202729]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl border transition-colors ${
              showNotifications
                ? 'bg-[#E1F0EF] border-[#087E83] text-[#087E83]'
                : 'bg-white border-[#DCE6E6] text-[#202729] hover:bg-[#F5F8F8]'
            }`}
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {upcomingEvents.length > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#087E83] rounded-full tabular-nums">
                {upcomingEvents.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#DCE6E6] rounded-2xl shadow-lg p-3 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCE6E6]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#155456]">
                    Upcoming Deadlines & Schedule
                  </span>
                  <span className="text-[11px] text-[#687879] tabular-nums">
                    ({upcomingEvents.length})
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 text-[#687879] hover:text-[#202729] rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#687879]">
                  No upcoming deadlines or interviews scheduled.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {upcomingEvents.map(item => {
                    const badge = badgeFor(item);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectApplication(item.app);
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-xl border border-[#DCE6E6] hover:border-[#087E83] hover:bg-[#F5F8F8] cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {item.type === 'interview' ? (
                              <Calendar className="w-3.5 h-3.5 text-[#C28A35] shrink-0" />
                            ) : item.type === 'offer' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-[#278567] shrink-0" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-[#087E83] shrink-0" />
                            )}
                            <span className="text-xs font-semibold text-[#202729] leading-tight">
                              {item.title}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums ${badge.className}`}
                          >
                            {badge.text}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#687879] mt-1.5">
                          <span className="truncate">{item.app.jobTitle || item.app.role}</span>
                          <span className="flex items-center gap-1 text-[#087E83] font-semibold">
                            Details <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Menu & Avatar */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-0.5 rounded-full border border-[#DCE6E6] hover:ring-2 hover:ring-[#087E83] transition-all shrink-0 focus:outline-none cursor-pointer"
            title="Candidate account menu"
            aria-expanded={showUserMenu}
          >
            <UserAvatar
              name={user?.name || 'Account'}
              avatarUrl={user?.avatarUrl}
              size="sm"
            />
          </button>

          {/* Profile Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#DCE6E6] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* User preview header */}
              <div className="px-4 py-3 border-b border-[#DCE6E6] bg-[#F5F8F8]/60">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={user?.name || 'Account'}
                    avatarUrl={user?.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#155456] truncate">
                      {user?.name || 'Account'}
                    </p>
                    <p className="text-[11px] text-[#687879] truncate">
                      {user?.email || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {onNavigateProfile && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigateProfile();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#202729] hover:bg-[#F5F8F8] hover:text-[#087E83] transition-colors text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#687879]" />
                    <span>Profile</span>
                  </button>
                )}

                {onNavigateSettings && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigateSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#202729] hover:bg-[#F5F8F8] hover:text-[#087E83] transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#687879]" />
                    <span>Settings</span>
                  </button>
                )}

                {onOpenPhotoModal && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenPhotoModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#202729] hover:bg-[#F5F8F8] hover:text-[#087E83] transition-colors text-left cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#687879]" />
                    <span>Change Photo</span>
                  </button>
                )}
              </div>

              {/* Sign out */}
              {onSignOut && (
                <div className="pt-1 border-t border-[#DCE6E6]">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#C64D4D] hover:bg-[#FBECEC] transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Deep Teal CTA */}
        <button
          onClick={onOpenNewApplicationModal}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#087E83] hover:bg-[#076B70] active:bg-[#06595D] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>
    </header>
  );
};