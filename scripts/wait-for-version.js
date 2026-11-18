const [url, sha, seconds = '90'] = process.argv.slice(2);
if (!url || !sha) {
  console.error('Uso: node scripts/wait-for-version.js URL SHA [SEGUNDOS]');
  process.exit(2);
}
const deadline = Date.now() + Number(seconds) * 1000;
(async () => {
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url.replace(/\/$/, '') + '/version');
      if (response.ok && (await response.json()).sha === sha) return;
    } catch {
      // Nothing to do
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error('No se observó la versión esperada');
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
