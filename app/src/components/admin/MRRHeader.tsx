/**
 * MRRHeader Component
 * Header displaying MRR value prominently with change indicator
 */

import React from 'react';
import type { MRRHeaderProps } from '../../types/admin';
import { formatCurrency, formatPercentageChange, getMRRChangeDirection, getMRRChangeColor } from '../../lib/admin/metricsCalculator';

/**
 * Arrow icons for MRR change direction
 */
function MRRArrow({ direction }: { direction: 'up' | 'down' | 'neutral' }) {
  if (direction === 'up') {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    );
  }
  if (direction === 'down') {
    return (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  }
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
    </svg>
  );
}

/**
 * Skeleton loader for MRRHeader
 */
function MRRHeaderSkeleton() {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white animate-pulse">
      <div className="h-4 bg-gray-600 rounded w-32 mb-4" />
      <div className="flex items-end gap-4">
        <div className="h-12 bg-gray-600 rounded w-48" />
        <div className="h-8 bg-gray-600 rounded w-24" />
      </div>
      <div className="h-3 bg-gray-700 rounded w-40 mt-4" />
    </div>
  );
}

/**
 * Format relative time for last updated
 */
function formatLastUpdated(date: Date | string): string {
  // Handle both Date object and string (from JSON serialization)
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Baru saja';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari yang lalu`;
}

/**
 * MRRHeader Component
 */
export function MRRHeader({
  mrr,
  mrrGrowth,
  lastUpdated,
  isLoading = false,
}: MRRHeaderProps) {
  if (isLoading) {
    return <MRRHeaderSkeleton />;
  }

  const direction = getMRRChangeDirection(mrrGrowth);
  const colorIndicator = getMRRChangeColor(mrrGrowth);
  
  const changeColorClass = {
    green: 'text-green-400 bg-green-400/20',
    red: 'text-red-400 bg-red-400/20',
    amber: 'text-amber-400 bg-amber-400/20',
  }[colorIndicator];

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
      {/* Label */}
      <div className="text-gray-400 text-sm font-medium mb-2">
        Monthly Recurring Revenue
      </div>
      
      {/* MRR Value and Change */}
      <div className="flex items-end gap-4 flex-wrap">
        {/* Main MRR Value */}
        <div className="text-4xl md:text-5xl font-bold tracking-tight">
          {formatCurrency(mrr, true)}
        </div>
        
        {/* Change Badge */}
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${changeColorClass}`}>
          <MRRArrow direction={direction} />
          <span>{formatPercentageChange(mrrGrowth)}</span>
        </div>
      </div>
      
      {/* Last Updated */}
      <div className="text-gray-500 text-xs mt-4">
        Terakhir diperbarui: {formatLastUpdated(lastUpdated)}
      </div>
    </div>
  );
}

export default MRRHeader;
