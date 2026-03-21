import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const nextBin = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
const port = 3301;
const baseUrl = `http://127.0.0.1:${port}`;

function uniqueMerchant() {
  const stamp = Date.now().toString(36);
  return {
    email: `merchant-${stamp}@example.com`,
    username: `merchant-${stamp}`,
    password: 'SmokeTest123!',
    firstName: 'Smoke',
    lastName: 'Merchant',
    whatsappNumber: '+15551234567',
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

function cookieFrom(response) {
  const raw = response.headers.get('set-cookie');
  assert.ok(raw, 'expected session cookie');
  return raw.split(';')[0];
}

async function main() {
  const server = spawn(process.execPath, [nextBin, 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: projectRoot,
    stdio: 'ignore',
  });

  try {
    await waitForServer();

    const merchant = uniqueMerchant();

    const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merchant),
    });
    assert.equal(signupResponse.status, 200, 'signup should succeed');
    const signupPayload = await signupResponse.json();
    const cookie = cookieFrom(signupResponse);
    assert.equal(signupPayload.user.username, merchant.username);

    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { cookie },
    });
    assert.equal(sessionResponse.status, 200, 'session lookup should succeed');
    const sessionPayload = await sessionResponse.json();
    assert.equal(sessionPayload.user.username, merchant.username);

    const dashboardResponse = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { cookie },
    });
    assert.equal(dashboardResponse.status, 200, 'dashboard data should be accessible');
    const dashboardPayload = await dashboardResponse.json();
    assert.ok(Array.isArray(dashboardPayload.orders), 'orders should be an array');
    assert.equal(dashboardPayload.analytics.dailyStats.length, 30, 'dashboard should return 30 daily buckets');

    const orderResponse = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      body: JSON.stringify({
        order: {
          productId: 'manual-product',
          quantity: 2,
          revenue: 49.99,
          date: new Date().toISOString(),
          notes: 'Smoke order',
          status: 'confirmed',
        },
      }),
    });
    assert.equal(orderResponse.status, 200, 'order creation should succeed');
    const orderPayload = await orderResponse.json();
    assert.equal(orderPayload.orders.length, 1, 'new merchant should now have one order');

    const uploadForm = new FormData();
    uploadForm.append('folder', 'products');
    uploadForm.append(
      'file',
      new File(
        [Uint8Array.from([71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 255, 255, 255, 0, 0, 0, 33, 249, 4, 1, 0, 0, 1, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59])],
        'pixel.gif',
        { type: 'image/gif' }
      )
    );
    const uploadResponse = await fetch(`${baseUrl}/api/uploads`, {
      method: 'POST',
      headers: { cookie },
      body: uploadForm,
    });
    assert.equal(uploadResponse.status, 200, 'upload should succeed');
    const uploadPayload = await uploadResponse.json();
    assert.ok(uploadPayload.url.startsWith(`/uploads/${merchant.username}/products/`), 'upload should return a merchant-scoped URL');

    const renamedUsername = `${merchant.username}-renamed`;
    const renameResponse = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      body: JSON.stringify({
        user: {
          username: renamedUsername,
          firstName: merchant.firstName,
          lastName: merchant.lastName,
          bio: '',
          whatsappNumber: merchant.whatsappNumber,
          avatarUrl: '',
        },
      }),
    });
    assert.equal(renameResponse.status, 200, 'username rename should succeed');
    const renamePayload = await renameResponse.json();
    assert.equal(renamePayload.user.username, renamedUsername);

    const viewResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-country-code': 'IN' },
      body: JSON.stringify({
        username: renamedUsername,
        type: 'view',
        source: 'instagram',
        referrerHost: 'instagram.com',
        pagePath: `/${renamedUsername}`,
      }),
    });
    assert.equal(viewResponse.status, 200, 'view tracking should succeed');

    const clickResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-country-code': 'IN' },
      body: JSON.stringify({
        username: renamedUsername,
        type: 'click',
        source: 'instagram',
        referrerHost: 'instagram.com',
        pagePath: `/${renamedUsername}/product/demo`,
      }),
    });
    assert.equal(clickResponse.status, 200, 'click tracking should succeed');

    const refreshedDashboardResponse = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { cookie },
    });
    const refreshedDashboard = await refreshedDashboardResponse.json();
    assert.ok(refreshedDashboard.analytics.totalViews >= 1, 'views should be persisted');
    assert.ok(refreshedDashboard.analytics.totalClicks >= 1, 'clicks should be persisted');
    assert.equal(refreshedDashboard.analytics.sourceSummary[0].source, 'instagram', 'source attribution should be persisted');
    assert.equal(refreshedDashboard.analytics.countrySummary[0].country, 'IN', 'country attribution should be persisted');

    const storefrontResponse = await fetch(`${baseUrl}/${renamedUsername}`);
    assert.equal(storefrontResponse.status, 200, 'public storefront should render');

    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { cookie },
    });
    assert.equal(logoutResponse.status, 200, 'logout should succeed');
  } finally {
    server.kill('SIGTERM');
    await new Promise((resolve) => server.once('exit', resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
