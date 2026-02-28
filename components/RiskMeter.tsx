'use client';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
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
  mlReasonCount,
  hasPositiveSignals,
  className = '',
}: RiskMeterProps) {
  let percentage: number;

  if (riskScore !== undefined) {
    // If we have an exact score from arbitration, use it.
    percentage = Math.round(riskScore * 100);
  } else if (label === 'FAKE' || label === 'CRITICAL_RISK' || label === 'HIGH_RISK') {
    // Heuristic fallback for legacy/basic mode
    percentage = 60 + mlReasonCount * 10;
    percentage = Math.min(percentage, 95);
  } else {
    // Heuristic fallback for low risk
    percentage = 15;
    if (hasPositiveSignals) {
      percentage += 5;
    }
    percentage = Math.min(percentage, 35);
  }

  const isHighRisk = label === 'HIGH_RISK' || label === 'CRITICAL_RISK' || label === 'FAKE';
  const isModerateRisk = label === 'MODERATE_RISK';

  const color = isHighRisk ? '#ef4444' : isModerateRisk ? '#f59e0b' : '#10b981';
  const trailColor = isHighRisk ? '#fee2e2' : isModerateRisk ? '#fef3c7' : '#d1fae5';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="w-32 h-32">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            pathColor: color,
            textColor: color,
            trailColor: trailColor,
            textSize: '20px',
          })}
        />
      </div>
      <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        Risk Level
      </p>
    </div>
  );
}

