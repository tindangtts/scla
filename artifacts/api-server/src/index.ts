import app from "./app.js";
import { logger } from "./lib/logger.js";
import { applyMigrations } from "./lib/migration-runner.js";
import { startScheduler } from "./lib/scheduler.js";
import { setupWebSocket } from "./lib/ws-server.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

applyMigrations()
  .then(() => {
    const server = app.listen(port, () => {
      logger.info({ port }, "Server listening");
      setupWebSocket(server);
      startScheduler();
    });
    server.on("error", (err) => {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to apply DB migrations — aborting startup");
    process.exit(1);
  });
