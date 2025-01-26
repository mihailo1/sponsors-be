import { Context } from "../deps.ts";

const kv = await Deno.openKv();

export async function getServerStats(context: Context) {
  const entries = kv.list({ prefix: ["strings"] });
  let stringsCount = 0;
  for await (const entry of entries) {
    stringsCount++;
  }
  context.response.body = {
    uptime: performance.now(),
    stringsCount,
  };
}

export default {
  getServerStats,
};
