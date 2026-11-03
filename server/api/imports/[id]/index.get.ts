import { db } from '../../../database';
import { importBatches, importIssues } from '../../../database/schema';
import { eq, sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid Batch ID' });
  }

  const batch = await db.select().from(importBatches).where(eq(importBatches.id, id)).get();
  if (!batch) {
    throw createError({ statusCode: 404, message: 'Import batch not found' });
  }

  const issuesCount = await db.select({ count: sql<number>`count(*)` })
    .from(importIssues)
    .where(eq(importIssues.importBatchId, id))
    .get();

  return {
    ...batch,
    issuesCount: issuesCount?.count || 0
  };
});

