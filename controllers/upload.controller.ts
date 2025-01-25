import { Context } from "../deps.ts";
import { existsSync } from "../deps.ts";

const listFilePath = "./data/list.json";
if (!existsSync(listFilePath)) {
    Deno.writeTextFileSync(listFilePath, JSON.stringify({ strings: [] }));
}

export async function uploadJsonFile(context: Context) {
    const body = await context.request.body.json() as string[];
    console.log('body', body);

    if (body.length > 0) {
        Deno.writeTextFileSync(listFilePath, JSON.stringify({ strings: body }));
        
        context.response.status = 200;
        context.response.body = { message: "File uploaded successfully", data: body };
    } else {
        context.response.status = 400;
        context.response.body = { message: "No JSON file uploaded" };
    }
}

export default {
    uploadJsonFile
};