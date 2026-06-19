import dns from "dns";
// Override DNS servers to bypass local resolver issues
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { app } from "@/bootstrap/app";
import { logger } from "@/shared/logger";
import { connectDB } from "@/infrastructure/database";

// CRITICAL: Use PORT from environment (required for Render)
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
    logger.info("=".repeat(50));

    // Connect to database
    await connectDB();

    // Start server - bind to 0.0.0.0 for Docker/Render
    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`✓ Server running on http://0.0.0.0:${PORT}`);
      logger.info(`✓ API available at http://0.0.0.0:${PORT}/api`);
      logger.info(`✓ Frontend available at http://0.0.0.0:${PORT}/`);
      logger.info("=".repeat(50));
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
