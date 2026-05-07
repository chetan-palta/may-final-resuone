import React, { useState, useRef } from 'react';
import { useResume } from '../context/ResumeContext';
import { UploadCloud, File, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { API_URL } from '../config';

export const ResumeImport = () => {
  const { setResumeData } = useResume();
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (fileToValidate: File) => {
    if (fileToValidate.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return false;
    }
    const type = fileToValidate.type;
    const isDocx = type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileToValidate.name.endsWith('.docx');
    const isPdf = type === 'application/pdf';
    
    if (!isPdf && !isDocx) {
      setError('Only PDF and DOCX files are supported.');
      return false;
    }
    
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    setSuccessMsg(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);
    
    const formData = new FormData();
    formData.append('resumeFile', file);
    
    try {
      const response = await fetch(`${API_URL}/api/resume/import`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to process resume');
      }
      
      setResumeData(result.data);
      setSuccessMsg(result.message);
      
      // Auto-close after a short delay
      setTimeout(() => {
        setIsOpen(false);
        setFile(null);
        setSuccessMsg(null);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-outline flex items-center gap-2 border-white/10 bg-white/5 text-slate-200 hover:border-indigo-400/30 hover:bg-white/10"
      >
        <UploadCloud size={16} />
        Import Existing Resume
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-2xl">
          <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 pt-0 text-slate-100 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-white">
                <UploadCloud size={18} className="text-cyan-300" />
                Import Your Resume
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 transition-colors hover:text-white"
                disabled={isProcessing}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {!file ? (
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive ? 'border-indigo-400 bg-white/8' : 'border-white/10 hover:border-indigo-400/30 hover:bg-white/8'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handleChange}
                  />
                  
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-cyan-500/20 text-cyan-300">
                    <UploadCloud size={24} />
                  </div>
                  <h4 className="mb-1 font-medium text-white">Click to upload or drag & drop</h4>
                  <p className="mb-4 text-sm text-slate-400">Strictly PDF or DOCX (Max: 5MB)</p>
                  
                  <button className="btn btn-primary btn-sm mx-auto">
                    Select File
                  </button>
                </div>
              ) : (
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="rounded-xl bg-indigo-500/15 p-2 text-indigo-200">
                      <File size={20} />
                    </div>
                    <div className="truncate">
                      <p className="truncate text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {!isProcessing && !successMsg && (
                    <button onClick={resetState} className="p-1 text-slate-400 transition-colors hover:text-rose-300">
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
              
              {error && (
                <div className="mt-4 flex gap-2 rounded-2xl border border-rose-400/15 bg-rose-500/10 p-3 text-sm text-rose-100">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              {successMsg && (
                <div className="mt-4 flex gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <p>{successMsg}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 border-t border-white/10 bg-white/5 p-4">
              <button 
                onClick={() => setIsOpen(false)}
                className="btn btn-outline"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                className="btn btn-primary flex items-center gap-2"
                disabled={!file || isProcessing || !!successMsg}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    Import Resume
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
