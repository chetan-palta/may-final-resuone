import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Download, FileText, LogOut, ArrowLeft, Clock, CheckCircle2, Zap } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { API_URL } from '../config';

interface ResumeMeta {
  id: string;
  title: string;
  updatedAt: string;
}

export const Dashboard = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { setResumeData, clearSavedData } = useResume();
  const [resumes, setResumes] = useState<ResumeMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/auth');
      return;
    }

    fetchResumes();
  }, [user, navigate, authLoading]);

  const fetchResumes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/resumes`, { withCredentials: true });
      setResumes(res.data.resumes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (resumes.length >= 5) return;
    // Clear saved data so form starts empty
    clearSavedData();
    navigate('/resume');
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/resumes/${id}`, { withCredentials: true });
      setResumeData(res.data);
      navigate('/resume?id=' + id);
    } catch (error) {
      console.error('Failed to load resume for editing', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/resumes/${id}`, { withCredentials: true });
      setResumes(prev => prev.filter(r => r.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete resume');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      window.location.href = `${API_URL}/api/resumes/${id}/pdf`;
    } catch (err) {
      alert('Failed to generate PDF');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/50 mb-4">
            <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-medium">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-200 dark:bg-violet-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      {/* Premium Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-slate-950/80 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 hover:opacity-75 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="hidden sm:inline text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                ResuOne
              </span>
            </button>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {resumes.length} of 5 resumes
                </p>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-1">
                  Your Resumes
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {resumes.length === 0 
                    ? "Get started by creating your first resume" 
                    : `You have ${resumes.length} resume${resumes.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {/* Create Resume Button */}
            <button
              onClick={handleCreate}
              disabled={resumes.length >= 5}
              className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                resumes.length >= 5
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
              }`}
            >
              <Plus className="w-5 h-5" />
              Create Resume
            </button>
          </div>

          {/* Limit Warning */}
          {resumes.length >= 5 && (
            <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-gap-3">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-200">
                You've reached the maximum of 5 resumes. Delete one to create a new one.
              </p>
            </div>
          )}
        </div>

        {/* Resume Cards Grid */}
        {resumes.length === 0 ? (
          // Empty State
          <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/50 dark:to-slate-800/50 border border-slate-200/50 dark:border-slate-800/50 p-16 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 mb-6">
              <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              No resumes yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Create your first ATS-optimized resume and start your journey to landing your dream job.
            </p>
            <button
              onClick={handleCreate}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:shadow-lg transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => {
              const isBeingDeleted = deleteConfirm === resume.id;
              const lastUpdated = new Date(resume.updatedAt);
              const isRecentlyUpdated = (Date.now() - lastUpdated.getTime()) < (24 * 60 * 60 * 1000);

              return (
                <div
                  key={resume.id}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
                >
                  {/* Gradient Border on Hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute inset-0.5 rounded-2xl bg-white dark:bg-slate-900/50 pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex-1 pr-2 line-clamp-2">
                        {resume.title}
                      </h3>
                      {isRecentlyUpdated && (
                        <div className="flex-shrink-0 px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-800">
                          <span className="text-xs font-semibold text-green-700 dark:text-green-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            New
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        Updated {lastUpdated.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="relative z-10 border-t border-slate-200/50 dark:border-slate-800/50 p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-b-2xl">
                    {isBeingDeleted ? (
                      // Delete Confirmation
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                          Delete this resume?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(resume.id)}
                            className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors duration-300"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors duration-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(resume.id)}
                          className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDownload(resume.id)}
                          className="flex-1 px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(resume.id)}
                          className="px-4 py-2.5 rounded-lg bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300 flex items-center gap-1"
                          title="Delete resume"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
