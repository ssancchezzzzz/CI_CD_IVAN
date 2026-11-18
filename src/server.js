const { memoryRepository, postgresRepository } = require('./repositories');
const { createApp } = require('./app');
async function main() {
  const repo = process.env.DATABASE_URL
    ? postgresRepository(process.env.DATABASE_URL)
    : memoryRepository();
  await repo.init();
  const server = createApp(repo).listen(Number(process.env.PORT || 3000), '0.0.0.0');
  async function shutdown() {
    server.close(async () => {
      await repo.close();
      process.exit(0);
    });
  }
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
