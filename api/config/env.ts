import { config } from "../../deps.ts";

const env = config();
export const DATABASE_URL = env.DATABASE_URL ?? Deno.env.get("DATABASE_URL");
