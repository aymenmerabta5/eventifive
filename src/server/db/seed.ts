import { config } from "dotenv";
config({ path: ".env" });

import { db } from "@/server/db";
import { roles } from "./schema";
import { eq } from "drizzle-orm";

export async function initializeDatabase() {
	try {
		console.log("Starting database initialization...");

		await seedRoles();

		console.log("Database initialization completed successfully!");
	} catch (error) {
		console.error("Database initialization failed:", error);
		throw error;
	}
}

export async function seedRoles() {
	console.log("Seeding roles...");

	const rolesList = [
		{ name: "super_admin" as const },
		{ name: "admin" as const },
		{ name: "communicator" as const },
		{ name: "scientific_committee_member" as const },
		{ name: "participant" as const },
		{ name: "speaker" as const },
		{ name: "workshop_facilitator" as const },
	];

	for (const role of rolesList) {
		const existingRole = await db
			.select()
			.from(roles)
			.where(eq(roles.name, role.name))
			.limit(1);

		if (existingRole.length === 0) {
			await db.insert(roles).values(role);
			console.log(`Created role: ${role.name}`);
		} else {
			console.log(`Role already exists: ${role.name}`);
		}
	}

	console.log("Roles seeding completed");
}

export async function checkDatabaseHealth() {
	try {
		const rolesCount = await db.select().from(roles);
		console.log(`Database health check: ${rolesCount.length} roles found`);
		return true;
	} catch (error) {
		console.error("Database health check failed:", error);
		return false;
	}
}