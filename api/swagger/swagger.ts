import { Router } from "../../deps.ts";

export async function createSwaggerRouter(): Promise<Router> {
  const swaggerDocument = JSON.parse(await Deno.readTextFile("./swagger.json"));

  const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sponsors App API - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    #swagger-ui { max-width: 1200px; margin: 0 auto; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/swagger.json",
        dom_id: "#swagger-ui",
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true
      });
    };
  </script>
</body>
</html>
`;

  const swaggerRouter = new Router();

  swaggerRouter.get("/swagger-ui", (context) => {
    context.response.headers.set("Content-Type", "text/html");
    context.response.body = swaggerHtml;
  });

  swaggerRouter.get("/swagger.json", (context) => {
    context.response.headers.set("Content-Type", "application/json");
    context.response.body = swaggerDocument;
  });

  return swaggerRouter;
}
