const express = require('express');
const { createService } = require('./taskService');
function createApp(repository) {
  const app = express();
  const service = createService(repository);
  app.use(express.json());
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/ready', async (req, res) => {
    try {
      await repository.list();
      res.json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'unavailable' });
    }
  });
  app.get('/version', (req, res) =>
    res.json({
      sha: process.env.GIT_SHA || process.env.RENDER_GIT_COMMIT || 'local',
    }),
  );
  app.get('/tasks', async (req, res, next) => {
    try {
      res.json(await service.list());
    } catch (e) {
      next(e);
    }
  });
  app.post('/tasks', async (req, res, next) => {
    try {
      res.status(201).json(await service.create(req.body));
    } catch (e) {
      next(e);
    }
  });
  app.patch('/tasks/:id/complete', async (req, res, next) => {
    try {
      res.json(await service.complete(req.params.id));
    } catch (e) {
      next(e);
    }
  });
  app.get('/openapi.yaml', (req, res) => res.sendFile('openapi.yaml', { root: process.cwd() }));
  app.use((err, req, res, next) =>
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Error interno' }),
  );
  return app;
}
module.exports = { createApp };
