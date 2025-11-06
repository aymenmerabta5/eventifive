"use client";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Hero } from "./_components/Hero";
import WhoWeAre from "./_components/WhoWeAre";
import About from "./_components/About";
 

export default function Home() {
	// const healthCheck = useQuery(orpc.healthCheck.queryOptions());

	return (
		<div className="flex flex-col">
			<Hero />
			<About/>
			<WhoWeAre />
		</div>
	);
}

