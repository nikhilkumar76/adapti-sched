import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const sampleSchedule = [
  { day: 0, time: 0, subject: "Data Structures", teacher: "Dr. Smith", room: "CS-101" },
  { day: 0, time: 1, subject: "Algorithms", teacher: "Prof. Johnson", room: "CS-102" },
  { day: 1, time: 0, subject: "Database Systems", teacher: "Dr. Williams", room: "CS-103" },
  { day: 1, time: 2, subject: "Web Development", teacher: "Prof. Brown", room: "CS-104" },
  { day: 2, time: 1, subject: "Machine Learning", teacher: "Dr. Davis", room: "CS-105" },
  { day: 3, time: 0, subject: "Software Engineering", teacher: "Prof. Miller", room: "CS-106" },
  { day: 4, time: 2, subject: "Computer Networks", teacher: "Dr. Wilson", room: "CS-107" },
];

export const TimetableDemo = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              See It In <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Action</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Example of an AI-generated conflict-free timetable
            </p>
          </div>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-2">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h3 className="text-2xl font-semibold">Computer Science Department</h3>
              <Badge variant="outline" className="text-success border-success/50 bg-success/5 px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse"></div>
                Conflict-Free
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                  <div className="font-semibold text-muted-foreground flex items-center gap-2 p-3">
                    <Clock className="w-4 h-4" />
                    Time/Day
                  </div>
                  {days.map((day, i) => (
                    <div key={i} className="font-semibold text-center p-3 rounded-lg bg-primary/5">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Time slots */}
                {timeSlots.map((time, timeIndex) => (
                  <div key={timeIndex} className="grid grid-cols-6 gap-2 mb-2">
                    <div className="font-medium text-sm text-muted-foreground p-3 flex items-center">
                      {time}
                    </div>
                    {days.map((_, dayIndex) => {
                      const slot = sampleSchedule.find(
                        s => s.day === dayIndex && s.time === timeIndex
                      );
                      
                      return (
                        <div key={dayIndex} className="min-h-[100px]">
                          {slot ? (
                            <Card className="h-full p-3 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:scale-105">
                              <div className="text-sm font-semibold text-foreground mb-1">
                                {slot.subject}
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div>{slot.teacher}</div>
                                <Badge variant="secondary" className="text-xs">
                                  {slot.room}
                                </Badge>
                              </div>
                            </Card>
                          ) : (
                            <div className="h-full rounded-lg border-2 border-dashed border-border/50 bg-muted/20"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
