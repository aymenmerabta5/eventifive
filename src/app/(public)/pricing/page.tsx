import PracingCard from "./_components/PricingCard";

export default function PricingPage(){
    return (
        <div className="min-h-screen py-16 px-4 pb-5">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-5xl font-bold text-foreground">
                    Choose your plan
                </h1>
                <p className="text-xl text-muted-foreground">
                    Unlock endless possibilities with our event management platform.
                </p>
            </div>
            <PracingCard />
        </div>
  );
}