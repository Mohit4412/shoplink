import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const nextBin = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
const port = 3302;
const baseUrl = `http://127.0.0.1:${port}`;

function uniqueMerchant(prefix = 'merchant') {
  const stamp = `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    email: `${stamp}@example.com`,
    username: stamp,
    password: 'RouteTest123!',
    firstName: 'Route',
    lastName: 'Tester',
    whatsappNumber: '+15550001111',
  };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {}
    await delay(500);
  }
  throw new Error('Server did not become ready in time');
}

function sessionCookie(response) {
  const raw = response.headers.get('set-cookie');
  assert.ok(raw, 'expected a session cookie');
  return raw.split(';')[0];
}

function jsonRequest(method, body, cookie, headers = {}) {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

const dbDir = mkdtempSync(path.join(tmpdir(), 'micro-store-tests-'));
const dbPath = path.join(dbDir, 'app.sqlite');

let server;

test.before(async () => {
  server = spawn(process.execPath, [nextBin, 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: projectRoot,
    env: {
      ...process.env,
      SHOPLINK_DB_PATH: dbPath,
    },
    stdio: 'ignore',
  });

  await waitForServer();
});

test.after(async () => {
  if (server) {
    server.kill('SIGTERM');
    await new Promise((resolve) => server.once('exit', resolve));
  }
  await rm(dbDir, { recursive: true, force: true });
});

test('unauthenticated dashboard and order routes are rejected', async () => {
  const [dashboardResponse, ordersResponse] = await Promise.all([
    fetch(`${baseUrl}/api/dashboard`),
    fetch(`${baseUrl}/api/orders`, jsonRequest('POST', {
      order: {
        productId: 'x',
        quantity: 1,
        revenue: 10,
        date: new Date().toISOString(),
        status: 'confirmed',
      },
    })),
  ]);

  assert.equal(dashboardResponse.status, 401);
  assert.equal(ordersResponse.status, 401);
});

test('signup, rename, and ownership enforcement work end to end', async () => {
  const merchantA = uniqueMerchant('owner-a');
  const merchantB = uniqueMerchant('owner-b');

  const signupA = await fetch(`${baseUrl}/api/auth/signup`, jsonRequest('POST', merchantA));
  assert.equal(signupA.status, 200);
  const cookieA = sessionCookie(signupA);

  const signupB = await fetch(`${baseUrl}/api/auth/signup`, jsonRequest('POST', merchantB));
  assert.equal(signupB.status, 200);
  const cookieB = sessionCookie(signupB);

  const createProduct = await fetch(`${baseUrl}/api/stores/${merchantA.username}/products`, jsonRequest('POST', {
    product: {
      imageUrl: '',
      name: 'Ownership Test Product',
      price: 99,
      description: 'Owned by merchant A',
      status: 'Active',
      category: 'General',
      stock: 5,
    },
  }, cookieA));
  assert.equal(createProduct.status, 200);
  const createProductPayload = await createProduct.json();
  assert.equal(createProductPayload.products.length, 1);
  const createdProductId = createProductPayload.products[0].id;

  const forbiddenUpdate = await fetch(`${baseUrl}/api/stores/${merchantA.username}/products/${createdProductId}`, jsonRequest('PATCH', {
    product: {
      name: 'Hijacked',
    },
  }, cookieB));
  assert.equal(forbiddenUpdate.status, 403);

  const renameConflict = await fetch(`${baseUrl}/api/auth/profile`, jsonRequest('PATCH', {
    user: {
      username: merchantA.username,
      firstName: merchantB.firstName,
      lastName: merchantB.lastName,
      bio: '',
      whatsappNumber: merchantB.whatsappNumber,
      avatarUrl: '',
    },
  }, cookieB));
  assert.equal(renameConflict.status, 409);

  const renamedUsername = `${merchantA.username}-renamed`;
  const renameA = await fetch(`${baseUrl}/api/auth/profile`, jsonRequest('PATCH', {
    user: {
      username: renamedUsername,
      firstName: merchantA.firstName,
      lastName: merchantA.lastName,
      bio: '',
      whatsappNumber: merchantA.whatsappNumber,
      avatarUrl: '',
    },
  }, cookieA));
  assert.equal(renameA.status, 200);

  const renamedStorefront = await fetch(`${baseUrl}/${renamedUsername}`);
  assert.equal(renamedStorefront.status, 200);

  const oldStorefront = await fetch(`${baseUrl}/${merchantA.username}`);
  assert.equal(oldStorefront.status, 404);

  const productAfterRename = await fetch(`${baseUrl}/${renamedUsername}/product/${createdProductId}`);
  assert.equal(productAfterRename.status, 200);
});

test('analytics and dashboard aggregates persist for a merchant session', async () => {
  const merchant = uniqueMerchant('metrics');

  const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, jsonRequest('POST', merchant));
  assert.equal(signupResponse.status, 200);
  const cookie = sessionCookie(signupResponse);

  const orderCreate = await fetch(`${baseUrl}/api/orders`, jsonRequest('POST', {
    order: {
      productId: 'manual-product',
      quantity: 2,
      revenue: 49.99,
      date: new Date().toISOString(),
      notes: 'Integration order',
      status: 'confirmed',
    },
  }, cookie));
  assert.equal(orderCreate.status, 200);

  const [viewResponse, clickResponse] = await Promise.all([
    fetch(`${baseUrl}/api/analytics/track`, jsonRequest('POST', {
      username: merchant.username,
      type: 'view',
      source: 'instagram',
      referrerHost: 'instagram.com',
      pagePath: `/${merchant.username}`,
    }, undefined, { 'x-country-code': 'US' })),
    fetch(`${baseUrl}/api/analytics/track`, jsonRequest('POST', {
      username: merchant.username,
      type: 'click',
      source: 'instagram',
      referrerHost: 'instagram.com',
      pagePath: `/${merchant.username}/product/demo`,
    }, undefined, { 'x-country-code': 'US' })),
  ]);
  assert.equal(viewResponse.status, 200);
  assert.equal(clickResponse.status, 200);

  const dashboardResponse = await fetch(`${baseUrl}/api/dashboard`, {
    headers: { cookie },
  });
  assert.equal(dashboardResponse.status, 200);
  const dashboard = await dashboardResponse.json();

  assert.equal(dashboard.orders.length, 1);
  assert.equal(dashboard.orders[0].status, 'confirmed');
  assert.ok(dashboard.analytics.totalViews >= 1);
  assert.ok(dashboard.analytics.totalClicks >= 1);
  assert.equal(dashboard.analytics.dailyStats.length, 30);
  assert.ok(dashboard.analytics.dailyStats.some((day) => day.orders >= 1));
  assert.equal(dashboard.analytics.sourceSummary[0].source, 'instagram');
  assert.equal(dashboard.analytics.referrerSummary[0].referrer, 'instagram.com');
  assert.equal(dashboard.analytics.countrySummary[0].country, 'US');
});
