'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScanMode } from '@/lib/types';
import { extractTextFromImage } from '@/lib/ocr';
import toast from 'react-hot-toast';

interface AnalyzerFormProps {
  onAnalyze: (data: {
    title: string;
    description: string;
    requirements: string;
    company_profile: string;
    salary_range: string;
    employment_type: string;
  }) => void;
  isLoading: boolean;
}

export default function AnalyzerForm({
  onAnalyze,
  isLoading,
}: AnalyzerFormProps) {
  const [mode, setMode] = useState<ScanMode>('quick');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [requirements, setRequirements] = useState('');
  const [companyProfile, setCompanyProfile] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [employmentType, setEmploymentType] = useState('');

  // OCR / Image states
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const minChars = 50;
  const charCount = mode === 'quick' ? description.length :
    (title + description + requirements + companyProfile).length;
  const isValid = charCount >= minChars;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('INVALID FILE TYPE. UPLOAD AN IMAGE.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsOcrLoading(true);
    setOcrProgress(0);
    try {
      const text = await extractTextFromImage(file, (progress) => {
        setOcrProgress(progress);
      });

      if (text) {
        setDescription((prev) => (prev ? prev + '\n\n' + text : text));
        toast.success('TEXT EXTRACTED SUCCESSFULLY.');
      }
    } catch (error) {
      toast.error('OCR ENGINE FAILURE.');
    } finally {
      setIsOcrLoading(false);
      setOcrProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading || isOcrLoading) return;

    onAnalyze({
      title: mode === 'quick' ? '' : title,
      description,
      requirements: mode === 'quick' ? '' : requirements,
      company_profile: mode === 'quick' ? '' : companyProfile,
      salary_range: mode === 'quick' ? '' : salaryRange,
      employment_type: mode === 'quick' ? '' : employmentType,
    });
  };

  return (
    <div className="card-brutal max-w-4xl mx-auto bg-white">
      {/* Header & Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b-[3px] border-gray-900">
        <div>
          <div className="section-label">
            <span className="w-2.5 h-2.5 bg-primary rounded-full" />
            Job Posting Analysis
          </div>
          <h2 className="title-h2 text-gray-900">Analyze Job Posting</h2>
        </div>

        <div className="flex border-[3px] border-gray-900 p-1 bg-white shadow-brutal">
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
              mode === 'quick'
                ? 'bg-primary text-white shadow-brutal-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Quick Scan
          </button>
          <button
            type="button"
            onClick={() => setMode('detailed')}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
              mode === 'detailed'
                ? 'bg-primary text-white shadow-brutal-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      {/* OCR Section */}
      <div className="mb-8 space-y-4">
        <label className="section-label">Upload Screenshot (Optional)</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-[3px] border-dashed border-gray-400 p-8 text-center cursor-pointer transition-all hover:border-primary hover:bg-primary/5 ${
              isOcrLoading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-bold uppercase tracking-wide text-gray-700">
                {isOcrLoading ? `Processing ${ocrProgress}%` : 'Click to Upload'}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative border-[3px] border-gray-900 bg-gray-50 p-2 h-[120px] shadow-brutal"
              >
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-3 -right-3 bg-gray-900 text-white p-1.5 hover:bg-primary transition-colors border-[3px] border-gray-900 shadow-brutal"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence mode="wait">
          {mode === 'detailed' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden"
            >
              <div className="md:col-span-2">
                <label className="section-label">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-brutal"
                  placeholder="e.g. Senior Software Architect"
                />
              </div>

              <div>
                <label className="section-label">Salary Range</label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="input-brutal"
                  placeholder="e.g. $140k - $180k"
                />
              </div>

              <div>
                <label className="section-label">Job Type</label>
                <input
                  type="text"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="input-brutal"
                  placeholder="e.g. Full-time / Remote"
                />
              </div>

              <div className="md:col-span-2">
                <label className="section-label">Requirements</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={2}
                  className="input-brutal resize-none"
                  placeholder="Key qualifications..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="section-label">Company Profile</label>
                <textarea
                  value={companyProfile}
                  onChange={(e) => setCompanyProfile(e.target.value)}
                  rows={2}
                  className="input-brutal resize-none"
                  placeholder="Website, LinkedIn, description..."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <label className="section-label">
            {mode === 'quick' ? 'Job Posting Text' : 'Job Description'}
          </label>
          <div className="relative border-[3px] border-gray-900 bg-white">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
              className="w-full p-5 bg-white focus:outline-none font-medium text-base min-h-[280px] block resize-none"
              placeholder="Paste the job posting content here..."
              required
            />

            <div className="border-t-[3px] border-gray-900 bg-gray-50 p-3 flex items-center justify-between text-xs font-bold uppercase tracking-wide">
              <span className="text-gray-600">{charCount} / {minChars} characters</span>
              {charCount < minChars ? (
                <span className="text-risk-red">Minimum {minChars} characters required</span>
              ) : (
                <span className="text-risk-green">Ready to analyze</span>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading || isOcrLoading}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Analyze Job Posting</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}








