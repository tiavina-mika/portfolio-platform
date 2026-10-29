import { Redis } from '@upstash/redis';

let redisInstance: Redis | undefined;

/**
 * Constructed lazily (not a module-level constant) because it depends on env vars that are
 * only loaded by dotenv once the server starts — a top-level constant would freeze the client
 * with an undefined url/token, since ESM imports resolve before dotenv.config() runs.
 */
export const getRedis = (): Redis => {
  redisInstance ??= new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  return redisInstance;
};
