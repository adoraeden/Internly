import { Application } from '../types';
import { api } from './apiClient';

// Fields a user can clear in the edit form. The browser sends "undefined" for an
// empty field, which JSON drops, so the server would keep the old value.
// Sending '' tells the server to clear it.
const CLEARABLE = ['companyWebsite', 'followUpDate', 'interviewDate', 'salary'] as const;

function toPayload(app: Application): Record<string, unknown> {
  // The server builds these itself, so we don't send them
  const { id, timeline, createdAt, updatedAt, ...rest } = app;
  const payload: Record<string, unknown> = { ...rest };
  for (const key of CLEARABLE) {
    if (payload[key] === undefined) payload[key] = '';
  }
  return payload;
}

export const ApplicationService = {
  async getApplications(): Promise<Application[]> {
    const { applications } = await api<{ applications: Application[] }>('/applications');
    return applications;
  },

  async createApplication(app: Application): Promise<Application> {
    const { application } = await api<{ application: Application }>('/applications', {
      method: 'POST',
      body: toPayload(app),
    });
    return application;
  },

  // Full edit from the edit form
  async updateApplication(app: Application): Promise<Application> {
    const { application } = await api<{ application: Application }>(`/applications/${app.id}`, {
      method: 'PUT',
      body: toPayload(app),
    });
    return application;
  },

  // Small change: status, notes, follow-up checkbox
  async patchApplication(id: string, changes: Partial<Application>): Promise<Application> {
    const { application } = await api<{ application: Application }>(`/applications/${id}`, {
      method: 'PUT',
      body: changes,
    });
    return application;
  },

  async deleteApplication(id: string): Promise<void> {
    await api(`/applications/${id}`, { method: 'DELETE' });
  },
};