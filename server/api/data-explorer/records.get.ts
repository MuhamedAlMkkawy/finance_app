import { DataStore } from '../../data/store';

export default defineEventHandler(async (event) => {
  await DataStore.ensureInitialized();
  const query = getQuery(event);
  return DataStore.getDataExplorerRecords(query);
});
