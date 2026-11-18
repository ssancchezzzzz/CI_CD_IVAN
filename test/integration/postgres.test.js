const test = require('node:test');
const assert = require('node:assert/strict');
const { PostgreSqlContainer } = require('@testcontainers/postgresql');
const { postgresRepository } = require('../../src/repositories');
const { createService } = require('../../src/taskService');
test('la API de datos funciona con PostgreSQL real', { timeout: 120000 }, async () => {
  let container;
  let url = process.env.TEST_DATABASE_URL;
  if (!url) {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    url = container.getConnectionUri();
  }
  const repo = postgresRepository(url);
  try {
    await repo.init();
    const service = createService(repo);
    const created = await service.create({ title: 'Integración SQL' });
    assert.equal(created.done, false);
    assert.ok((await service.list()).some((t) => t.id === created.id));
    assert.equal((await service.complete(created.id)).done, true);
  } finally {
    await repo.close();
    if (container) await container.stop();
  }
});
