"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";

export default function Events() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-100 to-purple-200 dark:from-[#0a0a0f] dark:via-[#1a0a2ead] dark:to-[#44146390] py-12 px-4 md:px-8">
			<div className="max-w-6xl mx-auto">
				{/* Header Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="mb-8"
				>
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
						<div>
							<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
								Events
							</h1>
							<p className="text-gray-600 dark:text-white/70 text-base md:text-lg">
								Manage and organize your scientific events
							</p>
						</div>
						<Link href="/events/add">
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Button
									className="bg-primary dark:bg-white text-white dark:text-[#1a0a2e] hover:bg-primary/90 dark:hover:bg-white/90 rounded-full px-6 py-6 text-sm md:text-base font-medium transition-all w-full sm:w-auto flex items-center gap-2"
								>
									<Plus className="size-4" />
									Create New Event
								</Button>
							</motion.div>
						</Link>
					</div>
				</motion.div>

				{/* Events List Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<Card className="shadow-lg">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="size-5" />
								Your Events
							</CardTitle>
							<CardDescription>
								View and manage all your created events
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-center py-12">
								<p className="text-muted-foreground text-lg mb-4">
									No events yet
								</p>
								<p className="text-muted-foreground text-sm mb-6">
									Get started by creating your first event
								</p>
								<Link href="/events/add">
									<Button
										variant="outline"
										className="rounded-full px-6 py-6"
									>
										<Plus className="size-4 mr-2" />
										Create Your First Event
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}