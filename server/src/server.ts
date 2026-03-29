import "dotenv/config";
import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { logger } from "./config/logger";

const HOST = process.env.HOST ?? "0.0.0.0";

const server = app.listen(env.PORT, HOST, () => {
  logger.info(`Server listening on http://${HOST}:${env.PORT}`);
});

// Helps avoid intermittent proxy timeouts / connection resets on some hosts.
server.keepAliveTimeout = 120_000;
server.headersTimeout = 120_000;

process.on("SIGTERM", () => {
  server.close(() => {
    prisma.$disconnect();
    process.exit(0);
  });
});
