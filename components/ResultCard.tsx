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

  const riskBadgeColor = isHighRisk
    ? 'bg-risk-red text-white'
    : isModerateRisk
      ? 'bg-risk-yellow text-black'
      : 'bg-risk-green text-white';

  const mlReasonCount = mlReasoning.length;
  const hasPositiveSignals = mlReasoning.some((reason) =>
    reason.startsWith('The posting includes detailed responsibilities and structured content.') ||
    reason.startsWith('The salary range appears realistic and clearly defined.') ||
    reason.startsWith('The job responsibilities are clearly outlined.') ||
    reason.startsWith('A structured company description is present.') ||
    reason.startsWith('No manipulative urgency language detected.')
  );

  return (
    <div className={`card-brutal p-0 overflow-hidden bg-white ${className}`}>
      {/* Header */}
      <div className="border-b-[3px] border-gray-900 p-6 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`badge-risk ${riskBadgeColor} shadow-brutal`}>
            {label.replace('_', ' ')}
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
            Analysis Report
          </h2>
        </div>

        {riskScore !== undefined && (
          <div className="badge-risk bg-gray-900 text-white shadow-brutal">
            Risk: {Math.round(riskScore * 100)}%
          </div>
        )}
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Risk Visualization */}
        <div className="lg:col-span-4 border-r-0 lg:border-r-[3px] border-gray-200 pr-0 lg:pr-8">
          <div className="section-label mb-6">Risk Assessment</div>
          <div className="flex justify-center py-4">
            <RiskMeter
              label={label}
              riskScore={riskScore}
              mlReasonCount={mlReasonCount}
              hasPositiveSignals={hasPositiveSignals}
            />
          </div>
        </div>

        {/* Analysis Details */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <div className="section-label mb-4">Key Findings</div>
            <div className="grid grid-cols-1 gap-3">
              {mlReasoning.map((reason, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-start gap-4 p-4 border-[3px] border-gray-900 bg-white hover:shadow-brutal transition-all"
                >
                  <span className="text-xs font-black text-white bg-primary w-7 h-7 flex items-center justify-center border-[3px] border-gray-900 flex-shrink-0 shadow-brutal">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 leading-relaxed flex-1">
                    {reason}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {onRunDeepReview && !hasAIAnalysis && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onRunDeepReview}
                disabled={isDeepLoading}
                className="btn-primary w-full md:w-auto flex items-center justify-center gap-3"
              >
                {isDeepLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin" />
                    <span>Running Analysis...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>{isHighRisk ? 'Run Deep AI Analysis' : 'Run Advanced Review'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

