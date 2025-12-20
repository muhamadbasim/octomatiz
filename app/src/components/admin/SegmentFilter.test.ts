/**
 * SegmentFilter Property Tests
 * Property-based tests for segment filter data isolation
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { filterBySegment } from './SegmentFilter';
import type { SegmentType } from '../../types/admin';

// Test data type
interface TestRecord {
  id: string;
  segment?: SegmentType;
  value: number;
}

// Arbitrary for generating test records
const testRecordArb = fc.record({
  id: fc.uuid(),
  segment: fc.oneof(
    fc.constant('basic' as SegmentType),
    fc.constant('premium' as SegmentType),
    fc.constant(undefined)
  ),
  value: fc.float({ min: 0, max: 10000, noNaN: true }),
});

const testRecordsArb = fc.array(testRecordArb, { minLength: 0, maxLength: 100 });

describe('SegmentFilter - Data Isolation', () => {
  /**
   * Property 6: Segment Filter Data Isolation
   * For any segment filter selection, all displayed metrics SHALL be
   * calculated using only data from that segment
   * 
   * Validates: Requirements 8.1
   */
  describe('Property 6: Segment Filter Data Isolation', () => {
    it('should return all records when segment is "all"', () => {
      fc.assert(
        fc.property(testRecordsArb, (records) => {
          const filtered = filterBySegment(records, 'all');
          expect(filtered).toHaveLength(records.length);
          expect(filtered).toEqual(records);
        }),
        { numRuns: 100 }
      );
    });

    it('should return only basic segment records when segment is "basic"', () => {
      fc.assert(
        fc.property(testRecordsArb, (records) => {
          const filtered = filterBySegment(records, 'basic');
          
          // All filtered records should have segment === 'basic'
          filtered.forEach(record => {
            expect(record.segment).toBe('basic');
          });
          
          // Count should match expected
          const expectedCount = records.filter(r => r.segment === 'basic').length;
          expect(filtered).toHaveLength(expectedCount);
        }),
        { numRuns: 100 }
      );
    });

    it('should return only premium segment records when segment is "premium"', () => {
      fc.assert(
        fc.property(testRecordsArb, (records) => {
          const filtered = filterBySegment(records, 'premium');
          
          // All filtered records should have segment === 'premium'
          filtered.forEach(record => {
            expect(record.segment).toBe('premium');
          });
          
          // Count should match expected
          const expectedCount = records.filter(r => r.segment === 'premium').length;
          expect(filtered).toHaveLength(expectedCount);
        }),
        { numRuns: 100 }
      );
    });

    it('should never include records from other segments', () => {
      fc.assert(
        fc.property(
          testRecordsArb,
          fc.constantFrom('basic' as SegmentType, 'premium' as SegmentType),
          (records, selectedSegment) => {
            const filtered = filterBySegment(records, selectedSegment);
            
            // No record should have a different segment
            const hasWrongSegment = filtered.some(
              record => record.segment !== undefined && record.segment !== selectedSegment
            );
            expect(hasWrongSegment).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve record integrity (no mutation)', () => {
      fc.assert(
        fc.property(testRecordsArb, (records) => {
          const originalRecords = JSON.parse(JSON.stringify(records));
          
          // Apply all filters
          filterBySegment(records, 'all');
          filterBySegment(records, 'basic');
          filterBySegment(records, 'premium');
          
          // Original records should be unchanged
          expect(records).toEqual(originalRecords);
        }),
        { numRuns: 50 }
      );
    });

    it('should return empty array when no records match segment', () => {
      // Create records with only basic segment
      const basicOnlyRecords: TestRecord[] = [
        { id: '1', segment: 'basic', value: 100 },
        { id: '2', segment: 'basic', value: 200 },
      ];
      
      const filtered = filterBySegment(basicOnlyRecords, 'premium');
      expect(filtered).toHaveLength(0);
    });

    it('should handle empty input array', () => {
      const emptyRecords: TestRecord[] = [];
      
      expect(filterBySegment(emptyRecords, 'all')).toHaveLength(0);
      expect(filterBySegment(emptyRecords, 'basic')).toHaveLength(0);
      expect(filterBySegment(emptyRecords, 'premium')).toHaveLength(0);
    });

    it('should handle records without segment property', () => {
      const recordsWithoutSegment: TestRecord[] = [
        { id: '1', value: 100 },
        { id: '2', value: 200 },
        { id: '3', segment: 'basic', value: 300 },
      ];
      
      // 'all' should return everything
      expect(filterBySegment(recordsWithoutSegment, 'all')).toHaveLength(3);
      
      // 'basic' should only return the one with segment
      const basicFiltered = filterBySegment(recordsWithoutSegment, 'basic');
      expect(basicFiltered).toHaveLength(1);
      expect(basicFiltered[0].id).toBe('3');
      
      // 'premium' should return nothing
      expect(filterBySegment(recordsWithoutSegment, 'premium')).toHaveLength(0);
    });
  });

  describe('Filter Idempotency', () => {
    it('should produce same result when applied multiple times', () => {
      fc.assert(
        fc.property(
          testRecordsArb,
          fc.constantFrom('all' as SegmentType, 'basic' as SegmentType, 'premium' as SegmentType),
          (records, segment) => {
            const firstFilter = filterBySegment(records, segment);
            const secondFilter = filterBySegment(firstFilter, segment);
            
            expect(secondFilter).toEqual(firstFilter);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Filter Completeness', () => {
    it('should partition records correctly (basic + premium + undefined = all)', () => {
      fc.assert(
        fc.property(testRecordsArb, (records) => {
          const all = filterBySegment(records, 'all');
          const basic = filterBySegment(records, 'basic');
          const premium = filterBySegment(records, 'premium');
          const undefined_segment = records.filter(r => r.segment === undefined);
          
          // Sum of filtered should equal total
          expect(basic.length + premium.length + undefined_segment.length).toBe(all.length);
        }),
        { numRuns: 100 }
      );
    });
  });
});
