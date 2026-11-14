import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  ArrowLeft,
  Award,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import * as examService from '../../services/examinationService.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card.jsx';
import Modal from '../../components/ui/Modal.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';

export default function ExamTakingPage() {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  // Primary state
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedAnswer }
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const deadlineRef = useRef(null);

  // Persistence state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Load examination & active attempt
  const initializeExam = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      // First attempt to start or resume the examination attempt
      const res = await examService.startOrResumeAttempt(examId);
      const data = res.data;

      setExam(data.examination);
      setAttempt(data.attempt);
      setRemainingSeconds(data.remainingSeconds);
      deadlineRef.current = new Date(data.attempt.deadline).getTime();

      // Hydrate answers map from existing attempt
      const existingAnswers = {};
      if (Array.isArray(data.attempt.answers)) {
        data.attempt.answers.forEach((ans) => {
          existingAnswers[ans.questionId] = ans.selectedAnswer;
        });
      }
      setAnswers(existingAnswers);
      setHasStarted(true);

      // Check if attempt was already submitted
      if (data.attempt.status === 'SUBMITTED') {
        setSubmittedResult({
          score: data.attempt.score,
          totalMarks: data.examination.totalMarks,
          passed: data.attempt.passed,
          submittedAt: data.attempt.submittedAt,
        });
      }
    } catch (err) {
      // If student already submitted, retrieve the existing attempt
      if (err.message && err.message.toLowerCase().includes('already submitted')) {
        try {
          const attemptRes = await examService.getStudentAttempt(examId);
          const attData = attemptRes.data;
          setExam(attData.examination);
          setAttempt(attData.attempt);
          setSubmittedResult({
            score: attData.attempt.score,
            totalMarks: attData.examination.totalMarks,
            passed: attData.attempt.passed,
            submittedAt: attData.attempt.submittedAt,
          });
          setHasStarted(true);
        } catch {
          setLoadError(err.message || 'Failed to initialize examination');
        }
      } else {
        setLoadError(err.message || 'Failed to initialize examination');
      }
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    initializeExam();
  }, [initializeExam]);

  // Format answers for server payload
  const formatAnswersPayload = (answersMap) => {
    return Object.entries(answersMap).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer,
    }));
  };

  // Authoritative submission handler
  const handleSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (isSubmitting || submittedResult) return;

      setIsSubmitting(true);
      setShowConfirmModal(false);

      try {
        const payload = formatAnswersPayload(answers);
        const res = await examService.submitAttempt(examId, payload);
        const finalAttempt = res.data?.attempt;

        setSubmittedResult({
          score: finalAttempt?.score,
          totalMarks: finalAttempt?.totalMarks || exam?.totalMarks,
          passed: finalAttempt?.passed,
          submittedAt: finalAttempt?.submittedAt || new Date().toISOString(),
          isAutoSubmit,
        });
      } catch (err) {
        setSaveErrorMsg(err.message || 'Submission failed. Please check connectivity.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers, exam, examId, isSubmitting, submittedResult]
  );

  // Authoritative Timer Interval
  useEffect(() => {
    if (!hasStarted || submittedResult || !deadlineRef.current) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((deadlineRef.current - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        clearInterval(interval);
        handleSubmit(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, submittedResult, handleSubmit]);

  // Background Auto-Save Answer Selection
  const handleSelectAnswer = async (option) => {
    if (submittedResult || isSubmitting) return;

    const currentQuestion = exam.questions[currentIndex];
    const newAnswers = {
      ...answers,
      [currentQuestion._id]: option,
    };

    setAnswers(newAnswers);
    setIsSaving(true);
    setSaveStatus('saving');
    setSaveErrorMsg('');

    try {
      const payload = formatAnswersPayload(newAnswers);
      await examService.saveAttemptProgress(examId, payload);
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      setSaveErrorMsg('Auto-save error: answers will retry on next action.');
    } finally {
      setIsSaving(false);
    }
  };

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (seconds) => {
    if (seconds == null || isNaN(seconds)) return '--:--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" className="text-blue-600 mb-4" />
        <h3 className="text-base font-bold text-slate-800">Preparing Secure Examination Session...</h3>
        <p className="text-xs text-slate-500 mt-1">Verifying identity, schedule window, and attempt state.</p>
      </div>
    );
  }

  // Load Error State
  if (loadError) {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-4 py-16">
        <Card className="border-rose-200">
          <CardHeader className="bg-rose-50/50">
            <div className="flex items-center space-x-3 text-rose-700">
              <AlertCircle className="w-6 h-6" />
              <CardTitle>Unable to Enter Examination</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-slate-600">{loadError}</p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
              <p><strong>Note:</strong> Examinations are strictly available during their scheduled active window.</p>
              <p>Attempts are limited to exactly one per student.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Link to="/examinations/available">
              <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Available Exams
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Completed / Submitted State
  if (submittedResult) {
    const isPass = submittedResult.passed;
    return (
      <div className="flex-1 max-w-3xl mx-auto px-4 py-16">
        <Card className="border-emerald-200 shadow-md">
          <CardHeader className="bg-emerald-50/60 text-center pb-6 border-b border-emerald-100">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl text-emerald-900">Examination Submitted Successfully</CardTitle>
            <p className="text-xs text-emerald-700 mt-1">
              Your responses have been securely recorded and graded authoritatively by the examination engine.
            </p>
          </CardHeader>

          <CardContent className="pt-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] uppercase font-bold text-slate-400">Total Score</span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {submittedResult.score} / {submittedResult.totalMarks}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] uppercase font-bold text-slate-400">Result</span>
                <div className="mt-1">
                  <Badge variant={isPass ? 'success' : 'danger'} size="md">
                    {isPass ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] uppercase font-bold text-slate-400">Status</span>
                <div className="mt-1">
                  <Badge variant="primary" dot size="md">
                    SUBMITTED
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
              <div className="flex items-center space-x-2 text-slate-700 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Academic Record Sealed</span>
              </div>
              <p>Examination ID: <span className="font-mono text-slate-700">{exam?._id}</span></p>
              <p>Submission Timestamp: <span className="font-mono text-slate-700">{new Date(submittedResult.submittedAt).toLocaleString()}</span></p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center pt-6">
            <Link to="/dashboard">
              <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Go to Dashboard
              </Button>
            </Link>
            <Link to="/examinations/available">
              <Button variant="primary">
                View Available Exams
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Active Examination Interface
  const questions = exam?.questions || [];
  const currentQuestion = questions[currentIndex] || {};
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const selectedAnswer = answers[currentQuestion._id] || '';
  const isUrgent = remainingSeconds != null && remainingSeconds < 300; // < 5 minutes

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner: Title, Authoritative Countdown, Auto-save Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="primary" size="sm">
                Active Assessment
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                Passing Marks: {exam?.passingMarks} / {exam?.totalMarks}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1">
              {exam?.title}
            </h1>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            {/* Save Status Indicator */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              {saveStatus === 'saving' ? (
                <>
                  <LoadingSpinner size="sm" className="text-blue-600" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-700">Sync issue</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Saved</span>
                </>
              )}
            </div>

            {/* Authoritative Countdown Timer */}
            <div
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm tracking-wide transition-colors ${
                isUrgent
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-blue-50/80 border-blue-200 text-blue-900'
              }`}
            >
              <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-600' : 'text-blue-600'}`} />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            {/* Quick Submit Button */}
            <Button
              size="sm"
              variant="danger"
              onClick={() => setShowConfirmModal(true)}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Finish Exam
            </Button>
          </div>
        </div>

        {saveErrorMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{saveErrorMsg}</span>
          </div>
        )}
      </div>

      {/* Main Examination Grid: Question Card + Navigation Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Active Question Card */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-xs border-slate-200">
            {/* Question Card Header */}
            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between py-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="text-slate-300">•</span>
                <Badge variant="default" size="sm">
                  {currentQuestion.marks} {currentQuestion.marks === 1 ? 'Mark' : 'Marks'}
                </Badge>
              </div>

              {selectedAnswer ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Answered</span>
                </span>
              ) : (
                <span className="text-xs text-slate-400">Not yet answered</span>
              )}
            </CardHeader>

            {/* Question Card Body */}
            <CardContent className="pt-6 space-y-6">
              <div className="text-base font-medium text-slate-900 leading-relaxed">
                {currentQuestion.questionText}
              </div>

              {/* 4 Answer Options */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options?.map((option, optIdx) => {
                  const isChecked = selectedAnswer === option;
                  const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectAnswer(option)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3 cursor-pointer ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 text-blue-950 font-medium shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50/50'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {optionLabel}
                      </span>
                      <span className="text-sm pt-0.5 leading-normal">{option}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>

            {/* Question Card Navigation Footer */}
            <CardFooter className="border-t border-slate-100 flex items-center justify-between py-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <div className="text-xs text-slate-400 font-medium">
                {currentIndex + 1} / {totalQuestions}
              </div>

              {currentIndex === totalQuestions - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowConfirmModal(true)}
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Review & Submit
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right 1 Column: Question Navigation Palette */}
        <div className="space-y-6">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="border-b border-slate-100 py-4">
              <CardTitle className="text-sm">Question Navigation</CardTitle>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                <span>{answeredCount} Answered</span>
                <span>{unansweredCount} Left</span>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {/* Question Number Badges Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = Boolean(answers[q._id]);

                  return (
                    <button
                      key={q._id || idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                        isCurrent
                          ? 'ring-2 ring-blue-600 bg-blue-600 text-white shadow-xs'
                          : isAnswered
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                      }`}
                      title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Palette Legend */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded bg-blue-600 shrink-0" />
                  <span>Current Question</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 shrink-0" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 shrink-0" />
                  <span>Unanswered</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-slate-100 pt-4">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setShowConfirmModal(true)}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Examination
              </Button>
            </CardFooter>
          </Card>

          {/* Integrity Guarantee Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 space-y-2">
            <div className="flex items-center space-x-2 text-slate-700 font-semibold">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Session Monitored</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Answers are automatically synced to the server. If your browser closes or refreshes, you can reconnect immediately and resume with your remaining time.
            </p>
          </div>
        </div>
      </div>

      {/* Final Submission Confirmation Dialog */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Examination Submission"
        description="Please review your progress before making your final submission."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmitting}
            >
              Return to Exam
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleSubmit(false)}
              isLoading={isSubmitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Confirm Final Submission
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Answered</span>
              <p className="text-xl font-bold text-emerald-900">{answeredCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-600">Unanswered</span>
              <p className="text-xl font-bold text-amber-900">{unansweredCount}</p>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                You still have <strong>{unansweredCount} unanswered questions</strong>. Submitting now will grade these questions as 0 marks.
              </span>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Once submitted, your answers are permanently sealed and cannot be modified. The authoritative server will grade your test immediately.
          </p>
        </div>
      </Modal>
    </div>
  );
}
