import { randomUUID } from 'crypto';
import { db, requireDb } from '@/server/db';
import { format, parseISO, subDays } from 'date-fns';
import { getDefaultAppState } from '@/src/lib/default-state';
import { ensureStoreSchema } from '@/server/store-repository';
import { isSupabaseEnabled, supabaseCount, supabaseDelete, supabaseInsert, supabasePatch, supabaseSelect } from '@/server/supabase';
import { Analytics, Order } from '@/src/types';

interface OrderRow {
  id: string;
  store_username: string;
  product_id: string;
  quantity: number;
  revenue: number;
  date: string;
  notes: string | null;
  status: Order['status'];
}

interface AnalyticsRow {
  store_username: string;
  metric_date: string;
  views: number;
  clicks: number;
}

interface AnalyticsEventRow {
  source: string | null;
  referrer_host: string | null;
  country_code: string | null;
  event_type: 'view' | 'click';
}

export function ensureDashboardSchema() {
  if (!db) {
    return;
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      store_username TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      revenue REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL,
      FOREIGN KEY (store_username) REFERENCES stores (username) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS analytics_daily (
      store_username TEXT NOT NULL,
      metric_date TEXT NOT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (store_username, metric_date),
      FOREIGN KEY (store_username) REFERENCES stores (username) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      store_username TEXT NOT NULL,
      event_type TEXT NOT NULL,
      metric_date TEXT NOT NULL,
      source TEXT,
      referrer_host TEXT,
      country_code TEXT,
      page_path TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (store_username) REFERENCES stores (username) ON DELETE CASCADE
    );
  `);

  const eventColumns = db.prepare(`PRAGMA table_info(analytics_events)`).all() as Array<{ name: string }>;
  if (!eventColumns.some((column) => column.name === 'country_code')) {
    db.exec(`ALTER TABLE analytics_events ADD COLUMN country_code TEXT`);
  }
}

let selectOrdersStmt: any;
let selectOrderStmt: any;
let insertOrderStmt: any;
let updateOrderStmt: any;
let deleteOrderStmt: any;
let selectAnalyticsRowsStmt: any;
let selectAnalyticsEventsStmt: any;
let upsertAnalyticsDayStmt: any;
let incrementViewsStmt: any;
let incrementClicksStmt: any;
let insertAnalyticsEventStmt: any;
let countOrdersStmt: any;
let countAnalyticsStmt: any;
let countAnalyticsEventsStmt: any;

if (db) {
  ensureStoreSchema();
  ensureDashboardSchema();

  selectOrdersStmt = db.prepare(`
  SELECT * FROM orders
  WHERE store_username = ?
  ORDER BY datetime(date) DESC, id DESC
`);

  selectOrderStmt = db.prepare(`
  SELECT * FROM orders
  WHERE store_username = ? AND id = ?
`);

  insertOrderStmt = db.prepare(`
  INSERT INTO orders (id, store_username, product_id, quantity, revenue, date, notes, status)
  VALUES (@id, @store_username, @product_id, @quantity, @revenue, @date, @notes, @status)
`);

  updateOrderStmt = db.prepare(`
  UPDATE orders
  SET product_id = @product_id,
      quantity = @quantity,
      revenue = @revenue,
      date = @date,
      notes = @notes,
      status = @status
  WHERE store_username = @store_username AND id = @id
`);

  deleteOrderStmt = db.prepare(`
  DELETE FROM orders WHERE store_username = ? AND id = ?
`);

  selectAnalyticsRowsStmt = db.prepare(`
  SELECT * FROM analytics_daily
  WHERE store_username = ?
  ORDER BY metric_date ASC
`);

  selectAnalyticsEventsStmt = db.prepare(`
  SELECT source, referrer_host, country_code, event_type
  FROM analytics_events
  WHERE store_username = ?
    AND datetime(created_at) >= datetime('now', '-30 days')
`);

  upsertAnalyticsDayStmt = db.prepare(`
  INSERT INTO analytics_daily (store_username, metric_date, views, clicks)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(store_username, metric_date) DO UPDATE SET
    views = excluded.views,
    clicks = excluded.clicks
`);

  incrementViewsStmt = db.prepare(`
  INSERT INTO analytics_daily (store_username, metric_date, views, clicks)
  VALUES (?, ?, 1, 0)
  ON CONFLICT(store_username, metric_date) DO UPDATE SET
    views = analytics_daily.views + 1
`);

  incrementClicksStmt = db.prepare(`
  INSERT INTO analytics_daily (store_username, metric_date, views, clicks)
  VALUES (?, ?, 0, 1)
  ON CONFLICT(store_username, metric_date) DO UPDATE SET
    clicks = analytics_daily.clicks + 1
`);

  insertAnalyticsEventStmt = db.prepare(`
  INSERT INTO analytics_events (
    id, store_username, event_type, metric_date, source, referrer_host, country_code, page_path, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

  countOrdersStmt = db.prepare(`
  SELECT COUNT(*) as count FROM orders WHERE store_username = ?
`);

  countAnalyticsStmt = db.prepare(`
  SELECT COUNT(*) as count FROM analytics_daily WHERE store_username = ?
`);

  countAnalyticsEventsStmt = db.prepare(`
  SELECT COUNT(*) as count FROM analytics_events WHERE store_username = ?
`);
}

function normalizeSource(value?: string | null) {
  const normalized = String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return normalized || 'direct';
}

function normalizeReferrerHost(value?: string | null) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized || 'direct';
}

function normalizeCountryCode(value?: string | null) {
  const normalized = String(value ?? '').trim().toUpperCase().replace(/[^A-Z]/g, '');
  return normalized.length === 2 ? normalized : 'Unknown';
}

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    revenue: row.revenue,
    date: row.date,
    notes: row.notes ?? '',
    status: row.status,
  };
}

