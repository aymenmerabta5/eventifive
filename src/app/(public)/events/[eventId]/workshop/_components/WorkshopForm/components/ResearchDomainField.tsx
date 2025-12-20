import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FlaskConical } from "lucide-react";

interface ResearchDomainFieldProps {
	researchDomain: string;
	onResearchDomainChange: (value: string) => void;
}

export function ResearchDomainField({
	researchDomain,
	onResearchDomainChange,
}: ResearchDomainFieldProps) {
	return (
		<div className="space-y-2">
			<Label
				htmlFor="researchDomain"
				className="flex items-center gap-2 text-sm font-medium"
			>
				<FlaskConical className="h-4 w-4 text-muted-foreground" />
				Research domain
			</Label>
			<Input
				id="researchDomain"
				name="researchDomain"
				type="text"
				value={researchDomain}
				onChange={(event) => onResearchDomainChange(event.target.value)}
				placeholder="Your research domain or area of expertise"
				autoComplete="organization-title"
				className="h-11"
			/>
			<p className="text-xs text-muted-foreground">
				Example: Artificial Intelligence, Human-Computer Interaction, Data Science...
			</p>
		</div>
	);
}
