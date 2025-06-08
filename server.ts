import { Application, send } from "./deps.ts";
import router from "./api/routes/router.ts";
import { handleWebSocket } from "./api/ws/stats.ts";
import { createSwaggerRouter } from "./api/swagger/swagger.ts";
import { buildReactApp } from "./api/utils/react_build.ts";

// Build the React app before starting the server
await buildReactApp();

const app = new Application();

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

const swaggerRouter = await createSwaggerRouter();

app.use(swaggerRouter.routes());
app.use(swaggerRouter.allowedMethods());
app.use(router.routes());
app.use(router.allowedMethods());

// Add the 404 handler after all routes
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

const port = parseInt(Deno.env.get("PORT") || "8000");
const baseUrl = Deno.env.get("BASE_URL") || `http://localhost:${port}`;
const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws";
const wsUrl = baseUrl.replace(/^https?/, wsProtocol) + "/ws";

console.log(`HTTP server is running. Access it at: ${baseUrl}/`);
console.log(`Swagger UI is available at: ${baseUrl}/swagger-ui`);
console.log(`WebSocket server is running. Connect at: ${wsUrl}`);

Deno.serve({ port }, async (request) => {
  console.log(`Received request: ${request.method} ${request.url}`);

  const wsResponse = handleWebSocket(request);
  if (wsResponse) {
    return wsResponse;
  }

  const response = await app.handle(request);
  return response || new Response("Not Found", { status: 404 });
});
