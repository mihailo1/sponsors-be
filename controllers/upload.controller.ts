import { Context } from "../deps.ts";

const kv = await Deno.openKv();

export async function uploadJsonFile(context: Context) {
  const body = await context.request.body().value as string[];
  console.log("body", body);

  if (body.length > 0) {
    for (const value of body) {
      const key = ["strings", value];
      await kv.set(key, value);
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
