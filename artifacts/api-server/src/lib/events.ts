import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

let wss: WebSocketServer | null = null;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/api/ws" });
  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ event: "connected" }));
  });
}

export function broadcast(event: string) {
  if (!wss) return;
  const msg = JSON.stringify({ event });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}
