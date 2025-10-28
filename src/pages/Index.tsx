import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { TimetableDemo } from "@/components/TimetableDemo";
import { TimetableGenerator } from "@/components/TimetableGenerator";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <TimetableGenerator />
      <TimetableDemo />
    </main>
  );
};

export default Index;
