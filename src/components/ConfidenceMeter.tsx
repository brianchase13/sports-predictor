'use client';

import { cn } from '@/lib/utils';

interface ConfidenceMeterProps {
  confidence: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showPercentage?: boolean;
  className?: string;
}

export function ConfidenceMeter({
  confidence,
  size = 'md',
  showLabel = true,
  showPercentage = true,
  className,
}: ConfidenceMeterProps) {
  const getConfidenceColor = (value: number) => {
    if (value >= 75) return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-100' };
    if (value >= 60) return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-100' };
    return { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-100' };
  };

  const getConfidenceLabel = (value: number) => {
    if (value >= 80) return 'Very High';
    if (value >= 70) return 'High';
    if (value >= 60) return 'Moderate';
    return 'Low';
  };

  const colors = getConfidenceColor(confidence);
  const label = getConfidenceLabel(confidence);

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || showPercentage) && (
        <div className={cn('flex items-center justify-between mb-1', textSizeClasses[size])}>
          {showLabel && (
            <span className={cn('font-medium', colors.text)}>{label}</span>
          )}
          {showPercentage && (
            <span className="font-bold">{confidence}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full overflow-hidden', colors.light, heightClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colors.bg
          )}
          style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
        />
      </div>
    </div>
  );
}

// Compact inline confidence badge
interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const getColors = (value: number) => {
    if (value >= 75) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (value >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        getColors(confidence),
        className
      )}
    >
      {confidence}%
    </span>
  );
}
