import { Router, send } from "../../deps.ts";
import stringController from "../controllers/string.controller.ts";
import uploadController from "../controllers/upload.controller.ts";
import statsController from "../controllers/stats.controller.ts";

const router = new Router();

const routes = [
  {
    method: "GET",
    path: "/api/strings",
    description: "Get all strings",
    requestSchema: null,
    responseSchema: "Array of strings",
  },
  {
    method: "POST",
    path: "/api/strings",
    description: "Create a new string",
    requestSchema: "{ value: string }",
    responseSchema: "Array of strings",
  },
  {
    method: "PUT",
    path: "/api/strings/:id",
    description: "Update a string by ID",
    requestSchema: "{ value: string }",
    responseSchema: "Array of strings",
  },
  {
    method: "DELETE",
    path: "/api/strings/:id",
    description: "Delete a string by ID",
    requestSchema: null,
    responseSchema: "Array of strings",
  },
  {
    method: "GET",
    path: "/api/strings/search",
    description: "Search strings by query",
    requestSchema: "{ query: string }",
    responseSchema: "Array of { id: number, value: string }",
  },
  {
    method: "POST",
    path: "/api/upload",
    description: "Upload a JSON file",
    requestSchema: "Array of strings",
    responseSchema: "{ message: string, data: Array of strings }",
  },
  {
    method: "GET",
    path: "/admin(.*)",
    description: "Serve the admin page",
    requestSchema: null,
    responseSchema: "HTML page",
  },
  {
    method: "GET",
    path: "/",
    description: "Serve the root page",
    requestSchema: null,
    responseSchema: "HTML page",
  },
  {
    method: "GET",
    path: "/api/stats",
    description: "Get server stats",
    requestSchema: null,
    responseSchema: "{ uptime: number, stringsCount: number }",
  },
  // Add other routes as needed
];

router.get("/api/strings", stringController.getAllStrings);
router.post("/api/strings", stringController.createString);
router.put("/api/strings/:id", stringController.updateString);
router.delete("/api/strings/:id", stringController.deleteString);
router.get("/api/strings/search", stringController.searchStrings);
router.post("/api/upload", uploadController.uploadJsonFile);
router.get("/api/stats", statsController.getServerStats);

router.get("/api/schema", (context) => {
  context.response.body = routes;
});

router.get("/", async (context) => {
  try {
    console.log("Serving empty page at root path");
    await send(context, "empty.html", {
      root: `${Deno.cwd()}/public`,
    });
  } catch (error) {
    console.error("Error serving empty page at root path", error);
    context.response.status = 404;
    context.response.body = "Not Found";
  }
});

router.get("/admin(.*)", async (context) => {
  try {
    console.log("Serving admin page");
    await send(context, "index.html", {
      root: `${Deno.cwd()}/react-app/build`,
    });
  } catch (error) {
    console.error("Error serving admin page", error);
    context.response.status = 404;
    context.response.body = "Admin page not found";
  }
});

// TODO: why /admin(.*) only works with .* method ?
router.all("(.*)", async (context) => {
  try {
    await send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}/react-app/build`,
    });
  } catch {
    try {
      await send(context, "index.html", {
        root: `${Deno.cwd()}/react-app/build`,
      });
    } catch (error) {
      console.error("Error serving fallback index.html", error);
      context.response.status = 404;
      context.response.body = "Not Found";
    }
  }
});

export default router;
