import React, { useState } from 'react';
import {
  Mail,
  GraduationCap,
  MapPin,
  CheckCircle2,
  Github,
  Linkedin,
  Globe,
  Edit3,
  Save,
  X,
  FileCheck2,
  Sparkles,
  Camera,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, WorkMode } from '../../types';
import { NavTab } from '../layout/Sidebar';

interface ProfilePageProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void | Promise<void>;
  onNavigateTab: (tab: NavTab) => void;
  applicationsCount: number;
  onOpenPhotoModal?: () => void;
}

const isHttpUrl = (v: string) => v === '' || /^https?:\/\//i.test(v);

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab,
  applicationsCount,
  onOpenPhotoModal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form states (filled from the saved profile when you click Edit)
  const [name, setName] = useState('');
  const [degree, setDegree] = useState('');
  const [headline, setHeadline] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode | 'Any'>('Any');
  const [preferredDuration, setPreferredDuration] = useState('');

  const [roles, setRoles] = useState<string[]>([]);
  const [newRoleInput, setNewRoleInput] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocationInput, setNewLocationInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [tools, setTools] = useState<string[]>([]);
  const [newToolInput, setNewToolInput] = useState('');

  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const startEditing = () => {
    setName(profile.name || '');
    setDegree(profile.degree || '');
    setHeadline(profile.headline || '');
    setTargetRole(profile.targetRole || '');
    setLocation(profile.location || '');
    setWorkMode(profile.preferredWorkMode || 'Any');
    setPreferredDuration(profile.preferredDuration || '');
    setRoles(profile.preferredRoles || []);
    setLocations(profile.preferredLocations || []);
    setSkills(profile.technicalSkills || []);
    setTools(profile.toolsAndTechnologies || []);
    setGithubUrl(profile.githubUrl || '');
    setLinkedinUrl(profile.linkedinUrl || '');
    setPortfolioUrl(profile.portfolioUrl || '');
    setNewRoleInput('');
    setNewLocationInput('');
    setNewSkillInput('');
    setNewToolInput('');
    setSaveError(null);
    setIsEditing(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveError(null);

    if (name.trim().length < 2) {
      setSaveError('Please enter your full name.');
      return;
    }
    const urls = [githubUrl.trim(), linkedinUrl.trim(), portfolioUrl.trim()];
    if (!urls.every(isHttpUrl)) {
      setSaveError('Links must start with http:// or https://');
      return;
    }

    const updated: UserProfile = {
      ...profile,
      name: name.trim(),
      degree: degree.trim(),
      headline: headline.trim(),
      targetRole: targetRole.trim(),
      location: location.trim(),
      preferredWorkMode: workMode,
      preferredDuration: preferredDuration.trim(),
      preferredRoles: roles,
      preferredLocations: locations,
      technicalSkills: skills,
      toolsAndTechnologies: tools,
      githubUrl: githubUrl.trim(),
      linkedinUrl: linkedinUrl.trim(),
      portfolioUrl: portfolioUrl.trim(),
    };

    setIsSaving(true);
    try {
      await onUpdateProfile(updated);
      setIsEditing(false);
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 2500);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Could not save your profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const addTo = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    clear: () => void
  ) => {
    const v = value.trim();
    if (v && !list.includes(v)) {
      setList([...list, v]);
      clear();
    }
  };

  const initials = profile.name
    ? profile.name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
    : '?';

  const emptyHint = (text: string) => <span className="text-sm text-[#687879]">{text}</span>;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DCE6E6]">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#087E83] uppercase block mb-1">
            CANDIDATE DOSSIER & TARGET PREFERENCES
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-display text-[#155456] tracking-tight">
            Candidate Profile
          </h2>
          <p className="text-base text-[#687879] mt-1.5 max-w-2xl leading-relaxed">
            Personalize your professional summary, target internship titles, verified skills, and career portfolio links.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {savedAlert && (
            <span className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E7F3EF] text-[#278567] text-sm font-semibold rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile Saved</span>
            </span>
          )}

          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="px-4 py-2.5 bg-white border border-[#DCE6E6] text-sm font-semibold text-[#202729] rounded-xl hover:bg-[#F5F8F8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#087E83] hover:bg-[#155456] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#087E83] hover:bg-[#155456] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Identity Banner */}
      <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-[#155456] via-[#087E83] to-[#155456] relative">
          <div className="absolute right-6 top-4 text-xs font-semibold text-white/80 flex items-center gap-2 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#E1F0EF]" />
            <span>Active Candidate · {applicationsCount} Tracked Applications</span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="relative group shrink-0">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[#087E83] border-4 border-white shadow-md flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-2xl text-white tracking-tight uppercase">
                      {initials}
                    </span>
                  )}
                </div>
                {onOpenPhotoModal && (
                  <button
                    type="button"
                    onClick={onOpenPhotoModal}
                    className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#087E83] hover:bg-[#155456] text-white shadow-md border-2 border-white transition-all flex items-center justify-center cursor-pointer"
                    title="Change profile photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-[#155456] tracking-tight truncate">
                    {profile.name}
                  </h3>
                  {onOpenPhotoModal && (
                    <button
                      type="button"
                      onClick={onOpenPhotoModal}
                      className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#DCE6E6] bg-white text-xs font-semibold text-[#155456] hover:bg-[#F5F8F8] hover:text-[#087E83] transition-colors cursor-pointer"
                    >
                      <Camera className="w-3 h-3 text-[#087E83]" />
                      <span>Edit photo</span>
                    </button>
                  )}
                </div>
                <p className="text-sm font-medium text-[#087E83] mt-0.5">
                  {profile.targetRole || 'Add your target role'}
                </p>
                {profile.headline && (
                  <p className="text-sm text-[#687879] mt-1 max-w-xl">{profile.headline}</p>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-2 pb-1">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-[#DCE6E6] bg-[#F5F8F8] text-[#202729] hover:text-[#087E83] hover:border-[#087E83] transition-colors"
                  title="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-[#DCE6E6] bg-[#F5F8F8] text-[#202729] hover:text-[#087E83] hover:border-[#087E83] transition-colors"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-[#DCE6E6] bg-[#F5F8F8] text-[#202729] hover:text-[#087E83] hover:border-[#087E83] transition-colors"
                  title="Personal Portfolio"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Meta Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#DCE6E6] text-sm text-[#687879]">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-[#087E83] shrink-0" />
              <span className="truncate">{profile.degree || 'Add your degree'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#087E83] shrink-0" />
              <span className="truncate">{profile.location || 'Add your location'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#087E83] shrink-0" />
              <span className="truncate">{profile.email}</span>
            </div>
          </div>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-6">
          {saveError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-[#FBECEC] text-[#C64D4D] text-sm font-medium rounded-xl border border-[#C64D4D]/20">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white border border-[#DCE6E6] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xl font-bold text-[#155456] pb-3 border-b border-[#DCE6E6]">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-[#687879] cursor-not-allowed"
                />
                <p className="text-[11px] text-[#687879] mt-1">Your email can't be changed here.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Academic Degree & Class
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={e => setDegree(e.target.value)}
                  placeholder="e.g. BCA (Class of 2027)"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Current Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Nashik, Maharashtra"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Professional Headline / Bio
                </label>
                <textarea
                  rows={2}
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="A one-line summary of who you are and what you're aiming for"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20"
                />
              </div>
            </div>
          </div>

          {/* Target Career Preferences */}
          <div className="bg-white border border-[#DCE6E6] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xl font-bold text-[#155456] pb-3 border-b border-[#DCE6E6]">
              Target Opportunity Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  placeholder="e.g. Backend Developer Intern"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Preferred Work Mode
                </label>
                <select
                  value={workMode}
                  onChange={e => setWorkMode(e.target.value as WorkMode | 'Any')}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Any">Any Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Term / Duration
                </label>
                <input
                  type="text"
                  value={preferredDuration}
                  onChange={e => setPreferredDuration(e.target.value)}
                  placeholder="e.g. 3-month summer term"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>
            </div>

            {/* Target Roles List */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                Target Role Titles
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {roles.map(r => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E1F0EF] text-[#087E83] rounded-lg text-xs font-semibold"
                  >
                    {r}
                    <button
                      type="button"
                      onClick={() => setRoles(roles.filter(x => x !== r))}
                      className="hover:text-[#C64D4D]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add role title (e.g. Full-Stack Intern)..."
                  value={newRoleInput}
                  onChange={e => setNewRoleInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTo(newRoleInput, roles, setRoles, () => setNewRoleInput(''));
                    }
                  }}
                  className="flex-1 px-3.5 py-2 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
                <button
                  type="button"
                  onClick={() => addTo(newRoleInput, roles, setRoles, () => setNewRoleInput(''))}
                  className="px-4 py-2 bg-[#E1F0EF] text-[#087E83] hover:bg-[#087E83] hover:text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Target Locations List */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                Target Cities & Hubs
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {locations.map(loc => (
                  <span
                    key={loc}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F8F8] border border-[#DCE6E6] text-[#202729] rounded-lg text-xs font-semibold"
                  >
                    {loc}
                    <button
                      type="button"
                      onClick={() => setLocations(locations.filter(x => x !== loc))}
                      className="hover:text-[#C64D4D]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add target city (e.g. Pune)..."
                  value={newLocationInput}
                  onChange={e => setNewLocationInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTo(newLocationInput, locations, setLocations, () => setNewLocationInput(''));
                    }
                  }}
                  className="flex-1 px-3.5 py-2 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
                <button
                  type="button"
                  onClick={() =>
                    addTo(newLocationInput, locations, setLocations, () => setNewLocationInput(''))
                  }
                  className="px-4 py-2 bg-[#E1F0EF] text-[#087E83] hover:bg-[#087E83] hover:text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Skills & Technologies */}
          <div className="bg-white border border-[#DCE6E6] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xl font-bold text-[#155456] pb-3 border-b border-[#DCE6E6]">
              Technical Skills
            </h3>

            <div>
              <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                Programming Languages & Core Competencies
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map(s => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#155456] text-white rounded-lg text-xs font-semibold"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter(x => x !== s))}
                      className="hover:text-red-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add language or core skill (e.g. JavaScript)..."
                  value={newSkillInput}
                  onChange={e => setNewSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTo(newSkillInput, skills, setSkills, () => setNewSkillInput(''));
                    }
                  }}
                  className="flex-1 px-3.5 py-2 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
                <button
                  type="button"
                  onClick={() => addTo(newSkillInput, skills, setSkills, () => setNewSkillInput(''))}
                  className="px-4 py-2 bg-[#E1F0EF] text-[#087E83] hover:bg-[#087E83] hover:text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Add Skill
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                Frameworks, Cloud, & Infrastructure Tools
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tools.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E1F0EF] text-[#087E83] rounded-lg text-xs font-semibold"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => setTools(tools.filter(x => x !== t))}
                      className="hover:text-[#C64D4D]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add framework or tool (e.g. React, MongoDB)..."
                  value={newToolInput}
                  onChange={e => setNewToolInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTo(newToolInput, tools, setTools, () => setNewToolInput(''));
                    }
                  }}
                  className="flex-1 px-3.5 py-2 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
                <button
                  type="button"
                  onClick={() => addTo(newToolInput, tools, setTools, () => setNewToolInput(''))}
                  className="px-4 py-2 bg-[#E1F0EF] text-[#087E83] hover:bg-[#087E83] hover:text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Add Tool
                </button>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-white border border-[#DCE6E6] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xl font-bold text-[#155456] pb-3 border-b border-[#DCE6E6]">
              Portfolio & Recruiter Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  GitHub Profile URL
                </label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202729] mb-1.5">
                  Personal Portfolio / Blog
                </label>
                <input
                  type="text"
                  value={portfolioUrl}
                  onChange={e => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="px-5 py-2.5 bg-white border border-[#DCE6E6] text-sm font-semibold text-[#202729] rounded-xl hover:bg-[#F5F8F8] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#087E83] hover:bg-[#155456] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Target Opportunities */}
          <div className="bg-white border border-[#DCE6E6] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE6E6] mb-5">
              <div>
                <h3 className="text-xl font-bold text-[#155456]">Target Internship Search Criteria</h3>
                <p className="text-sm text-[#687879] mt-0.5">
                  Roles and settings calibrated for upcoming recruitment cycles.
                </p>
              </div>
              <button
                type="button"
                onClick={startEditing}
                className="text-xs font-bold text-[#087E83] hover:text-[#155456] flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Adjust</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#687879] block mb-2">
                  Target Roles
                </span>
                <div className="flex flex-wrap gap-2">
                  {(profile.preferredRoles || []).length === 0
                    ? emptyHint('None added yet')
                    : (profile.preferredRoles || []).map(role => (
                        <span
                          key={role}
                          className="px-3 py-1.5 bg-[#E1F0EF] text-[#087E83] text-xs font-semibold rounded-lg"
                        >
                          {role}
                        </span>
                      ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#687879] block mb-2">
                  Preferred Cities
                </span>
                <div className="flex flex-wrap gap-2">
                  {(profile.preferredLocations || []).length === 0
                    ? emptyHint('None added yet')
                    : (profile.preferredLocations || []).map(loc => (
                        <span
                          key={loc}
                          className="px-3 py-1.5 bg-[#F5F8F8] border border-[#DCE6E6] text-[#202729] text-xs font-semibold rounded-lg"
                        >
                          {loc}
                        </span>
                      ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#687879] block mb-2">
                  Work Mode & Availability
                </span>
                <div className="space-y-1.5 text-sm text-[#202729]">
                  <p>
                    <strong className="font-semibold text-[#155456]">Work Mode:</strong>{' '}
                    {profile.preferredWorkMode || 'Any'}
                  </p>
                  <p>
                    <strong className="font-semibold text-[#155456]">Term:</strong>{' '}
                    {profile.preferredDuration || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="bg-white border border-[#DCE6E6] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE6E6] mb-5">
              <div>
                <h3 className="text-xl font-bold text-[#155456]">Technical Skills & Competencies</h3>
                <p className="text-sm text-[#687879] mt-0.5">
                  Languages and frameworks evaluated during automated resume matching.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('resume-checker')}
                className="text-xs font-bold text-[#087E83] hover:text-[#155456] flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Test in Resume Checker</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#687879] block mb-2.5">
                  Languages & Core Foundations
                </span>
                <div className="flex flex-wrap gap-2">
                  {(profile.technicalSkills || []).length === 0
                    ? emptyHint('No skills added yet. Click Edit Profile to add some.')
                    : (profile.technicalSkills || []).map(skill => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 bg-[#155456] text-white text-xs font-medium rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#687879] block mb-2.5">
                  Frameworks, Libraries & Developer Tools
                </span>
                <div className="flex flex-wrap gap-2">
                  {(profile.toolsAndTechnologies || []).length === 0
                    ? emptyHint('No tools added yet.')
                    : (profile.toolsAndTechnologies || []).map(tool => (
                        <span
                          key={tool}
                          className="px-3 py-1.5 bg-[#E1F0EF] text-[#087E83] text-xs font-semibold rounded-lg"
                        >
                          {tool}
                        </span>
                      ))}
                </div>
              </div>

              {profile.areasToLearn && profile.areasToLearn.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#687879] block mb-2.5">
                    Target Growth Areas
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {profile.areasToLearn.map(area => (
                      <span
                        key={area}
                        className="px-3 py-1.5 bg-[#FDF5E8] text-[#C28A35] text-xs font-semibold rounded-lg"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Education & Resume Matcher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#DCE6E6] rounded-2xl p-6 shadow-xs">
              <h3 className="text-xl font-bold text-[#155456] pb-3 border-b border-[#DCE6E6] mb-4">
                Education
              </h3>
              <p className="text-sm text-[#202729]">
                {profile.degree || 'Add your degree by clicking Edit Profile.'}
              </p>
            </div>

            <div className="bg-white border border-[#DCE6E6] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#155456] pb-3 border-b border-[#DCE6E6] mb-4">
                  Resume Matcher Readiness
                </h3>
                <p className="text-sm text-[#202729] leading-relaxed mb-3">
                  Your profile skills are used to benchmark against incoming job descriptions.
                </p>
                <div className="p-3.5 bg-[#E1F0EF] rounded-xl text-xs text-[#087E83] font-medium flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {(profile.technicalSkills || []).length} skills and{' '}
                    {(profile.toolsAndTechnologies || []).length} tools on your profile.
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onNavigateTab('resume-checker')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#087E83] hover:bg-[#155456] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Open Resume Checker</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};