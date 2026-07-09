import dns from "dns";
import { promises as dnsPromises } from "dns";

dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);
dnsPromises.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

dns.setDefaultResultOrder("ipv4first");

import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { createServer } from "http";
import { app } from "@/bootstrap/app";
import { logger } from "@/shared/logger";
import { connectDB } from "@/infrastructure/database";
import { initSocketIO } from "@/gateway/websocket/socket";

const PORT = parseInt(process.env.PORT || "5000", 10);

async function main() {
  try {
    // Log startup info
    logger.info("=".repeat(50));
    logger.info("Starting BetterLibmanan Backend Server");
    logger.info("=".repeat(50));
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    logger.info(`Port: ${PORT}`);
    logger.info(`Node Version: ${process.version}`);
    logger.info(`DNS Servers: ${dns.getServers().join(", ")}`);
    logger.info("=".repeat(50));

    await connectDB();

    // Wrap Express in a raw Node HTTP server so Socket.IO can share the port.
    const httpServer = createServer(app);
    initSocketIO(httpServer);

    httpServer.listen(PORT, "0.0.0.0", () => {
      logger.info(`✓ Server running on http://0.0.0.0:${PORT}`);
      logger.info(`✓ API available at http://0.0.0.0:${PORT}/api`);
      logger.info(`✓ Socket.IO available at ws://0.0.0.0:${PORT}/socket.io`);
      logger.info(`✓ Frontend available at http://0.0.0.0:${PORT}/`);
      logger.info("=".repeat(50));
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