function buildAnalytics(rows: AnalyticsRow[], events: AnalyticsEventRow[]): Analytics {
  const rowMap = new Map(rows.map((row) => [row.metric_date, row]));
  const today = new Date();
  const dailyStats = Array.from({ length: 30 }).map((_, index) => {
    const date = subDays(today, 29 - index);
    const metricDate = format(date, 'yyyy-MM-dd');
    const row = rowMap.get(metricDate);
    return {
      date: format(date, 'MMM dd'),
      fullDate: metricDate,
      views: row?.views ?? 0,
      clicks: row?.clicks ?? 0,
      orders: 0,
    };
  });

  const sourceMap = new Map<string, { source: string; views: number; clicks: number }>();
  const referrerMap = new Map<string, { referrer: string; views: number; clicks: number }>();
  const countryMap = new Map<string, { country: string; views: number; clicks: number }>();
  for (const event of events) {
    const source = normalizeSource(event.source);
    const referrer = normalizeReferrerHost(event.referrer_host);
    const country = normalizeCountryCode(event.country_code);
    const sourceEntry = sourceMap.get(source) ?? { source, views: 0, clicks: 0 };
    const referrerEntry = referrerMap.get(referrer) ?? { referrer, views: 0, clicks: 0 };
    const countryEntry = countryMap.get(country) ?? { country, views: 0, clicks: 0 };
    if (event.event_type === 'view') {
      sourceEntry.views += 1;
      referrerEntry.views += 1;
      countryEntry.views += 1;
    } else {
      sourceEntry.clicks += 1;
      referrerEntry.clicks += 1;
      countryEntry.clicks += 1;
    }
    sourceMap.set(source, sourceEntry);
    referrerMap.set(referrer, referrerEntry);
    countryMap.set(country, countryEntry);
  }

  return {
    totalViews: rows.reduce((sum, row) => sum + row.views, 0),
    totalClicks: rows.reduce((sum, row) => sum + row.clicks, 0),
    sourceSummary: [...sourceMap.values()].sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks)).slice(0, 5),
    referrerSummary: [...referrerMap.values()].sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks)).slice(0, 5),
    countrySummary: [...countryMap.values()].sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks)).slice(0, 5),
    dailyStats,
  };
}

async function getOrdersByStoreSupabase(username: string) {
  const rows = await supabaseSelect<OrderRow>('orders', {
    store_username: `eq.${username}`,
    select: '*',
    order: 'date.desc,id.desc',
  });
  return rows.map(toOrder);
}

export async function getOrdersByStore(username: string) {
  if (isSupabaseEnabled()) {
    return getOrdersByStoreSupabase(username);
  }

  requireDb();
  return (selectOrdersStmt.all(username) as OrderRow[]).map(toOrder);
}

export async function getAnalyticsByStore(username: string): Promise<Analytics> {
  const rows = isSupabaseEnabled()
    ? await supabaseSelect<AnalyticsRow>('analytics_daily', {
        store_username: `eq.${username}`,
        select: '*',
        order: 'metric_date.asc',
      })
    : (selectAnalyticsRowsStmt.all(username) as AnalyticsRow[]);
  const events = isSupabaseEnabled()
    ? await supabaseSelect<AnalyticsEventRow>('analytics_events', {
        store_username: `eq.${username}`,
        created_at: `gte.${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`,
        select: 'source,referrer_host,country_code,event_type',
      })
    : (selectAnalyticsEventsStmt.all(username) as AnalyticsEventRow[]);
  const analytics = buildAnalytics(rows, events);
  const orders = await getOrdersByStore(username);
  const orderCounts = new Map<string, number>();
  for (const order of orders) {
    const day = format(parseISO(order.date), 'yyyy-MM-dd');
    orderCounts.set(day, (orderCounts.get(day) ?? 0) + (order.status === 'confirmed' ? 1 : 0));
  }
  analytics.dailyStats = analytics.dailyStats.map((stat) => ({
    ...stat,
    orders: orderCounts.get(stat.fullDate) ?? 0,
  }));
  return analytics;
}

