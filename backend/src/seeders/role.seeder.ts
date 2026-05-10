import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import RoleModel from "../models/roles-permission.model";
import { RolePermissions } from "../utils/role-permission";

const seedRoles = async () => {
  console.log("Seeding roles started...");

  try {
    await connectDatabase();

    console.log("Upserting roles...");

    for (const roleName in RolePermissions) {
      const role = roleName as keyof typeof RolePermissions;
      const permissions = RolePermissions[role];

      await RoleModel.findOneAndUpdate(
        { name: role },
        { $set: { permissions }, $setOnInsert: { name: role } },
        { new: true, upsert: true, setDefaultsOnInsert: false }
      );
      console.log(`Role ${role} synced with permissions.`);
    }

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await mongoose.disconnect();
  }
};

seedRoles().catch((error) =>
  console.error("Error running seed script:", error)
);
