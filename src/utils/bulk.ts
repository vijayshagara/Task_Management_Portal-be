import { z } from 'zod';

export const bulkIdsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
});

export function parseBulkIds(body: unknown): string[] {
  return bulkIdsSchema.parse(body).ids;
}

export type BulkMutationResult = {
  ids: string[];
  count: number;
};
