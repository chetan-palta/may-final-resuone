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
      // CLIENT-SIDE EXPORT: Capture exact preview DOM and generate PDF from it
      // Ensure fonts are loaded to prevent fallback during capture
      try {
        await document.fonts.load('16px "Times New Roman"');
        await (document as any).fonts.ready;
      } catch (e) {
        // ignore font load failure; proceed
      }

      const previewEl = document.getElementById('resume-preview');
      if (!previewEl) throw new Error('Resume preview not available for export');

      // Freeze dimensions and styles to avoid reflow during capture
      const prevWidth = (previewEl as HTMLElement).style.width || '';
      const prevMinHeight = (previewEl as HTMLElement).style.minHeight || '';
      (previewEl as HTMLElement).style.width = '794px';
      (previewEl as HTMLElement).style.minHeight = '1123px';
      (previewEl as HTMLElement).classList.add('export-lock');

      // Allow the browser a tick to apply styles
      await new Promise(res => setTimeout(res, 120));

      const html2canvasModule = (await import('html2canvas')).default;
      const jspdfModule = await import('jspdf');

      const canvas = await html2canvasModule(previewEl as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: (previewEl as HTMLElement).scrollWidth,
        windowHeight: (previewEl as HTMLElement).scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = jspdfModule;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123]
      });

      const imgWidth = 794;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      while (position + 1123 < imgHeight) {
        position += 1123;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
      }

      pdf.save(`${data.personalDetails.fullName.replace(/\s+/g, '_') || 'resume'}.pdf`);

      // cleanup
      (previewEl as HTMLElement).classList.remove('export-lock');
      (previewEl as HTMLElement).style.width = prevWidth;
      (previewEl as HTMLElement).style.minHeight = prevMinHeight;

      // Clear saved data after successful export
      clearSavedData();
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

// We create a hidden route that Puppeteer will visit
const RenderRoute = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch(`${API_URL}/api/resumes/${id}`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to fetch resume');
        const dbData = await res.json();

        // Map DB snake_case columns back to frontend camelCase
        const mappedData = {
          personalDetails: dbData.personal_details || {},
          summary: dbData.summary || '',
          education: dbData.education || [],
          skills: dbData.skills || [],
          projects: dbData.projects || [],
          experience: dbData.experience || [],
          extraCurricular: dbData.extra_curricular || []
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
