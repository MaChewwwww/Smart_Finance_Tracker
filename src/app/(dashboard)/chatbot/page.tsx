"use client";

import React, { useState } from "react";

// Icons
import {
  Sparkles,
  Send,
  Info,
  User,
  ArrowRight,
} from "lucide-react";

// UI Components
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "model",
      content:
        "Hello! I am your Smart Finance AI Assistant. I can help analyze your spending patterns, suggest budgeting strategies, help you set up goals, or prioritize your active debts. How can I help you today?",
    },
  ]);
  const [inputVal, setInputVal] = useState("");

  const presetPrompts = [
    "How can I reduce my expenses this month?",
    "Summarize my spending patterns.",
    "What debts should I prioritize first?",
    "Help me design a savings goal.",
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add User Message
    const userMsg = { id: `user-${messages.length}`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");

    // Mock AI response delay
    setTimeout(() => {
      let aiResponseContent =
        "That's a great question! Based on your current financial summary, you have a monthly income of $5,200.00 and expenses of $2,150.25. Your largest category is 'Rent & Bills' at 62.4%. To improve your savings, I'd suggest reviewing subscription bloat or setting up a strict limit on food budgets.";
      
      if (text.includes("debts")) {
        aiResponseContent =
          "Regarding your debts, you have two active obligations: BDO Credit Card ($2,100 remaining, due Jun 12) and a Personal Loan ($500 remaining, overdue). I strongly recommend clearing the personal loan first because it is marked as OVERDUE, which helps preserve trust, and then paying off the BDO credit card next to avoid interest charges.";
      } else if (text.includes("goal")) {
        aiResponseContent =
          "To design a goal, I'd recommend building an 'Emergency Fund' first if you don't have one. A good target is 3 to 6 months of expenses (~$7,500 to $15,000). You've already saved $8,500 towards your $10,000 target. Contributing an extra $500 this month will put you on track to complete it by June 30.";
      }

      const aiMsg = {
        id: `model-${messages.length + 1}`,
        role: "model",
        content: aiResponseContent,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[500px] animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-blue-600 dark:text-blue-400 animate-pulse text-blue-500" /> AI Assistant
        </h1>
        <p className="text-sm font-semibold text-slate-400">
          Ask general financial questions or consult your personalized monthly budget insights.
        </p>
      </div>

      {/* Chat Layout Container */}
      <Card className="flex flex-col flex-1 glass-card overflow-hidden h-full border-border/70 hover:shadow-xl hover:translate-y-0">
        {/* Chat Area Scroll panel */}
        <CardContent className="flex-1 p-4 overflow-y-auto">
          <ScrollArea className="h-[calc(100vh-22rem)] min-h-[250px] pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Left Avatar for AI */}
                  {msg.role === "model" && (
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5 border border-blue-500/20 dark:border-blue-500/10 shadow-sm">
                      <AvatarFallback className="bg-blue-500/10 text-blue-500 neon-glow-blue font-bold">
                        <Sparkles className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed shadow-sm font-semibold ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-100/70 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200 rounded-tl-none border border-border/80"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Right Avatar for User */}
                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5 border border-border dark:border-slate-800 shadow-sm">
                      <AvatarFallback className="bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 font-bold">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input & Disclaimers Footer */}
        <CardFooter className="flex flex-col p-4 border-t border-border bg-slate-50/20 dark:bg-slate-900/10 gap-3">
          {/* Preset Prompts */}
          {messages.length === 1 && (
            <div className="w-full">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Suggested prompts</span>
              <div className="flex flex-wrap gap-2">
                {presetPrompts.map((prompt) => (
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

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputVal);
            }}
            className="flex items-center w-full gap-2 animate-in fade-in"
          >
            <Input
              type="text"
              placeholder="Ask me anything about your finances..."
              className="flex-1 h-11 bg-white/60 dark:bg-slate-950/40 border-border text-slate-900 dark:text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/10 font-semibold rounded-xl"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02]">
              <Send className="h-4.5 w-4.5" />
            </Button>
          </form>

          {/* Advice Disclaimer */}
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
