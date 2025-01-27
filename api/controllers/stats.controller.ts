import { ServerStats, StringItem } from "../../types.ts";

const kv = await Deno.openKv();

export async function getServerStats(): Promise<ServerStats> {
  const startTime = performance.now();

  const entries = kv.list({ prefix: ["strings"] });
  let stringsCount = 0;
  const uniqueStrings = new Set<string>();
  let totalLength = 0;
  const allStrings: StringItem[] = [];

  for await (const entry of entries) {
    stringsCount++;
    uniqueStrings.add(entry.value as string);
    totalLength += (entry.value as string).length;
    allStrings.push({
      id: entry.key[1] as string,
      value: entry.value as string,
    });
  }

  const uniqueStringsCount = uniqueStrings.size;
  const averageStringLength = stringsCount > 0 ? totalLength / stringsCount : 0;

  // Get 25 random entries
  const randomStrings = allStrings.sort(() => 0.5 - Math.random()).slice(0, 25);

  const endTime = performance.now();
  const requestDuration = endTime - startTime;

  const stats: ServerStats = {
    uptime: performance.now(),
    stringsCount,
    uniqueStringsCount,
    averageStringLength,
    memoryUsage: requestDuration,
    cpuUsage: "Not available on Windows",
    strings: randomStrings,
  };

  return stats;
}

export default {
  getServerStats,
};
