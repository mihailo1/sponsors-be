import { Context } from "../../deps.ts";
import { connectRedis, RedisClient } from "../../deps.ts";

let redis: RedisClient | null = null;
async function getRedis() {
  if (!redis) {
    redis = await connectRedis({
      hostname: Deno.env.get("REDIS_HOST") || "redis",
      port: 6379,
    });
  }
  return redis;
}

export async function uploadJsonFile(context: Context) {
  try {
    if (!context.request.hasBody) {
      context.response.status = 400;
      context.response.body = { message: "No body provided" };
      return;
    }

    const body = await context.request.body.json();

    if (Array.isArray(body) && body.length > 0) {
      const redis = await getRedis();
      await redis.sadd("strings", ...body);
      context.response.status = 200;
      context.response.body = {
        message: "File uploaded successfully",
        filesAdded: body.length,
      };
    } else {
      context.response.status = 400;
      context.response.body = { message: "No JSON file uploaded" };
    }
  } catch (error) {
    console.error("Failed to parse JSON body:", error);
    context.response.status = 400;
    context.response.body = "Invalid JSON";
  }
}

export default {
  uploadJsonFile,
};
