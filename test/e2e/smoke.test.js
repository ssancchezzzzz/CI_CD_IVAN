const test = require('node:test');
const assert = require('node:assert/strict');
const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
test('health y versión', async () => {
  const health = await fetch(`${base}/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, 'ok');
  const version = await fetch(`${base}/version`);
  assert.equal(version.status, 200);
  const data = await version.json();
  if (process.env.EXPECTED_SHA) assert.equal(data.sha, process.env.EXPECTED_SHA);
});
test('flujo de tareas', async () => {
  const before = await fetch(`${base}/tasks`);
  assert.equal(before.status, 200);
  if (process.env.READ_ONLY === 'true') return;
  const created = await fetch(`${base}/tasks`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'E2E' }),
  });
  assert.equal(created.status, 201);
  const task = await created.json();
  const updated = await fetch(`${base}/tasks/${task.id}/complete`, {
    method: 'PATCH',
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).done, true);
});
