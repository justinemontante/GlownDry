import { createServer } from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { setupWebSocket } from "./lib/events";

const port = Number(process.env["PORT"]) || 8080;

const server = createServer(app);
setupWebSocket(server);

server.listen(port, () => {
  logger.info({ port }, "Server listening");
});
