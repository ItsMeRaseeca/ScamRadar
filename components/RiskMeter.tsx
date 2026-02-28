'use client';

import type { FinalLabel } from '@/lib/types';

interface RiskMeterProps {
  label: FinalLabel;
  riskScore?: number;
  mlReasonCount: number;
  hasPositiveSignals: boolean;
  className?: string;
}

export default function RiskMeter({
  label,
  riskScore,
  className = '',
}: RiskMeterProps) {
  const percentage = riskScore !== undefined ? Math.round(riskScore * 100) : 50;

  const isHighRisk = label === 'HIGH_RISK' || label === 'CRITICAL_RISK' || label === 'FAKE';
  const isModerateRisk = label === 'MODERATE_RISK';

  const riskColor = isHighRisk
    ? 'bg-risk-red'
    : isModerateRisk
      ? 'bg-risk-yellow'
      : 'bg-risk-green';

  return (
    <div className={`w-full max-w-[240px] flex flex-col items-center gap-6 ${className}`}>
      {/* Risk Gauge */}
      <div className="relative w-full aspect-square border-[3px] border-gray-900 bg-white flex items-center justify-center overflow-hidden shadow-brutal">
        {/* Inner Percentage Display */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-7xl font-black tracking-tight leading-none text-gray-900">
            {percentage}
          </span>
          <span className="text-xs font-black uppercase tracking-wider mt-3 text-gray-600">
            Risk Score
          </span>
        </div>

        {/* Background Fill */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${riskColor}`}
          style={{ height: `${percentage}%`, opacity: 0.15 }}
        />

        {/* Indicator Line */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[3px] ${riskColor} transition-all duration-1000 ease-out`}
          style={{ bottom: `${percentage}%` }}
        />
      </div>

      <div className="badge-risk bg-gray-100 text-gray-700 border-gray-300">
        Analysis Complete
      </div>
    </div>
  );
}

