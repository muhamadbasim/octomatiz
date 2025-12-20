/**
 * VitalSignsSection Component
 * Displays MRR Growth, Customer Churn, Revenue Churn, NRR
 */

import React from 'react';
import type { VitalSignsSectionProps } from '../../types/admin';
import { MetricCard } from './MetricCard';
import {
  formatPercentage,
  getNRRStatus,
} from '../../lib/admin/metricsCalculator';

/**
 * Get churn status - lower is better
 */
function getChurnStatus(churn: number): 'healthy' | 'warning' | 'critical' {
  if (churn <= 2) return 'healthy';
  if (churn <= 5) return 'warning';
  return 'critical';
}

/**
 * VitalSignsSection Component
 */
export function VitalSignsSection({ metrics, isLoading = false }: VitalSignsSectionProps) {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h2 className="font-semibold text-gray-800">Vital Signs</h2>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* MRR Growth */}
        <MetricCard
          title="MRR Growth"
          value={formatPercentage(metrics.mrrGrowth)}
          change={metrics.mrrGrowth}
          changeLabel="MoM"
          status={metrics.mrrGrowth >= 0 ? 'healthy' : 'critical'}
          tooltip="Pertumbuhan Monthly Recurring Revenue bulan ini vs bulan lalu"
          isLoading={isLoading}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />

        {/* Customer Churn */}
        <MetricCard
          title="Customer Churn"
          value={formatPercentage(metrics.customerChurn)}
          status={getChurnStatus(metrics.customerChurn)}
          tooltip="Persentase pelanggan yang berhenti berlangganan"
          isLoading={isLoading}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          }
        />

        {/* Revenue Churn */}
        <MetricCard
          title="Revenue Churn"
          value={formatPercentage(metrics.revenueChurn)}
          status={getChurnStatus(metrics.revenueChurn)}
          tooltip="Persentase revenue yang hilang dari pelanggan yang churn"
          isLoading={isLoading}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* NRR */}
        <MetricCard
          title="NRR"
          value={formatPercentage(metrics.nrr)}
          status={getNRRStatus(metrics.nrr)}
          tooltip="Net Revenue Retention - >100% berarti ada expansion revenue"
          isLoading={isLoading}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

export default VitalSignsSection;
