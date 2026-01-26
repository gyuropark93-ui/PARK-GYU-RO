import { z } from 'zod';
import { insertVisitSchema, site_visits } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  logVisit: {
    method: 'POST' as const,
    path: '/api/visit',
    input: insertVisitSchema,
    responses: {
      201: z.custom<typeof site_visits.$inferSelect>(),
      400: errorSchemas.validation,
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type InsertVisit = z.infer<typeof insertVisitSchema>;
