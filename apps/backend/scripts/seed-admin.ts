/**
 * Seed script — creates the default admin accounts.
 *
 * Users created:
 *   1. Maria Santos  — superadmin (msantos / Admin@1234)
 *   2. Jose Reyes    — admin      (jreyes  / Admin@1234)
 *   3. Ana Dela Cruz — admin      (adelacruz / Admin@1234)
 *   4. Ramon Villanueva — admin   ( / Admin@1234)
 *
 * Usage:
 *   pnpm run seed           (from repo root)
 *   pnpm run seed           (from apps/backend)
 *
 * Environment:
 *   MONGODB_URI — defaults to mongodb://localhost:27017/betterlibmanan
 */

import path from "path";
import dns from "dns";
import dotenv from "dotenv";

// Force public DNS resolvers for the SRV lookup that mongodb+srv:// requires.
// Some ISPs / routers / VPNs don't return SRV records correctly, which causes
// `querySrv ECONNREFUSED`. Cloudflare + Google work everywhere.
dns.setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import mongoose from "mongoose";
import { AdminModel } from "../src/modules/auth/admin.model";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/betterlibmanan";

interface SeedUser {
  username: string;
  password: string;
  displayName: string;
  email: string;
  role: "superadmin" | "admin";
  isActive: boolean;
  phone?: string;
  department?: string;
  bio?: string;
}

const SEED_USERS: SeedUser[] = [
  {
    username: "msantos",
    password: "Admin@1234",
    displayName: "Maria Santos",
    email: "mayor@libmanan.gov.ph",
    role: "superadmin",
    isActive: true,
    phone: "+63 917 123 4567",
    department: "Office of the Mayor",
    bio: "Administrator for the BetterLibmanan web platform. Manages content, accounts, and site settings.",
  },
  {
    username: "jreyes",
    password: "Admin@1234",
    displayName: "Jose Reyes",
    email: "jreyes@libmanan.gov.ph",
    role: "admin",
    isActive: true,
    phone: "+63 918 234 5678",
    department: "Office of the Municipal Administrator",
    bio: "Manages legislative content and official government records.",
  },
  {
    username: "adelacruz",
    password: "Admin@1234",
    displayName: "Ana Dela Cruz",
    email: "adelacruz@libmanan.gov.ph",
    role: "admin",
    isActive: false,
    phone: "+63 919 345 6789",
    department: "Municipal Civil Registrar",
    bio: "Handles civil registration records and transparency documents.",
  },
  {
    username: "rvillanueva",
    password: "Admin@1234",
    displayName: "Ramon Villanueva",
    email: "rvillanueva@libmanan.gov.ph",
    role: "admin",
    isActive: true,
    phone: "+63 920 456 7890",
    department: "Municipal Planning and Development Office",
    bio: "Manages infrastructure transparency reports and DPWH project data.",
  },
];

async function seed(): Promise<void> {
  console.log("─".repeat(60));
  console.log("BetterLibmanan — Admin Seed");
  console.log("─".repeat(60));
  console.log(
    `MongoDB URI : ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, "//<redacted>@")}`,
  );
  console.log("─".repeat(60));

  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to database\n");

  for (const user of SEED_USERS) {
    const existing = await AdminModel.findOne({
      username: user.username.toLowerCase(),
    });

    if (existing) {
      // Patch extended profile fields onto pre-existing records so re-running
      // the seed after the schema migration fills in the new columns.
      let patched = false;
      if (!existing.phone && user.phone) { existing.phone = user.phone; patched = true; }
      if (!existing.department && user.department) { existing.department = user.department; patched = true; }
      if (!existing.bio && user.bio) { existing.bio = user.bio; patched = true; }

      if (patched) {
        await existing.save();
        console.log(`↻  "${user.username}" already exists — patched missing profile fields.`);
      } else {
        console.log(`⚠  "${user.username}" already exists — skipping.`);
      }
      continue;
    }

    const admin = await AdminModel.create(user);
    console.log(
      `✓ Created: ${admin.displayName} (${admin.username}) — ${admin.role}`,
    );
  }

  console.log(
    "\n⚠  IMPORTANT: Change default passwords before going to production!",
  );
  await mongoose.disconnect();
  console.log("\n✓ Disconnected");
  console.log("─".repeat(60));
}

seed().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
