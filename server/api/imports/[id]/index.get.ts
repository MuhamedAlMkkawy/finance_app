import { DataStore } from '../../../data/store';

export default defineEventHandler(async (event) => {
  await DataStore.ensureInitialized();
  const id = Number(getRouterParam(event, 'id'));
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid Batch ID' });
  }

  const batch = DataStore.getBatchById(id);
  if (!batch) {
    throw createError({ statusCode: 404, message: 'Import batch not found' });
  }

  const issues = DataStore.getBatchIssues(id);
  return {
    ...batch,
    issuesCount: issues.length
  };
});
