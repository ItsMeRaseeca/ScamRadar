'use client';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import type { FinalLabel } from '@/lib/types';

interface RiskMeterProps {
  label: FinalLabel;
  mlReasonCount: number;
  hasPositiveSignals: boolean;
  className?: string;
}

export default function RiskMeter({
  label,
  mlReasonCount,
  hasPositiveSignals,
  className = '',
}: RiskMeterProps) {
  let percentage: number;

  if (label === 'FAKE') {
    // Base 60% + 10% per ML reasoning item, capped at 95%
    percentage = 60 + mlReasonCount * 10;
    percentage = Math.min(percentage, 95);
  } else {
    // Base 15% + 5% if positive credibility signals exist, capped at 35%
    percentage = 15;
    if (hasPositiveSignals) {
      percentage += 5;
    }
    percentage = Math.min(percentage, 35);
  }

  const color = label === 'FAKE' ? '#ef4444' : '#10b981';
  const trailColor = label === 'FAKE' ? '#fee2e2' : '#d1fae5';

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
            fontWeight: 'bold',
          })}
        />
      </div>
      <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        Risk Level
      </p>
    </div>
  );
}

