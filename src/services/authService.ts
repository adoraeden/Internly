/**
 * Authentication Service
 *
 * Talks to the Express backend. The login session lives in an HttpOnly
 * cookie set by the server, so this file never stores or sees the token.
 *
 *  signIn        -> POST /api/auth/login
 *  createAccount -> POST /api/auth/register
 *  signOut       -> POST /api/auth/logout
 *  restoreSession -> GET /api/auth/me
 */

import { AuthUser } from '../types';
import { PhotoStorageService } from './photoStorageService';
import { api, ApiError } from './apiClient';

export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CreateAccountData {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}

// Still used by the "Instant demo" button's labels. It needs a real demo
// account in the database to work, which we'll handle in a later step.
export const DEMO_DEFAULT_USER: AuthUser = {
  id: 'usr-alex-johnson-2027',
  name: 'Alex Johnson',
  email: 'alex.johnson@demo.college.edu',
  createdAt: '2026-09-01T00:00:00.000Z',
};

// Keys the old fake login used. We delete them so they don't sit in the browser.
const LEGACY_SESSION_KEY = 'internly_auth_session_demo';
const LEGACY_LOCAL_KEY = 'internly_auth_session_remember';

class AuthService {
  private clearLegacyData(): void {
    try {
      sessionStorage.removeItem(LEGACY_SESSION_KEY);
      localStorage.removeItem(LEGACY_LOCAL_KEY);
    } catch {
      // Storage may be blocked; nothing to clean in that case
    }
    PhotoStorageService.clearLegacyPhoto();
  }

  /** Asks the server "who am I?" when the app starts. */
  async restoreSession(): Promise<AuthUser | null> {
    this.clearLegacyData();
    try {
      const { user } = await api<{ user: AuthUser }>('/auth/me');
      return user;
    } catch (err) {
      // 401 just means "not logged in", which is normal
      if (!(err instanceof ApiError && err.status === 401)) {
        console.warn('Could not restore session:', err);
      }
      return null;
    }
  }

  async signIn(credentials: SignInCredentials): Promise<{ user: AuthUser }> {
    const { user } = await api<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: {
        email: credentials.email.trim(),
        password: credentials.password,
        rememberMe: Boolean(credentials.rememberMe),
      },
    });
    return { user };
  }

  async createAccount(data: CreateAccountData): Promise<{ user: AuthUser }> {
    const { user } = await api<{ user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        termsAccepted: data.termsAccepted,
      },
    });
    return { user };
  }

  async signOut(): Promise<void> {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout request failed:', err);
    }
  }
}

export const authService = new AuthService();