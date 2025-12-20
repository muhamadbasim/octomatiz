/**
 * DangerZone Component
 * Alert sidebar showing active danger alerts
 */

import React from 'react';
import type { DangerZoneProps, DangerAlert, AlertSeverity } from '../../types/admin';

// Severity styling
const severityStyles: Record<AlertSeverity, { bg: string; border: string; icon: string; text: string }> = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    icon: 'text-red-600',
    text: 'text-red-800',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    icon: 'text-amber-600',
    text: 'text-amber-800',
  },
};

/**
 * Alert icon based on severity
 */
function AlertIcon({ severity }: { severity: AlertSeverity }) {
  if (severity === 'critical') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/**
 * Single alert item
 */
function AlertItem({ alert }: { alert: DangerAlert }) {
  const styles = severityStyles[alert.severity];
  
  return (
    <div className={`rounded-lg border p-3 ${styles.bg} ${styles.border}`}>
      <div className="flex items-start gap-3">
        <div className={styles.icon}>
          <AlertIcon severity={alert.severity} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm ${styles.text}`}>
            {alert.metricLabel}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {alert.message}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span>
              {alert.previousValue.toFixed(1)} → {alert.currentValue.toFixed(1)}
            </span>
            <span className={`font-medium ${alert.changePercent > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ({alert.changePercent > 0 ? '+' : ''}{alert.changePercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * All Clear state when no alerts
 */
function AllClearState() {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-green-700 font-semibold">Semua Aman!</div>
      <div className="text-gray-500 text-sm mt-1">Tidak ada alert aktif</div>
    </div>
  );
}

/**
 * Skeleton loader for DangerZone
 */
function DangerZoneSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
      <div className="space-y-3">
        <div className="h-20 bg-gray-100 rounded" />
        <div className="h-20 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

/**
 * DangerZone Component
 */
export function DangerZone({ alerts, isLoading = false }: DangerZoneProps) {
  if (isLoading) {
    return <DangerZoneSkeleton />;
  }

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold text-gray-800">Danger Zone</span>
          </div>
          {alerts.length > 0 && (
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  {criticalCount} kritis
                </span>
              )}
              {warningCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                  {warningCount} peringatan
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {alerts.length === 0 ? (
          <AllClearState />
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DangerZone;
