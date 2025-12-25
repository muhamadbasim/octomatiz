/**
 * EfficiencySection Component
 * Displays CAC, LTV, LTV:CAC Ratio with color-coded health indicators
 */

import React from 'react';
import type { EfficiencySectionProps } from '../../types/admin';
import { MetricCard } from './MetricCard';
import {
  formatCurrency,
  formatRatio,
  getLTVCACStatus,
} from '../../lib/admin/metricsCalculator';

/**
 * EfficiencySection Component
 */
export function EfficiencySection({ metrics, isLoading = false }: EfficiencySectionProps) {
  const ltvCacStatus = getLTVCACStatus(metrics.ltvCacRatio);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h2 className="font-semibold text-gray-800">Efficiency</h2>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* CAC */}
        <MetricCard
          title="CAC"
          value={formatCurrency(metrics.cac, true)}
          change={metrics.cacTrend}
          changeLabel="WoW"
          status={metrics.cacTrend > 20 ? 'critical' : metrics.cacTrend > 10 ? 'warning' : 'healthy'}
          tooltip="Customer Acquisition Cost - biaya untuk mendapatkan 1 pelanggan baru"
          isLoading={isLoading}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        {/* LTV */}
        <MetricCard
          title="LTV"
          value={formatCurrency(metrics.ltv, true)}
          status="healthy"
          tooltip="Lifetime Value - total revenue yang dihasilkan 1 pelanggan selama berlangganan"
          isLoading={isLoading}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* LTV:CAC Ratio */}
        <MetricCard
          title="LTV:CAC Ratio"
          value={formatRatio(metrics.ltvCacRatio)}
          status={ltvCacStatus}
          tooltip={`Rasio LTV terhadap CAC. ${
            ltvCacStatus === 'healthy' ? '≥5 = Sangat Sehat' :
            ltvCacStatus === 'warning' ? '3-5 = Cukup' :
            '<3 = Perlu Perbaikan'
          }`}
          isLoading={isLoading}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          }
        />
      </div>

      {/* LTV:CAC Health Indicator Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span>≥5:1 Sangat Sehat</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span>3-5:1 Cukup</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span>&lt;3:1 Perlu Perbaikan</span>
        </div>
      </div>
    </div>
  );
}

export default EfficiencySection;
