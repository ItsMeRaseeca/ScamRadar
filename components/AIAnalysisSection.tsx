'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AIAnalysis } from '@/lib/types';

interface AIAnalysisSectionProps {
  analysis: AIAnalysis;
  className?: string;
}

interface AnalysisCardProps {
  title: string;
  icon: React.ReactNode;
  content: string;
  defaultOpen?: boolean;
}

function AnalysisCard({
  title,
  icon,
  content,
  defaultOpen = false,
}: AnalysisCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-[3px] border-gray-900 bg-white transition-all hover:shadow-brutal">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white border-b-[3px] border-gray-900 group transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <span className="text-primary w-6 h-6 flex items-center justify-center">
            {icon}
          </span>
          <span className="font-black uppercase tracking-tight text-sm text-gray-900">
            {title}
          </span>
        </div>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 text-sm font-medium leading-relaxed text-gray-700 bg-gray-50 border-l-4 border-primary">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AIAnalysisSection({
  analysis,
  className = '',
}: AIAnalysisSectionProps) {
  return (
    <div className={`card-brutal p-0 bg-white ${className}`}>
      <div className="border-b-[3px] border-gray-900 p-6 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-primary rounded-full" />
          <h2 className="title-h2 text-xl text-gray-900">AI Deep Analysis</h2>
        </div>
        <div className="section-label text-gray-600">Powered by Gemini AI</div>
      </div>

      <div className="p-8 space-y-3">
        <AnalysisCard
          title="Manipulation Dictionary"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
          content={analysis.manipulation_signals}
          defaultOpen={true}
        />
        <AnalysisCard
          title="Linguistic Tone Analysis"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
          content={analysis.tone_analysis}
        />
        <AnalysisCard
          title="Structural Entity Risk"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          content={analysis.company_risk_analysis}
        />
        <AnalysisCard
          title="Consolidated Investigation Summary"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          content={analysis.overall_summary}
          defaultOpen={true}
        />
        <AnalysisCard
          title="Safety Protocol Recommendations"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          content={analysis.safety_advice}
          defaultOpen={true}
        />
      </div>
    </div>
  );
}








