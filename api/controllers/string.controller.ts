import { Context } from "../../deps.ts";
import { StringItem } from "../../types.ts";
import { getRedis } from "../utils/redisClient.ts";

const getAllStrings = async (context: Context) => {
  const redis = await getRedis();
  const keys = await redis.smembers("strings");
  const stringsArray: StringItem[] = keys.map((value: string) => ({
    id: value,
    value,
  }));
  context.response.status = 200;
  context.response.body = JSON.stringify(stringsArray);
};

const createString = async (context: Context) => {
  try {
    if (!context.request.hasBody) {
      context.response.status = 400;
      context.response.body = { error: "No body provided" };
      return;
    }

    const body = await context.request.body.json();

    if (body && typeof body === "object" && "value" in body && typeof body.value === "string") {
      const redis = await getRedis();
      await redis.sadd("strings", body.value);
      context.response.status = 201;
      context.response.body = { message: "String added" };
    } else {
      context.response.status = 400;
      context.response.body = { error: "Invalid body" };
    }
  } catch (error) {
    context.response.status = 500;
    context.response.body = { error: error instanceof Error ? error.message : String(error) };
  }
};

const updateString = async (context: Context) => {
  const id = (context as Context & { params?: Record<string, string> }).params?.id || context.request.url.searchParams.get("id");
  try {
    const body = await context.request.body.json();
    if (id != null && body.value) {
      const redis = await getRedis();
      await redis.srem("strings", id);
      await redis.sadd("strings", body.value);
      context.response.status = 200;
      context.response.body = { message: "String updated successfully" };
    } else {
      context.response.status = 400;
      context.response.body = { error: "Invalid request" };
    }
  } catch (error) {
    context.response.status = 500;
    context.response.body = { error: error instanceof Error ? error.message : String(error) };
  }
};

const deleteString = async (context: Context) => {
  let id: string | undefined = undefined;
  if ((context as Context & { params?: Record<string, string> }).params?.id) {
    id = (context as Context & { params: Record<string, string> }).params.id;
  } else {
    const match = context.request.url.pathname.match(/\/api\/strings\/(.+)$/);
    if (match) id = match[1];
  }
  try {
    if (id) {
      const redis = await getRedis();
      await redis.srem("strings", id);
      context.response.status = 200;
      context.response.body = { message: "String deleted successfully" };
    } else {
      context.response.status = 400;
      context.response.body = { error: "Invalid id" };
    }
  } catch (error) {
    context.response.status = 500;
    context.response.body = { error: error instanceof Error ? error.message : String(error) };
  }
};

const searchStrings = async (context: Context) => {
  const query = context.request.url.searchParams.get("query") || "";
  const redis = await getRedis();
  const allStrings = await redis.smembers("strings");
  const filteredStrings: StringItem[] = [];
  for (const value of allStrings) {
    if (value.toLowerCase().includes(query.toLowerCase())) {
      filteredStrings.push({ id: value, value });
    }
    if (filteredStrings.length >= 100) {
      break;
    }
  }
  context.response.status = 200;
  context.response.body = JSON.stringify(filteredStrings);
};

export default {
  getAllStrings,
  createString,
  updateString,
  deleteString,
  searchStrings,
};
