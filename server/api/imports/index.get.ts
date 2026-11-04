import { DataStore } from '../../data/store';

export default defineEventHandler(async () => {
  await DataStore.ensureInitialized();
  const batches = DataStore.getBatches();
  return batches.map(b => ({
    ...b,
    issuesCount: DataStore.getBatchIssues(b.id).length
  }));
});
