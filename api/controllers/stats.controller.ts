import { ServerStats, StringItem } from "../../types.ts";
import { neon } from '@neon/serverless';
import { DATABASE_URL } from "../config/env.ts";

const sql = neon(DATABASE_URL);

export async function getServerStats(): Promise<ServerStats> {
  const startTime = performance.now();

  const stringsArray: StringItem[] = (await sql`SELECT * FROM strings`).map((row: Record<string, any>) => ({
    id: row.id,
    value: row.value,
  }));
  const stringsCount = stringsArray.length;
  const uniqueStrings = new Set(stringsArray.map((item: StringItem) => item.value));
  const totalLength = stringsArray.reduce((acc: number, item: StringItem) => acc + item.value.length, 0);

  const uniqueStringsCount = uniqueStrings.size;
  const averageStringLength = stringsCount > 0 ? totalLength / stringsCount : 0;

  const randomStrings = stringsArray.sort(() => 0.5 - Math.random()).slice(0, 25);

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
