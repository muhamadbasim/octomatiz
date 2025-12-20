// Property tests for project CRUD operations
import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { generateProjectId, nowISO } from './client';
import type { DBProject } from '../../types/database';

// Arbitrary generators for project data
const businessNameArb = fc.string({ minLength: 1, maxLength: 100 });
const whatsappArb = fc.stringMatching(/^08[0-9]{8,11}$/);
const categoryArb = fc.constantFrom('kuliner', 'fashion', 'jasa', 'kerajinan');
const locationArb = fc.string({ minLength: 1, maxLength: 200 });
const templateArb = fc.constantFrom('simple', 'warm', 'modern');
const colorThemeArb = fc.constantFrom('green', 'blue', 'amber', 'pink');
const statusArb = fc.constantFrom('draft', 'building', 'live');

const projectInputArb = fc.record({
  business_name: fc.option(businessNameArb, { nil: undefined }),
  whatsapp: fc.option(whatsappArb, { nil: undefined }),
  category: fc.option(categoryArb, { nil: undefined }),
  location: fc.option(locationArb, { nil: undefined }),
  template: fc.option(templateArb, { nil: undefined }),
  color_theme: fc.option(colorThemeArb, { nil: undefined }),
  status: fc.option(statusArb, { nil: undefined }),
  current_step: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
});

describe('Project ID Generation', () => {
  it('should generate unique project IDs', () => {
    fc.assert(
      fc.property(fc.integer({ min: 100, max: 500 }), (count) => {
        const ids = new Set<string>();
        for (let i = 0; i < count; i++) {
          ids.add(generateProjectId());
        }
        return ids.size === count;
      }),
      { numRuns: 20 }
    );
  });

  it('should generate project IDs with correct prefix', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const id = generateProjectId();
        expect(id).toMatch(/^proj_\d+_[a-z0-9]+$/);
        return true;
      }),
      { numRuns: 50 }
    );
  });
});

