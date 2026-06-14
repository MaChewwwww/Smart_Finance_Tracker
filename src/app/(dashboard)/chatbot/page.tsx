"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Sparkles, Send, Info, User, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
}

const PRESET_PROMPTS = [
  "How can I reduce my expenses this month?",
  "Summarize my spending patterns.",
  "What debts should I prioritize?",
  "Help me plan a savings goal.",
];

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "model",
  content:
    "Hello! I'm your Smart Finance AI Assistant. I can help you understand your spending habits, plan savings goals, manage debt priorities, and more. How can I help you today?",
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const res = await axios.post("/api/chatbot/message", {
        message: trimmed,
        sessionId: sessionId ?? null,
      });

      if (res.data.success) {
        const { reply, sessionId: returnedSessionId } = res.data.data;
        if (returnedSessionId && !sessionId) setSessionId(returnedSessionId);
        const aiMsg: Message = {
          id: `model-${Date.now()}`,
          role: "model",
          content: reply,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        toast.error(res.data.error?.message || "Failed to get a response.");
        // Remove the user message on error so they can retry
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setInputVal(trimmed);
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error?.message
        : null;
      toast.error(msg || "Failed to reach the AI assistant.");
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInputVal(trimmed);
    } finally {
      setLoading(false);
    }
  };

  const showPresets = messages.length === 1 && !loading;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px] animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-blue-600 dark:text-blue-400 animate-pulse" /> AI Assistant
        </h1>
        <p className="text-sm font-semibold text-slate-400">
          Ask general financial questions or consult your personalized monthly budget insights.
        </p>
      </div>

      {/* Chat Container */}
      <Card className="flex flex-col flex-1 glass-card overflow-hidden border-border/70 hover:shadow-xl hover:translate-y-0">
        <CardContent className="flex-1 p-4 overflow-hidden">
          <ScrollArea className="h-full pr-3">
            <div className="space-y-4 pb-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "model" && (
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5 border border-blue-500/20 shadow-sm">
                      <AvatarFallback className="bg-blue-500/10 text-blue-500 font-bold">
                        <Sparkles className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed shadow-sm font-semibold whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-100/70 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200 rounded-tl-none border border-border/80"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5 border border-border shadow-sm">
                      <AvatarFallback className="bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 font-bold">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Typing indicator while waiting */}
              {loading && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5 border border-blue-500/20 shadow-sm">
                    <AvatarFallback className="bg-blue-500/10 text-blue-500 font-bold">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-slate-100/70 dark:bg-slate-900/30 border border-border/80 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Footer: Presets + Input */}
        <CardFooter className="flex flex-col p-4 border-t border-border bg-slate-50/20 dark:bg-slate-900/10 gap-3">
          {showPresets && (
            <div className="w-full">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Suggested prompts
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white/40 hover:bg-slate-100/60 dark:bg-slate-950/40 dark:hover:bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-400 transition-colors shadow-sm cursor-pointer"
                  >
                    {prompt} <ArrowRight className="h-3 w-3 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
            className="flex items-center w-full gap-2"
          >
            <Input
              type="text"
              placeholder="Ask me anything about your finances..."
              className="flex-1 h-11 bg-white/60 dark:bg-slate-950/40 border-border font-semibold rounded-xl"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !inputVal.trim()}
              className="h-11 w-11 shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>
              This assistant provides general financial guidance only and does not replace professional financial advice.
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
