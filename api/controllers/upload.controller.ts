import { Context, config } from "../../deps.ts";
import { neon } from '@neon/serverless';

const env = config();

const databaseUrl = env.DATABASE_URL;
const sql = neon(databaseUrl);

export async function uploadJsonFile(context: Context) {
  const body = await context.request.body().value as string[];
  console.log("body", body);

  if (body.length > 0) {
    for (const value of body) {
      await sql`INSERT INTO strings (value) VALUES (${value})`;
    }
    context.response.status = 200;
    context.response.body = {
      message: "File uploaded successfully",
      data: body,
    };
  } else {
    context.response.status = 400;
    context.response.body = { message: "No JSON file uploaded" };
  }
}

export default {
  uploadJsonFile,
};
