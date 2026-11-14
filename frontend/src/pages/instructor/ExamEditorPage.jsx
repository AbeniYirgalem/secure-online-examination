import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  FileQuestion,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
} from 'lucide-react';
import * as examService from '../../services/examinationService.js';
import PageHeading from '../../components/ui/PageHeading.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';

export default function ExamEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    startTime: '',
    endTime: '',
    passingMarks: 0,
    questions: [],
  });

  // Modal / Inline question builder state
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    marks: 1,
  });

  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [questionError, setQuestionError] = useState('');

  // Fetch examination if edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const loadExam = async () => {
      try {
        const res = await examService.getExaminationById(id);
        const exam = res.data?.examination;
        if (exam) {
          // Format ISO strings for datetime-local input (YYYY-MM-DDTHH:mm)
          const formatForInput = (d) => {
            const date = new Date(d);
            const offset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() - offset).toISOString().slice(0, 16);
          };

          setFormData({
            title: exam.title || '',
            description: exam.description || '',
            duration: exam.duration || 60,
            startTime: exam.startTime ? formatForInput(exam.startTime) : '',
            endTime: exam.endTime ? formatForInput(exam.endTime) : '',
            passingMarks: exam.passingMarks || 0,
            questions: exam.questions || [],
          });
        }
      } catch (err) {
        setApiError(err.message || 'Failed to load examination');
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [id, isEditMode]);

  // Handle Exam metadata changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  // Handle Question builder inputs
  const handleOptionChange = (index, value) => {
    const updated = [...newQuestion.options];
    updated[index] = value;
    setNewQuestion((prev) => ({ ...prev, options: updated }));
    setQuestionError('');
  };

  const handleAddQuestion = () => {
    setQuestionError('');

    if (!newQuestion.questionText.trim()) {
      setQuestionError('Question text is required.');
      return;
    }

    if (newQuestion.options.some((opt) => !opt.trim())) {
      setQuestionError('All four options must be filled.');
      return;
    }

    const marks = Number(newQuestion.marks);
    if (isNaN(marks) || marks < 1) {
      setQuestionError('Marks must be at least 1.');
      return;
    }

    const selectedOption = newQuestion.options[newQuestion.correctAnswerIndex];

    const questionToAdd = {
      questionText: newQuestion.questionText.trim(),
      options: newQuestion.options.map((opt) => opt.trim()),
      correctAnswer: selectedOption.trim(),
      marks,
    };

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, questionToAdd],
    }));

    // Reset question form
    setNewQuestion({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      marks: 1,
    });
  };

  const handleRemoveQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  // Calculated dynamic total marks
  const calculatedTotalMarks = formData.questions.reduce(
    (sum, q) => sum + (Number(q.marks) || 0),
    0
  );

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    if (!formData.duration || formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 minute.';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required.';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required.';
    } else if (
      formData.startTime &&
      new Date(formData.endTime) <= new Date(formData.startTime)
    ) {
      newErrors.endTime = 'End time must be later than start time.';
    }

    if (formData.passingMarks < 0) {
      newErrors.passingMarks = 'Passing marks cannot be negative.';
    } else if (calculatedTotalMarks > 0 && formData.passingMarks > calculatedTotalMarks) {
      newErrors.passingMarks = `Passing marks (${formData.passingMarks}) cannot exceed total marks (${calculatedTotalMarks}).`;
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: Number(formData.duration),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        passingMarks: Number(formData.passingMarks),
        questions: formData.questions,
      };

      if (isEditMode) {
        await examService.updateExamination(id, payload);
      } else {
        await examService.createExamination(payload);
      }

      navigate('/examinations', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Failed to save examination.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" className="text-blue-600 mb-3" />
        <p className="text-xs text-slate-500">Loading examination data...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link
          to="/examinations"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Examinations
        </Link>
      </div>

      <PageHeading
        title={isEditMode ? 'Edit Examination' : 'Create Examination'}
        description="Configure examination parameters, scheduling, and author multiple-choice question banks."
      />

      {/* Global API Error Banner */}
      {apiError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Section 1: Examination Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>1. General Configuration & Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              id="title"
              name="title"
              label="Examination Title"
              placeholder="e.g. CS401: Advanced Cryptography Midterm"
              value={formData.title}
              onChange={handleInputChange}
              error={errors.title}
              required
            />

            <div>
              <label
                htmlFor="description"
                className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5"
              >
                Description / Instructions
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Guidelines, permitted references, or assessment instructions for students..."
                value={formData.description}
                onChange={handleInputChange}
                className="block w-full rounded-xl text-sm text-slate-900 bg-white border border-slate-300 p-3 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                id="duration"
                name="duration"
                type="number"
                label="Duration (Minutes)"
                min="1"
                placeholder="60"
                value={formData.duration}
                onChange={handleInputChange}
                error={errors.duration}
                required
                leftIcon={<Clock className="w-4 h-4" />}
              />

              <Input
                id="passingMarks"
                name="passingMarks"
                type="number"
                label="Passing Marks"
                min="0"
                placeholder="40"
                value={formData.passingMarks}
                onChange={handleInputChange}
                error={errors.passingMarks}
                helperText={`Total marks: ${calculatedTotalMarks}`}
                required
                leftIcon={<Award className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                label="Schedule Start Date & Time"
                value={formData.startTime}
                onChange={handleInputChange}
                error={errors.startTime}
                required
                leftIcon={<Calendar className="w-4 h-4" />}
              />

              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                label="Schedule End Date & Time"
                value={formData.endTime}
                onChange={handleInputChange}
                error={errors.endTime}
                required
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Questions Bank Builder */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>2. Question Bank ({formData.questions.length} Questions)</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Each question requires exactly 4 choices with one verified correct answer.
              </p>
            </div>
            <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
              Total: {calculatedTotalMarks} Marks
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Added Questions List */}
            {formData.questions.length > 0 && (
              <div className="space-y-4">
                {formData.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-blue-600 uppercase">
                          Question {idx + 1} ({q.marks} Mark{q.marks > 1 ? 's' : ''})
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900">{q.questionText}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                        title="Remove question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = opt === q.correctAnswer;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-slate-100 text-slate-600">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 truncate">{opt}</span>
                            {isCorrect && (
                              <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Question Creation Form */}
            <div className="border border-blue-200/80 rounded-2xl p-5 bg-blue-50/20 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <FileQuestion className="w-4 h-4 text-blue-600" />
                <span>Add Multiple-Choice Question</span>
              </div>

              {questionError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{questionError}</span>
                </div>
              )}

              <Input
                id="newQuestionText"
                name="newQuestionText"
                label="Question Prompt"
                placeholder="e.g. Which hash algorithm produces a 256-bit digest?"
                value={newQuestion.questionText}
                onChange={(e) => {
                  setNewQuestion((prev) => ({ ...prev, questionText: e.target.value }));
                  setQuestionError('');
                }}
              />

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Answer Options (Select the correct radio option)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {newQuestion.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200 focus-within:border-blue-600"
                    >
                      <input
                        type="radio"
                        id={`opt-radio-${idx}`}
                        name="correctAnswerRadio"
                        checked={newQuestion.correctAnswerIndex === idx}
                        onChange={() => setNewQuestion((prev) => ({ ...prev, correctAnswerIndex: idx }))}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        title="Mark as correct answer"
                      />
                      <span className="font-bold text-xs text-slate-400 w-4">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <div className="w-full sm:w-48">
                  <Input
                    id="newQuestionMarks"
                    name="newQuestionMarks"
                    type="number"
                    min="1"
                    label="Question Marks"
                    value={newQuestion.marks}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        marks: e.target.value === '' ? '' : Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleAddQuestion}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Question to Bank
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Submission Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200">
          <Link to="/examinations">
            <Button variant="secondary" size="lg" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isEditMode ? 'Update Examination' : 'Save as Draft'}
          </Button>
        </div>
      </form>
    </div>
  );
}

