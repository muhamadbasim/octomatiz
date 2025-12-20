/**
 * ProductHealthSection Component
 * Displays ARPU and DAU/MAU Ratio
 */

import React from 'react';
import type { ProductHealthSectionProps } from '../../types/admin';
import { MetricCard } from './MetricCard';
import {
  formatCurrency,
  formatPercentage,
  getDAUMAUStatus,
} from '../../lib/admin/metricsCalculator';

/**
 * ProductHealthSection Component
 */
export function ProductHealthSection({ metrics, isLoading = false }: ProductHealthSectionProps) {
  const dauMauStatus = getDAUMAUStatus(metrics.dauMauRatio);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <h2 className="font-semibold text-gray-800">Product Health</h2>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* ARPU */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">ARPU</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Main ARPU Value */}
          <div className="text-2xl font-bold text-gray-900 mb-3">
            {formatCurrency(metrics.arpu, true)}
          </div>
          
          {/* Change indicator */}
          {metrics.arpuChange !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${
              metrics.arpuChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.arpuChange >= 0 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span>{metrics.arpuChange > 0 ? '+' : ''}{metrics.arpuChange.toFixed(1)}%</span>
            </div>
          )}
          
          {/* Segment Breakdown */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-2">Per Segmen:</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Basic</span>
                <span className="font-medium">{formatCurrency(metrics.arpuBySegment.basic, true)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Premium</span>
                <span className="font-medium">{formatCurrency(metrics.arpuBySegment.premium, true)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DAU/MAU Ratio */}
        <div className={`rounded-xl border p-4 ${
          dauMauStatus === 'healthy' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">DAU/MAU Ratio</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          {/* Main Value */}
          <div className={`text-2xl font-bold ${
            dauMauStatus === 'healthy' ? 'text-green-700' : 'text-amber-700'
          }`}>
            {formatPercentage(metrics.dauMauRatio)}
          </div>
          
          {/* Benchmark Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>0%</span>
              <span>Benchmark: 20%</span>
              <span>100%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  dauMauStatus === 'healthy' ? 'bg-green-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(metrics.dauMauRatio, 100)}%` }}
              />
            </div>
            {/* Benchmark line */}
            <div className="relative h-0">
              <div
                className="absolute -top-2 w-0.5 h-2 bg-gray-600"
                style={{ left: '20%' }}
              />
            </div>
          </div>
          
          {/* Status Text */}
          <div className={`mt-4 text-sm ${
            dauMauStatus === 'healthy' ? 'text-green-700' : 'text-amber-700'
          }`}>
            {dauMauStatus === 'healthy'
              ? '✓ Engagement sehat (≥20%)'
              : '⚠ Engagement rendah (<20%)'
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductHealthSection;
