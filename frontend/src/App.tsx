import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';
import { useResume } from './context/ResumeContext';
import { LivePreview } from './components/LivePreview';
import { ResumeForm } from './components/ResumeForm';
import { Home } from './components/Home';
import { ResumeImport } from './components/ResumeImport';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Admin } from './components/Admin';
import { useAuth } from './context/AuthContext';
import { IS_DEV_MODE } from './config';
import axios from 'axios';
import { API_URL } from './config';

axios.defaults.withCredentials = true;

const MainApp = () => {
  const { data, clearSavedData, setResumeData } = useResume();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoLoaded, setAutoLoaded] = useState(false);

  useEffect(() => {
    if (user && !data.id && !autoLoaded) {
      axios.get(`${API_URL}/api/resume/user`, { withCredentials: true })
        .then(res => {
          if (res.data && res.data.id) {
            setResumeData(res.data);
          }
          setAutoLoaded(true);
        })
        .catch(() => setAutoLoaded(true));
    }
  }, [user, data.id, autoLoaded, setResumeData]);

  const validateExtraCurricular = () => {
    for (let i = 0; i < data.extraCurricular.length; i++) {
      const words = data.extraCurricular[i].trim().split(/\s+/).filter(Boolean).length;
      if (words > 15) {
        alert('Validation Error: Each Extra Curricular line must be maximum 15 words.');
        return false;
      }
    }
    const noEmptyECs = data.extraCurricular.filter(e => e.trim().length > 0);
    if (noEmptyECs.length > 3) {
      alert('Validation Error: Maximum 3 Extra Curricular entries allowed.');
      return false;
    }
    if (data.certifications && data.certifications.length > 2) {
      alert('Validation Error: Maximum 2 Certificates allowed.');
      return false;
    }
    return true;
  };

  const handleExport = async () => {
    if (!validateExtraCurricular()) return;
    setIsExporting(true);
    try {
      if (data.id) {
        // Automatically save on export if logged in and managing a resume
        await axios.post(`${API_URL}/api/resumes`, data, { withCredentials: true });
      }
      // SERVER-SIDE EXPORT: ask backend to render the frontend render route via Puppeteer
      try {
        const resp = await axios.post(`${API_URL}/api/resumes/export-direct`, data, { responseType: 'arraybuffer' });
        const blob = new Blob([resp.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.personalDetails.fullName.replace(/\s+/g, '_') || 'resume'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        // Clear saved data after successful export
        clearSavedData();
      } catch (err) {
        console.error('Server-side export failed', err);
        throw err;
      }
    } catch (error) {
      console.error(error);
      alert('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveResume = async () => {
    if (!validateExtraCurricular()) return;
    try {
      setIsSaving(true);
      const suggestedName = data.resumeName || (data.personalDetails?.fullName ? `${data.personalDetails.fullName} Resume` : 'Untitled Resume');
      const customName = window.prompt("Enter Resume Name:", suggestedName);
      if (customName === null) {
        setIsSaving(false);
        return;
      }
      
      const payload = { ...data, resumeName: customName };
      const endpoint = data.id ? '/api/resume/update' : '/api/resume/save';
      const method = data.id ? axios.put : axios.post;
      const response = await method(`${API_URL}${endpoint}`, payload, { withCredentials: true });
      
      if (response.data.id) {
        setResumeData({ ...payload, id: response.data.id });
      } else {
        setResumeData(payload);
      }
      alert('Resume saved successfully!');
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        alert('Please login to save your resume.');
      } else {
        alert(error.response?.data?.error || 'Failed to save resume.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-container">
      {/* Left Input Panel */}
      <div className="left-panel">
        <header className="app-header">
          <div className="app-title">
            <FileText size={24} className="text-blue-600" style={{ color: 'var(--primary)' }} />
            ResuOne
          </div>
          <div className="flex items-center gap-3">
            <ResumeImport />
            <button
              className="btn btn-outline"
              onClick={handleSaveResume}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download size={18} />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </header>
        <div className="form-area">
          <ResumeForm />
        </div>
      </div>

      {/* Right Preview Panel */}
      <div className="right-panel">
        <LivePreview data={data} />
      </div>
    </div>
  );
};

// Expose a dev helper to capture the export canvas used by handleExport.
// This is intentionally small and only used by local tests.
if (typeof window !== 'undefined') {
  (window as any).__captureExportCanvas = async () => {
    try {
      // load html2canvas dynamically
      const html2canvasModule = (await import('html2canvas')).default;
      const previewEl = document.getElementById('resume-preview');
      if (!previewEl) return null;
      // ensure fonts
      try { await (document as any).fonts.ready; } catch (e) {}
      const canvas = await html2canvasModule(previewEl as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: (previewEl as HTMLElement).scrollWidth,
        windowHeight: (previewEl as HTMLElement).scrollHeight
      });
      return canvas.toDataURL('image/png');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('captureExportCanvas error', err);
      return null;
    }
  };
}

// We create a hidden route that Puppeteer will visit
const RenderRoute = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const base = import.meta.env.DEV ? 'http://localhost:5000' : ((typeof API_URL !== 'undefined' && API_URL) ? API_URL : '');
        const res = await fetch(`${base}/api/resumes/${id}`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to fetch resume');
        const dbData = await res.json();

        // Map DB snake_case columns back to frontend camelCase
        const mappedData = {
          // Support both API returning DB-style snake_case and our in-memory debug objects (camelCase)
          personalDetails: dbData.personal_details || dbData.personalDetails || {},
          summary: dbData.summary || dbData.summary || '',
          education: dbData.education || dbData.education || [],
          skills: dbData.skills || dbData.skills || [],
          projects: dbData.projects || dbData.projects || [],
          experience: dbData.experience || dbData.experience || [],
          extraCurricular: dbData.extra_curricular || dbData.extraCurricular || []
        };

        setData(mappedData);
      } catch (err) {
        console.error(err);
        setError('Could not load resume');
      }
    };

    if (id) fetchResume();
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ background: 'white', display: 'flex', justifyContent: 'center' }}>
      <LivePreview data={data} />
    </div>
  );
};

