import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Award,
  FileQuestion,
  Edit,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import * as examService from '../../services/examinationService.js';
import PageHeading from '../../components/ui/PageHeading.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.jsx';
import Modal from '../../components/ui/Modal.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';

export default function ExamDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [examination, setExamination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [publishing, setPublishing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchExam = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await examService.getExaminationById(id);
      setExamination(res.data?.examination);
    } catch (err) {
      setError(err.message || 'Failed to load examination details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExam();
  }, [id]);

  const handlePublish = async () => {
    setPublishing(true);
    setError('');
    setSuccess('');
    try {
      await examService.publishExamination(id);
      setSuccess('Examination has been successfully published.');
      await fetchExam();
    } catch (err) {
      setError(err.message || 'Failed to publish examination');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await examService.deleteExamination(id);
      navigate('/examinations', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete examination');
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" className="text-blue-600 mb-3" />
        <p className="text-xs text-slate-500">Loading examination details...</p>
      </div>
    );
  }

  if (!examination) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Examination Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">{error || 'This assessment does not exist or you lack ownership permissions.'}</p>
        <Link to="/examinations">
          <Button variant="secondary" size="md">Return to Examinations</Button>
        </Link>
      </div>
    );
  }

  const statusVariant = {
    DRAFT: 'warning',
    PUBLISHED: 'success',
    CLOSED: 'default',
  };

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
        title={examination.title}
        description={examination.description || 'No detailed instructions provided.'}
        badge={
          <Badge variant={statusVariant[examination.status] || 'default'} dot size="sm">
            {examination.status}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            {examination.status === 'DRAFT' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublish}
                isLoading={publishing}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Publish Examination
              </Button>
            )}

            {examination.status !== 'CLOSED' && (
              <Link to={`/examinations/${examination._id}/edit`}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Duration</span>
          <div className="flex items-center space-x-1.5 text-base font-bold text-slate-900">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{examination.duration} Mins</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Questions</span>
          <div className="flex items-center space-x-1.5 text-base font-bold text-slate-900">
            <FileQuestion className="w-4 h-4 text-purple-600" />
            <span>{examination.questions?.length || 0} Total</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Total Marks</span>
          <div className="flex items-center space-x-1.5 text-base font-bold text-slate-900">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>{examination.totalMarks} Marks</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Pass Criteria</span>
          <div className="flex items-center space-x-1.5 text-base font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>{examination.passingMarks} Marks</span>
          </div>
        </div>
      </div>

      {/* Schedule Banner */}
      <Card className="mb-8">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-700">Scheduled Availability Window:</span>
              <p className="text-slate-500 font-mono mt-0.5">
                {new Date(examination.startTime).toLocaleString()} &rarr;{' '}
                {new Date(examination.endTime).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Status:{' '}
            <strong className="text-slate-800">{examination.status}</strong>
          </div>
        </CardContent>
      </Card>

      {/* Questions Bank Inspection (Instructor Master View) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Question Bank Master ({examination.questions?.length || 0} Questions)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Verified Correct Answer Highlighted
          </span>
        </div>

        {examination.questions?.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-500 mb-3">No questions have been authored yet.</p>
            <Link to={`/examinations/${examination._id}/edit`}>
              <Button size="sm" variant="secondary">Add Questions</Button>
            </Link>
          </div>
        ) : (
          examination.questions.map((q, idx) => (
            <Card key={idx} className="p-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase">
                      Question {idx + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                      {q.questionText}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {q.marks} Mark{q.marks > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = opt === q.correctAnswer;
                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-slate-50/60 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-white border border-slate-200 text-slate-600">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                            Correct Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Examination"
        description="Are you sure you want to delete this examination?"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600">
          This will permanently remove <strong>{examination.title}</strong> and all {examination.questions?.length} associated questions from the database.
        </p>
      </Modal>
    </div>
  );
}

