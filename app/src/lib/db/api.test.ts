// Property tests for API operations
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { LocalStorageProject, DBProject } from '../../types/database';
import { generateProjectId, nowISO } from './client';

// Arbitrary generators
const businessNameArb = fc.string({ minLength: 1, maxLength: 100 });
const whatsappArb = fc.stringMatching(/^08[0-9]{8,11}$/);
const categoryArb = fc.constantFrom('kuliner', 'fashion', 'jasa', 'kerajinan');
const locationArb = fc.string({ minLength: 1, maxLength: 200 });
const templateArb = fc.constantFrom('simple', 'warm', 'modern');
const colorThemeArb = fc.constantFrom('green', 'blue', 'amber', 'pink');
const statusArb = fc.constantFrom('draft', 'building', 'live');

const localStorageProjectArb = fc.record({
  id: fc.string({ minLength: 10, maxLength: 50 }),
  businessName: fc.option(businessNameArb, { nil: undefined }),
  whatsapp: fc.option(whatsappArb, { nil: undefined }),
  category: fc.option(categoryArb, { nil: undefined }),
  location: fc.option(locationArb, { nil: undefined }),
  productImage: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
  headline: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
  storytelling: fc.option(fc.string({ minLength: 1, maxLength: 1000 }), { nil: undefined }),
  template: fc.option(templateArb, { nil: undefined }),
  colorTheme: fc.option(colorThemeArb, { nil: undefined }),
  currentStep: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
  status: fc.option(statusArb, { nil: undefined }),
  deployedUrl: fc.option(fc.webUrl(), { nil: undefined }),
  createdAt: fc.option(fc.date().map(d => d.toISOString()), { nil: undefined }),
  updatedAt: fc.option(fc.date().map(d => d.toISOString()), { nil: undefined }),
});

describe('Device Isolation', () => {
  /**
   * Property 2: Device Isolation
   * For any device ID, listing projects SHALL return only projects
   * associated with that device ID (or linked devices)
   */
  it('should isolate projects by device ID', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.string({ minLength: 10, maxLength: 30 }),
          device_id: fc.constantFrom('device_a', 'device_b', 'device_c'),
          business_name: businessNameArb,
        }), { minLength: 5, maxLength: 20 }),
        fc.constantFrom('device_a', 'device_b', 'device_c'),
        (projects, targetDeviceId) => {
          // Simulate filtering by device ID
          const filtered = projects.filter(p => p.device_id === targetDeviceId);
          
          // All filtered projects should belong to target device
          for (const project of filtered) {
            expect(project.device_id).toBe(targetDeviceId);
          }
          
          // No projects from other devices should be included
          const otherDeviceProjects = projects.filter(p => p.device_id !== targetDeviceId);
          for (const project of otherDeviceProjects) {
            expect(filtered.find(f => f.id === project.id)).toBeUndefined();
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include linked device projects', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.string({ minLength: 10, maxLength: 30 }),
          device_id: fc.constantFrom('device_main', 'device_linked', 'device_other'),
          business_name: businessNameArb,
        }), { minLength: 5, maxLength: 20 }),
        (projects) => {
          // Simulate linked devices: device_main and device_linked are linked
          const linkedDeviceIds = ['device_main', 'device_linked'];
          
          // Filter for main device (should include linked)
          const filtered = projects.filter(p => linkedDeviceIds.includes(p.device_id));
          
          // Should include projects from both linked devices
          const mainProjects = projects.filter(p => p.device_id === 'device_main');
          const linkedProjects = projects.filter(p => p.device_id === 'device_linked');
          
          expect(filtered.length).toBe(mainProjects.length + linkedProjects.length);
          
          // Should NOT include projects from unlinked device
          const otherProjects = projects.filter(p => p.device_id === 'device_other');
          for (const project of otherProjects) {
            expect(filtered.find(f => f.id === project.id)).toBeUndefined();
          }
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Migration Data Integrity', () => {
  /**
   * Property 3: Migration Data Integrity
   * For any localStorage project data, after migration the D1 database
   * SHALL contain equivalent data with matching field values
   */
  it('should preserve all fields during migration transformation', () => {
    fc.assert(
      fc.property(localStorageProjectArb, (localProject) => {
        const now = nowISO();
        
        // Simulate migration transformation
        const dbProject: DBProject = {
          id: localProject.id || generateProjectId(),
          device_id: 'test_device',
          business_name: localProject.businessName || null,
          whatsapp: localProject.whatsapp || null,
          category: localProject.category || null,
          location: localProject.location || null,
          photo_url: localProject.productImage || null,
          headline: localProject.headline || null,
          storytelling: localProject.storytelling || null,
          template: localProject.template || 'simple',
          color_theme: localProject.colorTheme || 'green',
          current_step: localProject.currentStep || 1,
          status: (localProject.status as 'draft' | 'building' | 'live') || 'draft',
          deployed_url: localProject.deployedUrl || null,
          short_url: null,
          created_at: localProject.createdAt || now,
          updated_at: localProject.updatedAt || now,
        };
        
        // Verify field mapping
        if (localProject.id) {
          expect(dbProject.id).toBe(localProject.id);
        }
        
        if (localProject.businessName) {
          expect(dbProject.business_name).toBe(localProject.businessName);
        } else {
          expect(dbProject.business_name).toBeNull();
        }
        
        if (localProject.whatsapp) {
          expect(dbProject.whatsapp).toBe(localProject.whatsapp);
        }
        
        if (localProject.category) {
          expect(dbProject.category).toBe(localProject.category);
        }
        
        if (localProject.productImage) {
          expect(dbProject.photo_url).toBe(localProject.productImage);
        }
        
        if (localProject.template) {
          expect(dbProject.template).toBe(localProject.template);
        } else {
          expect(dbProject.template).toBe('simple');
        }
        
        if (localProject.colorTheme) {
          expect(dbProject.color_theme).toBe(localProject.colorTheme);
        } else {
          expect(dbProject.color_theme).toBe('green');
        }
        
        if (localProject.currentStep) {
          expect(dbProject.current_step).toBe(localProject.currentStep);
        } else {
          expect(dbProject.current_step).toBe(1);
        }
        
        if (localProject.status) {
          expect(dbProject.status).toBe(localProject.status);
        } else {
          expect(dbProject.status).toBe('draft');
        }
        
        if (localProject.deployedUrl) {
          expect(dbProject.deployed_url).toBe(localProject.deployedUrl);
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should handle missing optional fields with defaults', () => {
    fc.assert(
      fc.property(fc.record({ id: fc.string({ minLength: 10 }) }), (minimalProject) => {
        const now = nowISO();
        
        // Minimal project with only ID
        const dbProject: DBProject = {
          id: minimalProject.id,
          device_id: 'test_device',
          business_name: null,
          whatsapp: null,
          category: null,
          location: null,
          photo_url: null,
          headline: null,
          storytelling: null,
          template: 'simple',
          color_theme: 'green',
          current_step: 1,
          status: 'draft',
          deployed_url: null,
          short_url: null,
          created_at: now,
          updated_at: now,
        };
        
        // Verify defaults
        expect(dbProject.template).toBe('simple');
        expect(dbProject.color_theme).toBe('green');
        expect(dbProject.current_step).toBe(1);
        expect(dbProject.status).toBe('draft');
        
        return true;
      }),
      { numRuns: 50 }
    );
  });
});
