import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  HelpCircle,
  BarChart3,
  User,
  Settings,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { UserProfile } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

export type NavTab =
  | 'dashboard'
  | 'applications'
  | 'resume-checker'
  | 'interview-prep'
  | 'analytics'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profile: UserProfile;
  onOpenLogoutModal: () => void;
  applicationsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  onOpenLogoutModal,
  applicationsCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'applications' as NavTab,
      label: 'Applications',
      icon: Briefcase,
      badge: applicationsCount,
    },
    {
      id: 'resume-checker' as NavTab,
      label: 'Resume Checker',
      icon: FileCheck2,
    },
    {
      id: 'interview-prep' as NavTab,
      label: 'Interview Prep',
      icon: HelpCircle,
    },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'profile' as NavTab,
      label: 'Profile',
      icon: User,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-[240px] h-screen bg-[#155456] text-white flex flex-col justify-between shrink-0 select-none shadow-md border-r border-[#087E83]/40">
      {/* Top Branding Section */}
      <div>
        <div className="p-5 border-b border-white/10">
          <Logo theme="teal" showTagline={true} />
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold text-[#E1F0EF]/80 uppercase tracking-wider">
            Workspace
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative focus:outline-none focus:ring-2 focus:ring-[#E1F0EF] ${
                  isActive
                    ? 'bg-white text-[#155456] font-bold shadow-sm'
                    : 'text-[#E1F0EF] hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#087E83]' : 'text-[#E1F0EF]/80 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {typeof item.badge === 'number' && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                      isActive
                        ? 'bg-[#E1F0EF] text-[#087E83]'
                        : 'bg-white/15 text-[#E1F0EF]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & Demo session footer */}
      <div className="p-3 border-t border-white/10 bg-[#0E3D3F]/60">
        <div
          onClick={() => onSelectTab('profile')}
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group mb-1.5 ${
            currentTab === 'profile' ? 'bg-white/15' : ''
          }`}
          title="View and edit candidate profile"
        >
          <UserAvatar
            name={profile.name}
            avatarUrl={profile.avatarUrl}
            size="sm"
            className="ring-1 ring-white/20"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white truncate">
                {profile.name}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#E1F0EF]/60 group-hover:text-white transition-colors" />
            </div>
            <p className="text-[11px] text-[#E1F0EF]/70 truncate">
              {profile.email}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenLogoutModal}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-[#E1F0EF]/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#E1F0EF]" />
          <span>Demo Environment</span>
        </button>
      </div>
    </aside>
  );
};
