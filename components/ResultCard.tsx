'use client';

import { motion } from 'framer-motion';
import RiskMeter from './RiskMeter';
import type { FinalLabel } from '@/lib/types';

interface ResultCardProps {
  label: FinalLabel;
  mlReasoning: string[];
  riskScore?: number;
  hasAIAnalysis?: boolean;
  onRunDeepReview?: () => void;
  isDeepLoading?: boolean;
  className?: string;
}

export default function ResultCard({
  label,
  mlReasoning,
  riskScore,
  hasAIAnalysis = false,
  onRunDeepReview,
  isDeepLoading = false,
  className = '',
}: ResultCardProps) {
  const isHighRisk = label === 'HIGH_RISK' || label === 'CRITICAL_RISK' || label === 'FAKE';
  const isModerateRisk = label === 'MODERATE_RISK';

  const bgGradient = isHighRisk
    ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'
    : isModerateRisk
      ? 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20'
      : 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20';

  const borderColor = isHighRisk
    ? 'border-red-300 dark:border-red-700'
    : isModerateRisk
      ? 'border-yellow-300 dark:border-yellow-700'
      : 'border-green-300 dark:border-green-700';

  const badgeBg = isHighRisk
    ? 'bg-red-500 dark:bg-red-600'
    : isModerateRisk
      ? 'bg-yellow-500 dark:bg-yellow-600'
      : 'bg-green-500 dark:bg-green-600';

  const badgeEmoji = isHighRisk ? '🔴' : isModerateRisk ? '🟠' : '🟢';
  const badgeText = label.replace('_', ' ');

  const mlReasonCount = mlReasoning.length;
  const hasPositiveSignals = mlReasoning.some((reason) =>
    reason.startsWith('The posting includes detailed responsibilities and structured content.') ||
    reason.startsWith('The salary range appears realistic and clearly defined.') ||
    reason.startsWith('The job responsibilities are clearly outlined.') ||
    reason.startsWith('A structured company description is present.') ||
    reason.startsWith('No manipulative urgency language detected.')
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border-2 ${borderColor} bg-gradient-to-br ${bgGradient} p-6 shadow-lg ${className}`}
    >
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Risk Meter */}
        <RiskMeter
          label={label}
          riskScore={riskScore}
          mlReasonCount={mlReasonCount}
          hasPositiveSignals={hasPositiveSignals}
        />

        {/* Content */}
        <div className="flex-1">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{badgeEmoji}</span>
            <span
              className={`px-4 py-2 rounded-full text-white font-semibold ${badgeBg}`}
            >
              {badgeText}
            </span>
            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {label}
            </span>
          </div>

          {/* Structured Analysis */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Structured Analysis
            </h3>
            <ul className="space-y-2">
              {mlReasoning.map((reason, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-gray-400 dark:text-gray-500 mt-1">
                    •
                  </span>
                  <span>{reason}</span>
                </motion.li>
              ))}
            </ul>

            {onRunDeepReview && !hasAIAnalysis && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={onRunDeepReview}
                  disabled={isDeepLoading}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${isHighRisk
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                    } ${isDeepLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isDeepLoading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                      Running deep AI review...
                    </>
                  ) : (
                    <>
                      <span>{isHighRisk ? '🔍' : '🔎'}</span>
                      <span>
                        {isHighRisk
                          ? 'Run Deep AI Investigation'
                          : 'Run Advanced Credibility Review'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

