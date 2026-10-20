import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Info,
  Copy,
  Check,
  Trash2,
  Layers,
  CheckSquare,
  Square,
  Save,
  Clock,
} from 'lucide-react';
import { analyzeResumeMatch } from '../../utils/resumeMatcher';
import {
  ResumeAnalysisResult,
  Application,
  ImprovementChecklistItem,
  UserProfile,
} from '../../types';
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME_TEXT } from '../../data/seedData';
import { ResumeService, SavedAnalysisSummary } from '../../services/resumeService';
import { todayLocalISO } from '../../utils/dates';

interface ResumeCheckerPageProps {
  applications?: Application[];
  userId?: string;
  profile?: UserProfile;
}

// Builds a Skills section from the profile (empty string if there are no skills)
function skillsFromProfile(profile?: UserProfile): string {
  const languages = profile?.technicalSkills ?? [];
  const tools = profile?.toolsAndTechnologies ?? [];
  if (languages.length === 0 && tools.length === 0) return '';
  const lines = ['SKILLS'];
  if (languages.length > 0) lines.push(`Languages & Core: ${languages.join(', ')}`);
  if (tools.length > 0) lines.push(`Frameworks & Tools: ${tools.join(', ')}`);
  return lines.join('\n');
}

const errorText = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

export const ResumeCheckerPage: React.FC<ResumeCheckerPageProps> = ({
  applications = [],
  userId,
  profile,
}) => {
  // Boxes start empty. Use the "Sample" buttons to try the tool.
  const [jobDescription, setJobDescription] = useState<string>('');
    const [resumeText, setResumeText] = useState<string>(() => skillsFromProfile(profile));
  // Once you edit or clear the box yourself, we stop auto-filling it
  const [resumeTouched, setResumeTouched] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedSuggestions, setCopiedSuggestions] = useState(false);

  // Company and title of the application the job description came from (saved with the report)
  const [jobSource, setJobSource] = useState<{ company: string; title: string } | null>(null);

  // Saved analyses history (from the server)
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysisSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  // Interactive checklist state (initialized from analysis)
  const [checklistState, setChecklistState] = useState<ImprovementChecklistItem[]>([]);

  useEffect(() => {
    if (analysisResult) {
      setChecklistState(analysisResult.checklist);
    }
  }, [analysisResult]);

  // Load this user's saved reports
  const loadHistory = () => {
    setHistoryLoading(true);
    setHistoryError(null);
    return ResumeService.list()
      .then(setSavedAnalyses)
      .catch(err => setHistoryError(errorText(err, 'Could not load your saved analyses.')))
      .finally(() => setHistoryLoading(false));
  };

    // The profile loads a moment after the page opens, so fill the box once it arrives
  useEffect(() => {
    if (resumeTouched || resumeText.trim() !== '') return;
    const fromProfile = skillsFromProfile(profile);
    if (fromProfile) setResumeText(fromProfile);
  }, [profile]);

  const handleUseProfileSkills = () => {
    const fromProfile = skillsFromProfile(profile);
    if (!fromProfile) return;
    setResumeTouched(true);
    setResumeText(prev => (prev.trim() ? `${fromProfile}\n\n${prev}` : fromProfile));
  };


  useEffect(() => {
    loadHistory();
  }, [userId]);

  // Auto-hide the error banner
  useEffect(() => {
    if (!pageError) return;
    const timer = setTimeout(() => setPageError(null), 6000);
    return () => clearTimeout(timer);
  }, [pageError]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = analyzeResumeMatch(jobDescription, resumeText);
      setAnalysisResult(res);
      setChecklistState(res.checklist);
      setIsAnalyzing(false);
    }, 250);
  };

  const handleClearAll = () => {
    setJobDescription('');
    setResumeText('');
    setAnalysisResult(null);
    setChecklistState([]);
    setResumeTouched(true);
  };

  const loadSampleJob = () => {
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setJobSource(null);
  };

  const loadSampleResume = () => {
    setResumeText(SAMPLE_RESUME_TEXT);
    setResumeTouched(true);
  };

  const handleImportFromApplication = (appId: string) => {
    const found = applications.find(a => a.id === appId);
    if (found && found.jobDescription) {
      setJobDescription(found.jobDescription);
      setJobSource({ company: found.company, title: found.jobTitle || found.role });
    }
  };

  const handleToggleChecklist = (id: string) => {
    setChecklistState(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedChecklistCount = checklistState.filter(c => c.completed).length;
  const checklistPercentage =
    checklistState.length > 0 ? Math.round((completedChecklistCount / checklistState.length) * 100) : 0;

  const handleCopySuggestions = () => {
    if (!analysisResult) return;
    const text = analysisResult.actionableSuggestions
      .map((s, i) => `${i + 1}. ${s}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedSuggestions(true);
    setTimeout(() => setCopiedSuggestions(false), 2000);
  };

  const handleSaveCurrentAnalysis = async () => {
    if (!analysisResult) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      const saved = await ResumeService.save({
        name: saveTitle.trim() || undefined,
        date: todayLocalISO(),
        jobCompany: jobSource?.company,
        jobTitle: jobSource?.title,
        // Include the checklist ticks so they are saved with the report
        result: { ...analysisResult, checklist: checklistState },
      });
      setSavedAnalyses(prev => [saved, ...prev]);
      setShowSaveDialog(false);
      setSaveTitle('');
    } catch (err) {
      setSaveError(errorText(err, 'Could not save the report. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      await ResumeService.remove(id);
      setSavedAnalyses(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setPageError(errorText(err, 'Could not delete the saved report.'));
    }
  };

  const handleLoadSaved = async (id: string) => {
    setLoadingReportId(id);
    try {
      const full = await ResumeService.get(id);
      setAnalysisResult(full.result);
      setChecklistState(full.result.checklist);
      setActiveTab('current');
    } catch (err) {
      setPageError(errorText(err, 'Could not open the saved report.'));
    } finally {
      setLoadingReportId(null);
    }
  };

  const jdWords = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;
  const resumeWords = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-8">
      {/* Error banner */}
      {pageError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-[#FBECEC] text-[#C64D4D] text-sm font-medium rounded-xl border border-[#C64D4D]/20">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{pageError}</span>
          <button onClick={() => setPageError(null)} aria-label="Dismiss message" className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DCE6E6]">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#087E83] uppercase block mb-1">
            RESUME ALIGNMENT WORKSPACE
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-display text-[#155456] tracking-tight">
            Resume Checker
          </h2>
          <p className="text-base text-[#687879] mt-1.5 max-w-2xl leading-relaxed">
            Understand how your resume aligns with the role you want.
          </p>
        </div>

        {/* Action Tabs & History Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center p-1 bg-white rounded-xl border border-[#DCE6E6] shadow-xs">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'current'
                  ? 'bg-[#087E83] text-white font-bold shadow-xs'
                  : 'text-[#687879] hover:text-[#202729]'
              }`}
            >
              Analysis Workspace
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-[#087E83] text-white font-bold shadow-xs'
                  : 'text-[#687879] hover:text-[#202729]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Saved History</span>
              {savedAnalyses.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-bold">
                  {savedAnalyses.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#687879] hover:text-[#202729] hover:bg-[#F5F8F8] rounded-xl border border-[#DCE6E6] transition-colors bg-white shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !jobDescription.trim() || !resumeText.trim()}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-xs transition-all ${
              !jobDescription.trim() || !resumeText.trim()
                ? 'bg-[#BCCFCF] cursor-not-allowed text-[#687879]'
                : 'bg-[#087E83] hover:bg-[#155456]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze resume'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        /* Saved Analyses History View */
        <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E6]">
            <div>
              <h3 className="text-base font-bold text-[#155456]">Saved Resume Analyses</h3>
              <p className="text-xs text-[#687879] mt-0.5">
                Review past compatibility reports and tracking benchmarks.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('current')}
              className="text-xs font-semibold text-[#087E83] hover:underline"
            >
              Back to Editor
            </button>
          </div>

          {historyLoading ? (
            <div className="py-12 text-center text-sm text-[#687879]">Loading your saved reports...</div>
          ) : historyError ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-sm text-[#C64D4D]">{historyError}</p>
              <button
                onClick={loadHistory}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#087E83] hover:bg-[#155456] rounded-xl transition-colors"
              >
                Try again
              </button>
            </div>
          ) : savedAnalyses.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#687879]">
              No saved analyses yet. Run an analysis and click &ldquo;Save to History&rdquo; to store snapshots.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAnalyses.map(item => (
                <div
                  key={item.id}
                  className="p-4 bg-[#F5F8F8] border border-[#DCE6E6] hover:border-[#087E83] rounded-xl transition-all flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#155456] truncate">{item.name}</h4>
                    {(item.jobCompany || item.jobTitle) && (
                      <p className="text-xs text-[#687879] truncate mt-0.5">
                        {[item.jobCompany, item.jobTitle].filter(Boolean).join(' — ')}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-[#687879] mt-1">
                      <span>Saved: {item.date}</span>
                      <span>·</span>
                      <span className="font-bold text-[#087E83]">{item.matchPercentage}% Alignment</span>
                      <span>·</span>
                      <span>{item.matchedCount} matched</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleLoadSaved(item.id)}
                      disabled={loadingReportId === item.id}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#087E83] hover:bg-[#155456] rounded-lg transition-colors disabled:opacity-60"
                    >
                      {loadingReportId === item.id ? 'Opening...' : 'View Report'}
                    </button>
                    <button
                      onClick={() => handleDeleteSaved(item.id)}
                      className="p-1.5 text-[#687879] hover:text-[#C64D4D] rounded-lg transition-colors"
                      title="Delete saved report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Main Workspace: Inputs + Results */
        <>
          {/* Two Input Editors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Target Job Description */}
            <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E6] mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#155456] uppercase tracking-wider">
                    Target Job Description
                  </span>
                  <span className="text-xs text-[#687879] font-mono">
                    ({jdWords} words · {jobDescription.length} chars)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Import from tracked applications dropdown */}
                  {applications.some(a => a.jobDescription) && (
                    <select
                      onChange={e => {
                        if (e.target.value) handleImportFromApplication(e.target.value);
                      }}
                      defaultValue=""
                      className="text-xs bg-[#F5F8F8] border border-[#DCE6E6] rounded-lg px-2 py-1 text-[#202729] focus:outline-none focus:border-[#087E83]"
                    >
                      <option value="" disabled>
                        Import from saved app...
                      </option>
                      {applications
                        .filter(a => a.jobDescription)
                        .map(a => (
                          <option key={a.id} value={a.id}>
                            {a.company} — {a.jobTitle || a.role}
                          </option>
                        ))}
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={loadSampleJob}
                    className="text-xs font-semibold text-[#087E83] hover:underline"
                  >
                    Sample job
                  </button>
                  {jobDescription && (
                    <button
                      type="button"
                      onClick={() => {
                        setJobDescription('');
                        setJobSource(null);
                      }}
                      className="text-xs text-[#687879] hover:text-[#C64D4D]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the target internship job description, requirements, and qualifications here..."
                className="w-full flex-1 p-4 text-sm text-[#202729] bg-[#F5F8F8] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20 resize-none font-mono leading-relaxed transition-colors"
              />
            </div>

            {/* Right: Your Resume */}
            <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E6] mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#155456] uppercase tracking-wider">
                    Your Resume Content
                  </span>
                  <span className="text-xs text-[#687879] font-mono">
                    ({resumeWords} words · {resumeText.length} chars)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                                    {skillsFromProfile(profile) && (
                    <button
                      type="button"
                      onClick={handleUseProfileSkills}
                      className="text-xs font-semibold text-[#087E83] hover:underline"
                    >
                      Use profile skills
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={loadSampleResume}
                    className="text-xs font-semibold text-[#087E83] hover:underline"
                  >
                    Sample resume
                  </button>
                  {resumeText && (
                    <button
                      type="button"
                                            onClick={() => {
                        setResumeTouched(true);
                        setResumeText('');
                      }}
                      className="text-xs text-[#687879] hover:text-[#C64D4D]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={resumeText}
                                onChange={e => {
                  setResumeTouched(true);
                  setResumeText(e.target.value);
                }}
                placeholder="Paste your resume sections (Skills, Projects, Education, Work Experience) here. Your resume text stays in your browser."
                className="w-full flex-1 p-4 text-sm text-[#202729] bg-[#F5F8F8] border border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20 resize-none font-mono leading-relaxed transition-colors"
              />
            </div>
          </div>

          {/* Empty state before the first analysis */}
          {!analysisResult && (
            <div className="p-10 text-center bg-white border border-dashed border-[#DCE6E6] rounded-2xl">
              <Sparkles className="w-8 h-8 text-[#087E83] mx-auto mb-2 opacity-70" />
              <h4 className="text-base font-bold text-[#155456]">Ready when you are</h4>
              <p className="text-sm text-[#687879] mt-1 max-w-md mx-auto">
                Paste a job description and your resume, then click &ldquo;Analyze resume&rdquo;. Or
                use the Sample buttons to see how the report looks.
              </p>
            </div>
          )}

          {/* Dedicated Results Workspace */}
          {analysisResult && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* A. Match Overview Card */}
              <div className="p-6 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#DCE6E6] mb-6">
                  <div>
                    <span className="text-xs font-bold text-[#087E83] uppercase tracking-wider">
                      ALIGNMENT REPORT
                    </span>
                    <h3 className="text-xl font-bold text-[#155456] mt-0.5">
                      Compatibility & Keyword Overlap
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      setSaveError(null);
                      setShowSaveDialog(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#087E83] bg-[#E1F0EF] hover:bg-[#D4E8E7] rounded-xl transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save to History</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  {/* Gauge */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-[#F5F8F8] border border-[#DCE6E6] rounded-2xl">
                    <span className="text-xs font-bold text-[#687879] uppercase tracking-wider mb-1">
                      Estimated Keyword Match
                    </span>
                    <div className="text-5xl font-serif-display tabular-nums text-[#087E83]">
                      {analysisResult.matchPercentage}%
                    </div>
                    <div className="w-full h-2.5 bg-[#DCE6E6] rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-[#087E83] rounded-full transition-all duration-500"
                        style={{ width: `${analysisResult.matchPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#687879] mt-2 font-medium text-center">
                      {analysisResult.matchPercentage >= 70
                        ? 'Strong term overlap across core qualifications.'
                        : 'Moderate alignment; key competencies missing.'}
                    </span>
                  </div>

                  {/* Summary Metric Strips */}
                  <div className="md:col-span-3 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white border border-[#DCE6E6] rounded-xl">
                        <span className="text-xs font-bold text-[#687879] uppercase tracking-wider block">
                          Matched Skills
                        </span>
                        <span className="text-2xl font-bold text-[#278567] tabular-nums mt-1 block">
                          {analysisResult.matchedKeywords.length}
                        </span>
                        <span className="text-xs text-[#687879]">Detected in both texts</span>
                      </div>

                      <div className="p-4 bg-white border border-[#DCE6E6] rounded-xl">
                        <span className="text-xs font-bold text-[#687879] uppercase tracking-wider block">
                          Missing Keywords
                        </span>
                        <span className="text-2xl font-bold text-[#C64D4D] tabular-nums mt-1 block">
                          {analysisResult.missingKeywords.length}
                        </span>
                        <span className="text-xs text-[#687879]">Required in job posting</span>
                      </div>

                      <div className="p-4 bg-white border border-[#DCE6E6] rounded-xl">
                        <span className="text-xs font-bold text-[#687879] uppercase tracking-wider block">
                          Additional Skills
                        </span>
                        <span className="text-2xl font-bold text-[#155456] tabular-nums mt-1 block">
                          {analysisResult.otherSkills.length}
                        </span>
                        <span className="text-xs text-[#687879]">In resume; unrequested</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#E1F0EF] border border-[#087E83]/20 rounded-xl flex items-start gap-3 text-xs text-[#155456]">
                      <Info className="w-4 h-4 text-[#087E83] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{analysisResult.disclaimer}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* B. Skills and Keyword Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Group 1: Skills found in both */}
                <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-5 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E6]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#278567]" />
                      <h4 className="text-xs font-bold text-[#155456] uppercase tracking-wider">
                        Found in Both ({analysisResult.matchedKeywords.length})
                      </h4>
                    </div>
                    <span className="text-xs text-[#278567] font-semibold">Matched</span>
                  </div>

                  {analysisResult.matchedKeywords.length === 0 ? (
                    <p className="text-xs text-[#687879] py-4">No direct keyword overlap found.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
                      {analysisResult.matchedKeywords.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E7F3EF] border border-[#278567]/30 rounded-lg text-xs font-semibold text-[#278567]"
                        >
                          <span>{item.term}</span>
                          <span className="text-[10px] opacity-75 font-mono">({item.count}×)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Group 2: Relevant terms missing from resume */}
                <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-5 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E6]">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#C64D4D]" />
                      <h4 className="text-xs font-bold text-[#155456] uppercase tracking-wider">
                        Missing from Resume ({analysisResult.missingKeywords.length})
                      </h4>
                    </div>
                    <span className="text-xs text-[#C64D4D] font-semibold">Gaps</span>
                  </div>

                  {analysisResult.missingKeywords.length === 0 ? (
                    <p className="text-xs text-[#278567] py-4 font-semibold">
                      Complete keyword coverage! All primary terms appear in your resume.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
                      {analysisResult.missingKeywords.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FBECEC] border border-[#C64D4D]/30 rounded-lg text-xs font-semibold text-[#C64D4D]"
                        >
                          <span>{item.term}</span>
                          <span className="text-[9px] uppercase px-1 py-0.5 bg-white rounded font-bold">
                            {item.importance}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Group 3: Terms in resume less relevant to role */}
                <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-5 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E6]">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#687879]" />
                      <h4 className="text-xs font-bold text-[#155456] uppercase tracking-wider">
                        Secondary / Unrequested ({analysisResult.otherSkills.length})
                      </h4>
                    </div>
                    <span className="text-xs text-[#687879] font-semibold">Resume only</span>
                  </div>

                  {analysisResult.otherSkills.length === 0 ? (
                    <p className="text-xs text-[#687879] py-4">No additional unrequested tech detected.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
                      {analysisResult.otherSkills.map((term, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-[#F5F8F8] border border-[#DCE6E6] rounded-lg text-xs font-medium text-[#202729]"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* C. Section-by-Section Structural Review */}
              <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-4">
                <div className="pb-3 border-b border-[#DCE6E6]">
                  <h3 className="text-xl font-bold text-[#155456]">Section-by-Section Review</h3>
                  <p className="text-sm text-[#687879] mt-0.5">
                    Structural evaluation of standard sections expected by early-career recruiters.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.sectionReviews.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl flex items-start gap-3"
                    >
                      {sec.detected ? (
                        <CheckCircle2 className="w-5 h-5 text-[#278567] shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-[#C28A35] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#155456]">{sec.section}</h4>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              sec.detected ? 'bg-[#E7F3EF] text-[#278567]' : 'bg-[#FDF5E8] text-[#C28A35]'
                            }`}
                          >
                            {sec.detected ? 'Detected' : 'Not identified'}
                          </span>
                        </div>
                        <p className="text-xs text-[#202729] mt-1 leading-relaxed">{sec.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* D. Actionable Recommendations */}
              <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E6]">
                  <div>
                    <h3 className="text-xl font-bold text-[#155456]">Actionable Recommendations</h3>
                    <p className="text-sm text-[#687879] mt-0.5">
                      Tailored guidance to improve bullet point strength and alignment.
                    </p>
                  </div>

                  <button
                    onClick={handleCopySuggestions}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#087E83] bg-[#E1F0EF] hover:bg-[#D4E8E7] rounded-xl transition-colors"
                  >
                    {copiedSuggestions ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSuggestions ? 'Copied' : 'Copy suggestions'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {analysisResult.actionableSuggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl flex items-start gap-3.5 text-sm text-[#202729] leading-relaxed"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E1F0EF] text-[#087E83] font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* E. Interactive Improvement Checklist */}
              <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E6]">
                  <div>
                    <h3 className="text-xl font-bold text-[#155456]">Resume Improvement Checklist</h3>
                    <p className="text-sm text-[#687879] mt-0.5">
                      Mark recommendations as completed as you polish your document.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#687879] tabular-nums">
                      {completedChecklistCount} of {checklistState.length} completed
                    </span>
                    <span className="text-xs font-bold text-[#087E83] font-mono">
                      ({checklistPercentage}%)
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {checklistState.map(chk => (
                    <div
                      key={chk.id}
                      onClick={() => handleToggleChecklist(chk.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        chk.completed
                          ? 'bg-[#E7F3EF]/60 border-[#278567]/30 text-[#155456]'
                          : 'bg-[#F5F8F8] border-[#DCE6E6] hover:border-[#087E83] text-[#202729]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {chk.completed ? (
                          <CheckSquare className="w-5 h-5 text-[#278567] shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-[#687879] shrink-0" />
                        )}
                        <span className={`text-sm ${chk.completed ? 'line-through text-[#687879]' : ''}`}>
                          {chk.text}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[#687879] bg-white px-2 py-0.5 rounded border border-[#DCE6E6] shrink-0">
                        {chk.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* F. Before-and-After Rewrite Examples */}
              <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-4">
                <div className="pb-3 border-b border-[#DCE6E6]">
                  <h3 className="text-xl font-bold text-[#155456]">
                    Before & After: Bullet Point Optimization Examples
                  </h3>
                  <p className="text-sm text-[#687879] mt-0.5">
                    Demonstrations of converting passive statements into measurable engineering achievements.
                  </p>
                </div>

                <div className="space-y-4">
                  {analysisResult.beforeAfterExamples.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl space-y-2.5"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C64D4D]">
                          Original (Vague / Passive)
                        </span>
                        <p className="text-xs text-[#687879] italic bg-white p-2.5 rounded-lg border border-[#DCE6E6]">
                          &ldquo;{item.original}&rdquo;
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#278567]">
                          Suggested Revision (Action + Tech Stack + Outcome)
                        </span>
                        <p className="text-xs font-semibold text-[#155456] bg-[#E7F3EF] p-2.5 rounded-lg border border-[#278567]/30">
                          &ldquo;{item.revised}&rdquo;
                        </p>
                      </div>

                      <p className="text-xs text-[#687879]">
                        <strong>Why this improves:</strong> {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Save Analysis Modal Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#DCE6E6] p-6 animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-base font-bold text-[#155456]">Save Analysis to History</h4>
            <p className="text-xs text-[#687879] mt-1">
              Give this analysis report a title to revisit your keyword alignment progress later.
            </p>

            {saveError && (
              <div className="flex items-start gap-2.5 mt-4 p-3 bg-[#FBECEC] text-[#C64D4D] text-xs font-medium rounded-xl border border-[#C64D4D]/20">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{saveError}</span>
              </div>
            )}

            <input
              type="text"
              maxLength={100}
              placeholder="e.g. Google SWE Summer 2027 — V1"
              value={saveTitle}
              onChange={e => setSaveTitle(e.target.value)}
              className="w-full mt-4 px-3.5 py-2.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
            />

            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[#DCE6E6]">
              <button
                onClick={() => setShowSaveDialog(false)}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-[#687879] hover:text-[#202729] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCurrentAnalysis}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#087E83] hover:bg-[#155456] rounded-xl shadow-xs transition-colors disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};