import { Context } from "../../deps.ts";

const kv = await Deno.openKv();

export async function uploadJsonFile(context: Context) {
  try {
    if (!context.request.hasBody) {
      context.response.status = 400;
      context.response.body = { message: "No body provided" };
      return;
    }

    const body = await context.request.body.json();

    if (body.length > 0) {
      for (const value of body) {
        const key = ["strings", value];
        await kv.set(key, value);
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
    console.error("Failed to parse JSON body:", error);
    context.response.status = 400;
    context.response.body = "Invalid JSON";
  }
}

export default {
  uploadJsonFile,
};
