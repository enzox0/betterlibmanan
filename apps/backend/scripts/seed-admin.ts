/**
 * Seed script — creates the default admin account.
 *
 * Usage:
 *   pnpm run seed           (from repo root)
 *   pnpm run seed           (from apps/backend)
 *
 * Environment:
 *   MONGODB_URI        — defaults to mongodb://localhost:27017/betterlibmanan
 *   SEED_ADMIN_USER    — defaults to "admin"
 *   SEED_ADMIN_PASS    — defaults to "Admin@1234"   (change in production!)
 *   SEED_ADMIN_NAME    — defaults to "Super Admin"
 */

import path from "path";
import dotenv from "dotenv";

// .env lives at the monorepo root — two directories above apps/backend.
// __dirname here is apps/backend/scripts, so we go up three levels.
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import mongoose from "mongoose";
import { AdminModel } from "../src/modules/auth/admin.model";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/betterlibmanan";
const ADMIN_USERNAME = process.env.SEED_ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASS || "Admin@1234";
const ADMIN_DISPLAY_NAME = process.env.SEED_ADMIN_NAME || "Super Admin";

async function seed(): Promise<void> {
  console.log("─".repeat(50));
  console.log("BetterLibmanan — Admin Seed");
  console.log("─".repeat(50));
  console.log(
    `MongoDB URI : ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, "//<redacted>@")}`,
  );
  console.log(`Username    : ${ADMIN_USERNAME}`);
  console.log(`Display     : ${ADMIN_DISPLAY_NAME}`);
  console.log("─".repeat(50));

  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to database");

  const existing = await AdminModel.findOne({
    username: ADMIN_USERNAME.toLowerCase(),
  });

  if (existing) {
    console.log(
      `⚠  Admin "${ADMIN_USERNAME}" already exists — skipping creation.`,
    );
    console.log(
      "   If you want to reset the password, delete the document and re-run the seed.",
    );
  } else {
    const admin = await AdminModel.create({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      displayName: ADMIN_DISPLAY_NAME,
      role: "superadmin",
      isActive: true,
    });

    console.log(`✓ Admin created:`);
    console.log(`   ID       : ${admin._id}`);
    console.log(`   Username : ${admin.username}`);
    console.log(`   Role     : ${admin.role}`);
    console.log("");
    console.log(
      "⚠  IMPORTANT: Change the default password before going to production!",
    );
  }

  await mongoose.disconnect();
  console.log("✓ Disconnected");
  console.log("─".repeat(50));
}

seed().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
