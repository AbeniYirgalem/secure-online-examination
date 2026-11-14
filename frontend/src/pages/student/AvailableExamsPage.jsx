import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import * as examService from '../../services/examinationService.js';
import PageHeading from '../../components/ui/PageHeading.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';

export default function AvailableExamsPage() {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const res = await examService.getAvailableExaminations();
        setExaminations(res.data?.examinations || []);
      } catch (err) {
        setError(err.message || 'Failed to load available examinations');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailable();
  }, []);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeading
        title="Available Examinations"
        description="Active, published academic assessments currently open for student participation."
        badge={
          <Badge variant="success" dot size="sm">
            Testing Session Open
          </Badge>
        }
      />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" className="text-blue-600 mb-3" />
          <p className="text-xs text-slate-500">Checking scheduled assessments...</p>
        </div>
      ) : examinations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No examinations currently available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no active examinations matching your scheduled window right now. Please check back when your instructor opens the session.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examinations.map((exam) => (
            <Card key={exam._id} className="flex flex-col justify-between hover:border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="success" dot size="sm">
                    Open Now
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500">
                    {exam.duration} Mins
                  </span>
                </div>
                <CardTitle>{exam.title}</CardTitle>
                {exam.description && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {exam.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-3 pt-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2 text-slate-500">
                  <User className="w-4 h-4" />
                  <span>Instructor: <strong>{exam.instructor?.name || 'Faculty'}</strong></span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Marks</span>
                    <p className="font-bold text-slate-900">{exam.totalMarks} Marks</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Pass Threshold</span>
                    <p className="font-bold text-slate-900">{exam.passingMarks} Marks</p>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Closes: {new Date(exam.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-3">
                <div className="flex items-center text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span>Integrity Monitored</span>
                </div>
                <Link to={`/examinations/${exam._id}/take`}>
                  <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Begin Exam
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

