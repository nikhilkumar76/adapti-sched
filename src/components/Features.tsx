import { Brain, RefreshCw, Zap, Shield, BarChart3, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "Smart Adaptive Scheduling",
    description: "Learns from constraints and adjusts allocations automatically using advanced machine learning algorithms."
  },
  {
    icon: Shield,
    title: "Conflict-Free Optimization",
    description: "Ensures zero overlap for teachers, rooms, and student batches through graph coloring techniques."
  },
  {
    icon: RefreshCw,
    title: "Dynamic Re-generation",
    description: "Updates the timetable instantly when any constraint changes with real-time propagation."
  },
  {
    icon: BarChart3,
    title: "Balanced Workload",
    description: "Prevents teacher overload and idle time gaps using priority queue optimization."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate complete timetables in under 2 seconds using optimized constraint propagation."
  },
  {
    icon: Settings,
    title: "Algorithmic Core",
    description: "Combines graph theory, greedy heuristics, and backtracking for maximum scalability."
  }
];

export const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container px-6">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Powerful Features for 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Perfect Schedules</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Built on proven DSA algorithms and modern optimization techniques
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group hover:border-accent/30 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-card to-card/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
