/**
 * MetricCard Component
 * Reusable card for displaying metrics with status indicators
 */

import React from 'react';
import type { MetricCardProps, MetricStatus } from '../../types/admin';

// Status color mapping
const statusColors: Record<MetricStatus, { bg: string; border: string; text: string }> = {
  healthy: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
  },
};

// Change indicator colors
const changeColors = {
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-gray-500',
};

/**
 * Get arrow direction based on change value
 */
export function getChangeDirection(change: number): 'up' | 'down' | 'neutral' {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
}

/**
 * Arrow icons for change direction
 */
function ChangeArrow({ direction }: { direction: 'up' | 'down' | 'neutral' }) {
  if (direction === 'up') {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    );
  }
  if (direction === 'down') {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
    </svg>
  );
}

/**
 * Skeleton loader for MetricCard
 */
function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
  );
}

/**
 * MetricCard Component
 */
export function MetricCard({
  title,
  value,
  formattedValue,
  change,
  changeLabel,
  status,
  tooltip,
  icon,
  isLoading = false,
  prefix,
  suffix,
}: MetricCardProps) {
  if (isLoading) {
    return <MetricCardSkeleton />;
  }

  const colors = status ? statusColors[status] : { bg: 'bg-white', border: 'border-gray-200', text: '' };
  const changeDirection = change !== undefined ? getChangeDirection(change) : 'neutral';
  const changeColor = change !== undefined
    ? change > 0 ? changeColors.positive : change < 0 ? changeColors.negative : changeColors.neutral
    : changeColors.neutral;

  const displayValue = formattedValue ?? value;

  return (
    <div
      className={`rounded-xl border p-4 transition-all hover:shadow-md ${colors.bg} ${colors.border}`}
      title={tooltip}
    >
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>

      {/* Main value */}
      <div className={`text-2xl font-bold ${status ? colors.text : 'text-gray-900'}`}>
        {prefix}{displayValue}{suffix}
      </div>

      {/* Change indicator */}
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${changeColor}`}>
          <ChangeArrow direction={changeDirection} />
          <span>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          {changeLabel && <span className="text-gray-500 ml-1">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}

export default MetricCard;
