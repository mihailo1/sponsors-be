import { Context } from "../../deps.ts";
import { StringItem } from "../../types.ts";

const kv = await Deno.openKv();

const getAllStrings = async (context: Context) => {
  const entries = kv.list({ prefix: ["strings"] });
  const stringsArray: StringItem[] = [];
  for await (const entry of entries) {
    stringsArray.push({
      id: entry.key[1] as string,
      value: entry.value as string,
    });
  }
  context.response.status = 200;
  context.response.body = JSON.stringify(stringsArray);
};

const createString = async (context: Context) => {
  try {
    const body = await context.request.body().value;
    if (body && typeof body === "object" && body.value) {
      const key = ["strings", body.value];
      await kv.set(key, body.value);
      context.response.status = 201;
      context.response.body = { message: "String created successfully" };
    } else {
      context.response.status = 400;
      context.response.body = { error: "Invalid input" };
    }
  } catch (error) {
    console.error("Failed to parse JSON body:", error);
    context.response.status = 400;
    context.response.body = { error: "Invalid JSON", extra: error };
  }
};

const updateString = async (context: Context) => {
  const id = context.request.url.searchParams.get("id");
  try {
    const body = await context.request.body().value;
    if (id != null && body.value) {
      const key = ["strings", id];
      await kv.set(key, body.value);
      context.response.status = 200;
      context.response.body = { message: "String updated successfully" };
    } else {
      context.response.status = 400;
      context.response.body = "Bad Request";
    }
  } catch (error) {
    console.error("Failed to parse JSON body:", error);
    context.response.status = 400;
    context.response.body = "Invalid JSON";
  }
};

const deleteString = async (context: Context) => {
  const id = context.request.url.pathname.split("/").pop();
  if (id != null) {
    const key = ["strings", id];
    await kv.delete(key);

    // Fetch the updated list of strings
    const entries = kv.list({ prefix: ["strings"] });
    const stringsArray: StringItem[] = [];
    for await (const entry of entries) {
      stringsArray.push({
        id: entry.key[1] as string,
        value: entry.value as string,
      });
    }

    context.response.status = 200;
    context.response.body = stringsArray;
  } else {
    context.response.status = 400;
    context.response.body = "Bad Request";
  }
};

const searchStrings = async (context: Context) => {
  const query = context.request.url.searchParams.get("query") || "";
  const entries = kv.list({ prefix: ["strings"] });
  const filteredStrings: StringItem[] = [];
  for await (const entry of entries) {
    const value = entry.value as string;
    if (value.toLowerCase().includes(query.toLowerCase())) {
      filteredStrings.push({ id: entry.key[1] as string, value });
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
