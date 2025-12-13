import { config } from "dotenv";
config({ path: ".env" });

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
	const { db } = await import("@/server/db");
	const  { roles } = await import("./schema");
    const { eq } = await import("drizzle-orm");
	console.log("Seeding roles...");

	const rolesList = [
		{ name: "super_admin" as const },
		{ name: "organizer" as const },
		{ name: "user" as const },
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
	const { db } = await import("@/server/db");
	const { roles } = await import("./schema");
	try {
		const rolesCount = await db.select().from(roles);
		console.log(`Database health check: ${rolesCount.length} roles found`);
		return true;
	} catch (error) {
		console.error("Database health check failed:", error);
		return false;
	}
}

initializeDatabase()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});