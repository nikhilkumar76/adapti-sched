import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Cpu, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Input Constraints",
    description: "Define teachers, subjects, classrooms, time slots, and availability preferences through an intuitive interface.",
    color: "from-accent/20 to-accent/5"
  },
  {
    icon: Cpu,
    title: "AI Processing",
    description: "Our hybrid algorithm engine uses Graph Coloring, Priority Queues, and Constraint Propagation to optimize allocations.",
    color: "from-primary/20 to-primary/5"
  },
  {
    icon: CheckCircle2,
    title: "Get Results",
    description: "Receive a perfectly balanced, conflict-free timetable in seconds. Export, edit, or regenerate as needed.",
    color: "from-success/20 to-success/5"
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container px-6">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            How <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Amdraipt</span> Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Three simple steps to perfect scheduling
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent/50 to-primary/50 z-0"></div>
                )}
                
                <Card className="relative z-10 h-full hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
                  <CardHeader>
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold mb-3">
                        {index + 1}
                      </div>
                      <CardTitle className="text-2xl">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
