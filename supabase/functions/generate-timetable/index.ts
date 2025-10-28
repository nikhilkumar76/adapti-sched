import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DSA Implementation: Graph Coloring + Constraint Satisfaction + Backtracking

interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  unavailable?: number[][]; // [day, slot] pairs
}

interface Room {
  id: string;
  name: string;
  capacity: number;
}

interface Class {
  id: string;
  name: string;
  size: number;
}

interface Subject {
  id: string;
  name: string;
  hoursPerWeek: number;
}

interface Constraint {
  teachers: Teacher[];
  rooms: Room[];
  classes: Class[];
  subjects: Subject[];
  daysPerWeek: number;
  slotsPerDay: number;
}

interface Assignment {
  classId: string;
  subject: string;
  teacher: string;
  room: string;
  day: number;
  slot: number;
}

// Priority Queue implementation for greedy scheduling
class PriorityQueue<T> {
  private items: Array<{ priority: number; value: T }> = [];

  enqueue(value: T, priority: number) {
    this.items.push({ priority, value });
    this.items.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.value;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Graph representation for conflict detection
class ConflictGraph {
  private adjacencyList: Map<string, Set<string>> = new Map();

  addVertex(vertex: string) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, new Set());
    }
  }

  addEdge(v1: string, v2: string) {
    this.addVertex(v1);
    this.addVertex(v2);
    this.adjacencyList.get(v1)!.add(v2);
    this.adjacencyList.get(v2)!.add(v1);
  }

  hasConflict(v1: string, v2: string): boolean {
    return this.adjacencyList.get(v1)?.has(v2) || false;
  }

  getConflicts(vertex: string): Set<string> {
    return this.adjacencyList.get(vertex) || new Set();
  }
}

// Main Timetable Generator with DSA algorithms
class TimetableGenerator {
  private assignments: Assignment[] = [];
  private conflictGraph: ConflictGraph = new ConflictGraph();
  private constraints: Constraint;
  private sessionQueue: PriorityQueue<{
    classId: string;
    subject: Subject;
    teacher: Teacher;
  }>;

  constructor(constraints: Constraint) {
    this.constraints = constraints;
    this.sessionQueue = new PriorityQueue();
    this.initializeSessionQueue();
  }

  // Initialize priority queue based on constraint difficulty
  private initializeSessionQueue() {
    for (const cls of this.constraints.classes) {
      for (const subject of this.constraints.subjects) {
        const availableTeachers = this.constraints.teachers.filter(t =>
          t.subjects.includes(subject.name)
        );

        if (availableTeachers.length === 0) continue;

        // Priority based on: fewer available teachers = higher priority
        const priority = 100 / availableTeachers.length;

        for (let i = 0; i < subject.hoursPerWeek; i++) {
          this.sessionQueue.enqueue(
            {
              classId: cls.id,
              subject: subject,
              teacher: availableTeachers[0],
            },
            priority
          );
        }
      }
    }
  }

  // Check if assignment violates any constraints
  private isValidAssignment(
    assignment: Assignment,
    currentAssignments: Assignment[]
  ): boolean {
    for (const existing of currentAssignments) {
      // Same time slot conflicts
      if (existing.day === assignment.day && existing.slot === assignment.slot) {
        // Same teacher conflict
        if (existing.teacher === assignment.teacher) return false;
        
        // Same room conflict
        if (existing.room === assignment.room) return false;
        
        // Same class conflict
        if (existing.classId === assignment.classId) return false;
      }

      // Teacher unavailability
      const teacher = this.constraints.teachers.find(t => t.name === assignment.teacher);
      if (teacher?.unavailable) {
        for (const [day, slot] of teacher.unavailable) {
          if (day === assignment.day && slot === assignment.slot) return false;
        }
      }
    }

    // Room capacity check
    const room = this.constraints.rooms.find(r => r.name === assignment.room);
    const cls = this.constraints.classes.find(c => c.id === assignment.classId);
    if (room && cls && room.capacity < cls.size) return false;

    return true;
  }

  // Backtracking algorithm with constraint propagation
  private backtrack(
    assignments: Assignment[],
    remainingSessions: Array<{ classId: string; subject: Subject; teacher: Teacher }>
  ): Assignment[] | null {
    // Base case: all sessions scheduled
    if (remainingSessions.length === 0) {
      return assignments;
    }

    const session = remainingSessions[0];
    const rest = remainingSessions.slice(1);

    // Try each possible time slot (Graph Coloring approach)
    for (let day = 0; day < this.constraints.daysPerWeek; day++) {
      for (let slot = 0; slot < this.constraints.slotsPerDay; slot++) {
        // Try each available room
        for (const room of this.constraints.rooms) {
          const assignment: Assignment = {
            classId: session.classId,
            subject: session.subject.name,
            teacher: session.teacher.name,
            room: room.name,
            day,
            slot,
          };

          // Constraint checking
          if (this.isValidAssignment(assignment, assignments)) {
            // Make assignment
            const newAssignments = [...assignments, assignment];

            // Recursively try to assign remaining sessions
            const result = this.backtrack(newAssignments, rest);
            
            if (result !== null) {
              return result;
            }
            
            // Backtrack if this path doesn't work
          }
        }
      }
    }

    // No valid assignment found
    return null;
  }

