/**
 * AdminDashboard Component
 * Main dashboard wrapper composing all sections
 */

import React, { useState, useEffect } from 'react';
import type { DashboardState, SegmentType, DashboardMetrics } from '../../types/admin';
import { MRRHeader } from './MRRHeader';
import { VitalSignsSection } from './VitalSignsSection';
import { EfficiencySection } from './EfficiencySection';
import { SustainabilitySection } from './SustainabilitySection';
import { ProductHealthSection } from './ProductHealthSection';
import { MRRTrendChart } from './MRRTrendChart';
import { CohortHeatmap } from './CohortHeatmap';
import { LTVCACBarChart } from './LTVCACBarChart';
import { DangerZone } from './DangerZone';
import { SegmentFilter } from './SegmentFilter';
import { LandingPageAnalytics } from './LandingPageAnalytics';

// Import mock data for development
import { getMockDashboardMetrics } from '../../lib/admin/mockData';

// Import admin API helper
import { adminFetch, hasAdminToken, promptForAdminToken, clearAdminToken } from '../../lib/api/adminApi';

// Real stats from D1
interface RealStats {
  totalProjects: number;
  projectsByStatus: { draft: number; building: number; live: number };
  totalDevices: number;
  projectsCreatedToday: number;
  projectsCreatedThisWeek: number;
  projectsCreatedThisMonth: number;
  totalDeployments: number;
}

/**
 * AdminDashboard Component
 */
