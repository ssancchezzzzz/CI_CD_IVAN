function memoryRepository() {
  let nextId = 1;
  const tasks = [];
  return {
    async init() {},
    async list() {
      return tasks.map((x) => ({ ...x }));
    },
    async create({ title, done }) {
      const task = { id: nextId++, title, done };
      tasks.push(task);
      return { ...task };
    },
    async complete(id) {
      const task = tasks.find((t) => t.id === id);
      if (!task) return null;
      task.done = true;
      return { ...task };
    },
    async close() {},
  };
}
function postgresRepository(connectionString) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString });
  return {
    async init() {
      await pool.query(`CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE
      )`);
    },
    async list() {
      const result = await pool.query('SELECT id, title, done FROM tasks ORDER BY id');
      return result.rows;
    },
    async create({ title, done }) {
      const result = await pool.query(
        'INSERT INTO tasks(title, done) VALUES($1,$2) RETURNING id,title,done',
        [title, done],
      );
      return result.rows[0];
    },
    async complete(id) {
      const result = await pool.query(
        'UPDATE tasks SET done=TRUE WHERE id=$1 RETURNING id,title,done',
        [id],
      );
      return result.rows[0] || null;
    },
    async close() {
      await pool.end();
    },
  };
}
module.exports = { memoryRepository, postgresRepository };