  // Main generation method
  generate(): Assignment[] {
    const sessions: Array<{ classId: string; subject: Subject; teacher: Teacher }> = [];
    
    // Extract all sessions from priority queue
    while (!this.sessionQueue.isEmpty()) {
      const session = this.sessionQueue.dequeue();
      if (session) sessions.push(session);
    }

    console.log(`Starting backtracking algorithm for ${sessions.length} sessions...`);
    
    const result = this.backtrack([], sessions);
    
    if (result === null) {
      throw new Error("Unable to generate conflict-free timetable with given constraints");
    }

    console.log(`Successfully generated timetable with ${result.length} assignments`);
    return result;
  }

  // Get timetable statistics
  getStats(): {
    totalAssignments: number;
    utilizationRate: number;
    teacherLoads: Record<string, number>;
  } {
    const totalSlots = this.constraints.daysPerWeek * this.constraints.slotsPerDay;
    const teacherLoads: Record<string, number> = {};

    for (const assignment of this.assignments) {
      teacherLoads[assignment.teacher] = (teacherLoads[assignment.teacher] || 0) + 1;
    }

    return {
      totalAssignments: this.assignments.length,
      utilizationRate: (this.assignments.length / totalSlots) * 100,
      teacherLoads,
    };
  }
}

// Input validation
function validateConstraints(constraints: any): string | null {
  if (!constraints || typeof constraints !== 'object') {
    return "Invalid constraints format";
  }

  if (!Array.isArray(constraints.teachers) || constraints.teachers.length === 0) {
    return "At least one teacher is required";
  }

  if (!Array.isArray(constraints.subjects) || constraints.subjects.length === 0) {
    return "At least one subject is required";
  }

  if (!Array.isArray(constraints.rooms) || constraints.rooms.length === 0) {
    return "At least one room is required";
  }

  if (!Array.isArray(constraints.classes) || constraints.classes.length === 0) {
    return "At least one class is required";
  }

  if (typeof constraints.daysPerWeek !== 'number' || constraints.daysPerWeek < 1 || constraints.daysPerWeek > 7) {
    return "Days per week must be between 1 and 7";
  }

  if (typeof constraints.slotsPerDay !== 'number' || constraints.slotsPerDay < 1 || constraints.slotsPerDay > 12) {
    return "Slots per day must be between 1 and 12";
  }

  // Validate teachers
  for (const teacher of constraints.teachers) {
    if (!teacher.name || typeof teacher.name !== 'string' || teacher.name.length > 100) {
      return "Invalid teacher name";
    }
    if (!Array.isArray(teacher.subjects)) {
      return "Teacher subjects must be an array";
    }
  }

  // Validate subjects
  for (const subject of constraints.subjects) {
    if (!subject.name || typeof subject.name !== 'string' || subject.name.length > 100) {
      return "Invalid subject name";
    }
    if (typeof subject.hoursPerWeek !== 'number' || subject.hoursPerWeek < 1 || subject.hoursPerWeek > 20) {
      return "Hours per week must be between 1 and 20";
    }
  }

  // Validate rooms
  for (const room of constraints.rooms) {
    if (!room.name || typeof room.name !== 'string' || room.name.length > 100) {
      return "Invalid room name";
    }
    if (typeof room.capacity !== 'number' || room.capacity < 1 || room.capacity > 1000) {
      return "Room capacity must be between 1 and 1000";
    }
  }

  // Validate classes
  for (const cls of constraints.classes) {
    if (!cls.name || typeof cls.name !== 'string' || cls.name.length > 100) {
      return "Invalid class name";
    }
    if (typeof cls.size !== 'number' || cls.size < 1 || cls.size > 1000) {
      return "Class size must be between 1 and 1000";
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawConstraints = await req.json();
    
    // Validate input
    const validationError = validateConstraints(rawConstraints);
    if (validationError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validationError,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const constraints: Constraint = rawConstraints;

    console.log('Received constraints:', {
      teachers: constraints.teachers.length,
      rooms: constraints.rooms.length,
      classes: constraints.classes.length,
      subjects: constraints.subjects.length,
    });

    const startTime = performance.now();
    
    // Initialize generator with DSA algorithms
    const generator = new TimetableGenerator(constraints);
    
    // Generate timetable using backtracking + constraint satisfaction
    const timetable = generator.generate();
    
    const endTime = performance.now();
    const generationTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`Timetable generated in ${generationTime}s`);

    return new Response(
      JSON.stringify({
        success: true,
        timetable,
        generationTime,
        stats: {
          totalAssignments: timetable.length,
          conflictsFree: true,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating timetable:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
