import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Download, FileText, LogOut, ArrowLeft, Sparkles, FileSearch, LayoutGrid } from 'lucide-react';
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
  const { setResumeData } = useResume();
  const [resumes, setResumes] = useState<ResumeMeta[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await axios.delete(`${API_URL}/api/resumes/${id}`, { withCredentials: true });
      setResumes(prev => prev.filter(r => r.id !== id));
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 text-center shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Loading workspace</p>
          <p className="mt-2 text-base text-slate-200">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6rem] top-0 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            <button onClick={() => navigate('/')} className="group flex items-center gap-3 rounded-2xl px-2 py-1 transition-all duration-300 hover:bg-white/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 shadow-[0_12px_30px_rgba(79,70,229,0.30)]">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-lg font-semibold tracking-tight text-white">ResuOne</span>
                <span className="block text-xs text-slate-400">Your resume workspace</span>
              </div>
            </button>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-md">
                Hello, <span className="font-semibold text-white">{user?.name}</span>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-300 hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-white hover:shadow-[0_18px_35px_rgba(244,63,94,0.14)]"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 shadow-lg shadow-slate-950/30 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white"
                title="Back to Home"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Dashboard</p>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Your resume workspace
                </h2>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-300">
              Keep one polished resume version, update it quickly, and export with a premium ATS-friendly finish.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <button
              type="button"
              onClick={handleCreate}
              disabled={resumes.length >= 5}
              className={`group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${resumes.length >= 5 ? 'cursor-not-allowed border border-white/10 bg-white/8 text-slate-500 opacity-60' : 'border border-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 text-white shadow-[0_18px_45px_rgba(79,70,229,0.30)] hover:scale-[1.01] hover:shadow-[0_24px_60px_rgba(79,70,229,0.38)]'}`}
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              Create resume
            </button>
            {resumes.length >= 5 && (
              <span className="text-xs text-slate-400">Maximum 5 saved resumes.</span>
            )}
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 text-center shadow-[0_24px_70px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:px-10">
            <div className="mx-auto flex max-w-xl flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 shadow-[0_20px_50px_rgba(79,70,229,0.30)]">
                <FileSearch className="h-9 w-9 text-white" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                Empty workspace
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">No resume created yet</h3>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
                Start with one premium resume and keep everything standardized for placements, internships, and recruiter screening.
              </p>
              <button
                type="button"
                onClick={handleCreate}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.30)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_24px_60px_rgba(79,70,229,0.38)]"
              >
                <Plus className="h-4 w-4" />
                Create resume
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {resumes.map((resume, index) => (
              <div
                key={resume.id}
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_20px_50px_rgba(15,23,42,0.2)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/25 hover:shadow-[0_28px_80px_rgba(79,70,229,0.18)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-300">ATS-ready</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">Last edited</span>
                      </div>
                      <h3 className="truncate text-xl font-semibold tracking-tight text-white">{resume.title}</h3>
                      <p className="mt-2 text-sm text-slate-400">
                        Updated {new Date(resume.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-blue-500/20 text-indigo-200 ring-1 ring-white/10">
                      <LayoutGrid className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Preview thumbnail</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Resume {index + 1}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3 rounded-[1.25rem] bg-gradient-to-br from-white/10 to-white/5 p-4 ring-1 ring-white/10">
                      <div className="h-3 w-2/3 rounded-full bg-white/15" />
                      <div className="h-2 w-5/6 rounded-full bg-white/10" />
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20" />
                        <div className="space-y-2 rounded-2xl bg-white/5 p-3">
                          <div className="h-2 w-4/5 rounded-full bg-white/15" />
                          <div className="h-2 w-2/3 rounded-full bg-white/10" />
                          <div className="h-2 w-5/6 rounded-full bg-white/15" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 bg-slate-950/40 p-3">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEdit(resume.id)}
                      className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-3 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-500/15 hover:text-white hover:shadow-[0_16px_30px_rgba(79,70,229,0.18)]"
                    >
                      <Edit2 className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDownload(resume.id)}
                      className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-3 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-500/15 hover:text-white hover:shadow-[0_16px_30px_rgba(6,182,212,0.12)]"
                    >
                      <Download className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-3 py-3 text-sm font-semibold text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-500/15 hover:text-rose-200 hover:shadow-[0_16px_30px_rgba(244,63,94,0.12)]"
                    >
                      <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
