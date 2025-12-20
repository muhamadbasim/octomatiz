/**
 * CohortHeatmap Component
 * Heatmap grid showing cohort retention percentages
 */

import React from 'react';
import type { CohortHeatmapProps, CohortData } from '../../types/admin';
import {
  getCohortRetentionColor,
  hasBadRetentionAtMonth3,
} from '../../lib/admin/metricsCalculator';

/**
 * Skeleton loader
 */
function HeatmapSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
      <div className="h-64 bg-gray-100 rounded" />
    </div>
  );
}

/**
 * Single heatmap cell
 */
function HeatmapCell({
  value,
  cohortLabel,
  monthIndex,
}: {
  value: number;
  cohortLabel: string;
  monthIndex: number;
}) {
  const bgColor = getCohortRetentionColor(value);
  const textColor = value > 50 ? 'white' : 'black';

  return (
    <div
      className="w-10 h-8 flex items-center justify-center text-xs font-medium rounded transition-all hover:scale-110 hover:z-10 cursor-default"
      style={{ backgroundColor: bgColor, color: textColor }}
      title={`${cohortLabel} - M${monthIndex}: ${value.toFixed(0)}%`}
    >
      {value.toFixed(0)}
    </div>
  );
}

/**
 * CohortHeatmap Component
 */
export function CohortHeatmap({ data, isLoading = false }: CohortHeatmapProps) {
  if (isLoading) {
    return <HeatmapSkeleton />;
  }

  const { cohorts, months } = data;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span className="font-semibold text-gray-800">Cohort Analysis</span>
          </div>
          <span className="text-xs text-gray-500">Retensi per bulan (%)</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="p-4 overflow-x-auto">
        {cohorts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data cohort
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 pb-2 pr-4 sticky left-0 bg-white">
                  Cohort
                </th>
                {months.map((month, i) => (
                  <th key={i} className="text-center text-xs font-medium text-gray-500 pb-2 px-1">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort, rowIndex) => {
                const hasBadRetention = hasBadRetentionAtMonth3(cohort.retentionByMonth);
                
                return (
                  <tr key={rowIndex}>
                    {/* Cohort Label */}
                    <td className={`text-xs font-medium pr-4 py-1 sticky left-0 bg-white ${
                      hasBadRetention ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      <div className="flex items-center gap-1">
                        {cohort.cohortLabel}
                        {hasBadRetention && (
                          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {cohort.userCount} users
                      </div>
                    </td>
                    
                    {/* Retention cells */}
                    {months.map((_, colIndex) => {
                      const retention = cohort.retentionByMonth[colIndex];
                      
                      // Only show cells where we have data
                      if (retention === undefined) {
                        return (
                          <td key={colIndex} className="px-1 py-1">
                            <div className="w-10 h-8 bg-gray-100 rounded" />
                          </td>
                        );
                      }
                      
                      return (
                        <td key={colIndex} className="px-1 py-1">
                          <HeatmapCell
                            value={retention}
                            cohortLabel={cohort.cohortLabel}
                            monthIndex={colIndex}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 pb-4 border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between">
          {/* Color gradient legend */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Retensi:</span>
            <div className="flex items-center">
              <div className="w-16 h-3 rounded-l" style={{ background: 'linear-gradient(to right, hsl(0, 70%, 45%), hsl(60, 70%, 45%), hsl(120, 70%, 45%))' }} />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
          
          {/* Warning indicator */}
          <div className="flex items-center gap-1 text-xs text-red-600">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Retensi &lt;50% di M3</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CohortHeatmap;
