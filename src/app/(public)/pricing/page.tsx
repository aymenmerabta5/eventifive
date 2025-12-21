import PracingCard from "./_components/PricingCard";

export default function PricingPage() {
  return (
    <div className="min-h-screen px-4 py-16 pb-5">
      <div className="mb-12 space-y-4 text-center">
        <h1 className="text-foreground text-5xl font-bold">Choose your plan</h1>
        <p className="text-muted-foreground text-xl">
          Unlock endless possibilities with our event management platform.
        </p>
      </div>
      <PracingCard />
    </div>
  );
}
