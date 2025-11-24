import type { NextRequest } from "next/server";
import { auth } from "@/server/better-auth/";

export async function createContext(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: req.headers,
	});
	return {
		session,
		req,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
