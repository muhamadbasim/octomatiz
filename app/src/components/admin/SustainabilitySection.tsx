/**
 * SustainabilitySection Component
 * Displays Payback Period, Burn Rate, Cash Runway
 */

import React from 'react';
import type { SustainabilitySectionProps } from '../../types/admin';
import { MetricCard } from './MetricCard';
import {
  formatCurrency,
  formatMonths,
  getPaybackPeriodStatus,
  getCashRunwayStatus,
} from '../../lib/admin/metricsCalculator';

/**
 * SustainabilitySection Component
 */
export function SustainabilitySection({ metrics, isLoading = false }: SustainabilitySectionProps) {
  const paybackStatus = getPaybackPeriodStatus(metrics.paybackPeriod);
  const runwayStatus = getCashRunwayStatus(metrics.cashRunway);

  // Calculate burn rate trend (comparing last 2 months)
  const burnRateTrend = metrics.burnRateTrend.length >= 2
    ? ((metrics.burnRateTrend[metrics.burnRateTrend.length - 1] - metrics.burnRateTrend[metrics.burnRateTrend.length - 2]) / metrics.burnRateTrend[metrics.burnRateTrend.length - 2]) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h2 className="font-semibold text-gray-800">Sustainability</h2>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Payback Period */}
        <MetricCard
          title="Payback Period"
          value={formatMonths(metrics.paybackPeriod)}
          status={paybackStatus}
          tooltip={`Waktu untuk mengembalikan CAC. ${
            paybackStatus === 'healthy' ? '≤12 bulan = Sehat' : '>12 bulan = Terlalu Lama'
          }`}
          isLoading={isLoading}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Burn Rate */}
        <MetricCard
          title="Burn Rate"
          value={formatCurrency(metrics.burnRate, true)}
          change={burnRateTrend}
          changeLabel="MoM"
          status={burnRateTrend > 10 ? 'warning' : 'healthy'}
          tooltip="Pengeluaran bulanan (cash outflow)"
          isLoading={isLoading}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          }
        />

        {/* Cash Runway */}
        <MetricCard
          title="Cash Runway"
          value={formatMonths(metrics.cashRunway)}
          status={runwayStatus}
          tooltip={`Berapa lama cash bertahan. ${
            runwayStatus === 'critical' ? '<6 bulan = KRITIS!' :
            runwayStatus === 'warning' ? '6-12 bulan = Waspada' :
            '≥12 bulan = Aman'
          }`}
          isLoading={isLoading}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
      </div>

      {/* Cash Runway Warning */}
      {runwayStatus === 'critical' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div className="font-semibold text-red-800">Cash Runway Kritis!</div>
            <div className="text-sm text-red-700">
              Runway kurang dari 6 bulan. Segera evaluasi burn rate atau cari pendanaan tambahan.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SustainabilitySection;
