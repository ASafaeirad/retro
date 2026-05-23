import * as v from 'valibot';

const configSchema = v.object({
  convexUrl: v.string(),
});

export const config = v.parse(configSchema, {
  convexUrl: import.meta.env.VITE_CONVEX_URL,
});
