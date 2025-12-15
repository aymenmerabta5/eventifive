"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SliderProps = {
	value: number[];
	onValueChange?: (value: number[]) => void;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	className?: string;
};

export function Slider({
	value,
	onValueChange,
	min = 0,
	max = 100,
	step = 1,
	disabled = false,
	className,
}: SliderProps) {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const next = Number(event.target.value);
		onValueChange?.([next]);
	};

	return (
		<div className={cn("w-full", className)}>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value[0] ?? min}
				onChange={handleChange}
				disabled={disabled}
				className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-60"
			/>
		</div>
	);
}

