import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, User, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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

export const TimetableChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [timetable, setTimetable] = useState<Assignment[] | null>(null);
  const [generationTime, setGenerationTime] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Start conversation
    if (messages.length === 0) {
      streamMessage([]);
    }
  }, []);

  const streamMessage = async (currentMessages: Message[]) => {
    setLoading(true);
    let assistantMessage = "";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/timetable-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: currentMessages }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (let line of lines) {
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.role === "assistant") {
                  newMessages[newMessages.length - 1].content = assistantMessage;
                } else {
                  newMessages.push({ role: "assistant", content: assistantMessage });
                }
                return newMessages;
              });
            }
          } catch (e) {
            // Ignore parse errors for incomplete JSON
          }
        }
      }

      // Check if constraints are complete
      if (assistantMessage.includes("CONSTRAINTS_COMPLETE:")) {
        const jsonMatch = assistantMessage.match(/CONSTRAINTS_COMPLETE:\s*({.*})/s);
        if (jsonMatch) {
          const constraintsJson = jsonMatch[1];
          await generateTimetable(JSON.parse(constraintsJson));
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    await streamMessage(newMessages);
  };

  const generateTimetable = async (constraints: any) => {
    setGenerating(true);
    toast.info("Generating timetable with DSA algorithms...");

    try {
      const { data, error } = await supabase.functions.invoke("generate-timetable", {
        body: constraints,
      });

      if (error) throw error;

      if (data.success) {
        setTimetable(data.timetable);
        setGenerationTime(data.generationTime);
        toast.success(`Timetable generated in ${data.generationTime}s!`, {
          description: "Conflict-free schedule ready",
        });
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate timetable");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="py-24 bg-background">
      <div className="container px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              AI-Powered <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Timetable Assistant</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Chat with our AI to create your perfect schedule
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Chat Interface */}
            <Card className="bg-gradient-to-br from-card to-card/50 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-accent" />
                  Amdraipt Assistant
                </CardTitle>
                <CardDescription>
                  Tell me about your teachers, subjects, and schedule needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content.replace(/CONSTRAINTS_COMPLETE:.*/, "Perfect! I have all the information. Generating your timetable now...")}
                          </p>
                        </div>
                        {msg.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-accent" />
                          </div>
                        )}
                      </div>
                    ))}
                    {loading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-2xl px-4 py-3">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type your message..."
                    disabled={loading || generating}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={loading || !input.trim() || generating}
                    size="icon"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timetable Display */}
            <Card className="bg-gradient-to-br from-card to-card/50 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Generated Timetable
                </CardTitle>
                <CardDescription>
                  {timetable ? "Your conflict-free schedule" : "Timetable will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generating ? (
                  <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Running DSA algorithms...</p>
                  </div>
                ) : timetable ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <Badge variant="outline" className="text-success border-success/50 bg-success/5 px-4 py-2">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {timetable.length} Classes
                      </Badge>
                      {generationTime && (
                        <Badge variant="outline" className="px-4 py-2">
                          <Clock className="w-4 h-4 mr-2" />
                          {generationTime}s
                        </Badge>
                      )}
                    </div>

                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {days.map((day, dayIdx) => (
                          <div key={dayIdx} className="space-y-2">
                            <h4 className="font-semibold text-sm text-primary">{day}</h4>
                            <div className="space-y-1">
                              {timeSlots.map((time, slotIdx) => {
                                const slot = timetable.find(
                                  (a) => a.day === dayIdx && a.slot === slotIdx
                                );
                                return slot ? (
                                  <Card
                                    key={slotIdx}
                                    className="p-3 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-1">
                                        <p className="text-sm font-semibold">{slot.subject}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {slot.teacher} • {slot.room}
                                        </p>
                                      </div>
                                      <Badge variant="secondary" className="text-xs">
                                        {time}
                                      </Badge>
                                    </div>
                                  </Card>
                                ) : null;
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <p className="text-center">
                      Start chatting to generate your timetable
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
