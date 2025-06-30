import { Context } from "../../deps.ts";
import { getRedis } from "../utils/redisClient.ts";

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
      if (redis.sadd) {
        // deno-redis
        await redis.sadd("strings", ...body);
      } else if (redis.set) {
        // Upstash Redis (simulate sadd with set for demo, or use SADD if supported)
        await Promise.all(body.map((item: string) => redis.sadd("strings", item)));
      }
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
    console.error("Failed to parse JSON body or Redis error:", error);
    context.response.status = 400;
    context.response.body = "Invalid JSON or Redis error";
  }
}

export default {
  uploadJsonFile,
};
