'use client';

import { motion } from 'framer-motion';
import { highlightText, extractKeywords } from '@/lib/highlight';
import type { FinalLabel } from '@/lib/types';

interface SafetyPanelProps {
  label: FinalLabel;
  mlReasoning: string[];
  originalText: string;
  className?: string;
}

export default function SafetyPanel({
  label,
  mlReasoning,
  originalText,
  className = '',
}: SafetyPanelProps) {
  const keywords = extractKeywords(mlReasoning, originalText);
  const segments = highlightText(originalText, keywords);

  if (!originalText) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-lg ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Job Posting (with highlighted risks)
      </h3>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {segments.map((seg, idx) =>
            seg.highlighted ? (
              <span
                key={`highlight-${idx}`}
                className="bg-red-200 dark:bg-red-900/30 text-red-900 dark:text-red-200 font-semibold rounded px-1"
              >
                {seg.text}
              </span>
            ) : (
              <span key={`text-${idx}`}>{seg.text}</span>
            )
          )}
        </p>
      </div>
      {keywords.length > 0 && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Highlighted:</span> Suspicious keywords
          detected by ML analysis
        </p>
      )}
    </motion.div>
  );
}

