import { UpstashRedis, connectRedis, RedisClient } from "../../deps.ts";

console.log("ENV VARS", Object.fromEntries(Deno.env.toObject ? Object.entries(Deno.env.toObject()) : Object.entries(Deno.env)));

let redis: RedisClient | null = null;
let upstashRedis: InstanceType<typeof UpstashRedis> | null = null;

export async function getRedis() {
  if (Deno.env.get("UPSTASH_REDIS_URL") && Deno.env.get("UPSTASH_REDIS_TOKEN")) {
    if (!upstashRedis) {
      upstashRedis = new UpstashRedis({
        url: Deno.env.get("UPSTASH_REDIS_URL"),
        token: Deno.env.get("UPSTASH_REDIS_TOKEN"),
      });
    }
    return upstashRedis;
  } else {
    if (!redis) {
      redis = await connectRedis({ hostname: Deno.env.get("REDIS_HOST") || "redis", port: 6379 });
    }
    return redis;
  }
}