export async function getDashboardData(username: string) {
  return {
    orders: await getOrdersByStore(username),
    analytics: await getAnalyticsByStore(username),
  };
}

export async function createOrder(username: string, order: Order) {
  const payload = {
    id: order.id,
    store_username: username,
    product_id: order.productId,
    quantity: order.quantity,
    revenue: order.revenue,
    date: order.date,
    notes: order.notes ?? null,
    status: order.status,
  };
  if (isSupabaseEnabled()) {
    await supabaseInsert('orders', payload);
  } else {
    insertOrderStmt.run(payload);
  }
  return getOrdersByStore(username);
}

export async function updateOrderById(username: string, id: string, updates: Partial<Order>) {
  const existing = isSupabaseEnabled()
    ? (await supabaseSelect<OrderRow>('orders', {
        store_username: `eq.${username}`,
        id: `eq.${id}`,
        select: '*',
        limit: 1,
      }))[0]
    : (selectOrderStmt.get(username, id) as OrderRow | undefined);
  if (!existing) {
    return null;
  }
  const payload = {
    id,
    store_username: username,
    product_id: updates.productId ?? existing.product_id,
    quantity: updates.quantity ?? existing.quantity,
    revenue: updates.revenue ?? existing.revenue,
    date: updates.date ?? existing.date,
    notes: updates.notes ?? existing.notes,
    status: updates.status ?? existing.status,
  };
  if (isSupabaseEnabled()) {
    await supabasePatch('orders', payload, {
      store_username: `eq.${username}`,
      id: `eq.${id}`,
    });
  } else {
    updateOrderStmt.run(payload);
  }
  return getOrdersByStore(username);
}

export async function deleteOrderById(username: string, id: string) {
  if (isSupabaseEnabled()) {
    await supabaseDelete('orders', { store_username: `eq.${username}`, id: `eq.${id}` });
  } else {
    deleteOrderStmt.run(username, id);
  }
  return getOrdersByStore(username);
}

async function trackEvent(
  username: string,
  type: 'view' | 'click',
  metadata?: { source?: string; referrerHost?: string; countryCode?: string; pagePath?: string }
) {
  const now = new Date();
  const metricDate = format(now, 'yyyy-MM-dd');
  if (isSupabaseEnabled()) {
    const existingDay = (await supabaseSelect<AnalyticsRow>('analytics_daily', {
      store_username: `eq.${username}`,
      metric_date: `eq.${metricDate}`,
      select: '*',
      limit: 1,
    }))[0];
    if (existingDay) {
      await supabasePatch('analytics_daily', {
        views: type === 'view' ? existingDay.views + 1 : existingDay.views,
        clicks: type === 'click' ? existingDay.clicks + 1 : existingDay.clicks,
      }, {
        store_username: `eq.${username}`,
        metric_date: `eq.${metricDate}`,
      });
    } else {
      await supabaseInsert('analytics_daily', {
        store_username: username,
        metric_date: metricDate,
        views: type === 'view' ? 1 : 0,
        clicks: type === 'click' ? 1 : 0,
      });
    }
  } else if (type === 'view') {
    requireDb();
    incrementViewsStmt.run(username, metricDate);
  } else {
    requireDb();
    incrementClicksStmt.run(username, metricDate);
  }
  const eventPayload = {
    id: `ae_${randomUUID()}`,
    store_username: username,
    event_type: type,
    metric_date: metricDate,
    source: normalizeSource(metadata?.source),
    referrer_host: normalizeReferrerHost(metadata?.referrerHost),
    country_code: normalizeCountryCode(metadata?.countryCode),
    page_path: metadata?.pagePath ?? null,
    created_at: now.toISOString(),
  };
  if (isSupabaseEnabled()) {
    await supabaseInsert('analytics_events', eventPayload);
  } else {
    insertAnalyticsEventStmt.run(
      eventPayload.id,
      eventPayload.store_username,
      eventPayload.event_type,
      eventPayload.metric_date,
      eventPayload.source,
      eventPayload.referrer_host,
      eventPayload.country_code,
      eventPayload.page_path,
      eventPayload.created_at
    );
  }
  return getAnalyticsByStore(username);
}

