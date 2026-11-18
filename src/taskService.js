function validateTitle(title) {
  if (typeof title !== 'string' || !title.trim()) {
    const error = new Error('title debe ser texto no vacío');
    error.status = 400;
    throw error;
  }
  return title.trim();
}
function createService(repository) {
  return {
    list: () => repository.list(),
    async create(data) {
      const title = validateTitle(data?.title);
      return repository.create({ title, done: false });
    },
    async complete(id) {
      const updated = await repository.complete(Number(id));
      if (!updated) {
        const error = new Error('Tarea no encontrada');
        error.status = 404;
        throw error;
      }
      return updated;
    },
  };
}
module.exports = { validateTitle, createService };
