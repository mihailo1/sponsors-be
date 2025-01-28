import { getServerStats } from "../controllers/stats.controller.ts";

const wsConnections = new Set<WebSocket>();

export function handleWebSocket(request: Request): Response | undefined {
  if (request.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(request);
    wsConnections.add(socket);
    console.log("WebSocket connection established");
    socket.addEventListener("open", () => {
      console.log("a client connected!");
    });
    socket.addEventListener("close", () => {
      wsConnections.delete(socket);
      console.log("WebSocket connection closed");
    });
    socket.addEventListener("error", (err) => {
      wsConnections.delete(socket);
      console.error("WebSocket error:", err);
    });
    return response;
  }
  return undefined;
}

setInterval(async () => {
  const stats = await getServerStats();
  //   console.log("Sending stats to WebSocket clients:", stats);
  for (const ws of wsConnections) {
    ws.send(JSON.stringify(stats));
  }
}, 1000);
