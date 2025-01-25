import { Application, send } from "./deps.ts";
import router from "./routes/router.ts";

const app = new Application();

app.use(async (context, next) => {
  context.response.headers.set("Access-Control-Allow-Origin", "*");
  context.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  context.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
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

console.log("HTTP server is running. Access it at: http://localhost:8000/");

await app.listen({ port: parseInt(Deno.env.get("PORT") || "8000") });
