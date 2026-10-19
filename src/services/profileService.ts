import { UserProfile } from '../types';
import { api } from './apiClient';

// Fields the server accepts. Email and photo are not editable here.
type EditableProfile = Partial<Omit<UserProfile, 'email' | 'avatarUrl'>>;

export const ProfileService = {
  async getProfile(): Promise<UserProfile> {
    const { profile } = await api<{ profile: UserProfile }>('/profile');
    return profile;
  },

  async updateProfile(changes: EditableProfile): Promise<UserProfile> {
    const { profile } = await api<{ profile: UserProfile }>('/profile', {
      method: 'PUT',
      body: changes,
    });
    return profile;
  },

  /** Sends a small image (as a data URL) and returns the saved photo. */
  async uploadAvatar(dataUrl: string): Promise<string | undefined> {
    const { profile } = await api<{ profile: UserProfile }>('/profile/avatar', {
      method: 'PUT',
      body: { avatar: dataUrl },
    });
    return profile.avatarUrl;
  },

  async removeAvatar(): Promise<void> {
    await api('/profile/avatar', { method: 'DELETE' });
  },
};