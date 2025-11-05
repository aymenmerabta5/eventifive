import Link from "next/link";

export default function Logo() {
	return (
		<Link className="font-bold font-mono text-2xl" href="/">
            Eventi<span className="text-primary">Five</span>
        </Link>
	);
}