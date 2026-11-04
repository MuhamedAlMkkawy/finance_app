import { DataStore } from '../../data/store';

export default defineEventHandler(async () => {
  await DataStore.ensureInitialized();
  return DataStore.getDataExplorerSchema();
});