function App() {
  const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) {
      return <div className="p-8 text-center text-gray-600">Loading session...</div>;
    }

    // In dev mode, allow access without requiring authentication
    if (IS_DEV_MODE) {
      return <>{children}</>;
    }

    if (!user) {
      return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
  };

  const AdminProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) {
      return <div className="p-8 text-center text-gray-600">Loading session...</div>;
    }

    // In dev mode, allow access without requiring authentication
    if (IS_DEV_MODE) {
      return <>{children}</>;
    }

    if (!user) {
      return <Navigate to="/auth" replace />;
    }

    // Check if user has admin flag (this would be set in JWT from backend)
    // For now, we rely on backend verification, but we can add frontend UI feedback
    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        {/* Public test route to render LivePreview with sample data for export testing */}
        <Route path="/preview-test" element={
          <div style={{ background: 'white', display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <LivePreview data={{
              personalDetails: { fullName: 'Test User', email: 'test@example.com', phone: '1234567890', location: 'Remote' },
              summary: 'This is a test summary to validate PDF export rendering and layout consistency across multiple sections.',
              education: [{ id: 'e1', degree: 'B.Sc Computer Science', institution: 'Test University', startDate: '2019', endDate: '2023', location: 'Test City', score: '8.5', scoreType: 'CGPA' }],
              skills: [{ id: 's1', name: 'Languages', items: 'Python, JavaScript, C++' }, { id: 's2', name: 'Tools', items: 'Docker, Git, AWS' }],
              projects: [{ id: 'p1', title: 'Project Alpha', technologies: 'React, Node', link: '', github: '', date: 'Dec 2025', description: 'An example long project description intended to test wrapping behavior in both preview and export. '.repeat(6) }],
              experience: [{ id: 'x1', company: 'ACME Corp', role: 'Software Engineer', startDate: 'May 2023', endDate: 'Present', location: 'Remote', type: 'Full-time', bulletPoints: ['Implemented feature X with performance improvements', 'Led migration to new infra', 'Wrote comprehensive tests and documentation'] }],
              extraCurricular: ['Volunteer contributor to open source projects', 'Organizer of local meetup group'],
              certifications: [{ id: 'c1', title: 'ML for Data Science Projects', issuer: 'IBM SkillsBuild', date: '2024' }]
            }} />
          </div>
        } />
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
        <Route path="/render/:id" element={<RenderRoute />} />
      </Routes>
    </Router>
  );
}

export default App;
