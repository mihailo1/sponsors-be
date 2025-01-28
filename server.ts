import { Application, send, config } from "./deps.ts";
import router from "./api/routes/router.ts";
import { handleWebSocket } from "./api/ws/stats.ts";
import { neon } from '@neon/serverless';
import { DATABASE_URL } from "./api/config/env.ts";

const env = config();
const app = new Application();

const sql = neon(DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS strings (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL
  )
`;

app.use(async (context, next) => {
  context.response.headers.set("Access-Control-Allow-Origin", "*");
  context.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  context.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  if (context.request.method === "OPTIONS") {
    context.response.status = 204;
    return;
  }
  await next();
});

app.use(async (context, next) => {
  try {
    await next();
    if (context.response.status === 404) {
      try {
        await send(context, context.request.url.pathname, {
          root: `${Deno.cwd()}/react-app/build`,
        });
      } catch {
        await send(context, "index.html", {
          root: `${Deno.cwd()}/react-app/build`,
        });
      }
    }
  } catch (error) {
    console.error("Error handling request", error);
    context.response.status = 500;
    context.response.body = "Internal Server Error";
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = parseInt(env.PORT || "8000");

console.log(`HTTP server is running. Access it at: http://localhost:${port}/`);

Deno.serve({ port }, async (request) => {
  console.log(`Received request: ${request.method} ${request.url}`);
  const wsResponse = handleWebSocket(request);
  if (wsResponse) {
    return wsResponse;
  } else {
    const response = await app.handle(request);
    return response || new Response("Not Found", { status: 404 });
  }
});
