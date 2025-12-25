// Analytics Service for OCTOmatiz
// Tracks link clicks and page views for landing pages

export interface LinkClickEvent {
  slug: string;
  timestamp: string;
  referrer: string | null;
  userAgent: string | null;
  projectId?: string;
}

export interface AnalyticsSummary {
  slug: string;
  totalClicks: number;
  clicksByDay: { date: string; count: number }[];
}

/**
 * Record a link click event (fire-and-forget pattern)
 * This function does NOT await - it fires the recording and returns immediately
 * Errors are logged but never thrown to avoid blocking page response
 */
export function recordLinkClick(
  db: D1Database | undefined,
  kv: KVNamespace | undefined,
  event: LinkClickEvent
): void {
  // Fire and forget - don't await
  recordLinkClickAsync(db, kv, event).catch((err) => {
    console.error('Analytics recording failed:', err);
  });
}

/**
 * Internal async function to record link click
 */
async function recordLinkClickAsync(
  db: D1Database | undefined,
  kv: KVNamespace | undefined,
  event: LinkClickEvent
): Promise<void> {
  // Record to D1 if available
  if (db) {
    try {
      const eventData = JSON.stringify({
        slug: event.slug,
        referrer: event.referrer,
        user_agent: event.userAgent,
        project_id: event.projectId,
      });

      await db.prepare(`
        INSERT INTO events (project_id, device_id, event_type, event_data, created_at)
        VALUES (?, 'system', 'link_click', ?, ?)
      `).bind(
        event.projectId || null,
        eventData,
        event.timestamp
      ).run();
    } catch (err) {
      console.error('D1 analytics insert failed:', err);
    }
  }

  // Increment KV view counter if available
  if (kv) {
    await incrementViewCounter(kv, event.slug);
  }
}


/**
 * Increment view counter in KV for a slug
 * Fire-and-forget, errors are logged but not thrown
 */
export async function incrementViewCounter(
  kv: KVNamespace,
  slug: string
): Promise<number> {
  const key = `views:${slug}`;
  
  try {
    const currentStr = await kv.get(key);
    const current = currentStr ? parseInt(currentStr, 10) : 0;
    const newCount = current + 1;
    
    await kv.put(key, newCount.toString());
    return newCount;
  } catch (err) {
    console.error(`Failed to increment view counter for ${slug}:`, err);
    return 0;
  }
}

/**
 * Get view count for a slug from KV
 */
export async function getViewCount(
  kv: KVNamespace | undefined,
  slug: string
): Promise<number> {
  if (!kv) return 0;
  
  try {
    const countStr = await kv.get(`views:${slug}`);
    return countStr ? parseInt(countStr, 10) : 0;
  } catch (err) {
    console.error(`Failed to get view count for ${slug}:`, err);
    return 0;
  }
}

/**
 * Get analytics for a specific slug
 */
export async function getSlugAnalytics(
  db: D1Database,
  slug: string,
  days: number = 30
): Promise<AnalyticsSummary> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateISO = startDate.toISOString();

  // Get total clicks
  const totalResult = await db.prepare(`
    SELECT COUNT(*) as count FROM events 
    WHERE event_type = 'link_click' 
    AND json_extract(event_data, '$.slug') = ?
  `).bind(slug).first<{ count: number }>();

  // Get clicks by day
  const dailyResult = await db.prepare(`
    SELECT 
      date(created_at) as date,
      COUNT(*) as count
    FROM events 
    WHERE event_type = 'link_click' 
    AND json_extract(event_data, '$.slug') = ?
    AND created_at >= ?
    GROUP BY date(created_at)
    ORDER BY date DESC
  `).bind(slug, startDateISO).all<{ date: string; count: number }>();

  return {
    slug,
    totalClicks: totalResult?.count || 0,
    clicksByDay: dailyResult.results || [],
  };
}

/**
 * Get analytics for all landing pages
 */