export function trackView(username: string, metadata?: { source?: string; referrerHost?: string; countryCode?: string; pagePath?: string }) {
  return trackEvent(username, 'view', metadata);
}

export function trackClick(username: string, metadata?: { source?: string; referrerHost?: string; countryCode?: string; pagePath?: string }) {
  return trackEvent(username, 'click', metadata);
}

export async function resetDashboardData(username: string) {
  if (isSupabaseEnabled()) {
    await Promise.all([
      supabaseDelete('orders', { store_username: `eq.${username}` }),
      supabaseDelete('analytics_daily', { store_username: `eq.${username}` }),
      supabaseDelete('analytics_events', { store_username: `eq.${username}` }),
    ]);
  } else {
    requireDb();
    db!.prepare('DELETE FROM orders WHERE store_username = ?').run(username);
    db!.prepare('DELETE FROM analytics_daily WHERE store_username = ?').run(username);
    db!.prepare('DELETE FROM analytics_events WHERE store_username = ?').run(username);
  }
}

export async function seedDashboardDataIfEmpty(username: string) {
  const [orderCount, analyticsCount, analyticsEventCount] = isSupabaseEnabled()
    ? await Promise.all([
        supabaseCount('orders', { store_username: `eq.${username}` }),
        supabaseCount('analytics_daily', { store_username: `eq.${username}` }),
        supabaseCount('analytics_events', { store_username: `eq.${username}` }),
      ])
    : [
        requireDb(),
        (countOrdersStmt.get(username) as { count: number }).count,
        (countAnalyticsStmt.get(username) as { count: number }).count,
        (countAnalyticsEventsStmt.get(username) as { count: number }).count,
      ];
  if (orderCount > 0 || analyticsCount > 0 || analyticsEventCount > 0) {
    return;
  }

  const initial = getDefaultAppState();
  for (const order of initial.orders) {
    const payload = {
      id: `${username}-${order.id}`,
      store_username: username,
      product_id: order.productId,
      quantity: order.quantity,
      revenue: order.revenue,
      date: order.date,
      notes: order.notes ?? null,
      status: order.status,
    };
    if (isSupabaseEnabled()) {
      await supabaseInsert('orders', payload);
    } else {
      requireDb();
      insertOrderStmt.run(payload);
    }
  }

  for (const stat of initial.analytics.dailyStats) {
    if (isSupabaseEnabled()) {
      await supabaseInsert('analytics_daily', {
        store_username: username,
        metric_date: stat.fullDate,
        views: stat.views,
        clicks: stat.clicks,
      }, { on_conflict: 'store_username,metric_date' }, { upsert: true });
    } else {
      requireDb();
      upsertAnalyticsDayStmt.run(username, stat.fullDate, stat.views, stat.clicks);
    }
  }

  for (const source of initial.analytics.sourceSummary) {
    for (let index = 0; index < source.views; index += 1) {
      const payload = {
        id: `ae_v_${username}_${source.source}_${index}`,
        store_username: username,
        event_type: 'view',
        metric_date: format(new Date(), 'yyyy-MM-dd'),
        source: source.source,
        referrer_host: source.source === 'direct' ? 'direct' : `${source.source}.com`,
        country_code: initial.analytics.countrySummary[0]?.country ?? 'US',
        page_path: '/',
        created_at: new Date().toISOString(),
      };
      if (isSupabaseEnabled()) {
        await supabaseInsert('analytics_events', payload);
      } else {
        requireDb();
        insertAnalyticsEventStmt.run(
          payload.id,
          payload.store_username,
          payload.event_type,
          payload.metric_date,
          payload.source,
          payload.referrer_host,
          payload.country_code,
          payload.page_path,
          payload.created_at
        );
      }
    }
    for (let index = 0; index < source.clicks; index += 1) {
      const payload = {
        id: `ae_c_${username}_${source.source}_${index}`,
        store_username: username,
        event_type: 'click',
        metric_date: format(new Date(), 'yyyy-MM-dd'),
        source: source.source,
        referrer_host: source.source === 'direct' ? 'direct' : `${source.source}.com`,
        country_code: initial.analytics.countrySummary[0]?.country ?? 'US',
        page_path: '/',
        created_at: new Date().toISOString(),
      };
      if (isSupabaseEnabled()) {
        await supabaseInsert('analytics_events', payload);
      } else {
        requireDb();
        insertAnalyticsEventStmt.run(
          payload.id,
          payload.store_username,
          payload.event_type,
          payload.metric_date,
          payload.source,
          payload.referrer_host,
          payload.country_code,
          payload.page_path,
          payload.created_at
        );
      }
    }
  }
}
