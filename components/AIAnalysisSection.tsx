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
  icon: string;
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-md overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </span>
        </div>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
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
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AIAnalysisSection({
  analysis,
  className = '',
}: AIAnalysisSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-800 p-6 shadow-lg ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🔍</span>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          AI Deep Investigation (Powered by Gemini)
        </h2>
      </div>

      <div className="space-y-4">
        <AnalysisCard
          title="Manipulation Signals"
          icon="🎭"
          content={analysis.manipulation_signals}
          defaultOpen={true}
        />
        <AnalysisCard
          title="Tone Analysis"
          icon="💬"
          content={analysis.tone_analysis}
        />
        <AnalysisCard
          title="Company Risk Analysis"
          icon="🏢"
          content={analysis.company_risk_analysis}
        />
        <AnalysisCard
          title="Overall Summary"
          icon="📋"
          content={analysis.overall_summary}
          defaultOpen={true}
        />
        <AnalysisCard
          title="Safety Advice"
          icon="🛡️"
          content={analysis.safety_advice}
          defaultOpen={true}
        />
      </div>
    </motion.div>
  );
}





