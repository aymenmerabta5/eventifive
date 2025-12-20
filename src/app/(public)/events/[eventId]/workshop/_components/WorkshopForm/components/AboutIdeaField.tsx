import { Label } from "@/components/ui/label";
import { FlaskConical } from "lucide-react";

interface AboutIdeaFieldProps {
	aboutIdea: string;
	onAboutIdeaChange: (value: string) => void;
}

export function AboutIdeaField({
	aboutIdea,
	onAboutIdeaChange,
}: AboutIdeaFieldProps) {
	return (
		<div className="space-y-2">
			<Label
				htmlFor="aboutIdea"
				className="flex items-center gap-2 text-sm font-medium"
			>
				<FlaskConical className="h-4 w-4 text-muted-foreground" />
				About your idea
			</Label>
			<textarea
				id="aboutIdea"
				name="aboutIdea"
				value={aboutIdea}
				onChange={(event) => onAboutIdeaChange(event.target.value)}
				placeholder="Tell us about your workshop idea or research project..."
				className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
			/>
			<p className="text-xs text-muted-foreground">
				Share your vision, goals, and what participants will learn
			</p>
		</div>
	);
}
