import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { TimetableChatbot } from "@/components/TimetableChatbot";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <TimetableChatbot />
    </main>
  );
};

export default Index;
