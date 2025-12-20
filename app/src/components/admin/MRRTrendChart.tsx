/**
 * MRRTrendChart Component
 * Line chart showing 12-month MRR trend
 * Uses SVG for lightweight rendering without external dependencies
 */

import React, { useMemo } from 'react';
import type { MRRTrendChartProps, MRRTrendData } from '../../types/admin';
import { formatCurrency } from '../../lib/admin/metricsCalculator';

/**
 * Skeleton loader for chart
 */
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
      <div className="h-48 bg-gray-100 rounded" />
    </div>
  );
}

/**
 * MRRTrendChart Component
 */
export function MRRTrendChart({ data, isLoading = false }: MRRTrendChartProps) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  // Chart dimensions
  const width = 100; // percentage-based for responsiveness
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = 100 - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const { minMRR, maxMRR, points, pathD } = useMemo(() => {
    if (data.length === 0) {
      return { minMRR: 0, maxMRR: 100, points: [], pathD: '' };
    }

    const mrrValues = data.map(d => d.mrr);
    const min = Math.min(...mrrValues) * 0.9; // Add 10% padding
    const max = Math.max(...mrrValues) * 1.1;
    const range = max - min || 1;

    const pts = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.mrr - min) / range) * chartHeight;
      return { x, y, data: d };
    });

    // Create SVG path
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return { minMRR: min, maxMRR: max, points: pts, pathD: path };
  }, [data]);

  // Y-axis labels
  const yLabels = useMemo(() => {
    const labels = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const value = minMRR + ((maxMRR - minMRR) * i) / steps;
      const y = padding.top + chartHeight - (i / steps) * chartHeight;
      labels.push({ value, y });
    }
    return labels;
  }, [minMRR, maxMRR]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <span className="font-semibold text-gray-800">MRR Trend (12 Bulan)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <svg
          viewBox={`0 0 100 ${height}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {yLabels.map((label, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={label.y}
              x2={100 - padding.right}
              y2={label.y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}

          {/* Y-axis labels */}
          {yLabels.map((label, i) => (
            <text
              key={i}
              x={padding.left - 2}
              y={label.y}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-[3px] fill-gray-500"
            >
              {formatCurrency(label.value, true)}
            </text>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => {
            const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
            return (
              <text
                key={i}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="text-[3px] fill-gray-500"
              >
                {d.monthLabel}
              </text>
            );
          })}

          {/* Area fill */}
          {points.length > 0 && (
            <path
              d={`${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`}
              fill="url(#mrrGradient)"
              opacity="0.3"
            />
          )}

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="1.5"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="0.5"
              />
              {/* Tooltip trigger area */}
              <title>
                {p.data.monthLabel}: {formatCurrency(p.data.mrr, true)}
                {p.data.growth !== 0 && ` (${p.data.growth > 0 ? '+' : ''}${p.data.growth.toFixed(1)}%)`}
              </title>
            </g>
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-blue-500 rounded" />
            <span>MRR</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MRRTrendChart;
