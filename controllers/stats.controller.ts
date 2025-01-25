import { Context } from "../deps.ts";
import { existsSync } from "../deps.ts";

const listFilePath = "./data/list.json";
if (!existsSync(listFilePath)) {
    Deno.writeTextFileSync(listFilePath, JSON.stringify({ strings: [] }));
}

const stringsArray: string[] = JSON.parse(Deno.readTextFileSync(listFilePath)).strings;

export function getServerStats(context: Context) {
    const stringsCount = stringsArray.length;
    context.response.body = {
        uptime: performance.now(),
        stringsCount,
    };
}

export default {
    getServerStats
};
