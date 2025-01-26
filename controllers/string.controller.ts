import { Context } from "../deps.ts";
import { existsSync } from "../deps.ts";

const listFilePath = "./data/list.json";
if (!existsSync(listFilePath)) {
    Deno.writeTextFileSync(listFilePath, JSON.stringify({ strings: [] }));
}

let stringsArray: string[] = JSON.parse(Deno.readTextFileSync(listFilePath)).strings;
let cachedStringsArray = stringsArray.map((str, index) => ({ id: index, value: str }));

const updateCache = () => {
    cachedStringsArray = stringsArray.map((str, index) => ({ id: index, value: str }));
};

const getAllStrings = async (context: Context) => {
    context.response.status = 200;
    context.response.body = JSON.stringify(stringsArray);
};

const createString = async (context: Context) => {
    try {
        const body = await context.request.body().value;
        if (body && typeof body === "object" && body.value) {   
            stringsArray.push(body.value);
            stringsArray = stringsArray.filter((str) => str !== null);
            stringsArray.sort();
            Deno.writeTextFileSync(listFilePath, JSON.stringify({ strings: stringsArray }));
            updateCache();
            context.response.status = 201;
            context.response.body = JSON.stringify(stringsArray);
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
    const id = context.params.id;
    try {
        const body = await context.request.body.json();
        if (id !== null) {
            const index = parseInt(id);
            if (index >= 0 && index < stringsArray.length && body.value) {
                stringsArray[index] = body.value;
                stringsArray.sort();
                Deno.writeTextFileSync(listFilePath, JSON.stringify({ strings: stringsArray }));
                updateCache();
                context.response.status = 200;
                context.response.body = JSON.stringify(stringsArray);
            } else {
                context.response.status = 404;
                context.response.body = "Not Found";
            }
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
    const id = context.params.id;
    if (id !== null) {
        const index = parseInt(id);
        if (index >= 0 && index < stringsArray.length) {
            stringsArray.splice(index, 1);
            Deno.writeTextFileSync(listFilePath, JSON.stringify({ strings: stringsArray }));
            updateCache();
            context.response.status = 200;
            context.response.body = JSON.stringify(cachedStringsArray);
        } else {
            context.response.status = 404;
            context.response.body = "Not Found";
        }
    } else {
        context.response.status = 400;
        context.response.body = "Bad Request";
    }
};

const searchStrings = async (context: Context) => {
    const query = context.request.url.searchParams.get("query") || "";
    const filteredStrings = cachedStringsArray
        .filter((str) => str.value.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 100);
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
