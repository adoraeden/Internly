import React from 'react';
import {
  X,
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  HelpCircle,
  BarChart3,
  User,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { NavTab } from './Sidebar';
import { UserProfile } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profile: UserProfile;
  onOpenLogoutModal: () => void;
  applicationsCount: number;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  profile,
  onOpenLogoutModal,
  applicationsCount,
}) => {
  if (!isOpen) return null;

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'applications' as NavTab, label: 'Applications', icon: Briefcase, badge: applicationsCount },
    { id: 'resume-checker' as NavTab, label: 'Resume Checker', icon: FileCheck2 },
    { id: 'interview-prep' as NavTab, label: 'Interview Prep', icon: HelpCircle },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#155456] text-white flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Logo theme="teal" showTagline={true} />
            <button
              onClick={onClose}
              className="p-1.5 text-[#E1F0EF] hover:text-white rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 pt-3 pb-1">
            <span className="text-[11px] font-bold text-[#E1F0EF]/80 uppercase tracking-wider">
              Workspace
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-[#155456] font-bold shadow-sm'
                      : 'text-[#E1F0EF] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#087E83]' : 'text-[#E1F0EF]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.badge === 'number' && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full tabular-nums font-bold ${
                        isActive ? 'bg-[#E1F0EF] text-[#087E83]' : 'bg-white/15 text-[#E1F0EF]'
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

        {/* Footer with profile & logout */}
        <div className="p-4 border-t border-white/10 bg-[#0E3D3F]/60">
          <div
            onClick={() => {
              onSelectTab('profile');
              onClose();
            }}
            className="flex items-center gap-3 mb-3 cursor-pointer"
          >
            <UserAvatar
              name={profile.name}
              avatarUrl={profile.avatarUrl}
              size="sm"
              className="ring-1 ring-white/20"
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {profile.name}
              </div>
              <div className="text-[11px] text-[#E1F0EF]/70 truncate">
                {profile.email}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onOpenLogoutModal();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-[#E1F0EF]/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Demo Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
