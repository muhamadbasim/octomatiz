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
