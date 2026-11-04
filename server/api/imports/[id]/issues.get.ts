import { DataStore } from '../../../data/store';

export default defineEventHandler(async (event) => {
  await DataStore.ensureInitialized();
  const id = Number(getRouterParam(event, 'id'));
  const query = getQuery(event);
  const limit = Math.min(200, Number(query.limit) || 100);

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid Batch ID' });
  }

  const issues = DataStore.getBatchIssues(id);
  return [...issues].reverse().slice(0, limit);
});
