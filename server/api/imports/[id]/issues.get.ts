import { db } from '../../../database';
import { importIssues } from '../../../database/schema';
import { eq, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  const query = getQuery(event);
  const limit = Math.min(200, Number(query.limit) || 100);

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid Batch ID' });
  }

  const issues = await db.select()
    .from(importIssues)
    .where(eq(importIssues.importBatchId, id))
    .orderBy(desc(importIssues.id))
    .limit(limit)
    .all();

  return issues;
});

