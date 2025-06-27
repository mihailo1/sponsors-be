import { ServerStats, StringItem } from "../../types.ts";
import { connectRedis, RedisClient } from "../../deps.ts";

let redis: RedisClient | null = null;
async function getRedis() {
  if (!redis) {
    redis = await connectRedis({ hostname: Deno.env.get("REDIS_HOST") || "redis", port: 6379 });
  }
  return redis;
}

export async function getServerStats(): Promise<ServerStats> {
  // const _startTime = performance.now();
  const redis = await getRedis();
  const allValues = await redis.smembers("strings");
  const stringsCount = allValues.length;
  const uniqueStrings = new Set<string>(allValues);
  let totalLength = 0;
  const allStrings: StringItem[] = allValues.map((value: string) => {
    totalLength += value.length;
    return { id: value, value };
  });

  const uniqueStringsCount = uniqueStrings.size;
  const averageStringLength = stringsCount > 0 ? totalLength / stringsCount : 0;

  // Get 25 random entries
  const randomStrings = allStrings.sort(() => 0.5 - Math.random()).slice(0, 25);

  // const _endTime = performance.now();
  // const requestDuration = _endTime - _startTime;

  const stats: ServerStats = {
    uptime: performance.now(),
    stringsCount,
    uniqueStringsCount,
    averageStringLength,
    memoryUsage: Deno.memoryUsage().heapUsed,
    systemMemoryInfo: Deno.systemMemoryInfo(),
    strings: randomStrings,
  };

  return stats;
}

export default {
  getServerStats,
};
