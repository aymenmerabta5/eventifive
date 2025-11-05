"use client";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export default function Dashboard({
	session,
}: {
	session: typeof authClient.$Infer.Session;
}) {
	const privateData = useQuery(orpc.privateData.queryOptions());

	return (
		<>
			<h1>Dashboard</h1>
			<p>API: {privateData.data?.message}</p>
		</>
	);
}
