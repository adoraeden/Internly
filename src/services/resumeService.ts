import { ResumeAnalysisResult, SavedResumeAnalysis } from '../types';
import { api } from './apiClient';

// What the history list shows (no full report, so it loads fast)
export type SavedAnalysisSummary = Omit<SavedResumeAnalysis, 'result'>;

export interface SaveAnalysisInput {
  name?: string;
  date: string;
  jobCompany?: string;
  jobTitle?: string;
  result: ResumeAnalysisResult;
}

export const ResumeService = {
  async list(): Promise<SavedAnalysisSummary[]> {
    const { analyses } = await api<{ analyses: SavedAnalysisSummary[] }>('/resume-analyses');
    return analyses;
  },

  async get(id: string): Promise<SavedResumeAnalysis> {
    const { analysis } = await api<{ analysis: SavedResumeAnalysis }>(
      `/resume-analyses/${encodeURIComponent(id)}`
    );
    return analysis;
  },

  async save(input: SaveAnalysisInput): Promise<SavedAnalysisSummary> {
    const { analysis } = await api<{ analysis: SavedResumeAnalysis }>('/resume-analyses', {
      method: 'POST',
      body: input,
    });
    // The list only needs the summary part
    const { result, ...summary } = analysis;
    return summary;
  },

  async remove(id: string): Promise<void> {
    await api(`/resume-analyses/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};