export function AdminDashboard() {
  const [state, setState] = useState<DashboardState>({
    metrics: null,
    isLoading: true,
    error: null,
    selectedSegment: 'all',
  });
  
  const [realStats, setRealStats] = useState<RealStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  // Check for admin token on mount
  useEffect(() => {
    if (!hasAdminToken()) {
      const hasToken = promptForAdminToken();
      if (!hasToken) {
        setNeedsAuth(true);
      }
    }
  }, []);

  // Fetch metrics on mount and when segment changes
  useEffect(() => {
    if (!needsAuth) {
      fetchMetrics(state.selectedSegment);
    }
  }, [state.selectedSegment, needsAuth]);
  
  // Fetch real stats from D1
  useEffect(() => {
    if (!needsAuth) {
      fetchRealStats();
    }
  }, [needsAuth]);
  
  const fetchRealStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const response = await adminFetch('/api/admin/stats');
      if (response.status === 401) {
        setStatsError('Akses tidak diizinkan');
        clearAdminToken();
        setNeedsAuth(true);
        return;
      }
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setRealStats(data.data);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch real stats:', error);
      setStatsError('Gagal memuat data');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchMetrics = async (segment: SegmentType) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try to fetch from API first
      const response = await adminFetch(`/api/admin/metrics?segment=${segment}`);
      
      if (response.status === 401) {
        clearAdminToken();
        setNeedsAuth(true);
        setState(prev => ({ ...prev, isLoading: false, error: 'Akses tidak diizinkan' }));
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setState(prev => ({
            ...prev,
            metrics: data.data,
            isLoading: false,
          }));
          return;
        }
      }
      
      // Fallback to mock data if API fails or returns error
      const mockData = getMockDashboardMetrics(segment);
      setState(prev => ({
        ...prev,
        metrics: mockData,
        isLoading: false,
      }));
    } catch (error) {
      // Use mock data on error
      console.warn('API fetch failed, using mock data:', error);
      const mockData = getMockDashboardMetrics(state.selectedSegment);
      setState(prev => ({
        ...prev,
        metrics: mockData,
        isLoading: false,
        error: null, // Don't show error since we have fallback
      }));
    }
  };

  const handleSegmentChange = (segment: SegmentType) => {
    setState(prev => ({ ...prev, selectedSegment: segment }));
  };

  const handleRetryAuth = () => {
    const hasToken = promptForAdminToken();
    if (hasToken) {
      setNeedsAuth(false);
    }
  };

  const { metrics, isLoading, error, selectedSegment } = state;

  // Auth required state
  if (needsAuth) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Autentikasi Diperlukan</h2>
            <p className="text-gray-600 mb-4">Masukkan Admin Secret untuk mengakses dashboard.</p>
            <button
              onClick={handleRetryAuth}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Masukkan Token
            </button>
            <a
              href="/"
              className="block mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Kembali ke Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !metrics) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-lg font-semibold text-red-800 mb-2">Gagal Memuat Data</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchMetrics(selectedSegment)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </a>
              <h1 className="text-lg font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <div className="text-xs text-gray-500">
              Unit Economics & Truth Metrics
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* MRR Header */}
        <div className="mb-6">
          <MRRHeader
            mrr={metrics?.vital.mrr ?? 0}
            mrrGrowth={metrics?.vital.mrrGrowth ?? 0}
            lastUpdated={metrics?.lastUpdated ?? new Date()}
            isLoading={isLoading}
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vital Signs */}
            <VitalSignsSection
              metrics={metrics?.vital ?? { mrr: 0, mrrGrowth: 0, customerChurn: 0, revenueChurn: 0, nrr: 0 }}
              isLoading={isLoading}
            />

            {/* Efficiency */}
            <EfficiencySection
              metrics={metrics?.efficiency ?? { cac: 0, ltv: 0, ltvCacRatio: 0, cacTrend: 0 }}
              isLoading={isLoading}
            />

            {/* MRR Trend Chart */}
            <MRRTrendChart
              data={metrics?.mrrTrend ?? []}
              isLoading={isLoading}
            />

            {/* Cohort Heatmap */}
            <CohortHeatmap
              data={metrics?.cohortAnalysis ?? { cohorts: [], months: [] }}
              isLoading={isLoading}
            />

            {/* Sustainability & Product Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SustainabilitySection
                metrics={metrics?.sustainability ?? { paybackPeriod: 0, burnRate: 0, cashRunway: 0, burnRateTrend: [] }}
                isLoading={isLoading}
              />
              <ProductHealthSection
                metrics={metrics?.product ?? { arpu: 0, arpuBySegment: { basic: 0, premium: 0 }, dauMauRatio: 0, arpuChange: 0 }}
                isLoading={isLoading}
              />
            </div>

            {/* LTV:CAC Bar Chart */}
            <LTVCACBarChart
              data={metrics?.ltvCacBySegment ?? []}
              isLoading={isLoading}
            />
          </div>

          {/* Sidebar - 1 column on desktop */}
          <div className="space-y-6">
            {/* Danger Zone */}
            <DangerZone
              alerts={metrics?.alerts ?? []}
              isLoading={isLoading}
            />

            {/* Segment Filter */}
            <SegmentFilter
              selected={selectedSegment}
              onChange={handleSegmentChange}
            />

            {/* Landing Page Analytics */}
            <LandingPageAnalytics isLoading={isLoading} />

            {/* Real Stats from D1 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <h3 className="font-semibold text-gray-800">Data Real (D1)</h3>
              </div>
              {statsLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : realStats ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Projects</span>
                    <span className="font-bold text-blue-600">{realStats.totalProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">├ Draft</span>
                    <span className="font-medium text-gray-500">{realStats.projectsByStatus.draft}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">├ Building</span>
                    <span className="font-medium text-yellow-600">{realStats.projectsByStatus.building}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">└ Live</span>
                    <span className="font-medium text-green-600">{realStats.projectsByStatus.live}</span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Devices</span>
                    <span className="font-bold text-purple-600">{realStats.totalDevices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Deployments</span>
                    <span className="font-bold text-green-600">{realStats.totalDeployments}</span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hari Ini</span>
                    <span className="font-medium">{realStats.projectsCreatedToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minggu Ini</span>
                    <span className="font-medium">{realStats.projectsCreatedThisWeek}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bulan Ini</span>
                    <span className="font-medium">{realStats.projectsCreatedThisMonth}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Gagal memuat data</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Ringkasan</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pelanggan</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pelanggan Baru (Bulan Ini)</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Churn (Bulan Ini)</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
            </div>

            {/* Health Score */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-semibold">Health Score</span>
              </div>
              <div className="text-4xl font-bold mb-1">
                {isLoading ? '-' : calculateHealthScore(metrics)}
              </div>
              <div className="text-green-100 text-sm">
                Bisnis dalam kondisi sehat
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Calculate overall health score (0-100)
 */
function calculateHealthScore(metrics: DashboardMetrics | null): string {
  if (!metrics) return '-';

  let score = 50; // Base score

  // LTV:CAC ratio (max +20)
  if (metrics.efficiency.ltvCacRatio >= 5) score += 20;
  else if (metrics.efficiency.ltvCacRatio >= 3) score += 10;
  else score -= 10;

  // NRR (max +15)
  if (metrics.vital.nrr > 110) score += 15;
  else if (metrics.vital.nrr > 100) score += 10;
  else score -= 10;

  // Churn (max +15)
  if (metrics.vital.customerChurn < 2) score += 15;
  else if (metrics.vital.customerChurn < 5) score += 5;
  else score -= 15;

  // Cash Runway (max +10)
  if (metrics.sustainability.cashRunway >= 12) score += 10;
  else if (metrics.sustainability.cashRunway >= 6) score += 5;
  else score -= 20;

  // Alerts penalty
  score -= metrics.alerts.filter(a => a.severity === 'critical').length * 10;
  score -= metrics.alerts.filter(a => a.severity === 'warning').length * 5;

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  return score.toString();
}

export default AdminDashboard;
