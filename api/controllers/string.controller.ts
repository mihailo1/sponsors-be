import { Context } from "../../deps.ts";
import { StringItem } from "../../types.ts";
import { neon } from '@neon/serverless';
import { DATABASE_URL } from "../config/env.ts";

const sql = neon(DATABASE_URL);

const getAllStrings = async (context: Context) => {
  const stringsArray: StringItem[] = (await sql`SELECT * FROM strings`).map((row: Record<string, any>) => ({
    id: row.id,
    value: row.value,
  }));
  context.response.status = 200;
  context.response.body = JSON.stringify(stringsArray);
};

const createString = async (context: Context) => {
  try {
    const body = await context.request.body().value;
    if (body && typeof body === "object" && body.value) {
      await sql`INSERT INTO strings (value) VALUES (${body.value})`;
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
      await sql`UPDATE strings SET value = ${body.value} WHERE id = ${id}`;
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
    await sql`DELETE FROM strings WHERE id = ${id}`;

    const stringsArray: StringItem[] = (await sql`SELECT * FROM strings`).map((row: Record<string, any>) => ({
      id: row.id,
      value: row.value,
    }));
    context.response.status = 200;
    context.response.body = stringsArray;
  } else {
    context.response.status = 400;
    context.response.body = "Bad Request";
  }
};

const searchStrings = async (context: Context) => {
  const query = context.request.url.searchParams.get("query") || "";
  const filteredStrings: StringItem[] = (await sql`SELECT * FROM strings WHERE value ILIKE ${'%' + query + '%'}`).map((row: Record<string, any>) => ({
    id: row.id,
    value: row.value,
  }));
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
