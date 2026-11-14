import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  Award,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  FileQuestion,
  Send,
} from 'lucide-react';
import * as examService from '../../services/examinationService.js';
import PageHeading from '../../components/ui/PageHeading.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Card, CardContent } from '../../components/ui/Card.jsx';
import Modal from '../../components/ui/Modal.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';

export default function ExaminationsPage() {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Publish state
  const [publishingId, setPublishingId] = useState(null);

  const fetchExaminations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await examService.getMyExaminations();
      setExaminations(res.data?.examinations || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve examinations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExaminations();
  }, []);

  const handleOpenDelete = (exam) => {
    setExamToDelete(exam);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    setIsDeleting(true);
    try {
      await examService.deleteExamination(examToDelete._id);
      setSuccessMessage(`Examination "${examToDelete.title}" was deleted.`);
      setDeleteModalOpen(false);
      setExamToDelete(null);
      await fetchExaminations();
    } catch (err) {
      setError(err.message || 'Failed to delete examination');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async (exam) => {
    setPublishingId(exam._id);
    setError('');
    setSuccessMessage('');
    try {
      await examService.publishExamination(exam._id);
      setSuccessMessage(`Examination "${exam.title}" published successfully.`);
      await fetchExaminations();
    } catch (err) {
      setError(err.message || 'Failed to publish examination');
    } finally {
      setPublishingId(null);
    }
  };

  const statusVariant = {
    DRAFT: 'warning',
    PUBLISHED: 'success',
    CLOSED: 'default',
  };

  const draftsCount = examinations.filter((e) => e.status === 'DRAFT').length;
  const publishedCount = examinations.filter((e) => e.status === 'PUBLISHED').length;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeading
        title="Instructor Examination Management"
        description="Author, schedule, configure question banks, and govern examination publishing."
        badge={
          <Badge variant="primary" dot size="sm">
            Instructor Portal
          </Badge>
        }
        actions={
          <Link to="/examinations/create">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Create Examination
            </Button>
          </Link>
        }
      />

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-rose-700 hover:text-rose-900 font-bold ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Total Authored</span>
              <h3 className="text-xl font-extrabold text-slate-900">{examinations.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Draft Assessments</span>
              <h3 className="text-xl font-extrabold text-slate-900">{draftsCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Published & Active</span>
              <h3 className="text-xl font-extrabold text-slate-900">{publishedCount}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Examination List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" className="text-blue-600 mb-3" />
          <p className="text-xs text-slate-500">Loading examinations...</p>
        </div>
      ) : examinations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No examinations created yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Get started by authoring your first digital examination with questions, scheduling, and passing marks.
          </p>
          <Link to="/examinations/create">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Create New Examination
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {examinations.map((exam) => (
            <Card key={exam._id} className="p-6 hover:border-slate-300 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {exam.title}
                    </h3>
                    <Badge variant={statusVariant[exam.status] || 'default'} size="sm">
                      {exam.status}
                    </Badge>
                  </div>
                  {exam.description && (
                    <p className="text-xs text-slate-600 max-w-2xl line-clamp-2">
                      {exam.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {exam.duration} mins
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                      {exam.questions?.length || 0} questions
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      {exam.totalMarks} Total / {exam.passingMarks} Pass
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(exam.startTime).toLocaleDateString()} &rarr;{' '}
                      {new Date(exam.endTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <Link to={`/examinations/${exam._id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      title="View Details"
                    >
                      Details
                    </Button>
                  </Link>

                  {exam.status !== 'CLOSED' && (
                    <Link to={`/examinations/${exam._id}/edit`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Edit className="w-3.5 h-3.5" />}
                        title="Edit Examination"
                      >
                        Edit
                      </Button>
                    </Link>
                  )}

                  {exam.status === 'DRAFT' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePublish(exam)}
                      isLoading={publishingId === exam._id}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                      title="Publish Examination"
                    >
                      Publish
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDelete(exam)}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    title="Delete Examination"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Examination Deletion"
        description="Are you sure you want to permanently delete this examination?"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Delete Examination
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600">
          This action will permanently delete <strong className="text-slate-900">{examToDelete?.title}</strong> and all associated question banks. This action cannot be reversed.
        </p>
      </Modal>
    </div>
  );
}

