import React, { useState, useMemo, useEffect } from 'react';
import {
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  Search,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit3,
  ChevronRight,
  BookOpen,
  Save,
  X,
  Code2,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Play,
  ExternalLink,
  CheckSquare,
  Square,
  Star,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import {
  InterviewQuestion,
  QuestionCategory,
  QuestionDifficulty,
  QuestionStatus,
  LearningResource,
  DayStudyPlan,
  PracticeSession,
} from '../../types';
import { CustomQuestionInput, QuestionProgress } from '../../services/interviewService';
import { todayLocalISO } from '../../utils/dates';

interface InterviewPrepPageProps {
  questions: InterviewQuestion[];
  resources: LearningResource[];
  studyPlan: DayStudyPlan[];
  sessions: PracticeSession[];
  onSaveProgress: (id: string, changes: QuestionProgress) => Promise<void>;
  onCreateCustom: (input: CustomQuestionInput) => Promise<InterviewQuestion>;
  onUpdateCustom: (id: string, input: CustomQuestionInput) => Promise<void>;
  onDeleteCustom: (id: string) => Promise<void>;
  onToggleResource: (id: string, field: 'bookmarked' | 'completed') => Promise<void>;
  onToggleStudyDay: (day: number) => Promise<void>;
  onSaveSession: (session: Omit<PracticeSession, 'id'>) => Promise<void>;
}

export const InterviewPrepPage: React.FC<InterviewPrepPageProps> = ({
  questions,
  resources,
  studyPlan,
  sessions,
  onSaveProgress,
  onCreateCustom,
  onUpdateCustom,
  onDeleteCustom,
  onToggleResource,
  onToggleStudyDay,
  onSaveSession,
}) => {
  // Navigation: Learning path or Special Mode
  const [activePath, setActivePath] = useState<
    | 'Technical'
    | 'HR & Behavioral'
    | 'Role-Specific'
    | 'Company-Specific'
    | 'Resources'
    | 'Study Plan'
    | 'Saved'
  >('Technical');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // The selected question is looked up by id, so it always shows the latest saved data
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedQuestion = useMemo(
    () => questions.find(q => q.id === selectedId) ?? null,
    [questions, selectedId]
  );

  // Pick the first question once they have loaded (or after the selected one is deleted)
  useEffect(() => {
    if (!selectedId && questions.length > 0) {
      setSelectedId(questions[0].id);
    }
  }, [questions, selectedId]);

  // Errors from quick actions (bookmark, status, ticks, sessions)
  const [pageError, setPageError] = useState<string | null>(null);
  useEffect(() => {
    if (!pageError) return;
    const timer = setTimeout(() => setPageError(null), 6000);
    return () => clearTimeout(timer);
  }, [pageError]);

  const run = async (action: () => Promise<unknown>, fallback: string) => {
    try {
      await action();
    } catch (err) {
      setPageError(err instanceof Error && err.message ? err.message : fallback);
    }
  };

  // Question detail states
  const [activeQuestionTab, setActiveQuestionTab] = useState<
    'refresher' | 'structure' | 'example' | 'mistakes' | 'practice'
  >('refresher');
  const [userPracticeText, setUserPracticeText] = useState('');
  const [revealModelAnswer, setRevealModelAnswer] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [isNotesSaved, setIsNotesSaved] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Mock Interview Mode Modal
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [mockQuestions, setMockQuestions] = useState<InterviewQuestion[]>([]);
  const [mockIndex, setMockIndex] = useState(0);
  const [mockTimerSeconds, setMockTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [mockConfidence, setMockConfidence] = useState<number>(4);
  const [mockCompletedSummary, setMockCompletedSummary] = useState<boolean>(false);

  // Custom question modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [formQuestion, setFormQuestion] = useState('');
  const [formCategory, setFormCategory] = useState<QuestionCategory>('Technical');
  const [formTopic, setFormTopic] = useState('');
  const [formSubCategory, setFormSubCategory] = useState('JavaScript & React');
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>('Medium');
  const [formAssessing, setFormAssessing] = useState('');
  const [formRefresher, setFormRefresher] = useState('');
  const [formExampleAnswer, setFormExampleAnswer] = useState('');
  const [formTips, setFormTips] = useState('');

  // Fill the notes and practice boxes when a different question is selected
  useEffect(() => {
    if (selectedQuestion) {
      setNotesText(selectedQuestion.notes || '');
      setUserPracticeText(selectedQuestion.userPracticeAnswer || '');
      setRevealModelAnswer(false);
      setActiveQuestionTab('refresher');
    }
  }, [selectedQuestion?.id]);

  // Timer effect for mock interview
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setMockTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (activePath === 'Saved') {
        if (!q.saved) return false;
      } else if (activePath === 'Company-Specific') {
        // Company-specific prep questions
        if (q.learningPath !== 'Company-Specific' && q.category !== 'Role-Specific') return false;
      } else if (activePath === 'Technical') {
        if (q.category !== 'Technical') return false;
      } else if (activePath === 'HR & Behavioral') {
        if (q.category !== 'HR & Behavioral') return false;
      } else if (activePath === 'Role-Specific') {
        if (q.category !== 'Role-Specific') return false;
      }

      if (selectedSubCategory !== 'All' && q.subCategory !== selectedSubCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          q.question.toLowerCase().includes(query) ||
          q.topic.toLowerCase().includes(query) ||
          (q.conceptRefresher && q.conceptRefresher.toLowerCase().includes(query)) ||
          (q.notes && q.notes.toLowerCase().includes(query));
        if (!matches) return false;
      }

      if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) {
        return false;
      }

      if (statusFilter !== 'All' && q.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [questions, activePath, selectedSubCategory, searchQuery, difficultyFilter, statusFilter]);

  // Overall metrics
  const totalCount = questions.length;
  const completedCount = questions.filter(q => q.status === 'Completed').length;
  const practicingCount = questions.filter(q => q.status === 'Practicing').length;
  const savedCount = questions.filter(q => q.saved).length;
  const sessionsCount = sessions.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Question subcategories for the active path
  const availableSubCategories = useMemo(() => {
    const list = new Set<string>();
    questions
      .filter(q => {
        if (activePath === 'Technical') return q.category === 'Technical';
        if (activePath === 'HR & Behavioral') return q.category === 'HR & Behavioral';
        if (activePath === 'Role-Specific') return q.category === 'Role-Specific';
        return true;
      })
      .forEach(q => {
        if (q.subCategory) list.add(q.subCategory);
      });
    return Array.from(list);
  }, [questions, activePath]);

  // Handlers
  const handleSaveNotes = async () => {
    if (!selectedQuestion) return;
    setIsSavingNotes(true);
    try {
      await onSaveProgress(selectedQuestion.id, {
        notes: notesText,
        userPracticeAnswer: userPracticeText,
      });
      setIsNotesSaved(true);
      setTimeout(() => setIsNotesSaved(false), 2000);
    } catch (err) {
      setPageError(
        err instanceof Error && err.message ? err.message : 'Could not save your notes.'
      );
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleToggleSaved = (e: React.MouseEvent, q: InterviewQuestion) => {
    e.stopPropagation();
    run(() => onSaveProgress(q.id, { saved: !q.saved }), 'Could not update the bookmark.');
  };

  const handleStatusChange = (q: InterviewQuestion, newStatus: QuestionStatus) => {
    run(() => onSaveProgress(q.id, { status: newStatus }), 'Could not update the status.');
  };

  const handleToggleResource = (id: string, field: 'bookmarked' | 'completed') => {
    run(() => onToggleResource(id, field), 'Could not update the resource.');
  };

  const handleToggleDayStudyPlan = (dayNum: number) => {
    run(() => onToggleStudyDay(dayNum), 'Could not update the study plan.');
  };

  // Mock interview launch
  const startMockInterview = () => {
    const pool = questions.length > 0 ? [...questions].sort(() => Math.random() - 0.5).slice(0, 4) : [];
    setMockQuestions(pool);
    setMockIndex(0);
    setMockTimerSeconds(0);
    setIsTimerRunning(true);
    setMockCompletedSummary(false);
    setIsMockModalOpen(true);
  };

  const handleNextMock = () => {
    if (mockIndex < mockQuestions.length - 1) {
      setMockIndex(prev => prev + 1);
    } else {
      // Finished
      setIsTimerRunning(false);
      setMockCompletedSummary(true);
      run(
        () =>
          onSaveSession({
            date: todayLocalISO(),
            questionIds: mockQuestions.map(q => q.id),
            completedCount: mockQuestions.length,
            averageConfidence: mockConfidence,
            durationMinutes: Math.max(1, Math.round(mockTimerSeconds / 60)),
          }),
        'Could not save your practice session.'
      );
    }
  };

  const handleOpenAddModal = () => {
    setFormQuestion('');
    setFormCategory('Technical');
    setFormTopic('');
    setFormSubCategory('JavaScript & React');
    setFormDifficulty('Medium');
    setFormAssessing('');
    setFormRefresher('');
    setFormExampleAnswer('');
    setFormTips('');
    setFormError(null);
    setEditingQuestion(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (q: InterviewQuestion) => {
    setFormQuestion(q.question);
    setFormCategory(q.category);
    setFormTopic(q.topic);
    setFormSubCategory(q.subCategory || '');
    setFormDifficulty(q.difficulty);
    setFormAssessing(q.assessing || '');
    setFormRefresher(q.conceptRefresher || '');
    setFormExampleAnswer(q.exampleAnswer || '');
    setFormTips(q.preparationTips.join('\n'));
    setFormError(null);
    setEditingQuestion(q);
    setIsAddModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formTopic.trim()) return;

    const tipsArray = formTips
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean);

    const input: CustomQuestionInput = {
      question: formQuestion.trim(),
      category: formCategory,
      topic: formTopic.trim(),
      subCategory: formSubCategory.trim(),
      difficulty: formDifficulty,
      assessing: formAssessing.trim(),
      conceptRefresher: formRefresher.trim(),
      exampleAnswer: formExampleAnswer.trim(),
      preparationTips: tipsArray,
    };

    setFormError(null);
    setIsSavingForm(true);
    try {
      if (editingQuestion) {
        await onUpdateCustom(editingQuestion.id, input);
      } else {
        const created = await onCreateCustom(input);
        setSelectedId(created.id);
      }
      setIsAddModalOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error && err.message
          ? err.message
          : 'Could not save the question. Please try again.'
      );
    } finally {
      setIsSavingForm(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Error banner for quick actions */}
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
            CAREER PREPARATION WORKSPACE
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-display text-[#155456] tracking-tight">
            Interview Prep
          </h2>
          <p className="text-base text-[#687879] mt-1.5 max-w-2xl leading-relaxed">
            Build your knowledge. Practise your answers. Walk in prepared.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={startMockInterview}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F5F8F8] text-[#155456] border border-[#087E83] text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Play className="w-4 h-4 text-[#087E83]" />
            <span>Launch Mock Interview</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#087E83] hover:bg-[#155456] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add question</span>
          </button>
        </div>
      </div>

      {/* Compact progress summary */}
      <div className="px-5 py-4 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-bold text-[#155456]">
              {completedCount} of {totalCount} questions completed
            </span>
            <span className="text-sm font-bold text-[#278567] tabular-nums">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#DCE6E6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#278567] rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-5 text-xs text-[#687879] shrink-0">
          <span>
            <strong className="text-[#C28A35] text-base tabular-nums">{practicingCount}</strong> in progress
          </span>
          <span>
            <strong className="text-[#087E83] text-base tabular-nums">{savedCount}</strong> saved
          </span>
          <span>
            <strong className="text-[#155456] text-base tabular-nums">{sessionsCount}</strong> mock sessions
          </span>
        </div>
      </div>

      {/* Level 1: main sections */}
      <div className="flex items-center gap-1 p-1 bg-white border border-[#DCE6E6] rounded-xl shadow-xs w-fit max-w-full overflow-x-auto">
        {[
          { id: 'questions', label: 'Questions', count: questions.length },
          { id: 'Study Plan', label: 'Study Plan', count: studyPlan.length },
          { id: 'Resources', label: 'Resources', count: resources.length },
        ].map(section => {
          const isActive =
            section.id === 'questions'
              ? activePath !== 'Study Plan' && activePath !== 'Resources'
              : activePath === section.id;
          return (
            <button
              key={section.id}
              onClick={() => {
                if (section.id === 'questions') {
                  if (activePath === 'Study Plan' || activePath === 'Resources') {
                    setActivePath('Technical');
                  }
                } else {
                  setActivePath(section.id as 'Study Plan' | 'Resources');
                }
                setSelectedSubCategory('All');
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#087E83] text-white shadow-xs'
                  : 'text-[#687879] hover:text-[#202729] hover:bg-[#F5F8F8]'
              }`}
            >
              <span>{section.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#DCE6E6] text-[#687879]'
                }`}
              >
                {section.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Level 2: question tracks (only inside Questions) */}
      {activePath !== 'Study Plan' && activePath !== 'Resources' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'Technical' as const, label: 'Technical', count: questions.filter(q => q.category === 'Technical').length },
            { id: 'HR & Behavioral' as const, label: 'HR & Behavioral', count: questions.filter(q => q.category === 'HR & Behavioral').length },
            { id: 'Role-Specific' as const, label: 'Role-Specific', count: questions.filter(q => q.category === 'Role-Specific').length },
            { id: 'Saved' as const, label: 'Saved', count: savedCount },
          ].map(track => {
            const isActive = activePath === track.id;
            return (
              <button
                key={track.id}
                onClick={() => {
                  setActivePath(track.id);
                  setSelectedSubCategory('All');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#155456] text-white border-[#155456]'
                    : 'bg-white border-[#DCE6E6] text-[#687879] hover:text-[#202729]'
                }`}
              >
                <span>{track.label}</span>
                <span className={isActive ? 'text-white/70' : 'text-[#687879]/70'}>{track.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Conditional Content: Study Plan vs Learning Resources vs Questions Workspace */}
      {activePath === 'Resources' ? (
        /* Curated Learning Resources Hub */
        <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE6E6]">
            <div>
              <h3 className="text-lg font-bold text-[#155456]">Verified Learning Resources & Guides</h3>
              <p className="text-xs text-[#687879] mt-0.5">
                Official documentation, algorithm problem roadmaps, and verified open-course materials.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#087E83] bg-[#E1F0EF] px-3 py-1 rounded-xl self-start sm:self-auto">
              Real External Documentation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map(res => (
              <div
                key={res.id}
                className="p-5 bg-[#F5F8F8] border border-[#DCE6E6] hover:border-[#087E83] rounded-2xl transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[#DCE6E6] text-[#087E83]">
                      {res.type}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleResource(res.id, 'completed')}
                        className="text-[#687879] hover:text-[#278567] transition-colors"
                        title={res.completed ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        {res.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#278567]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleToggleResource(res.id, 'bookmarked')}
                        className="text-[#687879] hover:text-[#087E83] transition-colors"
                        title={res.bookmarked ? 'Remove bookmark' : 'Bookmark resource'}
                      >
                        {res.bookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-[#087E83]" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[#155456] leading-snug">{res.title}</h4>
                  <p className="text-xs text-[#687879] mt-1.5 leading-relaxed">{res.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#DCE6E6] text-xs">
                  <span className="text-[#687879] font-medium">{res.topic}</span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 font-bold text-[#087E83] hover:underline"
                  >
                    <span>Open Documentation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activePath === 'Study Plan' ? (
        /* 7-Day Interview Preparation Plan */
        <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE6E6]">
            <div>
              <h3 className="text-lg font-bold text-[#155456]">7-Day Structured Preparation Plan</h3>
              <p className="text-xs text-[#687879] mt-0.5">
                Structured daily milestones designed to guide student preparation before upcoming interview loops.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#087E83] bg-[#E1F0EF] px-3 py-1 rounded-xl">
              {studyPlan.filter(d => d.completed).length} of {studyPlan.length} Days Completed
            </span>
          </div>

          <div className="space-y-4">
            {studyPlan.map(day => (
              <div
                key={day.day}
                className={`p-5 rounded-2xl border transition-all ${
                  day.completed
                    ? 'bg-[#E7F3EF]/50 border-[#278567]/30'
                    : 'bg-[#F5F8F8] border-[#DCE6E6]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => handleToggleDayStudyPlan(day.day)}
                      className="mt-0.5 text-[#087E83] hover:text-[#155456]"
                      title="Toggle completed day"
                    >
                      {day.completed ? (
                        <CheckSquare className="w-5 h-5 text-[#278567]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#687879]" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h4
                          className={`text-sm font-bold ${
                            day.completed ? 'text-[#155456] line-through' : 'text-[#155456]'
                          }`}
                        >
                          {day.title}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#DCE6E6] text-[#087E83]">
                          Day {day.day}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#202729]">{day.focus}</p>
                      <p className="text-xs text-[#687879] leading-relaxed">{day.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 shrink-0 justify-end">
                    {day.targetTopics.map(t => (
                      <span
                        key={t}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-[#DCE6E6] text-[#687879]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Questions Learning & Practice Workspace */
        <div className="space-y-6">
          {/* Filters */}
          <div className="p-4 bg-white border border-[#DCE6E6] rounded-2xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <select
              value={selectedSubCategory}
              onChange={e => setSelectedSubCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-[#202729] font-medium focus:outline-none focus:border-[#087E83]"
            >
              <option value="All">All topics</option>
              {availableSubCategories.map(sub => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#687879]" />
                <input
                  type="text"
                  placeholder="Search questions or keywords..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>

              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
              >
                <option value="All">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="Practicing">In Practice</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Main 2-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Questions List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#687879] px-1 font-semibold">
                <span>{filteredQuestions.length} Questions</span>
                <span>Click to study concept & practice</span>
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#DCE6E6] rounded-2xl shadow-xs">
                  <HelpCircle className="w-8 h-8 text-[#687879] mx-auto mb-2 opacity-50" />
                  <h4 className="text-sm font-bold text-[#155456]">No questions match filters</h4>
                  <p className="text-xs text-[#687879] mt-1">Try resetting search keywords or difficulty filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuestions.map(q => {
                    const isSelected = selectedQuestion?.id === q.id;
                    return (
                      <div
                        key={q.id}
                        onClick={() => setSelectedId(q.id)}
                        className={`p-4 bg-white border rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#087E83] ring-2 ring-[#087E83]/20 shadow-sm'
                            : 'border-[#DCE6E6] hover:border-[#087E83] shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold text-[#155456] bg-[#E1F0EF] px-2 py-0.5 rounded-md">
                              {q.topic}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                q.difficulty === 'Easy'
                                  ? 'bg-[#E7F3EF] text-[#278567]'
                                  : q.difficulty === 'Medium'
                                  ? 'bg-[#FDF5E8] text-[#C28A35]'
                                  : 'bg-[#FBECEC] text-[#C64D4D]'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                q.status === 'Completed'
                                  ? 'bg-[#E7F3EF] text-[#278567]'
                                  : q.status === 'Practicing'
                                  ? 'bg-[#FDF5E8] text-[#C28A35]'
                                  : 'bg-[#F5F8F8] text-[#687879]'
                              }`}
                            >
                              {q.status}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={e => handleToggleSaved(e, q)}
                            className="text-[#687879] hover:text-[#087E83] p-1"
                            title={q.saved ? 'Remove bookmark' : 'Bookmark question'}
                          >
                            {q.saved ? (
                              <BookmarkCheck className="w-4 h-4 text-[#087E83]" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <h4 className="text-sm font-bold text-[#202729] leading-snug line-clamp-2">
                          {q.question}
                        </h4>

                        <div className="flex items-center justify-between text-xs text-[#687879] mt-3 pt-2.5 border-t border-[#DCE6E6]">
                          <span className="text-[11px] truncate max-w-[180px]">
                            {q.subCategory || q.category}
                          </span>
                          <div className="flex items-center gap-1 text-[#087E83] font-semibold text-xs">
                            <span>Open Learning View</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Detailed Learning & Practice View (7 cols) */}
            <div className="lg:col-span-7 sticky top-20 space-y-4">
              {selectedQuestion ? (
                <div className="bg-white border border-[#DCE6E6] rounded-2xl shadow-xs p-6 space-y-5 animate-in fade-in duration-150">
                  {/* Question Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-[#DCE6E6] gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#087E83] uppercase tracking-wider">
                          {selectedQuestion.topic}
                        </span>
                        <span className="text-xs text-[#687879]">·</span>
                        <span className="text-xs text-[#687879]">{selectedQuestion.subCategory}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            selectedQuestion.difficulty === 'Easy'
                              ? 'bg-[#E7F3EF] text-[#278567]'
                              : selectedQuestion.difficulty === 'Medium'
                              ? 'bg-[#FDF5E8] text-[#C28A35]'
                              : 'bg-[#FBECEC] text-[#C64D4D]'
                          }`}
                        >
                          {selectedQuestion.difficulty}
                        </span>
                        {selectedQuestion.isCustom && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E1F0EF] text-[#087E83]">
                            Your question
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-[#155456] leading-snug">
                        {selectedQuestion.question}
                      </h3>
                    </div>

                    {/* Edit and delete only apply to your own custom questions */}
                    {selectedQuestion.isCustom && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(selectedQuestion)}
                          className="p-1.5 text-[#687879] hover:text-[#087E83] rounded-lg transition-colors"
                          title="Edit Question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const id = selectedQuestion.id;
                            run(async () => {
                              await onDeleteCustom(id);
                              setSelectedId(null);
                            }, 'Could not delete the question.');
                          }}
                          className="p-1.5 text-[#687879] hover:text-[#C64D4D] rounded-lg transition-colors"
                          title="Delete Custom Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 1. What the Interviewer is Assessing */}
                  {selectedQuestion.assessing && (
                    <div className="p-3.5 bg-[#E1F0EF] border border-[#087E83]/30 rounded-xl flex items-start gap-3 text-xs text-[#155456]">
                      <Lightbulb className="w-4 h-4 text-[#087E83] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold mb-0.5">What the Interviewer is Assessing:</strong>
                        <span className="leading-relaxed">{selectedQuestion.assessing}</span>
                      </div>
                    </div>
                  )}

                  {/* Learning Section Tabs */}
                  <div className="flex items-center border-b border-[#DCE6E6] gap-2 overflow-x-auto pb-1">
                    {[
                      { id: 'refresher' as const, label: 'Concept Refresher' },
                      { id: 'structure' as const, label: 'Answer Structure' },
                      { id: 'example' as const, label: 'Model Example Answer' },
                      { id: 'mistakes' as const, label: 'Common Pitfalls' },
                      { id: 'practice' as const, label: 'Practice & Notes' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setActiveQuestionTab(t.id)}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                          activeQuestionTab === t.id
                            ? 'bg-[#155456] text-white shadow-xs font-bold'
                            : 'text-[#687879] hover:text-[#202729] hover:bg-[#F5F8F8]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Body */}
                  <div className="space-y-4 min-h-[220px]">
                    {activeQuestionTab === 'refresher' && (
                      <div className="space-y-4">
                        <p className="text-sm text-[#202729] leading-relaxed whitespace-pre-wrap">
                          {selectedQuestion.conceptRefresher || 'No technical refresher provided.'}
                        </p>

                        {selectedQuestion.codeSnippet && (
                          <div className="rounded-xl overflow-hidden border border-[#DCE6E6]">
                            <div className="bg-[#202729] px-4 py-2 text-xs font-mono text-[#E1F0EF] flex justify-between items-center">
                              <span>Code Implementation ({selectedQuestion.codeSnippet.language})</span>
                              <Code2 className="w-3.5 h-3.5 text-[#087E83]" />
                            </div>
                            <pre className="p-4 bg-[#155456] text-white text-xs font-mono overflow-x-auto leading-relaxed">
                              <code>{selectedQuestion.codeSnippet.code}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {activeQuestionTab === 'structure' && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#687879]">
                          Recommended Response Framework
                        </h4>
                        <div className="space-y-2">
                          {(selectedQuestion.answerStructure || selectedQuestion.preparationTips).map(
                            (step, i) => (
                              <div
                                key={i}
                                className="p-3 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl flex items-start gap-3 text-sm text-[#202729]"
                              >
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E1F0EF] text-[#087E83] font-bold text-xs shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {activeQuestionTab === 'example' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-sm text-[#202729] leading-relaxed whitespace-pre-wrap">
                          {selectedQuestion.exampleAnswer || 'No model answer provided.'}
                        </div>

                        {selectedQuestion.followUpQuestions && selectedQuestion.followUpQuestions.length > 0 && (
                          <div className="space-y-2.5 pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#155456]">
                              Anticipated Follow-up Questions & Hints
                            </h4>
                            {selectedQuestion.followUpQuestions.map((fu, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-white border border-[#DCE6E6] rounded-xl text-xs space-y-1"
                              >
                                <span className="font-bold text-[#155456] block">{fu.question}</span>
                                <p className="text-[#687879]">
                                  <strong>Hint:</strong> {fu.hint}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeQuestionTab === 'mistakes' && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#C64D4D]">
                          Common Mistakes & Misconceptions to Avoid
                        </h4>
                        {selectedQuestion.commonMistakes && selectedQuestion.commonMistakes.length > 0 ? (
                          <div className="space-y-2">
                            {selectedQuestion.commonMistakes.map((mistake, i) => (
                              <div
                                key={i}
                                className="p-3 bg-[#FBECEC] border border-[#C64D4D]/20 rounded-xl flex items-start gap-3 text-xs text-[#202729]"
                              >
                                <AlertTriangle className="w-4 h-4 text-[#C64D4D] shrink-0 mt-0.5" />
                                <span>{mistake}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#687879]">No specific mistakes noted for this topic.</p>
                        )}
                      </div>
                    )}

                    {activeQuestionTab === 'practice' && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-[#155456] uppercase tracking-wider">
                              Write Your Answer (Practice Mode)
                            </label>
                            <button
                              type="button"
                              onClick={() => setRevealModelAnswer(!revealModelAnswer)}
                              className="text-xs font-semibold text-[#087E83] hover:underline flex items-center gap-1"
                            >
                              {revealModelAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span>{revealModelAnswer ? 'Hide Model Answer' : 'Reveal Model Answer'}</span>
                            </button>
                          </div>
                          <textarea
                            rows={5}
                            maxLength={10000}
                            value={userPracticeText}
                            onChange={e => setUserPracticeText(e.target.value)}
                            placeholder="Draft your verbal talking points, Situation-Task-Action-Result structure, or technical explanation..."
                            className="w-full p-3.5 text-sm bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl text-[#202729] focus:bg-white focus:outline-none focus:border-[#087E83]"
                          />
                        </div>

                        {revealModelAnswer && (
                          <div className="p-4 bg-[#E7F3EF] border border-[#278567]/30 rounded-xl text-xs text-[#155456] leading-relaxed space-y-1">
                            <strong className="block font-bold">Model Answer Reference:</strong>
                            <p>{selectedQuestion.exampleAnswer}</p>
                          </div>
                        )}

                        <div>
                          <label className="text-xs font-bold text-[#687879] uppercase tracking-wider block mb-1">
                            Personal Study Notes
                          </label>
                          <textarea
                            rows={2}
                            maxLength={5000}
                            value={notesText}
                            onChange={e => setNotesText(e.target.value)}
                            placeholder="Add personal code notes or interviewer feedback..."
                            className="w-full p-3 text-xs bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status & Save Strip */}
                  <div className="pt-4 border-t border-[#DCE6E6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#687879]">Status:</span>
                      {(['Not Started', 'Practicing', 'Completed'] as QuestionStatus[]).map(st => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(selectedQuestion, st)}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                            selectedQuestion.status === st
                              ? 'bg-[#155456] text-white border-[#155456] shadow-xs'
                              : 'bg-white border-[#DCE6E6] text-[#687879] hover:bg-[#F5F8F8]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {isNotesSaved && (
                        <span className="text-xs font-semibold text-[#278567] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Saved
                        </span>
                      )}
                      <button
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#087E83] hover:bg-[#155456] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-60"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingNotes ? 'Saving...' : 'Save Notes & Answer'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-white border border-[#DCE6E6] rounded-2xl shadow-xs">
                  <BookOpen className="w-10 h-10 text-[#687879] mx-auto mb-2 opacity-50" />
                  <h4 className="text-base font-bold text-[#155456]">No Question Selected</h4>
                  <p className="text-sm text-[#687879] mt-1">Select a question to view deep concepts and practice.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mock Interview Simulation Modal */}
      {isMockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#DCE6E6] p-6 animate-in fade-in zoom-in-95 duration-150 space-y-6">
            {!mockCompletedSummary ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E6]">
                  <div>
                    <span className="text-xs font-bold text-[#087E83] uppercase tracking-wider">
                      SIMULATION MODE
                    </span>
                    <h3 className="text-lg font-bold text-[#155456]">
                      Question {mockIndex + 1} of {mockQuestions.length}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F8F8] border border-[#DCE6E6] rounded-xl font-mono text-sm text-[#155456] font-bold">
                      <Clock className="w-4 h-4 text-[#087E83]" />
                      <span>
                        {String(Math.floor(mockTimerSeconds / 60)).padStart(2, '0')}:
                        {String(mockTimerSeconds % 60).padStart(2, '0')}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setIsMockModalOpen(false);
                      }}
                      className="p-1.5 text-[#687879] hover:text-[#202729]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {mockQuestions[mockIndex] ? (
                  <div className="space-y-4">
                    <div className="p-5 bg-[#F5F8F8] border border-[#DCE6E6] rounded-2xl space-y-2">
                      <span className="text-xs font-bold text-[#087E83] uppercase">
                        {mockQuestions[mockIndex].topic} · {mockQuestions[mockIndex].difficulty}
                      </span>
                      <h4 className="text-base font-bold text-[#155456] leading-relaxed">
                        {mockQuestions[mockIndex].question}
                      </h4>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#687879] uppercase tracking-wider block mb-1">
                        Verbal Practice Scratchpad
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Type bullet notes or outline your solution as you speak out loud..."
                        className="w-full p-3.5 text-sm bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#DCE6E6]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#687879]">Self Confidence:</span>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setMockConfidence(star)}
                            className="p-1"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= mockConfidence
                                  ? 'text-[#C28A35] fill-[#C28A35]'
                                  : 'text-[#DCE6E6]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleNextMock}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#087E83] hover:bg-[#155456] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                      >
                        <span>{mockIndex === mockQuestions.length - 1 ? 'Finish Simulation' : 'Next Question'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#687879] text-center py-8">
                    There are no questions available for a mock session yet.
                  </p>
                )}
              </>
            ) : (
              /* Simulation Completed Summary */
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-full bg-[#E7F3EF] text-[#278567] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-serif-display text-[#155456]">
                    Practice Session Completed!
                  </h3>
                  <p className="text-sm text-[#687879]">
                    You rehearsed {mockQuestions.length} questions in{' '}
                    {Math.max(1, Math.round(mockTimerSeconds / 60))} minutes.
                  </p>
                </div>

                <div className="p-4 bg-[#F5F8F8] border border-[#DCE6E6] rounded-2xl max-w-sm mx-auto flex items-center justify-around text-xs">
                  <div>
                    <span className="text-[#687879] block">Questions</span>
                    <span className="font-bold text-lg text-[#155456]">{mockQuestions.length}</span>
                  </div>
                  <div>
                    <span className="text-[#687879] block">Duration</span>
                    <span className="font-bold text-lg text-[#155456]">
                      {Math.max(1, Math.round(mockTimerSeconds / 60))}m
                    </span>
                  </div>
                  <div>
                    <span className="text-[#687879] block">Confidence</span>
                    <span className="font-bold text-lg text-[#C28A35]">{mockConfidence} / 5</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMockModalOpen(false)}
                  className="px-6 py-2.5 bg-[#087E83] hover:bg-[#155456] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Return to Preparation Workspace
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Custom Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#DCE6E6] p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E6] mb-4">
              <h3 className="text-base font-bold text-[#155456]">
                {editingQuestion ? 'Edit Your Question' : 'Add Custom Interview Question'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#687879] hover:text-[#202729]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {formError && (
                <div className="flex items-start gap-2.5 p-3 bg-[#FBECEC] text-[#C64D4D] text-xs font-medium rounded-xl border border-[#C64D4D]/20">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#202729] mb-1">
                  Question Prompt <span className="text-[#C64D4D]">*</span>
                </label>
                <input
                  type="text"
                  maxLength={300}
                  placeholder="e.g. How does Redis caching improve Node.js API throughput?"
                  value={formQuestion}
                  onChange={e => setFormQuestion(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202729] mb-1">Track</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as QuestionCategory)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR & Behavioral">HR & Behavioral</option>
                    <option value="Role-Specific">Role-Specific</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202729] mb-1">Subcategory</label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Databases & SQL"
                    value={formSubCategory}
                    onChange={e => setFormSubCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202729] mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={e => setFormDifficulty(e.target.value as QuestionDifficulty)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202729] mb-1">
                  Topic / Sub-domain <span className="text-[#C64D4D]">*</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Caching, React Hooks, Concurrency"
                  value={formTopic}
                  onChange={e => setFormTopic(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202729] mb-1">
                  What Interviewer is Assessing
                </label>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="e.g. Memory caching latency, invalidation strategies..."
                  value={formAssessing}
                  onChange={e => setFormAssessing(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202729] mb-1">
                  Concept Refresher Explanation
                </label>
                <textarea
                  rows={3}
                  maxLength={5000}
                  placeholder="Provide technical refresher context and key architectural takeaways..."
                  value={formRefresher}
                  onChange={e => setFormRefresher(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202729] mb-1">
                  Model Example Answer
                </label>
                <textarea
                  rows={3}
                  maxLength={5000}
                  placeholder="Comprehensive model answer to use as study baseline..."
                  value={formExampleAnswer}
                  onChange={e => setFormExampleAnswer(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#DCE6E6] rounded-xl text-[#202729] focus:outline-none focus:border-[#087E83]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE6E6]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSavingForm}
                  className="px-4 py-2 text-xs font-semibold text-[#687879] hover:text-[#202729]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingForm}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#087E83] hover:bg-[#155456] rounded-xl shadow-xs transition-colors disabled:opacity-60"
                >
                  {isSavingForm ? 'Saving...' : editingQuestion ? 'Save Changes' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};