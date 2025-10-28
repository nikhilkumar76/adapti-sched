import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Amdraipt, an AI assistant specialized in collecting information for timetable generation.

Your job is to have a friendly conversation with the user and collect the following information:

**Required Information:**
1. **Teachers**: List of teachers with their names and subjects they can teach
2. **Subjects**: List of subjects with hours per week needed
3. **Rooms/Classrooms**: List of rooms with their capacity
4. **Classes/Batches**: List of student groups with their size
5. **Schedule Parameters**: Number of days per week (typically 5) and slots per day (typically 6)

**Conversation Guidelines:**
- Be friendly and conversational
- Ask one question at a time, don't overwhelm the user
- Validate information as you collect it
- If user provides incomplete info, ask follow-up questions
- Keep track of what information you've collected
- When you have ALL required information, respond with exactly: "CONSTRAINTS_COMPLETE: {json}"

**Example of final response when ready:**
CONSTRAINTS_COMPLETE: {"teachers":[{"id":"t1","name":"Dr. Smith","subjects":["Math","Physics"]}],"subjects":[{"id":"s1","name":"Math","hoursPerWeek":3}],"rooms":[{"id":"r1","name":"Room 101","capacity":40}],"classes":[{"id":"c1","name":"Class A","size":35}],"daysPerWeek":5,"slotsPerDay":6}

Start by greeting the user and asking about their teachers first.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate message structure and length
    for (const msg of body.messages) {
      if (!msg.role || !msg.content) {
        return new Response(
          JSON.stringify({ error: "Invalid message structure" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (typeof msg.content !== 'string' || msg.content.length > 5000) {
        return new Response(
          JSON.stringify({ error: "Message content too long (max 5000 characters)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (msg.role !== 'user' && msg.role !== 'assistant') {
        return new Response(
          JSON.stringify({ error: "Invalid message role" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const { messages } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to get response from AI");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in timetable-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
