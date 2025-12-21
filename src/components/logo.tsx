import Link from "next/link";

export default function Logo() {
  return (
    <Link className="font-mono text-2xl font-bold" href="/">
      Eventi<span className="text-primary">Five</span>
    </Link>
  );
}
