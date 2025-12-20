/**
 * LTVCACBarChart Component
 * Horizontal bar chart comparing LTV and CAC by segment
 */

import React from 'react';
import type { LTVCACBarChartProps, LTVCACChartData, MetricStatus } from '../../types/admin';
import { formatCurrency, formatRatio } from '../../lib/admin/metricsCalculator';

/**
 * Status color mapping
 */
const statusColors: Record<MetricStatus, { bar: string; bg: string; text: string }> = {
  healthy: { bar: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  warning: { bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  critical: { bar: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
};

/**
 * Single segment bar
 */
function SegmentBar({ data, maxValue }: { data: LTVCACChartData; maxValue: number }) {
  const colors = statusColors[data.status];
  const ltvWidth = (data.ltv / maxValue) * 100;
  const cacWidth = (data.cac / maxValue) * 100;

  return (
    <div className={`rounded-lg p-4 ${colors.bg}`}>
      {/* Segment Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-800">{data.segmentLabel}</span>
        <span className={`text-sm font-medium ${colors.text}`}>
          Ratio: {formatRatio(data.ratio)}
        </span>
      </div>

      {/* LTV Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>LTV</span>
          <span>{formatCurrency(data.ltv, true)}</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${ltvWidth}%` }}
          />
        </div>
      </div>

      {/* CAC Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>CAC</span>
          <span>{formatCurrency(data.cac, true)}</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${colors.bar}`}
            style={{ width: `${cacWidth}%` }}
          />
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3 flex justify-end">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors.bg} ${colors.text} border ${
          data.status === 'healthy' ? 'border-green-200' :
          data.status === 'warning' ? 'border-amber-200' :
          'border-red-200'
        }`}>
          {data.status === 'healthy' ? 'Sehat' :
           data.status === 'warning' ? 'Cukup' :
           'Perlu Perbaikan'}
        </span>
      </div>
    </div>
  );
}

/**
 * Skeleton loader
 */
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

/**
 * LTVCACBarChart Component
 */
export function LTVCACBarChart({ data, isLoading = false }: LTVCACBarChartProps) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  // Find max value for scaling
  const maxValue = Math.max(...data.flatMap(d => [d.ltv, d.cac])) * 1.1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="font-semibold text-gray-800">LTV vs CAC per Segmen</span>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-4 space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data segmen
          </div>
        ) : (
          data.map((segment, i) => (
            <SegmentBar key={i} data={segment} maxValue={maxValue} />
          ))
        )}
      </div>

      {/* Legend */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>LTV (Lifetime Value)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-400" />
            <span>CAC (Customer Acquisition Cost)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LTVCACBarChart;
