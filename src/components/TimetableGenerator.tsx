import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Assignment {
  classId: string;
  subject: string;
  teacher: string;
  room: string;
  day: number;
  slot: number;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM"];

export const TimetableGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [timetable, setTimetable] = useState<Assignment[] | null>(null);
  const [generationTime, setGenerationTime] = useState<string | null>(null);

  // Sample constraints for demo
  const generateTimetable = async () => {
    setLoading(true);
    toast.info("Initializing DSA algorithms...");

    try {
      const constraints = {
        teachers: [
          { id: "t1", name: "Dr. Smith", subjects: ["Data Structures", "Algorithms"] },
          { id: "t2", name: "Prof. Johnson", subjects: ["Database Systems", "Web Development"] },
          { id: "t3", name: "Dr. Williams", subjects: ["Machine Learning", "AI"] },
          { id: "t4", name: "Prof. Brown", subjects: ["Software Engineering", "Computer Networks"] },
        ],
        rooms: [
          { id: "r1", name: "CS-101", capacity: 50 },
          { id: "r2", name: "CS-102", capacity: 40 },
          { id: "r3", name: "CS-103", capacity: 60 },
          { id: "r4", name: "CS-104", capacity: 45 },
        ],
        classes: [
          { id: "c1", name: "CS Year 3", size: 45 },
          { id: "c2", name: "CS Year 2", size: 50 },
        ],
        subjects: [
          { id: "s1", name: "Data Structures", hoursPerWeek: 3 },
          { id: "s2", name: "Algorithms", hoursPerWeek: 2 },
          { id: "s3", name: "Database Systems", hoursPerWeek: 3 },
          { id: "s4", name: "Machine Learning", hoursPerWeek: 2 },
          { id: "s5", name: "Software Engineering", hoursPerWeek: 2 },
        ],
        daysPerWeek: 5,
        slotsPerDay: 6,
      };

      const { data, error } = await supabase.functions.invoke('generate-timetable', {
        body: constraints
      });

      if (error) throw error;

      if (data.success) {
        setTimetable(data.timetable);
        setGenerationTime(data.generationTime);
        toast.success(`Timetable generated in ${data.generationTime}s!`, {
          description: "Using Graph Coloring + Backtracking algorithms"
        });
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate timetable", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Generate Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Timetable</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Powered by Graph Coloring, Backtracking & Constraint Propagation
            </p>
          </div>

          <Card className="bg-gradient-to-br from-card to-card/50 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                DSA Algorithm Engine
              </CardTitle>
              <CardDescription>
                Click generate to create a conflict-free timetable using advanced algorithms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  onClick={generateTimetable}
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-5 h-5" />
                      Generate Timetable
                    </>
                  )}
                </Button>
                
                {generationTime && (
                  <Badge variant="outline" className="text-success border-success/50 bg-success/5 px-4 py-2">
                    <Clock className="w-4 h-4 mr-2" />
                    Generated in {generationTime}s
                  </Badge>
                )}
              </div>

              {timetable && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <h3 className="text-xl font-semibold">Generated Schedule</h3>
                    <Badge variant="outline" className="text-success border-success/50 bg-success/5 px-4 py-2">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {timetable.length} Classes Scheduled
                    </Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      <div className="grid grid-cols-6 gap-2 mb-2">
                        <div className="font-semibold text-muted-foreground p-3">Time/Day</div>
                        {days.map((day, i) => (
                          <div key={i} className="font-semibold text-center p-3 rounded-lg bg-primary/5">
                            {day}
                          </div>
                        ))}
                      </div>

                      {timeSlots.map((time, timeIndex) => (
                        <div key={timeIndex} className="grid grid-cols-6 gap-2 mb-2">
                          <div className="font-medium text-sm text-muted-foreground p-3 flex items-center">
                            {time}
                          </div>
                          {days.map((_, dayIndex) => {
                            const assignments = timetable.filter(
                              a => a.day === dayIndex && a.slot === timeIndex
                            );
                            
                            return (
                              <div key={dayIndex} className="min-h-[100px] space-y-2">
                                {assignments.map((assignment, idx) => (
                                  <Card 
                                    key={idx}
                                    className="p-3 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20 hover:border-accent/40 transition-all duration-300"
                                  >
                                    <div className="text-xs font-semibold text-foreground mb-1">
                                      {assignment.subject}
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div className="truncate">{assignment.teacher}</div>
                                      <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="text-xs">
                                          {assignment.room}
                                        </Badge>
                                        <span className="text-xs opacity-70">{assignment.classId}</span>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                                {assignments.length === 0 && (
                                  <div className="h-full min-h-[100px] rounded-lg border-2 border-dashed border-border/50 bg-muted/20"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
