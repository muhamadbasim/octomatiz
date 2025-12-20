/**
 * LandingPageAnalytics Component
 * Displays link click analytics per landing page
 */

import React, { useState, useEffect } from 'react';
import { adminFetch } from '../../lib/api/adminApi';

interface ClicksByDay {
  date: string;
  count: number;
}

interface AnalyticsSummary {
  slug: string;
  totalClicks: number;
  clicksByDay: ClicksByDay[];
}

interface LandingPageAnalyticsProps {
  isLoading?: boolean;
}

export function LandingPageAnalytics({ isLoading: parentLoading }: LandingPageAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await adminFetch(`/api/admin/analytics?days=${days}`);
      
      if (response.status === 401) {
        setError('Akses tidak diizinkan');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data || []);
      } else {
        setError(data.error || 'Gagal memuat analytics');
      }
    } catch (err) {
      setError('Gagal terhubung ke server');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalClicks = analytics.reduce((sum, a) => sum + a.totalClicks, 0);
  const topPage = analytics.length > 0 ? analytics[0] : null;

  // Get selected page details
  const selectedPage = selectedSlug 
    ? analytics.find(a => a.slug === selectedSlug) 
    : null;

  if (parentLoading || loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="font-semibold text-gray-800">Landing Page Analytics</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="font-semibold text-gray-800">Landing Page Analytics</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-500 text-sm mb-2">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="text-indigo-600 text-sm hover:underline"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="font-semibold text-gray-800">Landing Page Analytics</h3>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
        >
          <option value={7}>7 hari</option>
          <option value={30}>30 hari</option>
          <option value={90}>90 hari</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-indigo-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-indigo-600">{totalClicks}</div>
          <div className="text-xs text-indigo-600/70">Total Klik</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{analytics.length}</div>
          <div className="text-xs text-green-600/70">Landing Pages</div>
        </div>
      </div>

      {/* Top Page */}
      {topPage && (
        <div className="bg-yellow-50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-1 text-xs text-yellow-700 mb-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Top Performer
          </div>
          <div className="font-medium text-gray-800 truncate">{topPage.slug}</div>
          <div className="text-sm text-yellow-700">{topPage.totalClicks} klik</div>
        </div>
      )}

      {/* Page List */}
      {analytics.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Belum ada data analytics
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {analytics.map((page) => (
            <button
              key={page.slug}
              onClick={() => setSelectedSlug(selectedSlug === page.slug ? null : page.slug)}
              className={`w-full text-left p-2 rounded-lg transition-colors ${
                selectedSlug === page.slug 
                  ? 'bg-indigo-100 border border-indigo-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800 truncate flex-1">
                  {page.slug}
                </span>
                <span className="text-sm font-bold text-indigo-600 ml-2">
                  {page.totalClicks}
                </span>
              </div>
              
              {/* Expanded Details */}
              {selectedSlug === page.slug && page.clicksByDay.length > 0 && (
                <div className="mt-2 pt-2 border-t border-indigo-200">
                  <div className="text-xs text-gray-500 mb-1">Klik per hari (terbaru)</div>
                  <div className="flex gap-1 flex-wrap">
                    {page.clicksByDay.slice(0, 7).map((day) => (
                      <div 
                        key={day.date} 
                        className="bg-white rounded px-2 py-1 text-xs"
                        title={day.date}
                      >
                        <span className="text-gray-500">{formatDate(day.date)}</span>
                        <span className="font-bold text-indigo-600 ml-1">{day.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchAnalytics}
        className="w-full mt-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-1"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>
  );
}

/**
 * Format date to short format (e.g., "20 Des")
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${day} ${months[date.getMonth()]}`;
}

export default LandingPageAnalytics;
