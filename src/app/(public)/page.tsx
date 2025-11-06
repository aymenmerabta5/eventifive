"use client";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { WavyBackground } from "./_components/Hero";

export default function Home() {
	// const healthCheck = useQuery(orpc.healthCheck.queryOptions());

	return (
		<WavyBackground />
	);
}