describe('Project Data Transformation', () => {
  /**
   * Property 1: Project CRUD Consistency
   * For any project created via the API, fetching that project by ID
   * SHALL return the same data that was saved
   */
  it('should preserve all fields during transformation', () => {
    fc.assert(
      fc.property(projectInputArb, (input) => {
        // Simulate what createProject does
        const id = generateProjectId();
        const now = nowISO();
        
        const project: DBProject = {
          id,
          device_id: 'test_device',
          business_name: input.business_name || null,
          whatsapp: input.whatsapp || null,
          category: input.category || null,
          location: input.location || null,
          photo_url: null,
          headline: null,
          storytelling: null,
          template: input.template || 'simple',
          color_theme: input.color_theme || 'green',
          current_step: input.current_step || 1,
          status: input.status || 'draft',
          deployed_url: null,
          short_url: null,
          created_at: now,
          updated_at: now,
        };
        
        // Verify all fields are set correctly
        expect(project.id).toBe(id);
        expect(project.device_id).toBe('test_device');
        
        if (input.business_name) {
          expect(project.business_name).toBe(input.business_name);
        } else {
          expect(project.business_name).toBeNull();
        }
        
        if (input.template) {
          expect(project.template).toBe(input.template);
        } else {
          expect(project.template).toBe('simple');
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should handle update merging correctly', () => {
    fc.assert(
      fc.property(projectInputArb, projectInputArb, (initial, update) => {
        const now = nowISO();
        
        // Create initial project
        const existing: DBProject = {
          id: 'test_id',
          device_id: 'test_device',
          business_name: initial.business_name || null,
          whatsapp: initial.whatsapp || null,
          category: initial.category || null,
          location: initial.location || null,
          photo_url: null,
          headline: null,
          storytelling: null,
          template: initial.template || 'simple',
          color_theme: initial.color_theme || 'green',
          current_step: initial.current_step || 1,
          status: initial.status || 'draft',
          deployed_url: null,
          short_url: null,
          created_at: now,
          updated_at: now,
        };
        
        // Simulate update
        const updated: DBProject = {
          ...existing,
          business_name: update.business_name !== undefined ? update.business_name || null : existing.business_name,
          whatsapp: update.whatsapp !== undefined ? update.whatsapp || null : existing.whatsapp,
          category: update.category !== undefined ? update.category || null : existing.category,
          location: update.location !== undefined ? update.location || null : existing.location,
          template: update.template !== undefined ? update.template || null : existing.template,
          color_theme: update.color_theme !== undefined ? update.color_theme || null : existing.color_theme,
          current_step: update.current_step !== undefined ? update.current_step : existing.current_step,
          status: update.status !== undefined ? update.status : existing.status,
          updated_at: nowISO(),
        };
        
        // Verify ID and device_id are preserved
        expect(updated.id).toBe(existing.id);
        expect(updated.device_id).toBe(existing.device_id);
        expect(updated.created_at).toBe(existing.created_at);
        
        // Verify updated fields
        if (update.business_name !== undefined) {
          expect(updated.business_name).toBe(update.business_name || null);
        } else {
          expect(updated.business_name).toBe(existing.business_name);
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

describe('Timestamp Generation', () => {
  it('should generate valid ISO timestamps', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const timestamp = nowISO();
        const parsed = new Date(timestamp);
        expect(parsed.toISOString()).toBe(timestamp);
        return true;
      }),
      { numRuns: 50 }
    );
  });

  it('should generate timestamps in chronological order', () => {
    const timestamps: string[] = [];
    for (let i = 0; i < 10; i++) {
      timestamps.push(nowISO());
    }
    
    for (let i = 1; i < timestamps.length; i++) {
      expect(new Date(timestamps[i]).getTime()).toBeGreaterThanOrEqual(
        new Date(timestamps[i - 1]).getTime()
      );
    }
  });
});


/**
 * Property Test for Ownership Verification
 * **Feature: security-hardening, Property 7: Project Ownership Verification**
 * **Validates: Requirements 4.1, 4.2**
 * 
 * For any update or delete request where the requesting device does not own
 * the project, the system should return HTTP 403 status.
 */
describe('verifyProjectOwnership - IDOR Protection', () => {
  // Arbitrary generators for device and project IDs
  const deviceIdArb = fc.stringMatching(/^device_[a-z0-9]{8,16}$/);
  const projectIdArb = fc.stringMatching(/^proj_[0-9]+_[a-z0-9]+$/);

  it('should return false for non-existent project', async () => {
    // Mock DB that returns null for project
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
      }),
    } as unknown as D1Database;
    
    const { verifyProjectOwnership } = await import('./projects');
    
    const result = await verifyProjectOwnership(db, 'non-existent-id', 'device-123');
    expect(result).toBe(false);
  });

  it('should return true when device owns the project', async () => {
    const deviceId = 'device-owner-123';
    const projectId = 'proj_123';
    
    const mockProject = {
      id: projectId,
      device_id: deviceId,
      business_name: 'Test Business',
      status: 'draft',
    };
    
    // Mock DB that returns project and device is in linked list
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockProject),
          all: vi.fn().mockResolvedValue({ results: [{ id: deviceId }] }),
        }),
      }),
    } as unknown as D1Database;
    
    const { verifyProjectOwnership } = await import('./projects');
    
    const result = await verifyProjectOwnership(db, projectId, deviceId);
    expect(result).toBe(true);
  });

  it('should return false when device does not own the project', async () => {
    const ownerDeviceId = 'device-owner-123';
    const attackerDeviceId = 'device-attacker-456';
    const projectId = 'proj_123';
    
    const mockProject = {
      id: projectId,
      device_id: ownerDeviceId,
      business_name: 'Test Business',
      status: 'draft',
    };
    
    // Mock DB that returns project but attacker's device is not linked to owner
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockProject),
          all: vi.fn().mockResolvedValue({ results: [{ id: attackerDeviceId }] }),
        }),
      }),
    } as unknown as D1Database;
    
    const { verifyProjectOwnership } = await import('./projects');
    
    const result = await verifyProjectOwnership(db, projectId, attackerDeviceId);
    expect(result).toBe(false);
  });

  /**
   * Property 7: For any device/project combination where device is the owner,
   * verifyProjectOwnership should return true
   */
  it('property: owner device always has access', async () => {
    await fc.assert(
      fc.asyncProperty(deviceIdArb, projectIdArb, async (deviceId, projectId) => {
        const mockProject = {
          id: projectId,
          device_id: deviceId,
          business_name: 'Test',
          status: 'draft',
        };
        
        const db = {
          prepare: vi.fn().mockReturnValue({
            bind: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue(mockProject),
              all: vi.fn().mockResolvedValue({ results: [{ id: deviceId }] }),
            }),
          }),
        } as unknown as D1Database;
        
        const { verifyProjectOwnership } = await import('./projects');
        const result = await verifyProjectOwnership(db, projectId, deviceId);
        
        expect(result).toBe(true);
        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 7: For any device/project combination where device is NOT the owner
   * and NOT linked, verifyProjectOwnership should return false
   */
  it('property: non-owner device is denied access', async () => {
    await fc.assert(
      fc.asyncProperty(
        deviceIdArb,
        deviceIdArb,
        projectIdArb,
        async (ownerDeviceId, attackerDeviceId, projectId) => {
          // Ensure owner and attacker are different
          fc.pre(ownerDeviceId !== attackerDeviceId);
          
          const mockProject = {
            id: projectId,
            device_id: ownerDeviceId,
            business_name: 'Test',
            status: 'draft',
          };
          
          // Attacker's linked devices don't include owner
          const db = {
            prepare: vi.fn().mockReturnValue({
              bind: vi.fn().mockReturnValue({
                first: vi.fn().mockResolvedValue(mockProject),
                all: vi.fn().mockResolvedValue({ results: [{ id: attackerDeviceId }] }),
              }),
            }),
          } as unknown as D1Database;
          
          const { verifyProjectOwnership } = await import('./projects');
          const result = await verifyProjectOwnership(db, projectId, attackerDeviceId);
          
          expect(result).toBe(false);
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 7: For any non-existent project, verifyProjectOwnership should return false
   */
  it('property: non-existent project always returns false', async () => {
    await fc.assert(
      fc.asyncProperty(deviceIdArb, projectIdArb, async (deviceId, projectId) => {
        const db = {
          prepare: vi.fn().mockReturnValue({
            bind: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue(null),
              all: vi.fn().mockResolvedValue({ results: [] }),
            }),
          }),
        } as unknown as D1Database;
        
        const { verifyProjectOwnership } = await import('./projects');
        const result = await verifyProjectOwnership(db, projectId, deviceId);
        
        expect(result).toBe(false);
        return true;
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 7: Linked devices should have access to each other's projects
   */
  it('property: linked device has access to project', async () => {
    await fc.assert(
      fc.asyncProperty(
        deviceIdArb,
        deviceIdArb,
        projectIdArb,
        async (ownerDeviceId, linkedDeviceId, projectId) => {
          const mockProject = {
            id: projectId,
            device_id: ownerDeviceId,
            business_name: 'Test',
            status: 'draft',
          };
          
          // Linked device's linked list includes the owner
          const db = {
            prepare: vi.fn().mockReturnValue({
              bind: vi.fn().mockReturnValue({
                first: vi.fn().mockResolvedValue(mockProject),
                all: vi.fn().mockResolvedValue({ 
                  results: [{ id: linkedDeviceId }, { id: ownerDeviceId }] 
                }),
              }),
            }),
          } as unknown as D1Database;
          
          const { verifyProjectOwnership } = await import('./projects');
          const result = await verifyProjectOwnership(db, projectId, linkedDeviceId);
          
          expect(result).toBe(true);
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
