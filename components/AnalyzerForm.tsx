'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ScanMode } from '@/lib/types';

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

  const minChars = 50;
  const charCount = mode === 'quick' ? description.length : 
    (title + description + requirements + companyProfile).length;
  const isValid = charCount >= minChars;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      {/* Mode Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Scan Mode:
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              mode === 'quick'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Quick Scan
          </button>
          <button
            type="button"
            onClick={() => setMode('detailed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              mode === 'detailed'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Detailed Scan
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Detailed Mode Fields */}
        {mode === 'detailed' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Requirements
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Required skills, experience, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Profile
              </label>
              <textarea
                value={companyProfile}
                onChange={(e) => setCompanyProfile(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Company information"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., $50k - $70k"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employment Type
                </label>
                <input
                  type="text"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Full-time"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Description (Always Required) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Description {mode === 'quick' && '*'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={mode === 'quick' ? 12 : 6}
            minLength={mode === 'quick' ? minChars : 0}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            placeholder={
              mode === 'quick'
                ? 'Paste the full job posting here...'
                : 'Job description details...'
            }
            required
          />
          <div className="mt-2 flex justify-between items-center">
            <span
              className={`text-sm ${
                charCount < minChars
                  ? 'text-red-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {charCount} / {minChars} characters minimum
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!isValid || isLoading}
          whileHover={{ scale: isValid && !isLoading ? 1.02 : 1 }}
          whileTap={{ scale: isValid && !isLoading ? 0.98 : 1 }}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
            isValid && !isLoading
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg cursor-pointer'
              : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analyzing...
            </span>
          ) : (
            '🔍 Analyze Job Posting'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}





