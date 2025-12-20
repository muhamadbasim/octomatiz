/**
 * SegmentFilter Component
 * Customer segment filter (All/Basic/Premium)
 */

import React from 'react';
import type { SegmentFilterProps, SegmentType } from '../../types/admin';
import { SEGMENT_OPTIONS } from '../../types/admin';

/**
 * Filter data by segment
 * Utility function for segment filtering
 */
export function filterBySegment<T extends { segment?: SegmentType }>(
  data: T[],
  segment: SegmentType
): T[] {
  if (segment === 'all') {
    return data;
  }
  return data.filter(item => item.segment === segment);
}

/**
 * SegmentFilter Component
 */
export function SegmentFilter({ selected, onChange }: SegmentFilterProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-semibold text-gray-800">Segmen Pelanggan</span>
        </div>
      </div>

      {/* Options */}
      <div className="p-4 space-y-2">
        {SEGMENT_OPTIONS.map(option => (
          <label
            key={option.type}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
              selected === option.type
                ? 'bg-green-50 border border-green-200'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <input
              type="radio"
              name="segment"
              value={option.type}
              checked={selected === option.type}
              onChange={() => onChange(option.type)}
              className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
            />
            <span className={`font-medium ${
              selected === option.type ? 'text-green-700' : 'text-gray-700'
            }`}>
              {option.label}
            </span>
            {selected === option.type && (
              <svg className="w-4 h-4 text-green-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

export default SegmentFilter;