export async function getAllAnalytics(
  db: D1Database,
  days: number = 30
): Promise<AnalyticsSummary[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateISO = startDate.toISOString();

  // Get all unique slugs with their total clicks
  const slugsResult = await db.prepare(`
    SELECT 
      json_extract(event_data, '$.slug') as slug,
      COUNT(*) as total_clicks
    FROM events 
    WHERE event_type = 'link_click'
    AND json_extract(event_data, '$.slug') IS NOT NULL
    GROUP BY json_extract(event_data, '$.slug')
    ORDER BY total_clicks DESC
  `).all<{ slug: string; total_clicks: number }>();

  const summaries: AnalyticsSummary[] = [];

  for (const row of slugsResult.results || []) {
    // Get daily breakdown for each slug
    const dailyResult = await db.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as count
      FROM events 
      WHERE event_type = 'link_click' 
      AND json_extract(event_data, '$.slug') = ?
      AND created_at >= ?
      GROUP BY date(created_at)
      ORDER BY date DESC
    `).bind(row.slug, startDateISO).all<{ date: string; count: number }>();

    summaries.push({
      slug: row.slug,
      totalClicks: row.total_clicks,
      clicksByDay: dailyResult.results || [],
    });
  }

  return summaries;
}

/**
 * Extract link click event from request headers
 */
export function extractLinkClickEvent(
  slug: string,
  request: Request,
  projectId?: string
): LinkClickEvent {
  return {
    slug,
    timestamp: new Date().toISOString(),
    referrer: request.headers.get('referer') || request.headers.get('referrer'),
    userAgent: request.headers.get('user-agent'),
    projectId,
  };
}

// ============================================
// COHORT TRACKING
// ============================================

export interface CohortEvent {
  deviceId: string;
  eventType: 'signup' | 'active' | 'project_created' | 'deployed';
  timestamp: string;
  cohortMonth: string; // Format: YYYY-MM
}

export interface CohortData {
  cohortMonth: string;
  cohortLabel: string;
  userCount: number;
  retentionByMonth: number[];
}

export interface CohortAnalysis {
  cohorts: CohortData[];
  months: string[];
}

/**
 * Get cohort month string from date (YYYY-MM format)
 */
export function getCohortMonth(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get cohort label from month string (e.g., "Jan 24")
 */
export function getCohortLabel(cohortMonth: string): string {
  const [year, month] = cohortMonth.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month, 10) - 1]} ${year.slice(2)}`;
}

/**
 * Record a cohort event (user signup or activity)
 */
export function recordCohortEvent(
  db: D1Database | undefined,
  kv: KVNamespace | undefined,
  event: CohortEvent
): void {
  recordCohortEventAsync(db, kv, event).catch((err) => {
    console.error('Cohort event recording failed:', err);
  });
}

/**
 * Internal async function to record cohort event
 */
async function recordCohortEventAsync(
  db: D1Database | undefined,
  kv: KVNamespace | undefined,
  event: CohortEvent
): Promise<void> {
  if (db) {
    try {
      const eventData = JSON.stringify({
        device_id: event.deviceId,
        cohort_month: event.cohortMonth,
      });

      await db.prepare(`
        INSERT INTO events (project_id, device_id, event_type, event_data, created_at)
        VALUES (NULL, ?, ?, ?, ?)
      `).bind(
        event.deviceId,
        event.eventType,
        eventData,
        event.timestamp
      ).run();
    } catch (err) {
      console.error('D1 cohort event insert failed:', err);
    }
  }

  // Also store in KV for fast cohort lookups
  if (kv && event.eventType === 'signup') {
    try {
      const key = `cohort:${event.cohortMonth}:users`;
      const existingStr = await kv.get(key);
      const existing: string[] = existingStr ? JSON.parse(existingStr) : [];
      
      if (!existing.includes(event.deviceId)) {
        existing.push(event.deviceId);
        await kv.put(key, JSON.stringify(existing));
      }
    } catch (err) {
      console.error('KV cohort storage failed:', err);
    }
  }
}

/**
 * Record user activity for retention tracking
 */
export async function recordUserActivity(
  db: D1Database | undefined,
  kv: KVNamespace | undefined,
  deviceId: string
): Promise<void> {
  const now = new Date();
  const currentMonth = getCohortMonth(now);
  
  // Record activity event
  recordCohortEvent(db, kv, {
    deviceId,
    eventType: 'active',
    timestamp: now.toISOString(),
    cohortMonth: currentMonth,
  });

  // Update last active in KV
  if (kv) {
    try {
      await kv.put(`device:${deviceId}:lastActive`, currentMonth);
    } catch (err) {
      console.error('Failed to update last active:', err);
    }
  }
}

/**
 * Get cohort analysis from real data
 * Returns retention rates for last N months
 */
export async function getCohortAnalysisFromDB(
  db: D1Database,
  kv: KVNamespace | undefined,
  monthsBack: number = 6
): Promise<CohortAnalysis> {
  const cohorts: CohortData[] = [];
  const months: string[] = [];
  
  const now = new Date();
  
  // Generate month labels (M0, M1, M2, ...)
  for (let i = 0; i <= monthsBack; i++) {
    months.push(`M${i}`);
  }

  // Get cohorts for last N months
  for (let i = monthsBack - 1; i >= 0; i--) {
    const cohortDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const cohortMonth = getCohortMonth(cohortDate);
    const cohortLabel = getCohortLabel(cohortMonth);

    try {
      // Get users who signed up in this cohort month
      const signupResult = await db.prepare(`
        SELECT DISTINCT device_id 
        FROM events 
        WHERE event_type = 'signup'
        AND json_extract(event_data, '$.cohort_month') = ?
      `).bind(cohortMonth).all<{ device_id: string }>();

      const cohortUsers = signupResult.results?.map(r => r.device_id) || [];
      const userCount = cohortUsers.length;

      if (userCount === 0) {
        // No users in this cohort, use placeholder data
        cohorts.push({
          cohortMonth,
          cohortLabel,
          userCount: 0,
          retentionByMonth: Array(monthsBack + 1 - i).fill(0),
        });
        continue;
      }

      // Calculate retention for each subsequent month
      const retentionByMonth: number[] = [100]; // M0 is always 100%

      for (let m = 1; m <= monthsBack - i; m++) {
        const targetDate = new Date(cohortDate.getFullYear(), cohortDate.getMonth() + m, 1);
        const targetMonth = getCohortMonth(targetDate);

        // Count how many cohort users were active in target month
        const activeResult = await db.prepare(`
          SELECT COUNT(DISTINCT device_id) as count
          FROM events 
          WHERE device_id IN (${cohortUsers.map(() => '?').join(',')})
          AND event_type IN ('active', 'project_created', 'deployed')
          AND strftime('%Y-%m', created_at) = ?
        `).bind(...cohortUsers, targetMonth).first<{ count: number }>();

        const activeCount = activeResult?.count || 0;
        const retention = userCount > 0 ? Math.round((activeCount / userCount) * 100) : 0;
        retentionByMonth.push(retention);
      }

      cohorts.push({
        cohortMonth,
        cohortLabel,
        userCount,
        retentionByMonth,
      });
    } catch (err) {
      console.error(`Failed to get cohort data for ${cohortMonth}:`, err);
      // Add empty cohort on error
      cohorts.push({
        cohortMonth,
        cohortLabel,
        userCount: 0,
        retentionByMonth: [0],
      });
    }
  }

  return { cohorts, months };
}

/**
 * Get cohort analysis with fallback to mock data
 */
export async function getCohortAnalysis(
  db: D1Database | undefined,
  kv: KVNamespace | undefined,
  monthsBack: number = 6
): Promise<CohortAnalysis> {
  if (db) {
    try {
      const realData = await getCohortAnalysisFromDB(db, kv, monthsBack);
      
      // Check if we have any real data
      const hasRealData = realData.cohorts.some(c => c.userCount > 0);
      if (hasRealData) {
        return realData;
      }
    } catch (err) {
      console.error('Failed to get real cohort data:', err);
    }
  }

  // Fallback to mock cohort data
  return getMockCohortAnalysis(monthsBack);
}

/**
 * Generate mock cohort data for development/fallback
 */
function getMockCohortAnalysis(monthsBack: number = 6): CohortAnalysis {
  const cohorts: CohortData[] = [];
  const months: string[] = [];
  const now = new Date();

  for (let i = 0; i <= monthsBack; i++) {
    months.push(`M${i}`);
  }

  for (let i = monthsBack - 1; i >= 0; i--) {
    const cohortDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const cohortMonth = getCohortMonth(cohortDate);
    const cohortLabel = getCohortLabel(cohortMonth);

    // Generate realistic-looking retention curve
    const userCount = Math.floor(Math.random() * 50) + 20;
    const retentionByMonth: number[] = [100];
    
    let retention = 100;
    for (let m = 1; m <= monthsBack - i; m++) {
      // Decay rate: ~20-40% drop each month, stabilizing around 20-30%
      const decay = Math.random() * 0.2 + 0.2;
      retention = Math.max(15, Math.round(retention * (1 - decay)));
      retentionByMonth.push(retention);
    }

    cohorts.push({
      cohortMonth,
      cohortLabel,
      userCount,
      retentionByMonth,
    });
  }

  return { cohorts, months };
}
